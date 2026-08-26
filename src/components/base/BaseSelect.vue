<template>
  <div class="field" :class="stacked ? '' : 'field--inline'">
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
 * stacked: true place le label au-dessus du menu (ex : barre de filtres) ;
 * par défaut le label est en ligne, à côté (ex : filtre isolé en haut de page).
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
  stacked: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>