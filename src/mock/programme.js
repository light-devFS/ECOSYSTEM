export const mockProgramme = {
  pays: ['Togo'],
  niveaux: ['Terminale D'],
  matieres: ['Mathématiques'],
  chapitres: [
    {
      id: 'ch1',
      chapitre: 'Suites numériques',
      statut: 'planifie',
      contenusIA: 'Exercices IA validés',
      ouvrable: true,
    },
    {
      id: 'ch2',
      chapitre: 'Fonctions et dérivées',
      statut: 'en-cours',
      contenusIA: 'Exercices IA validés',
      ouvrable: true,
    },
    {
      id: 'ch3',
      chapitre: 'Probabilités conditionnelles',
      statut: 'termine',
      contenusIA: 'Exercices IA validés',
      ouvrable: true,
    },
    {
      id: 'ch4',
      chapitre: "Géométrie dans l'espace",
      statut: 'a-planifier',
      contenusIA: 'En attente de validation',
      ouvrable: false,
    },
  ],
}