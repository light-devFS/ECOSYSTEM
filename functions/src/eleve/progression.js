const { onCall } = require("firebase-functions/v2/https");
const { admin, FieldValue } = require("../firebase");
const { requireAuth } = require("../helpers");

// ============================================
// PARTIE ÉLÈVE — Progression & compétences
// ============================================

// Crée la progression de départ pour l'élève connecté (une doc par matière).
// On saute les matières déjà présentes pour ne pas écraser les vrais résultats.
exports.seedStudentProgression = onCall(async (request) => {
  const auth = requireAuth(request);
  const db = admin.firestore();

  const bases = [
    {
      matiere: "Mathématiques",
      competences: [
        { competence: "Fonctions et dérivées", percent: 60 },
        { competence: "Suites numériques", percent: 35 },
        { competence: "Probabilités", percent: 85 },
      ],
      erreursFrequentes: ["Confusion suite arithmétique / géométrique"],
      revisionsProgrammees: [
        { periode: "Demain", titre: "Dérivées usuelles", matiere: "Mathématiques" },
      ],
    },
    {
      matiere: "Français",
      competences: [
        { competence: "Grammaire", percent: 70 },
        { competence: "Analyse de texte", percent: 45 },
      ],
      erreursFrequentes: [],
      revisionsProgrammees: [],
    },
    {
      matiere: "SVT",
      competences: [{ competence: "Biologie cellulaire", percent: 97 }],
      erreursFrequentes: [],
      revisionsProgrammees: [
        { periode: "Aujourd'hui", titre: "Vocabulaire de la cellule", matiere: "SVT" },
      ],
    },
    {
      matiere: "Anglais",
      competences: [{ competence: "Écoute active", percent: 30 }],
      erreursFrequentes: [],
      revisionsProgrammees: [
        { periode: "Dans 3 jours", titre: "Conjugaison — prétérit", matiere: "Anglais" },
      ],
    },
  ];

  const batch = db.batch();
  let count = 0;

  for (const base of bases) {
    const ref = db.collection("progressions").doc(`${auth.uid}_${base.matiere}`);
    const doc = await ref.get();
    if (!doc.exists) {
      batch.set(ref, {
        userId: auth.uid,
        ...base,
        updatedAt: FieldValue.serverTimestamp(),
      });
      count++;
    }
  }

  await batch.commit();
  console.log(`✅ Progression de départ créée pour ${auth.uid} (${count} matière(s)).`);
  return { ok: true, count };
});