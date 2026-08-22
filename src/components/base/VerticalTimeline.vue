<template>
  <ol class="vertical-timeline">
    <li
      v-for="step in steps"
      :key="step.id"
      class="vertical-timeline__step"
      :class="`vertical-timeline__step--${step.statut}`"
    >
      <span class="vertical-timeline__dot" />
      <div>
        <p class="vertical-timeline__label">{{ step.label }}</p>
        <p class="vertical-timeline__description">{{ step.description }}</p>
      </div>
    </li>
  </ol>
</template>

<script setup>
/**
 * VerticalTimeline
 * steps: [{ id, label, description, statut }] — statut: 'fait' | 'en-cours' | 'attente'
 * Réutilisable pour tout suivi séquentiel (tickets, dossiers, workflows).
 */
defineProps({
  steps: {
    type: Array,
    required: true,
  },
})
</script>