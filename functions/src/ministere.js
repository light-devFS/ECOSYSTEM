const {onCall} = require("firebase-functions/v2/https");
const {admin, FieldValue} = require("./firebase");
const {requireAuth, getUserWithRole, requireRole} = require("./helpers");

const db = admin.firestore();

// ============================================
// ESPACE MINISTÈRE
// ============================================
// Le ministère supervise le système à l'échelle nationale, avec le
// MOINDRE PRIVILÈGE : il consulte des données agrégées (jamais nominatives),
// gère les programmes officiels et exporte des rapports.
// Réservé : role "ministere" (créé par l'admin via createUserAccount).

// --- Programmes officiels de référence (par pays / niveau / matière)
const PROGRAMMES = [
  {
    pays: "Togo",
    niveau: "Terminale",
    matiere: "Mathématiques",
    chapitres: [
      "Analyse",
      "Suites numériques",
      "Probabilités",
      "Géométrie dans l'espace",
    ],
  },
  {
    pays: "Togo",
    niveau: "Première",
    matiere: "Mathématiques",
    chapitres: [
      "Fonctions",
      "Statistiques",
      "Vecteurs et droites",
      "Produit scalaire",
    ],
  },
  {
    pays: "Togo",
    niveau: "Terminale",
    matiere: "SVT",
    chapitres: ["Génétique", "Écosystèmes", "Immunologie", "Géologie"],
  },
];

// Crée les données de démonstration du ministère : programmes officiels +
// indicateurs agrégés nationaux. Idempotent. Réservé : admin.
exports.seedMinistryData = onCall(async (request) => {
  const auth = requireAuth(request);
  const user = await getUserWithRole(auth.uid);
  requireRole(user.role, ["admin"]);

  const rapport = {programmes: 0, indicateurs: 0};

  // --- 1. Programmes officiels
  for (const programme of PROGRAMMES) {
    const existant = await db
        .collection("curriculums")
        .where("pays", "==", programme.pays)
        .where("niveau", "==", programme.niveau)
        .where("matiere", "==", programme.matiere)
        .get();
    if (existant.empty) {
      await db.collection("curriculums").add({
        ...programme,
        createdAt: FieldValue.serverTimestamp(),
      });
      rapport.programmes += 1;
    }
  }

  // --- 2. Indicateurs agrégés nationaux (anonymes, par matière)
  const indicateurs = [
    {
      matiere: "Mathématiques",
      maîtriseMoyenne: 62,
      elevesActifs: 1240,
      tauxReussite: 68,
    },
    {
      matiere: "SVT",
      maîtriseMoyenne: 70,
      elevesActifs: 980,
      tauxReussite: 74,
    },
    {
      matiere: "Anglais",
      maîtriseMoyenne: 55,
      elevesActifs: 1180,
      tauxReussite: 60,
    },
    {
      matiere: "Philosophie",
      maîtriseMoyenne: 66,
      elevesActifs: 890,
      tauxReussite: 71,
    },
  ];
  const docAgg = db.collection("national_stats").doc("indicateurs");
  const snap = await docAgg.get();
  if (!snap.exists) {
    await docAgg.set({
      indicateurs,
      miseAJour: FieldValue.serverTimestamp(),
    });
    rapport.indicateurs = indicateurs.length;
  }

  console.log(
      `✅ Seed ministère : ${rapport.programmes} programmes, ` +
      `${rapport.indicateurs} indicateurs`);

  return rapport;
});

// Statistiques agrégées nationales + indicateurs.
// Réservé : ministere (+ admin).
// Ne renvoie QUE des données anonymes/agrégées (moindre privilège).
exports.getNationalStatistics = onCall(async (request) => {
  const auth = requireAuth(request);
  const user = await getUserWithRole(auth.uid);
  requireRole(user.role, ["ministere", "admin"]);

  // --- Comptage agrégé (peu coûteux, démo)
  const [elevesSnap, profsSnap, classesSnap, curriculumsSnap, indicateursSnap] =
    await Promise.all([
      db.collection("users").where("role", "==", "eleve").count().get(),
      db.collection("users").where("role", "==", "professeur").count().get(),
      db.collection("classes").count().get(),
      db.collection("curriculums").count().get(),
      db.collection("national_stats").doc("indicateurs").get(),
    ]);

  const indicateurs = indicateursSnap.exists ?
    indicateursSnap.data().indicateurs || [] :
    [];

  console.log(`📊 Stats nationales consultées par ${user.displayName}`);

  return {
    totals: {
      eleves: elevesSnap.data().count,
      professeurs: profsSnap.data().count,
      classes: classesSnap.data().count,
      programmes: curriculumsSnap.data().count,
    },
    indicateurs,
    note: "Données agrégées et anonymes uniquement (moindre privilège).",
  };
});

// Liste les programmes officiels (par filtre pays/niveau/matière optionnel).
// Réservé : ministere (+ admin).
exports.getNationalCurriculums = onCall(async (request) => {
  const auth = requireAuth(request);
  const user = await getUserWithRole(auth.uid);
  requireRole(user.role, ["ministere", "admin"]);

  const {pays, niveau, matiere} = request.data || {};
  let query = db.collection("curriculums");
  if (pays) query = query.where("pays", "==", pays);
  if (niveau) query = query.where("niveau", "==", niveau);
  if (matiere) query = query.where("matiere", "==", matiere);

  const snap = await query.get();
  const programmes = snap.docs.map((doc) => ({id: doc.id, ...doc.data()}));

  console.log(
      `📚 ${programmes.length} programmes consultés par ${user.displayName}`);
  return {programmes};
});

// Export d'un rapport national agrégé (CSV-like, non nominatif).
// Réservé : ministere (+ admin).
exports.exportNationalReport = onCall(async (request) => {
  const auth = requireAuth(request);
  const user = await getUserWithRole(auth.uid);
  requireRole(user.role, ["ministere", "admin"]);

  const stats = await exports.getNationalStatistics(request);

  const lignes = [
    "indicateur, valeur",
    `eleves, ${stats.totals.eleves}`,
    `professeurs, ${stats.totals.professeurs}`,
    `classes, ${stats.totals.classes}`,
    `programmes_officiels, ${stats.totals.programmes}`,
    ...stats.indicateurs.map(
        (i) => `maitrise_${i.matiere}, ${i.maîtriseMoyenne}%`,
    ),
  ];
  const csv = lignes.join("\n");

  console.log(
      `📦 Rapport exporté par ${user.displayName} ` +
      `(${stats.indicateurs.length} matières)`);
  return {
    filename: `rapport_national_${new Date().toISOString().slice(0, 10)}.csv`,
    content: csv,
  };
});
