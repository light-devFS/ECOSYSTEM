export const mockProfDashboard = {
  stats: {
    classesActives: 4,
    classesActivesCaption: 'Tle D, C ; 1ere D, S',
    comprehensionMoyenne: '71%',
    devoirsACorriger: 27,
    devoirsACorrigerCaption: 'Sur 3 classes',
    ticketsEnAttente: 5,
    ticketsEnAttenteCaption: '2 Urgents',
  },
  alertesComprehension: [
    {
      id: 'ac1',
      titre: 'Suites géométriques',
      description: "Terminale D · 34% des élèves en difficulté",
      label: 'Prioritaire',
      variant: 'danger',
    },
    {
      id: 'ac2',
      titre: 'Dérivées composées',
      description: "Terminale D · 21% des élèves en difficulté",
      label: 'A surveiller',
      variant: 'warning',
    },
    {
      id: 'ac3',
      titre: 'Probabilités conditionnelles',
      description: "Première S1 · 12% des élèves en difficulté",
      label: 'Stable',
      variant: 'teal',
    },
  ],
  devoirsACorrigerListe: [
    { id: 'dc1', devoir: 'Suites arithmétiques', classe: 'Terminale D', rendus: '24 / 31' },
    { id: 'dc2', devoir: 'Dérivées', classe: 'Terminale C', rendus: '29 / 29' },
  ],
  mesClasses: [
    { id: 'c1', nom: 'Terminale D', eleves: 31, maitrise: 85, color: 'success' },
    { id: 'c2', nom: 'Terminale C', eleves: 29, maitrise: 68, color: 'warning' },
    { id: 'c3', nom: 'Première D', eleves: 33, maitrise: 59, color: 'danger' },
  ],
}