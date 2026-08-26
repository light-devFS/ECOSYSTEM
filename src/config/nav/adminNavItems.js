/**
 * Liens de la sidebar pour l'espace administration.
 * Même principe que eleveNavItems/parentNavItems.
 */
export const adminNavItems = [
  { label: 'Tableau de bord', to: '/admin/dashboard' },
  { label: 'Eleves, enseignants', to: '/admin/eleves-enseignants' },
  { label: 'Emploi du temps', to: '/admin/emploi-du-temps', disabled: true },
  { label: 'Statistiques', to: '/admin/statistiques', disabled: true },
  { label: 'Supervision', to: '/admin/supervision', disabled: true },
]