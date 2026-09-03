<template>
  <article class="course-card">
    <div>
      <h3 class="course-card__subject">{{ matiere.nom }}</h3>
      <p class="course-card__chapters">{{ chapitresLabel }} Chapitres</p>
    </div>
    <div class="program-card__actions">
      <BaseButton variant="secondary" @click="$emit('view', matiere)">Voir le programme</BaseButton>
      <BaseButton @click="$emit('publish', matiere)">Publier une version</BaseButton>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  matiere: {
    type: Object,
    required: true,
  },
})

defineEmits(['view', 'publish'])

const chapitresLabel = computed(() => String(props.matiere.chapitres).padStart(2, '0'))
</script>