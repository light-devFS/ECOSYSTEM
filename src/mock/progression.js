export const mockProgression = {
  parMatiere: {
    Mathématiques: [
      { competence: 'Fonctions et dérivées', percent: 60 },
      { competence: 'Suites numériques', percent: 35 },
      { competence: 'Probabilités', percent: 85 },
    ],
    Français: [
      { competence: 'Grammaire', percent: 70 },
      { competence: 'Analyse de texte', percent: 45 },
    ],
    SVT: [{ competence: 'Biologie cellulaire', percent: 97 }],
  },
  erreursFrequentes: [
    'Confusion suite arithmétique / géométrique',
    'Erreur de signe en dérivation',
  ],
  revisionsProgrammees: [
    { periode: "Aujourd'hui", titre: 'Vocabulaire de la cellule', matiere: 'SVT' },
    { periode: 'Demain', titre: 'Dérivées usuelles', matiere: 'Mathématiques' },
    { periode: 'Dans 3 jours', titre: 'Conjugaison — prétérit', matiere: 'Anglais' },
    { periode: 'Dans 6 jours', titre: 'Fonctions trigonométriques', matiere: 'Mathématiques' },
  ],
}