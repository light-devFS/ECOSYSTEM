<template>
  <div class="tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      class="tabs__item"
      :class="{ 'tabs__item--active': tab.id === modelValue }"
      :aria-selected="tab.id === modelValue"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
/**
 * BaseTabs
 * tabs: [{ id, label }] — modelValue est l'id de l'onglet actif.
 */
defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
})

defineEmits(['update:modelValue'])
</script>