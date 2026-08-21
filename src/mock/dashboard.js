/**
 * Données de démonstration du tableau de bord élève.
 * À remplacer par les appels Firestore réels dans dashboardService.
 */
export const mockDashboard = {
  stats: {
    devoirsARendre: 3,
    progression: 68,
    matiereAReviser: '08',
    streakJours: 5,
  },
  subjectsProgress: [
    { label: 'Mathématiques', percent: 90, color: 'teal' },
    { label: 'Philosophie', percent: 50, color: 'warning' },
    { label: 'Anglais', percent: 20, color: 'danger' },
    { label: 'SVT', percent: 97, color: 'success' },
  ],
  tuteurIA: {
    difficulteDetectee: 'Fonctions exponentielles',
    maitrise: 42,
  },
  tachesAVenir: [
    {
      id: 't1',
      matiere: 'Mathématiques',
      type: 'Devoirs à rendre',
      titre: 'Fonctions logarithmes',
      date: "Aujourd'hui",
    },
    {
      id: 't2',
      matiere: 'Anglais',
      type: 'Revisions',
      titre: 'Grammaire',
      date: '01 Septembre',
    },
  ],
}