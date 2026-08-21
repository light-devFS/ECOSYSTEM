<template>
  <div class="progress-row">
    <div class="progress-row__labels">
      <span>{{ label }}</span>
      <span>{{ percent }}%</span>
    </div>
    <div class="progress-row__track">
      <div
        class="progress-row__fill"
        :style="{ width: `${percent}%`, backgroundColor: `var(--color-${color})` }"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * ProgressBar
 * color doit correspondre à un token de couleur défini dans variables.css
 * (ex: "teal", "warning", "danger", "success") — jamais une valeur en dur.
 */
defineProps({
  label: {
    type: String,
    required: true,
  },
  percent: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: 'primary',
  },
})
</script>