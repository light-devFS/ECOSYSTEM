<template>
  <button
    class="btn"
    :class="`btn--${variant}`"
    :type="type"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<script setup>
/**
 * BaseButton
 * Bouton unique utilisé sur toute la plateforme.
 * Gère nativement l'état de chargement (spinner + désactivation)
 * pour éviter de dupliquer cette logique dans chaque formulaire.
 */
defineProps({
  variant: {
    type: String,
    default: 'primary', // 'primary' | 'secondary'
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
