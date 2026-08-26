/**
 * Liens de la sidebar pour l'espace parent.
 * Même principe que eleveNavItems : un seul endroit à modifier
 * quand une page devient disponible.
 */
export const parentNavItems = [
  { label: 'Tableau de bord', to: '/parent/dashboard' },
  { label: 'Evolution', to: '/parent/evolution' },
  { label: 'Devoir & échéances', to: '/parent/devoirs' },
  { label: 'Messagerie', to: '/parent/messagerie', badge: 1 },
]