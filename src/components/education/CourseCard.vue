<template>
  <article class="course-card">
    <div>
      <h3 class="course-card__subject">{{ course.matiere }}</h3>
      <p class="course-card__chapters">{{ course.chapitres }} chapitres</p>
    </div>
    <p class="course-card__teacher">Enseignant · {{ course.enseignant }}</p>
    <BaseButton variant="secondary" @click="$emit('open', course)">Ouvrir le cours</BaseButton>
  </article>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
  course: {
    type: Object,
    required: true,
  },
})

defineEmits(['open'])
</script>