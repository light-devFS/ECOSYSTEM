<template>
  <span class="badge" :class="`badge--${variant}`">{{ label }}</span>
</template>

<script setup>
/**
 * BaseBadge
 * variant: 'success' | 'warning' | 'danger' | 'neutral'
 * Utilisé pour la difficulté d'un exercice, un statut, etc. — partout
 * où la maquette montre une pastille colorée avec du texte.
 */
defineProps({
  label: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'neutral',
  },
})
</script>