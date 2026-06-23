<template>
  <div class="settings-page" :class="{ visible: mounted }">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="page-header">
      <h1 class="page-title">Configuración</h1>
      <p class="page-subtitle">Gestiona tu cuenta y preferencias</p>
    </div>

    <!-- ── Tabs ───────────────────────────────────────────── -->
    <div class="tabs-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key, disabled: !tab.enabled }"
        @click="tab.enabled && (activeTab = tab.key)"
      >
        <component :is="tab.icon" :size="15" />
        {{ tab.label }}
        <span v-if="!tab.enabled" class="tab-soon">prox...</span>
      </button>
    </div>

    <!-- ════════════════════════════════════════════════════
         TAB — PERFIL
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'profile'" class="tab-pane">

      <!-- Información personal -->
      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">Información personal</h2>
          <p class="card-desc">Datos de tu cuenta y perfil profesional</p>
        </div>

        <!-- Avatar -->
        <div class="avatar-section">
          <div class="avatar-wrap">
            <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" class="avatar-img" />
            <div v-else class="avatar-placeholder">{{ userInitials }}</div>
            <button class="avatar-overlay" @click="triggerAvatarInput" title="Cambiar foto">
              <Camera :size="16" />
            </button>
          </div>
          <div class="avatar-info">
            <button class="btn-change-photo" @click="triggerAvatarInput">
              <Upload :size="14" /> Cambiar foto
            </button>
            <p class="avatar-hint">JPG, PNG o WebP · Máx. 2 MB</p>
          </div>
          <input ref="avatarInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden-input" @change="handleAvatarChange" />
        </div>

        <!-- Formulario -->
        <form @submit.prevent="saveProfile" novalidate>
          <div class="form-grid">
            <div class="ff">
              <label>Nombre *</label>
              <input v-model="form.firstName" type="text" placeholder="Ana" :class="{ err: errors.firstName }" @blur="validateField('firstName')" />
              <span v-if="errors.firstName" class="ferr">{{ errors.firstName }}</span>
            </div>
            <div class="ff">
              <label>Apellido *</label>
              <input v-model="form.lastName" type="text" placeholder="Rivera" :class="{ err: errors.lastName }" @blur="validateField('lastName')" />
              <span v-if="errors.lastName" class="ferr">{{ errors.lastName }}</span>
            </div>
            <div class="ff">
              <label>Correo electrónico *</label>
              <input v-model="form.email" type="email" placeholder="dr.rivera@nutria.com" :class="{ err: errors.email }" @blur="validateField('email')" />
              <span v-if="errors.email" class="ferr">{{ errors.email }}</span>
            </div>
            <div class="ff">
              <label>Teléfono</label>
              <input v-model="form.phone" type="tel" placeholder="+52 55 8765 4321" />
            </div>
            <div class="ff">
              <label>Número de cédula</label>
              <input v-model="form.license" type="text" placeholder="CDN 12345" />
            </div>
            <div class="ff">
              <label>Especialización</label>
              <input v-model="form.specialization" type="text" placeholder="Nutrióloga clínica" />
            </div>
          </div>

          <div class="card-footer">
            <Transition name="saved-msg">
              <span v-if="savedMsg" class="saved-indicator">
                <CheckCircle :size="15" /> Cambios guardados
              </span>
            </Transition>
            <button type="submit" class="btn-save" :disabled="saving">
              <span v-if="saving" class="spinner-sm" />
              <Save v-else :size="15" />
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Peligro: eliminar cuenta -->
      <div class="settings-card danger-card">
        <div class="card-header">
          <h2 class="card-title danger-title">Zona de peligro</h2>
          <p class="card-desc">Estas acciones son permanentes e irreversibles.</p>
        </div>
        <div class="danger-row">
          <div>
            <p class="danger-action-title">Eliminar cuenta</p>
            <p class="danger-action-desc">Se eliminará tu cuenta y todos los datos asociados de forma permanente.</p>
          </div>
          <button class="btn-danger-outline" @click="askDeleteAccount">
            <Trash2 :size="15" /> Eliminar cuenta
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs deshabilitados — placeholder visual -->
    <div v-else class="tab-pane coming-soon-pane">
      <div class="coming-soon">
        <Construction :size="36" />
        <p class="cs-title">Próximamente</p>
        <p class="cs-sub">Esta sección estará disponible en una próxima actualización.</p>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         MODAL: Confirmar eliminar cuenta
    ═══════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="deleteModal" class="modal-overlay" @click.self="deleteModal = false">
        <Transition name="modal-slide">
          <div v-if="deleteModal" class="modal-card">
            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon-box danger"><AlertTriangle :size="19" /></div>
                <div>
                  <h2 class="modal-title">¿Eliminar tu cuenta?</h2>
                  <p class="modal-sub">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button class="modal-close" @click="deleteModal = false"><X :size="17" /></button>
            </div>
            <div class="modal-body">
              <p class="delete-warning">Se eliminarán permanentemente:</p>
              <ul class="delete-list">
                <li>Tu perfil y datos personales</li>
                <li>Todos tus pacientes y expedientes</li>
                <li>Planes alimenticios y recetas guardadas</li>
                <li>Documentos y archivos adjuntos</li>
              </ul>
              <div class="confirm-input-wrap">
                <label>Escribe <strong>ELIMINAR</strong> para confirmar</label>
                <input v-model="deleteConfirmText" type="text" placeholder="ELIMINAR" class="confirm-input" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="deleteModal = false">Cancelar</button>
              <button class="btn-danger" :disabled="deleteConfirmText !== 'ELIMINAR'" @click="deleteAccount">
                <Trash2 :size="14" /> Eliminar mi cuenta
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Camera,
  Upload,
  Save,
  CheckCircle,
  Trash2,
  AlertTriangle,
  X,
  Construction,
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

