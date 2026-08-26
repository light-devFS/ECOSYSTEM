export const mockAdminDashboard = {
  etablissement: 'Lycée Moderne de Lomé',
  stats: {
    elevesInscrits: 842,
    enseignants: 56,
    classes: 28,
    classesCaption: 'Collège & Lycée',
    usageHorsLigne: '23%',
  },
  indicateurs: [
    {
      id: 'i1',
      titre: 'Maîtrise moyenne par compétence',
      description: 'Apprentissage réel',
      valeur: '71%',
    },
    {
      id: 'i2',
      titre: "Temps moyen de résolution d'une lacune",
      description: "Efficacité de l'accompagnement",
      valeur: '4,2 jours',
    },
    {
      id: 'i3',
      titre: 'Tickets résolus ce mois',
      description: "Capacité d'intervention",
      valeur: '58 / 63',
    },
    {
      id: 'i4',
      titre: 'Satisfaction déclarée',
      description: "Qualité de l'expérience",
      valeur: '4,3 / 5',
    },
  ],
  alertes: [
    {
      id: 'al1',
      titre: 'Notion difficile détectée sur 3 classes',
      description: "Géométrie dans l'espace",
      label: 'À surveiller',
      variant: 'warning',
    },
    {
      id: 'al2',
      titre: 'Ticket en escalade',
      description: 'Aucune réponse depuis 5 jours',
      label: 'Urgent',
      variant: 'danger',
    },
  ],
}