const { onCall } = require("firebase-functions/v2/https");
const { admin, FieldValue } = require("../firebase");
const { requireAuth } = require("../helpers");

// ============================================
// PARTIE ÉLÈVE — Les cours
// ============================================

// Remplit la collection "courses" avec les matières de la maquette.
// Idempotent : si des cours existent déjà, on ne les réécrit pas.
exports.seedCourses = onCall(async (request) => {
  requireAuth(request);
  const db = admin.firestore();

  const snapshot = await db.collection("courses").get();
  if (!snapshot.empty) {
    console.log(`ℹ️ Cours déjà présents (${snapshot.size}), rien à faire.`);
    return { ok: true, already: snapshot.size };
  }

  const cours = [
    { matiere: "Mathématiques", chapitres: 8, enseignant: "M. Kodjo Aziaka" },
    { matiere: "Français", chapitres: 10, enseignant: "Mme Adjoa Lawson" },
    { matiere: "Physique-Chimie", chapitres: 13, enseignant: "Mme Essowè Bakoma" },
    { matiere: "Histoire-Géographie", chapitres: 15, enseignant: "M. Sena Amégan" },
    { matiere: "SVT", chapitres: 10, enseignant: "M. Yao Kpodar" },
    { matiere: "Anglais", chapitres: 11, enseignant: "Mme Julia Cole" },
  ];

  const batch = db.batch();
  cours.forEach((c) => {
    const ref = db.collection("courses").doc();
    batch.set(ref, {
      ...c,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();

  console.log(`✅ ${cours.length} matières ajoutées à la collection "courses".`);
  return { ok: true, count: cours.length };
});