const auth = useAuthStore()
const toast = useToastStore()

/* ─────────────────────────────────────────────────────────
   TABS
───────────────────────────────────────────────────────── */
const tabs = [
  { key: 'profile', label: 'Perfil', icon: User, enabled: true },
  { key: 'clinic', label: 'Clínica', icon: Building2, enabled: false },
  { key: 'notifications', label: 'Notificaciones', icon: Bell, enabled: false },
  { key: 'security', label: 'Seguridad', icon: Shield, enabled: false },
  { key: 'billing', label: 'Facturación', icon: CreditCard, enabled: false },
]

const activeTab = ref('profile')

/* ─────────────────────────────────────────────────────────
   ESTADO
───────────────────────────────────────────────────────── */
const mounted = ref(false)
const saving = ref(false)
const savedMsg = ref(false)

const avatarInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref('')
const selectedAvatarFile = ref<File | null>(null)

const deleteModal = ref(false)
const deleteConfirmText = ref('')

const pageError = ref('')

/* ─────────────────────────────────────────────────────────
   FORMULARIO
───────────────────────────────────────────────────────── */
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  license: '',
  specialization: '',
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
})

const userInitials = computed(() => {
  const first = form.firstName.trim()[0] ?? ''
  const last = form.lastName.trim()[0] ?? ''

  return `${first}${last}`.toUpperCase() || 'N'
})

/* ─────────────────────────────────────────────────────────
   VALIDACIÓN
───────────────────────────────────────────────────────── */
function validateField(field: 'firstName' | 'lastName' | 'email') {
  if (field === 'firstName') {
    errors.firstName = form.firstName.trim() ? '' : 'El nombre es requerido.'
  }

  if (field === 'lastName') {
    errors.lastName = form.lastName.trim() ? '' : 'El apellido es requerido.'
  }

  if (field === 'email') {
    if (!form.email.trim()) {
      errors.email = 'El correo es requerido.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Ingresa un correo válido.'
    } else {
      errors.email = ''
    }
  }
}

function validateAll() {
  validateField('firstName')
  validateField('lastName')
  validateField('email')

  return !errors.firstName && !errors.lastName && !errors.email
}

/* ─────────────────────────────────────────────────────────
   USUARIO / PERFIL
───────────────────────────────────────────────────────── */
async function ensureUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

async function loadProfile() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    toast.error(pageError.value)
    return
  }

  form.email = user.email ?? ''

  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, phone, specialization, profile_photo_url, license_number')
    .eq('id', user.id)
    .single()

  if (error) {
    pageError.value = error.message
    toast.error(pageError.value)
    return
  }

  form.firstName = data?.first_name ?? ''
  form.lastName = data?.last_name ?? ''
  form.phone = data?.phone ?? ''
  form.license = data?.license_number ?? ''
  form.specialization = data?.specialization ?? ''

  if (data?.profile_photo_url) {
    await loadAvatarPreview(data.profile_photo_url)
  }
}

