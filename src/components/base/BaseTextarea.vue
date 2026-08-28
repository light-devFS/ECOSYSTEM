<template>
  <div class="field">
    <label v-if="label" :for="fieldId" class="field__label">{{ label }}</label>
    <textarea
      :id="fieldId"
      class="field__input"
      :rows="rows"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * BaseTextarea
 * Même style que BaseInput, pour les champs texte multi-lignes
 * (description d'un ticket, commentaire, ...).
 */
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  rows: {
    type: Number,
    default: 4,
  },
  id: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])

const fieldId = computed(() => props.id || `field-${Math.random().toString(36).slice(2, 9)}`)
</script>