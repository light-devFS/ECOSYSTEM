<template>
  <aside class="app-sidebar">
    <p class="app-sidebar__brand">EduSphere</p>

    <nav class="app-sidebar__nav">
      <router-link
        v-for="item in navItems"
        :key="item.label"
        :to="item.disabled ? '' : item.to"
        class="app-sidebar__link"
        :class="{ 'app-sidebar__link--disabled': item.disabled }"
        :aria-disabled="item.disabled"
        @click="item.disabled && $event.preventDefault()"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <div class="app-sidebar__user">
      <div class="app-sidebar__avatar">{{ initials }}</div>
      <div>
        <p class="app-sidebar__user-name">{{ userName }}</p>
        <button type="button" class="app-sidebar__logout" @click="$emit('logout')">
          Déconnexion
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

/**
 * AppSidebar
 * navItems: [{ label, to, disabled }] — "disabled" sert pour les
 * espaces pas encore développés, afin de ne jamais pointer vers une
 * route inexistante.
 */
const props = defineProps({
  navItems: {
    type: Array,
    required: true,
  },
  userName: {
    type: String,
    default: '',
  },
})

defineEmits(['logout'])

const initials = computed(() =>
  props.userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
)
</script>