async function loadAvatarPreview(pathOrUrl: string) {
  if (pathOrUrl.startsWith('http')) {
    avatarPreview.value = pathOrUrl
    return
  }

  const { data, error } = await supabase.storage
    .from('nutria-files')
    .createSignedUrl(pathOrUrl, 60 * 60)

  if (!error && data?.signedUrl) {
    avatarPreview.value = data.signedUrl
  }
}

async function uploadAvatar(userId: string) {
  if (!selectedAvatarFile.value) return null

  const file = selectedAvatarFile.value

  const extension = file.name.split('.').pop() || 'jpg'
  const filePath = `${userId}/profile/avatar-${Date.now()}.${extension}`

  const { error } = await supabase.storage
    .from('nutria-files')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    })

  if (error) throw error

  return filePath
}

/* ─────────────────────────────────────────────────────────
   GUARDAR PERFIL
───────────────────────────────────────────────────────── */
async function saveProfile() {
  if (!validateAll()) return

  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    toast.error(pageError.value)
    return
  }

  saving.value = true
  pageError.value = ''

  try {
    const avatarPath = await uploadAvatar(user.id)

    const payload = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      phone: form.phone.trim() || null,
      license_number: form.license.trim() || null,
      specialization: form.specialization.trim() || null,
      ...(avatarPath ? { profile_photo_url: avatarPath } : {}),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)

    if (error) throw error

    await auth.loadUser()

    savedMsg.value = true
    selectedAvatarFile.value = null

    toast.success('Perfil actualizado correctamente.')

    setTimeout(() => {
      savedMsg.value = false
    }, 3000)

    
  } catch (err) {
    pageError.value =
      err instanceof Error ? err.message : 'No se pudo guardar el perfil.'

    toast.error(pageError.value)
  } finally {
    saving.value = false
  }
}

/* ─────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────── */
function triggerAvatarInput() {
  avatarInput.value?.click()
}

function handleAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    toast.error('El archivo supera los 2 MB.')
    input.value = ''
    return
  }

  selectedAvatarFile.value = file

  const reader = new FileReader()

  reader.onload = () => {
    avatarPreview.value = reader.result as string
  }

  reader.readAsDataURL(file)
  input.value = ''
}

/* ─────────────────────────────────────────────────────────
   ELIMINAR CUENTA
───────────────────────────────────────────────────────── */
function askDeleteAccount() {
  deleteConfirmText.value = ''
  deleteModal.value = true
}

async function deleteAccount() {
  if (deleteConfirmText.value !== 'ELIMINAR') return

  toast.info('La eliminación completa de cuenta requiere una función segura en backend.')
  deleteModal.value = false
}

