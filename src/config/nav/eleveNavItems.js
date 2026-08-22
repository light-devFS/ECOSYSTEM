/**
 * Liens de la sidebar pour l'espace élève.
 * Un seul endroit à modifier quand une page devient disponible
 * (il suffit de retirer "disabled") — toutes les vues élève importent
 * cette même liste, au lieu de la redéfinir chacune de leur côté.
 */
export const eleveNavItems = [
  { label: 'Tableau de bord', to: '/eleve/dashboard' },
  { label: 'Mes cours', to: '/eleve/cours' },
  { label: 'Exercices', to: '/eleve/exercices' },
  { label: 'Tuteur IA', to: '/eleve/tuteur-ia' },
  { label: 'Progression', to: '/eleve/progression' },
  { label: 'Groupes', to: '/eleve/groupes' },
  { label: 'Mes tickets', to: '/eleve/tickets' },
]