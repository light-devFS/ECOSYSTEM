export const mockChapterDetails = {
  ch1: {
    chapitre: 'Suites numériques',
    matiere: 'Mathématiques',
    niveau: 'Terminale D',
    statut: 'planifie',
    exercices: [
      {
        id: 'ex1',
        titre: 'Suites arithmétiques — Introduction',
        type: "Série d'exercices",
        apercu: 'Détermine le terme général de la suite définie par...',
      },
      {
        id: 'ex2',
        titre: 'Suites arithmétiques — Application',
        type: 'Quiz auto-corrigé',
        apercu: '6 questions à choix multiples sur la convergence.',
      },
    ],
    seances: [
      { id: 's1', date: '02/09/26', titre: 'Introduction aux suites numériques' },
      { id: 's2', date: '09/09/26', titre: 'Suites arithmétiques : exercices dirigés' },
    ],
  },
  ch2: {
    chapitre: 'Fonctions et dérivées',
    matiere: 'Mathématiques',
    niveau: 'Terminale D',
    statut: 'en-cours',
    exercices: [
      {
        id: 'ex3',
        titre: 'Dérivées composées',
        type: 'Explication alternative',
        apercu: "Reprenons la règle de la chaîne à l'aide d'un exemple concret...",
      },
    ],
    seances: [{ id: 's3', date: '16/09/26', titre: 'Dérivées usuelles et composées' }],
  },
  ch3: {
    chapitre: 'Probabilités conditionnelles',
    matiere: 'Mathématiques',
    niveau: 'Terminale D',
    statut: 'termine',
    exercices: [
      {
        id: 'ex4',
        titre: 'Probabilités conditionnelles — Quiz',
        type: 'Quiz de révision',
        apercu: '8 questions à choix multiples, difficulté progressive.',
      },
    ],
    seances: [{ id: 's4', date: '23/09/26', titre: 'Synthèse et évaluation' }],
  },
}