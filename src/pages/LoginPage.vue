<template>
  <div class="login-wrapper">

    <!-- ═══════════════════════════════════════════
         PANEL IZQUIERDO — imagen de fondo + branding
    ════════════════════════════════════════════ -->
    <div class="left-panel">

      <!-- Imagen de fondo: reemplaza la URL por la tuya -->
      <img
        src="/src/assets/FondoLogin.jpg"
        alt="Fondo Nutria"
        class="bg-image"
      />

      <!-- Contenido sobre la imagen -->
      <div class="left-content">

        <!-- Logo: reemplaza src por la ruta de tu logo -->
        <div class="brand" :class="{ visible: mounted }">
  <img src="/src/assets/logo-nutria.png" alt="NutriPro" class="brand-logo" />
</div>

        <!-- Tarjetas flotantes decorativas -->
         <div class="floating-cards">
  <div class="stat-card card-1" :class="{ visible: mounted }">
    <span class="stat-icon">
      <Salad :size="26" :stroke-width="2.2" />
    </span>
    <div>
      <p class="stat-value">Planes</p>
      <p class="stat-label">nutricionales personalizados</p>
    </div>
  </div>

  <div class="stat-card card-2" :class="{ visible: mounted }">
    <span class="stat-icon">
      <TrendingUp :size="26" :stroke-width="2.2" />
    </span>
    <div>
      <p class="stat-value">Progreso</p>
      <p class="stat-label">claro para cada paciente</p>
    </div>
  </div>
</div>

        <!-- Cita / tagline -->
        <blockquote class="tagline" :class="{ visible: mounted }">
          Empoderando a nutriólogos para brindar una atención más precisa y personalizada.
        </blockquote>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════
         PANEL DERECHO — formulario de login
    ════════════════════════════════════════════ -->
    <div class="right-panel">
      <div class="form-container" :class="{ visible: mounted }">

        <!-- Encabezado -->
        <div class="form-header">
          <h1 class="form-title">{{ formTitle }}</h1>
          <p class="form-subtitle">{{ formSubtitle }}</p>
        </div>

        <!-- Mensaje de error global -->
        <Transition name="shake">
          <div v-if="errorMsg" class="error-banner">
            <span class="error-icon">⚠</span> {{ errorMsg }}
          </div>
        </Transition>

        <template v-if="isRegisterMode">
  <div class="register-grid">
    <div class="field-group" :class="{ focused: focus.firstName, error: errors.firstName }">
      <label class="field-label">Nombre</label>
      <div class="input-wrapper">
        <input
          v-model="form.firstName"
          type="text"
          placeholder="Ana"
          class="field-input no-icon"
          autocomplete="given-name"
          @focus="focus.firstName = true"
          @blur="focus.firstName = false; validateFirstName()"
        />
      </div>
      <Transition name="slide-down">
        <p v-if="errors.firstName" class="field-error">{{ errors.firstName }}</p>
      </Transition>
    </div>

    <div class="field-group" :class="{ focused: focus.lastName, error: errors.lastName }">
      <label class="field-label">Apellido</label>
      <div class="input-wrapper">
        <input
          v-model="form.lastName"
          type="text"
          placeholder="Rivera"
          class="field-input no-icon"
          autocomplete="family-name"
          @focus="focus.lastName = true"
          @blur="focus.lastName = false; validateLastName()"
        />
      </div>
      <Transition name="slide-down">
        <p v-if="errors.lastName" class="field-error">{{ errors.lastName }}</p>
      </Transition>
    </div>
  </div>

  <div class="field-group" :class="{ focused: focus.specialization, error: errors.specialization }">
    <label class="field-label">Especialización</label>
    <div class="input-wrapper">
      <input
        v-model="form.specialization"
        type="text"
        placeholder="Nutrición clínica"
        class="field-input no-icon"
        @focus="focus.specialization = true"
        @blur="focus.specialization = false"
      />
    </div>
  </div>
</template>

        <!-- Formulario -->
        <form @submit.prevent="handleSubmit" novalidate>

          <!-- Email -->
          <div class="field-group" :class="{ focused: focus.email, error: errors.email }">
            <label class="field-label">Correo electrónico</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                v-model="form.email"
                type="email"
                placeholder="dr.castro@nutría.com"
                class="field-input"
                autocomplete="email"
                @focus="focus.email = true"
                @blur="focus.email = false; validateEmail()"
              />
            </div>
            <Transition name="slide-down">
              <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
            </Transition>
          </div>

          <!-- Contraseña -->
          <div class="field-group" :class="{ focused: focus.password, error: errors.password }">
            <div class="label-row">
              <label class="field-label">Contraseña</label>
              <a href="#" class="forgot-link" @click.prevent="forgotPassword">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="field-input"
                :autocomplete="isRegisterMode ? 'new-password' : 'current-password'"
                @focus="focus.password = true"
                @blur="focus.password = false; validatePassword()"
              />
              <button
                type="button"
                class="eye-btn"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <Transition name="slide-down">
              <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
            </Transition>
          </div>

          <div
  v-if="isRegisterMode"
  class="field-group"
  :class="{ focused: focus.confirmPassword, error: errors.confirmPassword }"
