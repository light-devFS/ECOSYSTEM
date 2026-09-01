/* eslint-disable*/
// ============================================
// ECOSYSTEM — Backend Cloud Functions (point d'entrée)
// Chaque module gère un domaine. On re-exporte tout ici.
// ============================================

const users = require("./src/users");
const tutor = require("./src/tutor");
const exams = require("./src/exams");
const admin = require("./src/admin");
const parent = require("./src/parent");
const ministere = require("./src/ministere");
const courses = require("./src/eleve/courses");
const exercises = require("./src/eleve/exercises");
const progression = require("./src/eleve/progression");

// Profil utilisateur (auto à l'inscription)
exports.createUserDocument = users.createUserDocument;

// Comptes créés par l'école (rôles contrôlés)
exports.createUserAccount = users.createUserAccount;

// Tuteur IA (Gemini)
exports.tutorAI = tutor.tutorAI;

// Banque d'épreuves
exports.seedExamBank = exams.seedExamBank;
exports.depositExam = exams.depositExam;
exports.signalExam = exams.signalExam;

// ADMINISTRATION & PROFESSEURS
exports.seedAdminData = admin.seedAdminData;
exports.createAssignment = admin.createAssignment;
exports.updateTicketStatut = admin.updateTicketStatut;
exports.createTicketGroupe = admin.createTicketGroupe;

// ESPACE PARENT
exports.seedParentData = parent.seedParentData;
exports.linkChildToParent = parent.linkChildToParent;

// ESPACE MINISTÈRE
exports.seedMinistryData = ministere.seedMinistryData;
exports.getNationalStatistics = ministere.getNationalStatistics;
exports.getNationalCurriculums = ministere.getNationalCurriculums;
exports.exportNationalReport = ministere.exportNationalReport;

// PARTIE ÉLÈVE
exports.seedCourses = courses.seedCourses;
exports.seedStudentExercises = exercises.seedStudentExercises;
exports.submitExerciseResult = exercises.submitExerciseResult;
exports.seedStudentProgression = progression.seedStudentProgression;