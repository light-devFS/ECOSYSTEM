<template>
  <div class="ai-suggestion">
    <div class="ai-suggestion__header">
      <p class="ai-suggestion__title">{{ suggestion.titre }}</p>
      <div class="ai-suggestion__actions">
        <button
          type="button"
          class="ai-suggestion__action ai-suggestion__action--decline"
          aria-label="Refuser la proposition"
          @click="$emit('decline')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <button
          type="button"
          class="ai-suggestion__action ai-suggestion__action--accept"
          aria-label="Accepter la proposition"
          @click="$emit('accept')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12l6 6L20 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
    <p class="ai-suggestion__description">{{ suggestion.description }}</p>
  </div>
</template>

<script setup>
/**
 * AiSuggestionCard
 * Réutilisable partout où l'IA propose une action que l'élève peut
 * accepter ou refuser (groupes, révisions suggérées, etc.).
 */
defineProps({
  suggestion: {
    type: Object,
    required: true,
  },
})

defineEmits(['accept', 'decline'])
</script>