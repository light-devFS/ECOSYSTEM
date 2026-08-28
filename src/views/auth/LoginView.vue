<template>
  <div class="auth-layout">
    <aside class="auth-layout__panel">
      <p class="auth-layout__panel-title">EduSphere</p>
      <div>
        <h1 class="auth-layout__panel-heading">
          L'éducation intelligente,<br />accessible à tous.
        </h1>
        <p class="auth-layout__panel-text">
          Apprends, progresse et bénéficie d'un accompagnement personnalisé grâce à EduSphere.
        </p>
      </div>
    </aside>

    <section class="auth-layout__content">
      <div class="auth-layout__form-wrapper">
        <header class="login-header">
          <h2>Bienvenue sur EduSphere</h2>
          <p class="text-muted">Connectez-vous à votre espace</p>
        </header>

        <form novalidate @submit.prevent="handleSubmit">
          <BaseInput
            id="login-email"
            v-model="form.email"
            type="email"
            label="Adresse e-mail"
            placeholder="Entrez votre adresse e-mail"
            :error="errors.email"
            :disabled="isSubmitting"
          />

          <BaseInput
            id="login-password"
            v-model="form.password"
            type="password"
            label="Mot de passe"
            :error="errors.password"
            :disabled="isSubmitting"
          />

          <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

          <div class="login-links">
            <router-link to="/mot-de-passe-oublie">Mot de passe oublié ?</router-link>
          </div>

          <BaseButton type="submit" :loading="isSubmitting">
            {{ isSubmitting ? 'Connexion en cours…' : 'Se connecter' }}
          </BaseButton>
        </form>

        <div class="login-divider"><span>ou</span></div>

        <div class="login-google-row">
          <button
            type="button"
            class="btn--google-icon"
            :disabled="isGoogleSubmitting"
            aria-label="Se connecter avec Google"
            @click="handleGoogleLogin"
          >
            <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9C16.66 14.2 17.64 11.9 17.64 9.2z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
            </svg>
          </button>
        </div>
        <p v-if="isGoogleSubmitting" class="text-muted text-sm login-google-status">Connexion en cours…</p>

        <p class="login-footer text-sm text-muted">
          Vous n'avez pas encore de compte ?
          <router-link to="/creer-un-compte">Créer un compte</router-link>
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
/**
 * LoginView
 * Connexion e-mail/mot de passe : authService.login() utilise des
 * utilisateurs mockés en attendant que le backend expose sa propre
 * authentification.
 * Connexion Google : authService.loginWithGoogle() est déjà réelle
 * (Firebase Auth), voir le commentaire dans authService.js pour ses limites actuelles.
 */
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { login, loginWithGoogle } from '@/services/auth/authService'

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const formError = ref('')
const isSubmitting = ref(false)
const isGoogleSubmitting = ref(false)

function validate() {
  errors.email = form.email.trim() ? '' : "L'adresse e-mail est requise."
  errors.password = form.password ? '' : 'Le mot de passe est requis.'
  return !errors.email && !errors.password
}

async function handleSubmit() {
  formError.value = ''
  if (!validate()) return

  isSubmitting.value = true
  try {
    const user = await login({
      email: form.email.trim(),
      password: form.password,
    })
    router.push(`/${user.role}/dashboard`)
  } catch (error) {
    formError.value = error.message || 'Une erreur est survenue. Merci de réessayer.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleGoogleLogin() {
  formError.value = ''
  isGoogleSubmitting.value = true
  try {
    const user = await loginWithGoogle()
    router.push(`/${user.role}/dashboard`)
  } catch (error) {
    formError.value = error.message || 'Une erreur est survenue. Merci de réessayer.'
  } finally {
    isGoogleSubmitting.value = false
  }
}
</script>

<style scoped>
.login-header {
  margin-bottom: var(--space-6);
}

.login-header h2 {
  margin-bottom: var(--space-1);
}

.login-links {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-5);
}

.login-links a {
  font-size: var(--font-size-sm);
}

.form-error {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-4);
}

.login-divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-5) 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--color-border);
}

.login-google-row {
  display: flex;
  justify-content: center;
}

.login-google-status {
  text-align: center;
  margin-top: var(--space-2);
}

.login-footer {
  margin-top: var(--space-6);
  text-align: center;
}
</style>