export const mockExamBank = {
  filtres: {
    pays: ['Togo'],
    niveaux: ['Terminale D'],
    matieres: ['Toutes', 'Mathématiques', 'Physique-chimie', 'SVT', 'Français', 'Anglais'],
    typesEpreuve: ['Examen', 'Devoir', 'Concours'],
  },
  total: 124,
  resultats: [
    { id: 'ep1', type: 'Examen', matiere: 'Physique-chimie', niveau: 'Terminale D' },
    { id: 'ep2', type: 'Examen', matiere: 'SVT', niveau: 'Terminale D' },
  ],
}