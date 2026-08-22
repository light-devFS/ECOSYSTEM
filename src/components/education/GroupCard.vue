<template>
  <article class="group-card">
    <div>
      <h3 class="group-card__title">{{ group.titre }}</h3>
      <p class="group-card__meta">{{ group.matiere }} · {{ group.membres }} membres</p>
    </div>
    <p class="group-card__description">{{ group.description }}</p>
    <BaseButton variant="secondary" @click="$emit('open', group)">Voir le groupe</BaseButton>
  </article>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
  group: {
    type: Object,
    required: true,
  },
})

defineEmits(['open'])
</script>