const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { admin, FieldValue } = require("./firebase");
const { requireAuth, getUserWithRole, requireRole } = require("./helpers");

const db = admin.firestore();

// ============================================
// ESPACE PARENT
// ============================================
// Le parent suit le parcours de son (ses) enfant(s). Le lien parent →
// enfant(s) est stocké dans le profil parent (`enfants: [uid]`).
// Les lectures (dashboard, progression, devoirs, messages) sont faites
// côté client sur Firestore ; seules les écritures passent par ici.

const EMAIL_ENFANT_REFERENCE = "eleve@ecosystem.test";

// Retourne l'uid de l'enfant de référence pour la démo (Awa Mensah).
async function obtenirEnfantDeReference() {
  const snap = await db
    .collection("users")
    .where("email", "==", EMAIL_ENFANT_REFERENCE)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0].id;
}

// Crée (ou récupère) le compte parent de démonstration et le lie à
// l'enfant de référence. Réservé : admin.
exports.seedParentData = onCall(async (request) => {
  const auth = requireAuth(request);
  const user = await getUserWithRole(auth.uid);
  requireRole(user.role, ["admin"]);

  const rapport = { parent: 0, messages: 0 };

  const enfantUid = await obtenirEnfantDeReference();
  if (!enfantUid) {
    throw new HttpsError("failed-precondition", "Aucun élève « eleve@ecosystem.test » trouvé : seedAdminData d'abord.");
  }

  // --- 1. Compte parent (Auth + profil Firestore lié à l'enfant)
  const EMAIL = "parent@ecosystem.test";
  let parentUid = null;
  try {
    const record = await admin.auth().getUserByEmail(EMAIL);
    parentUid = record.uid;
  } catch (error) {
    const record = await admin.auth().createUser({
      email: EMAIL,
      password: "demo1234",
      displayName: "Parent — Awa Mensah",
      emailVerified: true,
    });
    parentUid = record.uid;
    rapport.parent = 1;
  }

  const profil = await db.collection("users").doc(parentUid).get();
  const liaison = { role: "parent", displayName: "Parent — Awa Mensah", email: EMAIL };
  if (profil.exists) {
    const data = profil.data();
    if (!(data.enfants || []).includes(enfantUid)) {
      await db.collection("users").doc(parentUid).update({
        enfants: FieldValue.arrayUnion(enfantUid),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  } else {
    await db.collection("users").doc(parentUid).set({
      ...liaison,
      enfants: [enfantUid],
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  // --- 2. Messages de démonstration adressés à l'enfant
  const messages = [
    {
      childUid: enfantUid,
      categorie: "enseignant",
      auteur: "M. Kodjo Aziaka",
      role: "Professeur de Mathématiques",
      extrait: "Je vous propose un point rapide jeudi sur les suites géométriques",
      lu: false,
    },
    {
      childUid: enfantUid,
      categorie: "administration",
      auteur: "Administration",
      role: "",
      extrait: "Rappel : réunion parents-professeurs le 5 septembre",
      lu: true,
    },
  ];

  for (const message of messages) {
    const existants = await db
      .collection("messages")
      .where("childUid", "==", enfantUid)
      .where("categorie", "==", message.categorie)
      .limit(1)
      .get();
    if (!existants.empty) continue;
    await db.collection("messages").add({
      ...message,
      createdAt: FieldValue.serverTimestamp(),
    });
    rapport.messages += 1;
  }

  console.log(`👪 seedParentData ok — parent:${rapport.parent} messages:${rapport.messages} enfant=${enfantUid}`);
  return { ok: true, parentUid, enfantUid, ...rapport };
});

// Lie un enfant (élève) au compte parent connecté. Permet au parent de
// suivre plusieurs enfants. Réservé : parent (ou admin).
exports.linkChildToParent = onCall(async (request) => {
  const data = request.data || {};
  const auth = requireAuth(request);
  const user = await getUserWithRole(auth.uid);
  requireRole(user.role, ["parent", "admin"]);

  const childUid = (data.childUid || "").trim();
  if (!childUid) {
    throw new HttpsError("invalid-argument", "Le champ « childUid » est obligatoire.");
  }

  const childSnap = await db.collection("users").doc(childUid).get();
  if (!childSnap.exists) {
    throw new HttpsError("not-found", "Profil élève introuvable.");
  }
  if (childSnap.data().role !== "eleve") {
    throw new HttpsError("invalid-argument", "Le profil cible n'est pas un élève.");
  }

  const parentRef = db.collection("users").doc(auth.uid);
  await parentRef.update({
    enfants: FieldValue.arrayUnion(childUid),
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`👪 ${user.displayName} suit maintenant l'élève ${childUid}`);
  return { ok: true, childUid };
});