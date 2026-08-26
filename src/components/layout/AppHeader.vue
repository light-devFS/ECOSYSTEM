<template>
  <header class="app-header">
    <div class="app-header__left">
      <button
        type="button"
        class="app-header__hamburger"
        aria-label="Ouvrir le menu"
        @click="toggleSidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>

      <div>
        <p class="app-header__eyebrow">{{ eyebrow }}</p>
        <h1 class="app-header__title">{{ title }}</h1>
      </div>
    </div>

    <input
      v-if="searchable"
      class="app-header__search"
      type="search"
      :placeholder="searchPlaceholder"
      :value="searchValue"
      @input="$emit('update:searchValue', $event.target.value)"
    />

    <button
      v-if="showNotifications"
      type="button"
      class="app-header__notifications"
      aria-label="Notifications"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3a5 5 0 0 0-5 5v3.4c0 .5-.2 1-.5 1.4L5 15h14l-1.5-2.2c-.3-.4-.5-.9-.5-1.4V8a5 5 0 0 0-5-5Z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
        <path
          d="M9.5 18a2.5 2.5 0 0 0 5 0"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
      <span v-if="notificationsCount > 0" class="app-header__badge">{{ notificationsCount }}</span>
    </button>
  </header>
</template>

<script setup>
import { toggleSidebar } from '@/services/ui/layoutState'

defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  notificationsCount: {
    type: Number,
    default: 0,
  },
  showNotifications: {
    type: Boolean,
    default: true,
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  searchValue: {
    type: String,
    default: '',
  },
  searchPlaceholder: {
    type: String,
    default: 'Rechercher…',
  },
})

defineEmits(['update:searchValue'])
</script>