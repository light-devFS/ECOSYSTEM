export const mockTickets = [
  {
    id: 't1',
    notion: 'Suites géométriques',
    matiere: 'Mathématiques',
    statut: 'en-cours',
    professeur: 'M. Aziaka',
    timeline: [
      { id: 'creation', label: 'Création', description: 'Ticket lié à la notion « Suites géométriques ».', statut: 'fait' },
      { id: 'notification', label: 'Notification', description: 'M. Aziaka a été alerté.', statut: 'fait' },
      { id: 'intervention', label: 'Intervention', description: 'Séance de soutien prévue jeudi à 15h.', statut: 'en-cours' },
      { id: 'suivi', label: 'Suivi', description: 'En attente', statut: 'attente' },
      { id: 'validation', label: 'Validation', description: 'En attente', statut: 'attente' },
      { id: 'cloture', label: 'Clôture', description: 'En attente', statut: 'attente' },
    ],
  },
  {
    id: 't2',
    notion: "Équilibrage d'équations",
    matiere: 'Physique-Chimie',
    statut: 'resolu',
    professeur: 'Mme Bakoma',
    timeline: [
      { id: 'creation', label: 'Création', description: "Ticket lié à la notion « Équilibrage d'équations ».", statut: 'fait' },
      { id: 'notification', label: 'Notification', description: 'Mme Bakoma a été alertée.', statut: 'fait' },
      { id: 'intervention', label: 'Intervention', description: 'Séance de soutien effectuée.', statut: 'fait' },
      { id: 'suivi', label: 'Suivi', description: 'Notion acquise.', statut: 'fait' },
      { id: 'validation', label: 'Validation', description: 'Validé par le professeur.', statut: 'fait' },
      { id: 'cloture', label: 'Clôture', description: 'Ticket clôturé.', statut: 'fait' },
    ],
  },
]