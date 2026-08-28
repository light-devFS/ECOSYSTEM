const { onUserCreated } = require("firebase-functions/v2/identity");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { admin, FieldValue } = require("./firebase");
const { requireAuth, getUserWithRole, requireRole } = require("./helpers");

// ============================================
// Profil utilisateur — créé à l'inscription
// ============================================
// Écouteur "fallback" : crée le profil seulement s'il n'existe pas déjà.
// Ainsi, un compte créé par l'école (createUserAccount) garde son rôle.
exports.createUserDocument = onUserCreated(async (user) => {
  const uid = user.uid;
  const email = user.email || "email-inconnu@exemple.com";
  const displayName = user.displayName || "Élève";

  console.log(`Création du document pour l'utilisateur : ${email} (UID: ${uid})`);

  try {
    const userDocRef = admin.firestore().collection("users").doc(uid);
    const snapshot = await userDocRef.get();

    if (snapshot.exists) {
      console.log(`ℹ️ Profil déjà présent pour ${email}, on ne l'écrase pas.`);
      return;
    }

    await userDocRef.set({
      displayName,
      email,
      role: "eleve",
      createdAt: FieldValue.serverTimestamp(),
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
// Comptes créés par l'école (administrateurs/profs)
// ============================================
// Crée un compte réel (Firebase Auth) + son profil Firestore.
// Les identifiants (email, identifiant, mot de passe) sont remis à l'élève.
exports.createUserAccount = onCall(async (request) => {
  const data = request.data;
  const auth = requireAuth(request);
  const creator = await getUserWithRole(auth.uid);
  requireRole(creator.role, ["professeur", "admin"]);

  // --- Validations des entrées
  const displayName = (data.displayName || "").trim();
  const email = (data.email || "").trim();
  const role = data.role || "eleve";
  const password = data.password || "";
  const identifier = (data.identifier || "").trim();

  if (!displayName) {
    throw new HttpsError("invalid-argument", "Le nom complet est obligatoire.");
  }

  const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValide) {
    throw new HttpsError("invalid-argument", "L'adresse e-mail n'est pas valide.");
  }

  const rolesAutorises = ["eleve", "professeur", "parent", "admin"];
  if (!rolesAutorises.includes(role)) {
    throw new HttpsError(
      "invalid-argument",
      `Le rôle doit être l'un des suivants : ${rolesAutorises.join(", ")}.`,
    );
  }

  // --- Vérifier que l'e-mail n'est pas déjà utilisé
  try {
    await admin.auth().getUserByEmail(email);
    throw new HttpsError("already-exists", "Un compte existe déjà avec cette adresse e-mail.");
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    // Sinon : c'est une erreur "user-not-found" → l'e-mail est libre, on continue.
  }

  // --- Mot de passe (fourni ou temporaire généré)
  let finalPassword = password;
  if (!finalPassword || finalPassword.length < 6) {
    finalPassword = `temp${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // --- Identifiant (fourni ou généré, ex. "AWA26")
  let finalIdentifier = identifier;
  if (!finalIdentifier) {
    const prenom = displayName.split(/\s+/)[0]
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    finalIdentifier = `${prenom}${String(new Date().getFullYear()).slice(-2)}`;
  }

  console.log(`Création du compte : ${email} (rôle ${role}) par ${creator.displayName}`);

  // --- Créer le compte Auth réel
  const userRecord = await admin.auth().createUser({
    email,
    password: finalPassword,
    displayName,
  });

  // --- Créer le profil Firestore (set complet : le rôle écrit ici gagne)
  await admin.firestore().collection("users").doc(userRecord.uid).set({
    displayName,
    email,
    identifier: finalIdentifier,
    role,
    createdAt: FieldValue.serverTimestamp(),
    progress: {
      overall: 0,
      streak: 0,
    },
    subjects: {
      "Mathématiques": 0,
      "Français": 0,
      "Physique-Chimie": 0,
      "Histoire-Géographie": 0,
      "SVT": 0,
      "Anglais": 0,
    },
  });

  console.log(`✅ Compte créé : ${email} — identifiant ${finalIdentifier} (rôle ${role})`);

  return {
    uid: userRecord.uid,
    email,
    identifier: finalIdentifier,
    tempPassword: finalPassword,
    role,
  };
});