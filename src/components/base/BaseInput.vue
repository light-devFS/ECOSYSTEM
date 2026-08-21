<template>
  <div class="field">
    <label v-if="label" :for="fieldId" class="field__label">{{ label }}</label>
    <div class="field__control">
      <input
        :id="fieldId"
        class="field__input"
        :class="{ 'field__input--error': error }"
        :type="resolvedType"
        :placeholder="placeholder"
        :value="modelValue"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${fieldId}-error` : undefined"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="field__toggle"
        :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        @click="showPassword = !showPassword"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            v-if="showPassword"
            d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.5 5.4A9.9 9.9 0 0 1 12 5c5 0 9 4 10 7a13 13 0 0 1-3 4M6.2 6.5A13 13 0 0 0 2 12c1 3 5 7 10 7 1.4 0 2.7-.3 3.9-.8"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <template v-else>
            <path
              d="M2 12c1-3 5-7 10-7s9 4 10 7c-1 3-5 7-10 7s-9-4-10-7Z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" />
          </template>
        </svg>
      </button>
    </div>
    <p v-if="error" :id="`${fieldId}-error`" class="field__error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

/**
 * BaseInput
 * Champ de formulaire unique pour toute la plateforme.
 * Le type "password" ajoute automatiquement le bouton afficher/masquer,
 * pour ne pas réimplémenter cette logique dans chaque page.
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
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])

const showPassword = ref(false)
const fieldId = computed(() => props.id || `field-${Math.random().toString(36).slice(2, 9)}`)
const resolvedType = computed(() => {
  if (props.type !== 'password') return props.type
  return showPassword.value ? 'text' : 'password'
})
</script>
