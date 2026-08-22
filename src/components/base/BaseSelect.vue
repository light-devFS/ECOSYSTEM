<template>
  <div class="field field--inline">
    <label v-if="label" class="field__label">{{ label }}</label>
    <select
      class="select"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
/**
 * BaseSelect
 * options: [{ value, label }]
 * Utilisé pour les filtres (ex : "Toutes les matières") sur les pages
 * de listes — à réutiliser plutôt que de recréer un select à chaque fois.
 */
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>