const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { admin, FieldValue } = require("../firebase");
const { requireAuth } = require("../helpers");

// ============================================
// PARTIE ÉLÈVE — Les exercices
// ============================================

// Crée les exercices de démonstration pour l'élève connecté.
// Idempotent : si l'élève a déjà des exercices, on ne les réécrit pas.
exports.seedStudentExercises = onCall(async (request) => {
  const auth = requireAuth(request);
  const db = admin.firestore();

  const existing = await db
    .collection("exercises")
    .where("userId", "==", auth.uid)
    .get();

  if (!existing.empty) {
    console.log(`ℹ️ Exercices déjà présents pour ${auth.uid} (${existing.size}).`);
    return { ok: true, already: existing.size };
  }

  const exercices = [
    {
      titre: "Suites arithmétiques",
      matiere: "Mathématiques",
      competence: "Suites numériques",
      difficulte: "moyen",
      statut: "en-cours",
      score: null,
    },
    {
      titre: "Circuits en série et dérivation",
      matiere: "Physique-Chimie",
      competence: "Électricité",
      difficulte: "moyen",
      statut: "a-faire",
      score: null,
    },
    {
      titre: "Compréhension orale",
      matiere: "Anglais",
      competence: "Écoute active",
      difficulte: "difficile",
      statut: "a-faire",
      score: null,
    },
    {
      titre: "Vocabulaire de la cellule",
      matiere: "SVT",
      competence: "Biologie cellulaire",
      difficulte: "facile",
      statut: "a-faire",
      score: null,
    },
  ];

  const batch = db.batch();
  exercices.forEach((ex) => {
    const ref = db.collection("exercises").doc();
    batch.set(ref, {
      ...ex,
      userId: auth.uid,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();

  console.log(`✅ ${exercices.length} exercices créés pour l'élève ${auth.uid}.`);
  return { ok: true, count: exercices.length };
});

// Envoie le résultat d'un exercice terminé (score /100).
// Met à jour : l'exercice, la progression de la matière, la progression globale.
exports.submitExerciseResult = onCall(async (request) => {
  const data = request.data;
  const auth = requireAuth(request);
  const db = admin.firestore();

  const { exerciseId, score } = data;
  if (!exerciseId || exerciseId.trim().length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "L'identifiant de l'exercice est obligatoire.",
    );
  }
  if (typeof score !== "number" || score < 0 || score > 100) {
    throw new HttpsError(
      "invalid-argument",
      "Le score doit être un nombre entre 0 et 100.",
    );
  }

  // 1. Récupérer l'exercice et vérifier qu'il appartient à l'élève
  const exRef = db.collection("exercises").doc(exerciseId);
  const exDoc = await exRef.get();
  if (!exDoc.exists) {
    throw new HttpsError(
      "not-found",
      "Exercice introuvable.",
    );
  }
  const ex = exDoc.data();
  if (ex.userId !== auth.uid) {
    throw new HttpsError(
      "permission-denied",
      "Cet exercice ne vous appartient pas.",
    );
  }

  // 2. Marquer l'exercice comme terminé
  await exRef.update({
    statut: "termine",
    score,
    submittedAt: FieldValue.serverTimestamp(),
  });

  // 3. Mettre à jour la progression de l'élève pour cette matière
  const progRef = db.collection("progressions").doc(`${auth.uid}_${ex.matiere}`);
  const progDoc = await progRef.get();

  if (progDoc.exists) {
    const dataProg = progDoc.data();
    const competences = Array.isArray(dataProg.competences) ? dataProg.competences : [];

    const index = competences.findIndex((c) => c.competence === ex.competence);
    if (index >= 0) {
      competences[index].percent = score;
    } else {
      competences.push({ competence: ex.competence, percent: score });
    }

    const erreurs = Array.isArray(dataProg.erreursFrequentes) ? dataProg.erreursFrequentes : [];
    if (score < 50 && !erreurs.includes(ex.competence)) {
      erreurs.push(ex.competence);
    }

    await progRef.update({
      competences,
      erreursFrequentes: erreurs,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    await progRef.set({
      userId: auth.uid,
      matiere: ex.matiere,
      competences: [{ competence: ex.competence, percent: score }],
      erreursFrequentes: score < 50 ? [ex.competence] : [],
      revisionsProgrammees: [],
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // 4. Recalculer la progression globale (moyenne des scores) + streak
  const allDone = await db
    .collection("exercises")
    .where("userId", "==", auth.uid)
    .where("statut", "==", "termine")
    .get();

  const scores = [];
  allDone.forEach((doc) => {
    if (typeof doc.data().score === "number") scores.push(doc.data().score);
  });
  const overall = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const userRef = db.collection("users").doc(auth.uid);
  const userDoc = await userRef.get();
  const prevProgress = userDoc.exists && userDoc.data().progress ? userDoc.data().progress : { streak: 0 };

  const today = new Date().toISOString().slice(0, 10);
  const lastDay = prevProgress.lastSubmissionDate || "";
  const streak = lastDay === today ? prevProgress.streak : (prevProgress.streak || 0) + 1;

  await userRef.set(
    {
      progress: {
        overall,
        streak,
        lastSubmissionDate: today,
      },
    },
    { merge: true },
  );

  console.log(`🎯 Exercice ${exerciseId} noté : ${score}/100 → progression globale ${overall}% (streak ${streak}).`);
  return { ok: true, overall, streak };
});