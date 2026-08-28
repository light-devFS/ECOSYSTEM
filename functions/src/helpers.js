const { HttpsError } = require("firebase-functions/v2/https");
const { admin } = require("./firebase");

// Vérifie que l'appelant est connecté et renvoie ses infos d'auth
function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Vous devez être connecté pour effectuer cette action.",
    );
  }
  return request.auth;
}

// Récupère le profil Firestore (users/{uid}) de l'utilisateur connecté
async function getUserWithRole(uid) {
  const userDoc = await admin.firestore().collection("users").doc(uid).get();
  if (!userDoc.exists) {
    throw new HttpsError(
      "not-found",
      "Profil utilisateur introuvable.",
    );
  }
  return userDoc.data();
}

// Vérifie que le rôle de l'utilisateur est autorisé pour cette action
function requireRole(role, rolesAutorises) {
  if (!rolesAutorises.includes(role)) {
    throw new HttpsError(
      "permission-denied",
      `Action réservée aux rôles : ${rolesAutorises.join(", ")}.`,
    );
  }
}

module.exports = { admin, requireAuth, getUserWithRole, requireRole };