>
  <label class="field-label">Confirmar contraseña</label>

  <div class="input-wrapper">
    <span class="input-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </span>

    <input
      v-model="form.confirmPassword"
      :type="showConfirmPassword ? 'text' : 'password'"
      placeholder="••••••••"
      class="field-input"
      autocomplete="new-password"
      @focus="focus.confirmPassword = true"
      @blur="focus.confirmPassword = false; validateConfirmPassword()"
    />

    <button
      type="button"
      class="eye-btn"
      @click="showConfirmPassword = !showConfirmPassword"
      :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
    >
      <svg v-if="!showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    </button>
  </div>

  <Transition name="slide-down">
    <p v-if="errors.confirmPassword" class="field-error">
      {{ errors.confirmPassword }}
    </p>
  </Transition>
</div>

          <!-- Recordar sesión -->
          <div v-if="!isRegisterMode" class="remember-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.remember" class="checkbox-input" />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Mantener sesión iniciada</span>
            </label>
          </div>

          <!-- Botón submit -->
          <button
            type="submit"
            class="submit-btn"
            :class="{ loading: isLoading, success: loginSuccess }"
            :disabled="isLoading || loginSuccess"
          >
            <Transition name="fade" mode="out-in">
              <span v-if="loginSuccess" key="success" class="btn-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Acceso exitoso
              </span>
              <span v-else-if="isLoading" key="loading" class="btn-content">
  <span class="spinner"></span>
  {{ submitText }}
</span>

<span v-else key="idle" class="btn-content">
  {{ submitText }}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </Transition>
          </button>
        </form>

        <!-- Footer del formulario -->
        <div class="form-footer">
          <div class="divider"><span>Plataforma segura</span></div>
          <p v-if="!isRegisterMode" class="register-link">
  ¿Eres nuevo?
  <a href="#" @click.prevent="goToRegister">Crea tu cuenta</a>
</p>

<p v-else class="register-link">
  ¿Ya tienes cuenta?
  <a href="#" @click.prevent="goToLogin">Inicia sesión</a>
</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { Salad, TrendingUp } from 'lucide-vue-next'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const mounted = ref(false)
const isLoading = ref(false)
const loginSuccess = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMsg = ref('')

const authMode = ref<'login' | 'register'>('login')

const isRegisterMode = computed(() => authMode.value === 'register')

const form = reactive({
  firstName: '',
  lastName: '',
  specialization: '',
  email: '',
  password: '',
  confirmPassword: '',
  remember: false,
})

