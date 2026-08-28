const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { admin, FieldValue } = require("./firebase");
const { requireAuth, getUserWithRole, requireRole } = require("./helpers");

// ============================================
// Banque collaborative d'épreuves
// ============================================

// Remplit la banque d'épreuves avec des exemples (réservé prof/admin)
exports.seedExamBank = onCall(async (request) => {
  const auth = requireAuth(request);
  const user = await getUserWithRole(auth.uid);
  requireRole(user.role, ["professeur", "admin"]);

  const epreuves = [
    {
      titre: "Épreuve de Mathématiques — BAC 2 Série D 2024",
      type: "Examen",
      matiere: "Mathématiques",
      niveau: "Terminale D",
      serie: "D",
      annee: 2024,
      chapitres: ["Suites numériques", "Fonctions"],
      pays: "Togo",
      ecole: "Lycée Moderne de Lomé",
      statut: "publie",
    },
    {
      titre: "Épreuve de Physique-chimie — BAC 2 Série C 2024",
      type: "Examen",
      matiere: "Physique-chimie",
      niveau: "Terminale C",
      serie: "C",
      annee: 2024,
      chapitres: ["Mécanique", "Chimie organique"],
      pays: "Togo",
      ecole: "Lycée Moderne de Lomé",
      statut: "publie",
    },
    {
      titre: "Composition de SVT — Terminale D (devoir)",
      type: "Devoir",
      matiere: "SVT",
      niveau: "Terminale D",
      serie: "D",
      annee: 2025,
      chapitres: ["Génétique", "Immunologie"],
      pays: "Togo",
      ecole: "Collège d'Enseignement Général de Kara",
      statut: "publie",
    },
    {
      titre: "Épreuve d'Anglais — BAC Blanc Série A4",
      type: "Examen",
      matiere: "Anglais",
      niveau: "Terminale A4",
      serie: "A4",
      annee: 2025,
      chapitres: ["Reading comprehension"],
      pays: "Togo",
      ecole: "",
      statut: "publie",
    },
    {
      titre: "Concours de mathématiques — Lycée de Lomé",
      type: "Concours",
      matiere: "Mathématiques",
      niveau: "Terminale C",
      serie: "C",
      annee: 2023,
      chapitres: ["Géométrie dans l'espace"],
      pays: "Togo",
      ecole: "Lycée de Lomé",
      statut: "publie",
    },
  ];

  const db = admin.firestore();
  const batch = db.batch();

  epreuves.forEach((epreuve) => {
    const ref = db.collection("exams").doc();
    batch.set(ref, {
      ...epreuve,
      deposePar: {
        uid: auth.uid,
        displayName: user.displayName || "Professeur",
      },
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();

  console.log(`✅ Banque d'épreuves remplie avec ${epreuves.length} épreuves par ${user.displayName}`);
  return { ok: true, count: epreuves.length };
});

// Dépose une épreuve dans la banque (réservé prof/admin)
exports.depositExam = onCall(async (request) => {
  const data = request.data;
  const auth = requireAuth(request);
  const user = await getUserWithRole(auth.uid);
  requireRole(user.role, ["professeur", "admin"]);

  const champsObligatoires = ["titre", "type", "matiere", "niveau"];
  for (const champ of champsObligatoires) {
    if (!data[champ] || data[champ].trim().length === 0) {
      throw new HttpsError(
        "invalid-argument",
        `Le champ « ${champ} » est obligatoire.`,
      );
    }
  }

  const ref = await admin.firestore().collection("exams").add({
    titre: data.titre.trim(),
    type: data.type,
    matiere: data.matiere,
    niveau: data.niveau,
    serie: data.serie || "",
    annee: data.annee || null,
    chapitres: Array.isArray(data.chapitres) ? data.chapitres : [],
    pays: data.pays || "Togo",
    ecole: data.ecole || "",
    fileURL: data.fileURL || "",
    solutionsURL: data.solutionsURL || "",
    statut: "publie",
    deposePar: {
      uid: auth.uid,
      displayName: user.displayName || "Professeur",
    },
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(`✅ Épreuve déposée : ${data.titre} (par ${user.displayName})`);
  return { id: ref.id };
});

// Signale une épreuve suspecte (tout utilisateur connecté)
exports.signalExam = onCall(async (request) => {
  const data = request.data;
  const auth = requireAuth(request);

  const examId = data.examId;
  if (!examId || examId.trim().length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "L'identifiant de l'épreuve est obligatoire.",
    );
  }

  await admin.firestore().collection("exams").doc(examId).update({
    statut: "signale",
    motifSignalement: data.motif || "Contenu inapproprié",
    signaleLe: FieldValue.serverTimestamp(),
    signalePar: auth.uid,
  });

  console.log(`🚩 Épreuve signalée : ${examId} (par ${auth.uid})`);
  return { ok: true, examId };
});