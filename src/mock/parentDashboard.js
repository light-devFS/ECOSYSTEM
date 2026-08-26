export const mockParentDashboard = {
  enfants: [{ id: 'awa', nom: 'Awa Mensah', niveau: 'Tle D' }],
  suivi: {
    nom: 'Awa Mensah',
    niveau: 'Terminale D',
    etablissement: 'Lycée Moderne de Lomé',
  },
  stats: {
    niveauGlobal: 'Bon',
    devoirsEnRetard: 1,
    alertes: 2,
    ticketsSuivis: 1,
  },
  alertesImportantes: [
    {
      id: 'al1',
      titre: 'Difficulté persistante détectée',
      description: 'Suites géométriques · Mathématiques',
      action: 'Ticket ouvert',
    },
    {
      id: 'al2',
      titre: 'Devoir en retard',
      description: 'Dissertation — Français, échéance dépassée de 1 jour',
      action: 'À suivre',
    },
  ],
}