const errors = reactive({
  firstName: '',
  lastName: '',
  specialization: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const focus = reactive({
  firstName: false,
  lastName: false,
  specialization: false,
  email: false,
  password: false,
  confirmPassword: false,
})

const formTitle = computed(() => {
  return isRegisterMode.value ? 'Crear cuenta' : 'Bienvenido!'
})

const formSubtitle = computed(() => {
  return isRegisterMode.value
    ? 'Registra tu cuenta profesional en Nutría'
    : 'Inicia sesión en tu cuenta Nutría'
})

const submitText = computed(() => {
  if (loginSuccess.value) return 'Acceso exitoso'
  if (isLoading.value) return isRegisterMode.value ? 'Creando cuenta...' : 'Verificando...'

  return isRegisterMode.value ? 'Crear cuenta' : 'Iniciar sesión'
})

onMounted(() => {
  setTimeout(() => {
    mounted.value = true
  }, 100)
})

function clearErrors() {
  errorMsg.value = ''

  Object.assign(errors, {
    firstName: '',
    lastName: '',
    specialization: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
}

function validateFirstName() {
  if (isRegisterMode.value && !form.firstName.trim()) {
    errors.firstName = 'El nombre es requerido.'
  } else {
    errors.firstName = ''
  }
}

function validateLastName() {
  if (isRegisterMode.value && !form.lastName.trim()) {
    errors.lastName = 'El apellido es requerido.'
  } else {
    errors.lastName = ''
  }
}

function validateEmail() {
  if (!form.email.trim()) {
    errors.email = 'El correo es requerido.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresa un correo válido.'
  } else {
    errors.email = ''
  }
}

function validatePassword() {
  if (!form.password) {
    errors.password = 'La contraseña es requerida.'
  } else if (form.password.length < 6) {
    errors.password = 'Mínimo 6 caracteres.'
  } else {
    errors.password = ''
  }
}

function validateConfirmPassword() {
  if (!isRegisterMode.value) {
    errors.confirmPassword = ''
    return
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña.'
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  } else {
    errors.confirmPassword = ''
  }
}

function validateForm() {
  validateFirstName()
  validateLastName()
  validateEmail()
  validatePassword()
  validateConfirmPassword()

  return (
    !errors.firstName &&
    !errors.lastName &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword
  )
}

async function handleSubmit() {
  if (isRegisterMode.value) {
    await handleRegister()
    return
  }

  await handleLogin()
}

async function handleLogin() {
  if (!validateForm()) return

  isLoading.value = true
  errorMsg.value = ''

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    })

    if (error) throw error

    if (!data.session || !data.user) {
      throw new Error('No se pudo iniciar sesión.')
    }

    await auth.loadUser()
    loginSuccess.value = true

    toast.success('Inicio de sesión correcto.')

    setTimeout(() => {
      router.push('/dashboard')
    }, 700)
  } catch (err) {
    errorMsg.value =
      err instanceof Error
        ? err.message
        : 'Credenciales incorrectas. Intenta de nuevo.'

    toast.error(errorMsg.value)
  } finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  if (!validateForm()) return

  isLoading.value = true
  errorMsg.value = ''

  try {
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          specialization: form.specialization.trim(),
        },
      },
    })

    if (error) throw error

    if (!data.user) {
      throw new Error('No se pudo crear la cuenta.')
    }

    /*
      Si tienes desactivada la confirmación por correo en Supabase,
      normalmente data.session viene con sesión activa.
    */
    if (data.session) {
      await auth.loadUser()

      toast.success('Cuenta creada correctamente.')

      setTimeout(() => {
        router.push('/dashboard')
      }, 700)

      return
    }

    toast.success('Cuenta creada. Revisa tu correo para confirmar tu cuenta.')

    authMode.value = 'login'
    form.password = ''
    form.confirmPassword = ''
  } catch (err) {
    errorMsg.value =
      err instanceof Error
        ? err.message
        : 'No se pudo crear la cuenta.'

    toast.error(errorMsg.value)
  } finally {
    isLoading.value = false
  }
}

function forgotPassword() {
  router.push('/forgot-password')
}

function goToRegister() {
  clearErrors()
  authMode.value = 'register'
}

function goToLogin() {
  clearErrors()
  authMode.value = 'login'
  form.confirmPassword = ''
}
</script>

<style scoped>

/* ─── Reset y contenedor raíz ──────────────────────────────── */
* { box-sizing: border-box; margin: 0; padding: 0; }

:global(html),
:global(body),
:global(#app) {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100vh;
}

:global(body) {
    overflow-x: hidden;
}

.login-wrapper {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: #f8faff;
}

/* ══════════════════════════════════════════════════════════════
   PANEL IZQUIERDO
══════════════════════════════════════════════════════════════ */
.left-panel {
  position: relative;
  width: 50%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

/* Imagen de fondo */
.bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    object-position: left center;
}


/* Contenido del panel izq */
.left-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2.5rem 2.8rem;
  width: 100%;
}

/* Branding */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0;
  transform: translateY(-16px);
  transition: opacity .6s ease, transform .6s ease;
}
.brand.visible { opacity: 1; transform: translateY(0); }

.brand {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.brand.visible {
  opacity: 1;
  transform: translateY(0);
}

.brand-logo {
  width: 170px;
  height: auto;
  object-fit: contain;
}

/* Tarjetas flotantes */
.floating-cards {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: auto 0;
  align-self: flex-end;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255,255,255,.15);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,.25);
  border-radius: 16px;
  padding: 14px 20px;
  color: #fff;
  min-width: 180px;
  opacity: 0;
  transform: translateX(40px);
  transition: opacity .6s ease, transform .6s ease, background .2s;
}
.stat-card:hover { background: rgba(255,255,255,.22); }
.stat-card.visible { opacity: 1; transform: translateX(0); }
.card-1 { transition-delay: .3s; }
.card-2 { transition-delay: .5s; }

.stat-icon { font-size: 1.6rem; }
.stat-value { font-size: 1.2rem; font-weight: 700; line-height: 1; }
.stat-label { font-size: .75rem; opacity: .8; margin-top: 3px; }

/* Cita */
.tagline {
  font-size: 1.15rem;
  font-weight: 500;
  color: rgba(255,255,255,.93);
  line-height: 1.55;
  border-left: 3px solid rgba(255,255,255,.5);
  padding-left: 16px;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity .7s ease .7s, transform .7s ease .7s;
}
.tagline.visible { opacity: 1; transform: translateY(0); }


/* ══════════════════════════════════════════════════════════════
   PANEL DERECHO
══════════════════════════════════════════════════════════════ */
.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #fff;
}

