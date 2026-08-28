const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { admin, FieldValue } = require("./firebase");
const { Timestamp } = require("firebase-admin/firestore");
const { requireAuth, getUserWithRole, requireRole } = require("./helpers");

const db = admin.firestore();

// ============================================
// ADMINISTRATION & PROFESSEURS
// ============================================

// Crée toutes les données administratives de démonstration.
// Idempotent : les classes, profs, épreuves, tickets et devoirs déjà
// présents ne sont pas recréés en double.
// Réservé : admin.
exports.seedAdminData = onCall(async (request) => {
  const auth = requireAuth(request);
  const user = await getUserWithRole(auth.uid);
  requireRole(user.role, ["admin"]);

  const rapport = {
    classes: 0,
    profs: 0,
    epreuves: 0,
    tickets: 0,
    devoirs: 0,
    elevesEnClasse: 0,
  };

  // --- 1. Classes
  const nomsClasses = [
    { name: "Terminale D", niveau: "Terminale" },
    { name: "Première S", niveau: "Première" },
  ];
  for (const classe of nomsClasses) {
    const existant = await db.collection("classes").where("name", "==", classe.name).get();
    if (existant.empty) {
      await db.collection("classes").add({ ...classe, createdAt: FieldValue.serverTimestamp() });
      rapport.classes += 1;
    }
  }

  // --- 2. Emplois du temps par classe
  const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
  const creneaux = ["7h00 - 7h45", "7h50 - 8h35", "9h40 - 10h25", "10h30 - 11h15"];
  const evenements = [
    { id: "ev1", titre: "Réunion parents-professeurs", date: "5 septembre, 16h00" },
    { id: "ev2", titre: "Conseil de classe (Terminale D)", date: "12 Septembre, 15h00" },
  ];
  for (const classe of nomsClasses) {
    await db.collection("schedule").doc(classe.name).set(
      { className: classe.name, jours, creneaux, evenements },
      { merge: true },
    );
  }

  // --- 3. Comptes professeurs (Auth + profil Firestore)
  const profs = [
    {
      displayName: "Kodjo Aziaka",
      email: "m.aziaka@ecosystem.test",
      matiere: "Mathématiques",
      classes: ["Terminale D", "Première S"],
    },
    {
      displayName: "Adjoa Lawson",
      email: "mme.lawson@ecosystem.test",
      matiere: "Français",
      classes: ["Terminale D"],
    },
  ];
  const profsUids = {};

  for (const prof of profs) {
    let uid = null;
    try {
      const record = await admin.auth().getUserByEmail(prof.email);
      uid = record.uid;
    } catch (error) {
      // Compte absent : on le crée (mot de passe temporaire commencant par "temp").
      const record = await admin.auth().createUser({
        email: prof.email,
        password: `temp${Math.floor(1000 + Math.random() * 9000)}`,
        displayName: prof.displayName,
      });
      uid = record.uid;
      rapport.profs += 1;
    }
    profsUids[prof.email] = uid;

    const initiales = prof.displayName
      .split(/\s+/)
      .map((mot) => mot[0].toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      .join("");

    await db.collection("users").doc(uid).set(
      {
        displayName: prof.displayName,
        email: prof.email,
        role: "professeur",
        matiere: prof.matiere,
        classes: prof.classes,
        identifier: `${initiales}${String(new Date().getFullYear()).slice(-2)}`,
        statut: "actif",
      },
      { merge: true },
    );
  }

  // --- 4. Attribuer une classe aux élèves existants si elle manque
  const elevesSnap = await db.collection("users").where("role", "==", "eleve").get();
  const elevesSansClasse = [];
  elevesSnap.forEach((docu) => {
    if (!docu.data().classe) elevesSansClasse.push(docu.id);
  });
  for (const id of elevesSansClasse) {
    await db.collection("users").doc(id).update({ classe: "Terminale D" });
  }
  const termDSnapshot = await db
    .collection("users")
    .where("role", "==", "eleve")
    .where("classe", "==", "Terminale D")
    .get();
  const elevesTermD = termDSnapshot.docs;
  rapport.elevesEnClasse = elevesTermD.length;

  // --- 5. Banque d'épreuves (si vide)
  const examsCount = await db.collection("exams").count().get();
  if (examsCount.data().count === 0) {
    const epreuves = [
      { titre: "Épreuve de Mathématiques — BAC 2 Série D 2024", type: "Examen", matiere: "Mathématiques", niveau: "Terminale D", serie: "D", annee: 2024, chapitres: ["Suites numériques", "Fonctions"], pays: "Togo", ecole: "Lycée Moderne de Lomé", statut: "publie" },
      { titre: "Épreuve de Physique-chimie — BAC 2 Série C 2024", type: "Examen", matiere: "Physique-chimie", niveau: "Terminale C", serie: "C", annee: 2024, chapitres: ["Mécanique", "Chimie organique"], pays: "Togo", ecole: "Lycée Moderne de Lomé", statut: "publie" },
      { titre: "Composition de SVT — Terminale D (devoir)", type: "Devoir", matiere: "SVT", niveau: "Terminale D", serie: "D", annee: 2025, chapitres: ["Génétique", "Immunologie"], pays: "Togo", ecole: "Collège d'Enseignement Général de Kara", statut: "publie" },
      { titre: "Épreuve d'Anglais — BAC Blanc Série A4", type: "Examen", matiere: "Anglais", niveau: "Terminale A4", serie: "A4", annee: 2025, chapitres: ["Reading comprehension"], pays: "Togo", ecole: "", statut: "publie" },
      { titre: "Concours de mathématiques — Lycée de Lomé", type: "Concours", matiere: "Mathématiques", niveau: "Terminale C", serie: "C", annee: 2023, chapitres: ["Géométrie dans l'espace"], pays: "Togo", ecole: "Lycée de Lomé", statut: "publie" },
    ];
    const batch = db.batch();
    epreuves.forEach((epreuve) => {
      batch.set(db.collection("exams").doc(), {
        ...epreuve,
        deposePar: { uid: auth.uid, displayName: user.displayName || "Administration" },
        createdAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
    rapport.epreuves = epreuves.length;
  }

  // --- 6. Tickets de supervision (liés à l'élève de démonstration)
  const tickets = [
    { userId: null, eleve: "Awa Mensah", notion: "Suites géométriques", matiere: "Mathématiques", professeur: "M. Kodjo Aziaka", statut: "en-cours", suivi: "intervention", priorite: "normale" },
    { userId: null, eleve: "Awa Mensah", notion: "Rédaction argumentative", matiere: "Français", professeur: "Mme Adjoa Lawson", statut: "en-cours", suivi: "sans-reponse", priorite: "urgent" },
    { userId: null, eleve: "Awa Mensah", notion: "Acides aminés", matiere: "SVT", professeur: "M. Kodjo Aziaka", statut: "resolu", suivi: "cloture", priorite: "normale" },
  ];

  const eleveDemo = await db.collection("users").where("email", "==", "eleve@ecosystem.test").get();
  const awaUid = eleveDemo.empty ? null : eleveDemo.docs[0].id;

  for (const ticket of tickets) {
    const existant = await db
      .collection("tickets")
      .where("notion", "==", ticket.notion)
      .where("userId", "==", awaUid || "__aucun__")
      .get();
    if (!existant.empty) continue;
    await db.collection("tickets").add({
      ...ticket,
      userId: awaUid,
      classe: "Terminale D",
      createdAt: FieldValue.serverTimestamp(),
    });
    rapport.tickets += 1;
  }

  // --- 7. Devoirs (assignments) pour les élèves de Terminale D
  const devoirs = [
    { title: "Exercices sur les suites numériques", subject: "Mathématiques", type: "devoir", profName: "M. Kodjo Aziaka", profUid: profsUids["m.aziaka@ecosystem.test"] || null },
    { title: "Préparer le commentaire composé", subject: "Français", type: "revisions", profName: "Mme Adjoa Lawson", profUid: profsUids["mme.lawson@ecosystem.test"] || null },
  ];
  const dansJours = (n) =>
    Timestamp.fromDate(new Date(Date.now() + n * 24 * 60 * 60 * 1000));

  for (const devoir of devoirs) {
    const existants = await db
      .collection("assignments")
      .where("title", "==", devoir.title)
      .limit(1)
      .get();
    if (!existants.empty) continue;
    for (const eleveDoc of elevesTermD) {
      await db.collection("assignments").add({
        userId: eleveDoc.id,
        classe: "Terminale D",
        subject: devoir.subject,
        type: devoir.type,
        title: devoir.title,
        profName: devoir.profName,
        profUid: devoir.profUid,
        status: "à faire",
        dueDate: dansJours(devoir.type === "devoir" ? 3 : 5),
        createdAt: FieldValue.serverTimestamp(),
      });
      rapport.devoirs += 1;
    }
  }

  console.log(
    `🏫 seedAdminData ok — classes:${rapport.classes} profs:${rapport.profs} epreuves:${rapport.epreuves} tickets:${rapport.tickets} devoirs:${rapport.devoirs} (TermD:${rapport.elevesEnClasse})`,
  );
  return { ok: true, ...rapport };
});

// Crée un devoir pour toute une classe (réservé prof/admin).
// Chaque élève de la classe reçoit sa propre copie dans `assignments`.
exports.createAssignment = onCall(async (request) => {
  const data = request.data || {};
  const auth = requireAuth(request);
  const user = await getUserWithRole(auth.uid);
  requireRole(user.role, ["professeur", "admin"]);

  const title = (data.title || "").trim();
  const subject = (data.subject || "").trim();
  const type = data.type || "devoir";
  const classe = (data.classe || "").trim();

  for (const champ of [["title", title], ["subject", subject], ["classe", classe]]) {
    if (!champ[1]) {
      throw new HttpsError("invalid-argument", `Le champ « ${champ[0]} » est obligatoire.`);
    }
  }

  let dueDate = Timestamp.fromDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
  if (data.dueDate) {
    const dateParsed = new Date(data.dueDate);
    if (!Number.isNaN(dateParsed.getTime())) {
      dueDate = Timestamp.fromDate(dateParsed);
    }
  }

  const eleves = await db.collection("users").where("role", "==", "eleve").where("classe", "==", classe).get();

  let count = 0;
  const batch = db.batch();
  eleves.forEach((eleveDoc) => {
    batch.set(db.collection("assignments").doc(), {
      userId: eleveDoc.id,
      classe,
      subject,
      type,
      title,
      profName: user.displayName || "Professeur",
      profUid: auth.uid,
      status: "à faire",
      dueDate,
      createdAt: FieldValue.serverTimestamp(),
    });
    count += 1;
  });

  if (count > 0) await batch.commit();

  console.log(`📚 Devoir créé : ${title} (${classe}) par ${user.displayName} — ${count} élève(s)`);
  return { ok: true, count, classe };
});