/* eslint-disable*/
// ============================================
// ECOSYSTEM — Backend Cloud Functions (point d'entrée)
// Chaque module gère un domaine. On re-exporte tout ici.
// ============================================

const users = require("./src/users");
const tutor = require("./src/tutor");
const exams = require("./src/exams");
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

// PARTIE ÉLÈVE
exports.seedCourses = courses.seedCourses;
exports.seedStudentExercises = exercises.seedStudentExercises;
exports.submitExerciseResult = exercises.submitExerciseResult;
exports.seedStudentProgression = progression.seedStudentProgression;