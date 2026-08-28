const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { admin, FieldValue } = require("./firebase");
const axios = require("axios");

// La clé API Gemini est stockée comme secret Firebase (jamais dans le code)
const geminiKey = defineSecret("GEMINI_KEY");

// ============================================
// Tuteur IA avec Gemini (v2)
// ============================================
exports.tutorAI = onCall({ secrets: [geminiKey] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Vous devez être connecté pour utiliser le tuteur IA.",
    );
  }

  const { message } = request.data;
  const uid = request.auth.uid;

  if (!message || message.trim().length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "Le message ne peut pas être vide.",
    );
  }

  console.log(`Tuteur IA - Utilisateur ${uid} : ${message}`);

  try {
    // Enregistrer le message de l'élève
    await admin.firestore().collection("chatHistory").add({
      userId: uid,
      author: "eleve",
      text: message,
      timestamp: FieldValue.serverTimestamp(),
    });

    // Récupérer la clé API Gemini depuis les secrets
    const geminiApiKey = geminiKey.value();
    if (!geminiApiKey) {
      console.error("Clé API Gemini non configurée.");
      throw new Error("Clé API Gemini non configurée.");
    }

    // Appeler l'API Gemini
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Tu es un tuteur scolaire bienveillant. Réponds à la question suivante de manière claire, pédagogique et adaptée à un élève de lycée. Question : ${message}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const replyText = response.data.candidates[0].content.parts[0].text;

    // Enregistrer la réponse du tuteur
    const replyRef = await admin.firestore().collection("chatHistory").add({
      userId: uid,
      author: "tuteur",
      text: replyText,
      timestamp: FieldValue.serverTimestamp(),
    });

    console.log(`Réponse envoyée à l'utilisateur ${uid}`);

    return {
      id: replyRef.id,
      author: "tuteur",
      text: replyText,
    };
  } catch (error) {
    console.error("Erreur Tuteur IA :", error);

    const errorMessage = "Désolé, je n'ai pas pu traiter ta question pour le moment. Réessaie plus tard.";

    await admin.firestore().collection("chatHistory").add({
      userId: uid,
      author: "tuteur",
      text: errorMessage,
      timestamp: FieldValue.serverTimestamp(),
    });

    throw new HttpsError(
      "internal",
      "Erreur lors du traitement de la requête.",
    );
  }
});