onMounted(async () => {
  await auth.loadUser()
  await loadProfile()

  setTimeout(() => {
    mounted.value = true
  }, 80)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   BASE
══════════════════════════════════════════════════════════ */
.settings-page {
  padding: 2.2rem 2.4rem;
  min-height: 100vh;
  background: #f8fafb;
  font-family: 'Inter','Segoe UI',sans-serif;
  opacity: 0;
  transition: opacity .4s ease;
  max-width: 860px;
}
.settings-page.visible { opacity: 1; }

/* ── Header ───────────────────────────────────────────────── */
.page-header {
  margin-bottom: 1rem;
  animation: fadeDown .5s ease both;
}
.page-title    { font-size: 1.5rem; font-weight: 600; color: #0f1923; letter-spacing: -.5px; }
.page-subtitle { font-size: .9rem; color: #9ca3af; margin-top: 5px; }

/* ── Tabs ─────────────────────────────────────────────────── */
.tabs-bar {
  display: flex;
  gap: 2px;
  border-bottom: 2px solid #f0f0f5;
  margin-bottom: 1.8rem;
  animation: fadeDown .5s .05s ease both;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 11px 18px;
  background: none; border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: .86rem; font-weight: 500;
  color: #6b7280;
  cursor: pointer; font-family: inherit;
  white-space: nowrap;
  transition: color .2s;
  position: relative;
}
.tab-btn:hover:not(.disabled) { color: #3E9B92; }
.tab-btn.active {
  color: #3E9B92;
  font-weight: 600;
  border-bottom-color: #3E9B92;
}
.tab-btn.disabled { cursor: default; opacity: .5; }

.tab-soon {
  font-size: .65rem;
  font-weight: 700;
  background: #f0f0f5;
  color: #9ca3af;
  padding: 2px 7px;
  border-radius: 20px;
  letter-spacing: .03em;
}

/* ── Cards ────────────────────────────────────────────────── */
.settings-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #f0f0f5;
  box-shadow: 0 1px 12px rgba(0,0,0,.04);
  padding: 1.6rem 1.8rem;
  margin-bottom: 1.2rem;
  animation: fadeUp .5s ease both;
}

.card-header { margin-bottom: 1.4rem; }
.card-title  { font-size: 1.05rem; font-weight: 700; color: #0f1923; }
.card-desc   { font-size: .83rem; color: #9ca3af; margin-top: 4px; }

/* ── Avatar ───────────────────────────────────────────────── */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 1.6rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid #f3f3f8;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar-img,
.avatar-placeholder {
  width: 72px; height: 72px;
  border-radius: 18px;
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #3E9B92, #2d7a72);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 700; color: #fff;
}

.avatar-overlay {
  position: absolute; inset: 0;
  border-radius: 18px;
  background: rgba(0,0,0,.45);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; border: none; cursor: pointer;
  transition: opacity .2s;
}
.avatar-wrap:hover .avatar-overlay { opacity: 1; }

.btn-change-photo {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px;
  border: 1.5px solid #e5e7eb;
  background: #fff; border-radius: 10px;
  font-size: .84rem; font-weight: 600;
  color: #374151; cursor: pointer; font-family: inherit; transition: .2s;
}
.btn-change-photo:hover { border-color: #3E9B92; color: #3E9B92; }

.avatar-hint { font-size: .76rem; color: #9ca3af; margin-top: 5px; }
.hidden-input { display: none; }

/* ── Form ─────────────────────────────────────────────────── */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 1.6rem; }

.ff { display: flex; flex-direction: column; gap: 6px; }
.ff label { font-size: .78rem; font-weight: 600; color: #374151; letter-spacing: .02em; }
.ff input {
  padding: 11px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 11px;
  font-size: .9rem; color: #0f1923;
  background: #f9fafb;
  outline: none; font-family: inherit; transition: .2s;
}
.ff input:focus { border-color: #3E9B92; background: #fff; box-shadow: 0 0 0 4px rgba(62,155,146,.1); }
.ff input.err  { border-color: #ef4444; }
.ferr { font-size: .73rem; color: #ef4444; }

/* ── Card footer ──────────────────────────────────────────── */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  padding-top: 1.2rem;
  border-top: 1px solid #f3f3f8;
}

.saved-indicator {
  display: flex; align-items: center; gap: 6px;
  font-size: .82rem; font-weight: 600;
  color: #3E9B92;
}

.btn-save {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 24px;
  background: #3E9B92; color: #fff;
  border: none; border-radius: 11px;
  font-size: .9rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: .2s;
  box-shadow: 0 4px 14px rgba(62,155,146,.32);
}
.btn-save:hover:not(:disabled) { background: #358e85; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(62,155,146,.38); }
.btn-save:disabled { opacity: .65; cursor: not-allowed; transform: none; }

/* ── Danger card ──────────────────────────────────────────── */
.danger-card { border-color: #fee2e2; }
.danger-title { color: #dc2626; }

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.danger-action-title { font-size: .9rem; font-weight: 600; color: #0f1923; }
.danger-action-desc  { font-size: .82rem; color: #9ca3af; margin-top: 3px; }

.btn-danger-outline {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px;
  border: 1.5px solid #ef4444;
  background: none; border-radius: 10px;
  font-size: .86rem; font-weight: 600;
  color: #ef4444; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: .2s; flex-shrink: 0;
}
.btn-danger-outline:hover { background: #fff1f1; }

/* ── Coming soon ──────────────────────────────────────────── */
.coming-soon-pane { animation: fadeUp .5s ease both; }
.coming-soon {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 4rem 1rem;
  background: #fff;
  border-radius: 18px;
  border: 1px dashed #e5e7eb;
  color: #9ca3af; text-align: center;
}
.cs-title { font-size: 1rem; font-weight: 700; color: #374151; }
.cs-sub   { font-size: .84rem; max-width: 300px; }

/* ══════════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,25,35,.45);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
}

.modal-card {
  background: #fff;
  border-radius: 20px;
  width: 100%; max-width: 460px;
  box-shadow: 0 24px 60px rgba(0,0,0,.18);
  overflow: hidden;
}

.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.4rem 1.4rem 1rem;
  border-bottom: 1px solid #f3f3f8;
}
.modal-title-group { display: flex; align-items: center; gap: 12px; }
.modal-icon-box {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.modal-icon-box.danger { background: #fff1f1; color: #ef4444; }
.modal-title { font-size: 1rem; font-weight: 700; color: #0f1923; }
.modal-sub   { font-size: .78rem; color: #9ca3af; margin-top: 2px; }
.modal-close {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; padding: 4px; border-radius: 7px; display: flex; transition: .2s;
}
.modal-close:hover { color: #374151; background: #f3f4f6; }

.modal-body { padding: 1.4rem; }

.delete-warning {
  font-size: .87rem; font-weight: 600; color: #374151; margin-bottom: 10px;
}
.delete-list {
  padding-left: 18px; margin-bottom: 1.2rem;
}
.delete-list li {
  font-size: .84rem; color: #6b7280; line-height: 1.6; margin-bottom: 3px;
}

.confirm-input-wrap { display: flex; flex-direction: column; gap: 5px; }
.confirm-input-wrap label { font-size: .78rem; font-weight: 600; color: #374151; }
.confirm-input {
  padding: 10px 13px;
  border: 1.5px solid #e5e7eb; border-radius: 10px;
  font-size: .9rem; color: #0f1923; background: #f9fafb;
  outline: none; font-family: inherit; transition: .2s;
  letter-spacing: .04em;
}
.confirm-input:focus { border-color: #ef4444; background: #fff; box-shadow: 0 0 0 4px rgba(239,68,68,.1); }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 1rem 1.4rem;
  border-top: 1px solid #f3f3f8;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1.5px solid #e5e7eb; background: #fff;
  border-radius: 10px; font-size: .88rem; font-weight: 600;
  color: #374151; cursor: pointer; font-family: inherit; transition: .2s;
}
.btn-secondary:hover { border-color: #9ca3af; }

.btn-danger {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px; background: #ef4444; color: #fff;
  border: none; border-radius: 10px; font-size: .88rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: .2s;
  box-shadow: 0 3px 10px rgba(239,68,68,.25);
}
.btn-danger:hover:not(:disabled) { background: #dc2626; }
.btn-danger:disabled { opacity: .4; cursor: not-allowed; }

/* ── Spinner ──────────────────────────────────────────────── */
.spinner-sm {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .6s linear infinite; display: inline-block;
}

/* ── Animaciones ──────────────────────────────────────────── */
@keyframes fadeDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeUp   { from { opacity:0; transform:translateY(12px);  } to { opacity:1; transform:translateY(0); } }
@keyframes spin     { to { transform:rotate(360deg); } }

.saved-msg-enter-active { transition: all .3s ease; }
.saved-msg-leave-active { transition: all .25s ease; }
.saved-msg-enter-from,
.saved-msg-leave-to     { opacity: 0; transform: translateX(8px); }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s ease; }
.modal-fade-enter-from,   .modal-fade-leave-to     { opacity: 0; }

.modal-slide-enter-active { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease; }
.modal-slide-leave-active { transition: transform .2s ease, opacity .2s ease; }
.modal-slide-enter-from   { transform: scale(.92) translateY(14px); opacity: 0; }
.modal-slide-leave-to     { transform: scale(.96); opacity: 0; }

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 640px) {
  .settings-page { padding: 1.2rem 1rem; }
  .settings-card { padding: 1.2rem 1.1rem; }
  .form-grid { grid-template-columns: 1fr; }
  .avatar-section { flex-wrap: wrap; }
  .danger-row { flex-direction: column; align-items: flex-start; }
}
</style>