.form-container {
  width: 100%;
  max-width: 440px;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity .7s ease .2s, transform .7s ease .2s;
}
.form-container.visible { opacity: 1; transform: translateY(0); }

/* Encabezado */
.form-header { margin-bottom: 2rem; }
.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f1923;
  letter-spacing: -.5px;
  line-height: 1.2;
}
.form-subtitle {
  font-size: .95rem;
  color: #7a8a9a;
  margin-top: 6px;
}

/* Banner de error */
.error-banner {
  background: #fff1f1;
  border: 1px solid #fca5a5;
  border-radius: 12px;
  color: #b91c1c;
  font-size: .88rem;
  padding: 12px 16px;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.error-icon { font-size: 1rem; }

/* Grupos de campo */
.field-group {
  margin-bottom: 1.3rem;
}

.field-label {
  display: block;
  font-size: .83rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 7px;
  letter-spacing: .02em;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 7px;
}
.label-row .field-label { margin-bottom: 0; }

.forgot-link {
  font-size: .82rem;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  transition: color .2s;
}
.forgot-link:hover { color: #1d4ed8; text-decoration: underline; }

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #9ca3af;
  display: flex;
  transition: color .2s;
}

.field-input {
  width: 100%;
  padding: 13px 44px;
  font-size: .95rem;
  color: #0f1923;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  transition: border-color .25s, box-shadow .25s, background .25s;
  font-family: inherit;
}
.field-input::placeholder { color: #b0bac5; }

/* Focus */
.field-group.focused .field-input {
  border-color: #85878b;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(37,99,235,.12);
}
.field-group.focused .input-icon { color: #2563eb; }

/* Error */
.field-group.error .field-input {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239,68,68,.1);
}

.field-error {
  font-size: .78rem;
  color: #ef4444;
  margin-top: 5px;
  padding-left: 4px;
}

/* Botón ojo */
.eye-btn {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  padding: 4px;
  border-radius: 6px;
  transition: color .2s;
}
.eye-btn:hover { color: #374151; }

/* Recordar sesión */
.remember-row { margin-bottom: 1.5rem; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}
.checkbox-input { display: none; }
.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 1.5px solid #d1d5db;
  border-radius: 5px;
  background: #fff;
  transition: border-color .2s, background .2s;
  flex-shrink: 0;
  position: relative;
}
.checkbox-input:checked + .checkbox-custom {
  background: #949494;
  border-color: #949494;
}
.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 6px;
  height: 10px;
  border: 2px solid #fff;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}
.checkbox-text { font-size: .87rem; color: #4b5563; }

/* Botón de envío */
.submit-btn {
  width: 100%;
  padding: 15px;
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  background-color: #3E9B92;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity .25s, transform .15s, box-shadow .25s;
  letter-spacing: .02em;
}
.submit-btn:hover:not(:disabled) {
  opacity: .93;
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(151, 151, 151, 0.4);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { cursor: not-allowed; opacity: .7; }
.submit-btn.success {
  background: linear-gradient(90deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 18px rgba(5,150,105,.4);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

/* Footer */
.form-footer { margin-top: 1.8rem; text-align: center; }

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}
.divider span { font-size: .78rem; color: #9ca3af; white-space: nowrap; }


.register-link { font-size: .88rem; color: #6b7280; }
.register-link a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
  transition: color .2s;
}
.register-link a:hover { color: #1d4ed8; text-decoration: underline; }

/* ─── Animaciones ──────────────────────────────────────────── */
@keyframes spin { to { transform: rotate(360deg); } }

/* Shake para errores */
.shake-enter-active {
  animation: shake .45s ease;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}

/* Slide-down para errores de campo */
.slide-down-enter-active { transition: all .25s ease; }
.slide-down-leave-active { transition: all .2s ease; }
.slide-down-enter-from   { opacity: 0; transform: translateY(-6px); }
.slide-down-leave-to     { opacity: 0; transform: translateY(-6px); }

/* Fade para el botón */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

/* ─── Responsive ───────────────────────────────────────────── */
@media (max-width: 768px) {
  .login-wrapper { flex-direction: column; }
  .left-panel {
    width: 100%;
    min-height: 220px;
    flex-shrink: 0;
  }
  .left-content { padding: 1.8rem 1.6rem; }
  .floating-cards { flex-direction: row; align-self: auto; }
  .tagline { font-size: .95rem; }
  .right-panel { padding: 2rem 1.4rem; }
  .form-title { font-size: 1.6rem; }
}

.left-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;

background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.45) 0%,
    rgba(0, 0, 0, 0.25) 35%,
    rgba(0, 0, 0, 0.05) 70%,
    rgba(0, 0, 0, 0) 100%
);
}

.register-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field-input.no-icon {
  padding-left: 14px;
  padding-right: 14px;
}

@media (max-width: 520px) {
  .register-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>