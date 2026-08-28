<template>
  <div class="field" :class="stacked ? '' : 'field--inline'">
    <label v-if="label" class="field__label">{{ label }}</label>
    <select
      v-if="multiple"
      class="select"
      multiple
      :size="Math.min(options.length, 4)"
      @change="handleMultipleChange"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :selected="modelValue.includes(option.value)"
      >
        {{ option.label }}
      </option>
    </select>
    <select
      v-else
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
 * multiple: true permet une sélection multiple — modelValue devient alors
 * un tableau de valeurs sélectionnées au lieu d'une chaîne unique.
 */
defineProps({
  modelValue: {
    type: [String, Array],
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
  multiple: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

function handleMultipleChange(event) {
  const values = Array.from(event.target.selectedOptions).map((option) => option.value)
  emit('update:modelValue', values)
}
</script>