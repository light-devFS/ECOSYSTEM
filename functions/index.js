/* eslint-disable*/
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// ============================================
// 1. Fonction déclenchée à la création d'un utilisateur
// ============================================
exports.createUserDocument = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const email = user.email || "email-inconnu@exemple.com";
  const displayName = user.displayName || "Élève";

  console.log(`Création du document pour l'utilisateur : ${email} (UID: ${uid})`);

  try {
    await admin.firestore().collection("users").doc(uid).set({
      displayName,
      email,
      role: "eleve",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      progress: {
        overall: 0,
        streak: 0,
      },
      subjects: {
        math: 0,
        philosophy: 0,
        english: 0,
        svt: 0,
      },
    });

    console.log(`✅ Document utilisateur créé avec succès pour ${email}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la création du document pour ${email} :`, error);
  }
});

// ============================================
// 2. Fonction callable : Tuteur IA avec Gemini
// ============================================
exports.tutorAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Vous devez être connecté pour utiliser le tuteur IA.",
    );
  }

  const { message } = data;
  const uid = context.auth.uid;

  if (!message || message.trim().length === 0) {
    throw new functions.https.HttpsError(
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
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Récupérer la clé API Gemini
    const geminiApiKey = functions.config().gemini.key;
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
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
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
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    throw new functions.https.HttpsError(
      "internal",
      "Erreur lors du traitement de la requête.",
    );
  }
});

// ============================================
// 3. Fonction callable : Authentification pour l'OS (EDU OS)
// ============================================
exports.authenticateForOS = functions.https.onCall(async (data, context) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email et mot de passe sont requis.",
    );
  }

  console.log(`Tentative d'authentification OS pour : ${email}`);

  try {
    // Récupérer la clé API Firebase Web
    const firebaseApiKey = functions.config().firebase.api_key;
    if (!firebaseApiKey) {
      console.error("Clé API Firebase non configurée.");
      throw new Error("Clé API Firebase non configurée.");
    }

    // Appeler l'API REST d'authentification Firebase
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const uid = response.data.localId;

    // Créer un custom token pour cet utilisateur
    const customToken = await admin.auth().createCustomToken(uid);

    console.log(`✅ Authentification OS réussie pour ${email} (UID: ${uid})`);

    return {
      customToken,
      uid,
    };
  } catch (error) {
    console.error("❌ Erreur d'authentification OS :", error);
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Identifiants invalides.",
    );
  }
});