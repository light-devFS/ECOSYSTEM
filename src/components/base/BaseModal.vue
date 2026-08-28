<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop" @click.self="close">
      <div class="modal-panel" role="dialog" aria-modal="true" :aria-label="title">
        <h3 class="modal-panel__title">{{ title }}</h3>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * BaseModal
 * Fenêtre modale générique — formulaires de création/modification
 * (groupe, ticket, élève, ...). Le contenu du formulaire vient du
 * slot par défaut ; cette coquille ne gère que l'affichage/fermeture.
 */
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>