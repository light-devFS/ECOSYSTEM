<template>
  <div v-if="isOpen" class="app-sidebar__backdrop" @click="closeSidebar" />

  <aside class="app-sidebar" :class="{ 'app-sidebar--open': isOpen }">
    <p class="app-sidebar__brand">EduSphere</p>

    <nav class="app-sidebar__nav">
      <router-link
        v-for="item in navItems"
        :key="item.label"
        :to="item.disabled ? '' : item.to"
        class="app-sidebar__link"
        :class="{ 'app-sidebar__link--disabled': item.disabled }"
        :aria-disabled="item.disabled"
        :title="item.label"
        @click="handleLinkClick(item, $event)"
      >
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="app-sidebar__link-badge">{{ item.badge }}</span>
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
import { useLayoutState, closeSidebar } from '@/services/ui/layoutState'

/**
 * AppSidebar
 * navItems: [{ label, to, disabled, badge }] — "disabled" sert pour les
 * espaces pas encore développés, afin de ne jamais pointer vers une
 * route inexistante.
 *
 * Sur mobile, la sidebar devient un panneau qui glisse par-dessus le
 * contenu (voir responsive.css) ; l'état d'ouverture vient de
 * layoutState, partagé avec AppHeader (bouton menu).
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

const layout = useLayoutState()
const isOpen = computed(() => layout.sidebarOpen)

function handleLinkClick(item, event) {
  if (item.disabled) {
    event.preventDefault()
    return
  }
  // Sur mobile, on referme le panneau après avoir choisi une page.
  closeSidebar()
}

const initials = computed(() =>
  props.userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
)
</script>