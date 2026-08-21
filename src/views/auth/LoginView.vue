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
            id="login-identifier"
            v-model="form.identifier"
            label="Identifiant"
            :error="errors.identifier"
            :disabled="isSubmitting"
          />

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
 * Le backend (Firebase) n'étant pas encore connecté, authService.login()
 * utilise des utilisateurs mockés. Le formulaire, la validation et la
 * gestion des états ne changeront pas quand Firebase sera branché :
 * seule l'implémentation d'authService devra évoluer.
 */
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { login } from '@/services/auth/authService'

const router = useRouter()

const form = reactive({
  identifier: '',
  email: '',
  password: '',
})

const errors = reactive({
  identifier: '',
  email: '',
  password: '',
})

const formError = ref('')
const isSubmitting = ref(false)

function validate() {
  errors.identifier = form.identifier.trim() ? '' : "L'identifiant est requis."
  errors.email = form.email.trim() ? '' : "L'adresse e-mail est requise."
  errors.password = form.password ? '' : 'Le mot de passe est requis.'
  return !errors.identifier && !errors.email && !errors.password
}

async function handleSubmit() {
  formError.value = ''
  if (!validate()) return

  isSubmitting.value = true
  try {
    const user = await login({
      identifier: form.identifier.trim(),
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

.login-footer {
  margin-top: var(--space-6);
  text-align: center;
}
</style>
