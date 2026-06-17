<template>
  <div class="appointments-page" :class="{ visible: mounted }">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Citas</h1>
        <p class="page-subtitle">Gestiona tu agenda</p>
      </div>
      <button class="btn-new" @click="openModal()">
        <Plus :size="18" :stroke-width="2.5" /> Nueva cita
      </button>
    </div>

    <!-- ── Layout principal ────────────────────────────────── -->
    <div class="main-layout">

      <!-- ══ CALENDARIO ══════════════════════════════════════ -->
      <div class="calendar-card">

        <!-- Navegación mes -->
        <div class="cal-nav">
          <h2 class="cal-month">{{ monthLabel }}</h2>
          <div class="cal-nav-btns">
            <button class="nav-btn" @click="prevMonth"><ChevronLeft :size="16" /></button>
            <button class="nav-btn" @click="nextMonth"><ChevronRight :size="16" /></button>
          </div>
        </div>

        <!-- Días de la semana -->
        <div class="cal-weekdays">
          <span v-for="d in weekdays" :key="d">{{ d }}</span>
        </div>

        <!-- Grilla de días -->
        <div class="cal-grid">
          <!-- Celdas vacías del inicio -->
          <div v-for="_ in firstDayOfMonth" :key="'e' + _" class="cal-cell empty" />

          <!-- Días del mes -->
          <div
            v-for="day in daysInMonth"
            :key="day"
            class="cal-cell"
            :class="{
              today:    isToday(day),
              selected: isSelected(day),
              'has-appt': hasAppointments(day),
            }"
            @click="selectDay(day)"
          >
            <span class="day-num">{{ day }}</span>
            <span v-if="hasAppointments(day)" class="appt-dot" />
          </div>
        </div>

      </div>

      <!-- ══ PANEL LATERAL — citas del día ══════════════════ -->
      <div class="day-panel">
        <h3 class="day-title">{{ selectedDayLabel }}</h3>

        <div v-if="selectedDayAppointments.length" class="appt-list">
          <div
            v-for="appt in selectedDayAppointments"
            :key="appt.id"
            class="appt-card"
            @click="openModal(appt)"
          >
            <div class="appt-time-col">
              <span class="appt-time">{{ appt.time }}</span>
            </div>
            <div class="appt-body">
              <div class="appt-top-row">
                <span class="appt-badge" :class="appt.status">{{ statusLabel(appt.status) }}</span>
              </div>
              <p class="appt-name">{{ appt.patientName }}</p>
              <p class="appt-reason">{{ appt.reason }}</p>
            </div>
            <div class="appt-actions" @click.stop>
              <button class="appt-act-btn" @click="confirmAppt(appt)" title="Confirmar" v-if="appt.status === 'pending'">
                <Check :size="13" />
              </button>
              <button class="appt-act-btn danger" @click="askDelete(appt)" title="Eliminar">
                <Trash2 :size="13" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="day-empty">
          <span class="day-empty-icon">📅</span>
          <p>Sin citas para este día</p>
          <button class="btn-new-small" @click="openModal()">+ Agregar cita</button>
        </div>
      </div>

    </div>

    <!-- ══ LISTA PRÓXIMAS CITAS ════════════════════════════ -->
    <div class="upcoming-section">
      <h3 class="section-title">Próximas citas</h3>
      <div class="upcoming-grid">
        <div
          v-for="appt in upcomingAppointments"
          :key="appt.id"
          class="upcoming-card"
          @click="selectDayFromAppt(appt); openModal(appt)"
        >
          <div class="up-date-box">
            <span class="up-day">{{ new Date(appt.date + 'T12:00:00').getDate() }}</span>
            <span class="up-month">{{ new Date(appt.date + 'T12:00:00').toLocaleDateString('es-MX', { month: 'short' }) }}</span>
          </div>
          <div class="up-info">
            <p class="up-name">{{ appt.patientName }}</p>
            <p class="up-reason">{{ appt.reason }}</p>
            <p class="up-time">🕐 {{ appt.time }}</p>
          </div>
          <span class="appt-badge" :class="appt.status">{{ statusLabel(appt.status) }}</span>
        </div>
      </div>
    </div>

    <!-- ══ MODAL: Nueva / Editar cita ═════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="modal.open" class="modal-overlay" @click.self="closeModal">
        <Transition name="modal-slide">
          <div v-if="modal.open" class="modal-card">

            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon-box">
                  <CalendarPlus :size="20" />
                </div>
                <div>
                  <h2 class="modal-title">{{ modal.appt ? 'Editar cita' : 'Nueva cita' }}</h2>
                  <p class="modal-sub">{{ modal.appt ? 'Modifica los datos de la cita' : 'Agenda una cita para un paciente' }}</p>
                </div>
              </div>
              <button class="modal-close" @click="closeModal"><X :size="18" /></button>
            </div>

            <div class="modal-body">
              <form @submit.prevent="saveAppointment" novalidate>
                <div class="form-grid">

                  <!-- Paciente -->
                  <div class="form-field full">
                    <label>Paciente</label>
                    <div class="select-wrapper">
                      <Users :size="15" class="field-ico" />
                      <select v-model="form.patientId" :class="{ err: formErrors.patientId }">
  <option value="" disabled>Selecciona un paciente</option>
  <option v-for="p in patientList" :key="p.id" :value="p.id">
    {{ p.full_name }}
  </option>
</select>
                    </div>
                    <span v-if="formErrors.patientId" class="field-err">{{ formErrors.patientId }}</span>
                  </div>

                  <!-- Fecha -->
                  <div class="form-field">
                    <label>Fecha</label>
                    <div class="input-wrapper">
                      <CalendarDays :size="15" class="field-ico" />
                      <input
                        v-model="form.date"
                        type="date"
                        :class="{ err: formErrors.date }"
                      />
                    </div>
                    <span v-if="formErrors.date" class="field-err">{{ formErrors.date }}</span>
                  </div>

                  <!-- Hora -->
                  <div class="form-field">
                    <label>Hora</label>
                    <div class="input-wrapper">
                      <Clock :size="15" class="field-ico" />
                      <input
                        v-model="form.time"
                        type="time"
                        :class="{ err: formErrors.time }"
                      />
                    </div>
                    <span v-if="formErrors.time" class="field-err">{{ formErrors.time }}</span>
                  </div>

                  <!-- Razón / Tipo -->
                  <div class="form-field full">
                    <label>Razón de la cita</label>
                    <div class="select-wrapper">
                      <ClipboardList :size="15" class="field-ico" />
                      <select v-model="form.reason" :class="{ err: formErrors.reason }">
                        <option value="" disabled>Selecciona el motivo</option>
                        <option>Primera consulta</option>
                        <option>Consulta de seguimiento</option>
                        <option>Control de peso</option>
                        <option>Revisión de plan alimenticio</option>
                        <option>Evaluación inicial</option>
                        <option>Consulta de urgencia</option>
                        <option>Otro</option>
                      </select>
                    </div>
                    <span v-if="formErrors.reason" class="field-err">{{ formErrors.reason }}</span>
                  </div>

                  <!-- Estado -->
                  <div class="form-field full">
                    <label>Estado</label>
                    <div class="status-selector">
                      <button
                        v-for="s in statusOptions"
                        :key="s.value"
                        type="button"
                        class="status-opt"
                        :class="{ selected: form.status === s.value, [s.value]: true }"
                        @click="form.status = s.value"
                      >
                        <span class="status-dot" />
                        {{ s.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Notas adicionales 
                  <div class="form-field full">
                    <label>Notas adicionales</label>
                    <div class="textarea-wrapper">
                      <FileText :size="15" class="field-ico textarea-ico" />
                      <textarea
                        v-model="form.notes"
                        placeholder="Observaciones, indicaciones previas, etc."
                        rows="3"
                      />
                    </div>
                  </div>-->

                </div>

                <div class="modal-footer">
                  <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
                  <button type="submit" class="btn-primary" :disabled="saving">
                    <span v-if="saving" class="spinner-sm" />
                    <Check v-else :size="15" />
                    {{ modal.appt ? 'Guardar cambios' : 'Crear cita' }}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ══ MODAL: Confirmar eliminación ════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="deleteModal.open" class="modal-overlay" @click.self="deleteModal.open = false">
        <div class="modal-card delete-modal">
          <div class="delete-icon-wrap"><Trash2 :size="26" /></div>
          <h3 class="delete-title">¿Eliminar cita?</h3>
          <p class="delete-sub">
            Se eliminará la cita de <strong>{{ deleteModal.appt?.patientName }}</strong>
            el {{ deleteModal.appt ? formatDate(deleteModal.appt.date) : '' }} a las {{ deleteModal.appt?.time }}.
          </p>
          <div class="modal-footer centered">
            <button class="btn-secondary" @click="deleteModal.open = false">Cancelar</button>
            <button class="btn-danger" @click="deleteAppointment">
              <Trash2 :size="14" /> Eliminar
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  X,
  CalendarPlus,
  CalendarDays,
  Clock,
  Users,
  ClipboardList,
  FileText,
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

/* ─────────────────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────────────────── */
type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'

interface PatientOption {
  id: string
  full_name: string
}

interface AppointmentRow {
  id: string
  user_id: string
  patient_id: string
  appointment_date: string
  appointment_time: string
  reason: string | null
  status: AppointmentStatus
  created_at: string
  updated_at: string
  patients?: {
    full_name: string
  } | null
}

interface Appointment {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  reason: string
  notes: string
  status: AppointmentStatus
}

/* ─────────────────────────────────────────────────────────
   STORE
───────────────────────────────────────────────────────── */
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
/* ─────────────────────────────────────────────────────────
   ESTADO
───────────────────────────────────────────────────────── */
const mounted = ref(false)
const saving = ref(false)
const loading = ref(false)
const pageError = ref('')

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())
const selectedDate = ref(today.toISOString().slice(0, 10))

const weekdays = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

const patientList = ref<PatientOption[]>([])

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'cancelled', label: 'Cancelada' },
]

const appointments = ref<Appointment[]>([])

/* ─────────────────────────────────────────────────────────
   SUPABASE
───────────────────────────────────────────────────────── */
async function ensureUser() {
  if (!auth.user) {
    await auth.loadUser()
  }

  return auth.user
}

async function loadPatients() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('user_id', user.id)
    .order('full_name', { ascending: true })

  if (error) {
    pageError.value = error.message
    return
  }

  patientList.value = data ?? []
}

function normalizeTime(time: string) {
  return time.slice(0, 5)
}

function mapAppointment(row: any): Appointment {
  const patientName = Array.isArray(row.patients)
    ? row.patients[0]?.full_name
    : row.patients?.full_name

  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: patientName ?? 'Paciente sin nombre',
    date: row.appointment_date,
    time: normalizeTime(row.appointment_time),
    reason: row.reason ?? 'Sin motivo',
    notes: '',
    status: row.status ?? 'pending',
  }
}

async function loadAppointments() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  loading.value = true
  pageError.value = ''

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      user_id,
      patient_id,
      appointment_date,
      appointment_time,
      reason,
      status,
      created_at,
      updated_at,
      patients (
        full_name
      )
    `)
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  loading.value = false

  if (error) {
    pageError.value = error.message
    return
  }

  appointments.value = (data ?? []).map((row) => mapAppointment(row))
}

/* ─────────────────────────────────────────────────────────
   COMPUTED CALENDARIO
───────────────────────────────────────────────────────── */
const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1)
    .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase()),
)

const daysInMonth = computed(() =>
  new Date(viewYear.value, viewMonth.value + 1, 0).getDate(),
)

const firstDayOfMonth = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).getDay(),
)

const selectedDateStr = computed(() => selectedDate.value)

const selectedDayLabel = computed(() => {
  const date = new Date(selectedDateStr.value + 'T12:00:00')

  return date
    .toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .replace(/^\w/, (c) => c.toUpperCase())
})

const selectedDayAppointments = computed(() =>
  appointments.value
    .filter((appointment) => appointment.date === selectedDateStr.value)
    .sort((a, b) => a.time.localeCompare(b.time)),
)

const upcomingAppointments = computed(() => {
  const todayStr = today.toISOString().slice(0, 10)

  return appointments.value
    .filter((appointment) => appointment.date >= todayStr && appointment.status !== 'cancelled')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 6)
})

function hasAppointments(day: number) {
  const dateStr = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-${String(
    day,
  ).padStart(2, '0')}`

  return appointments.value.some((appointment) => appointment.date === dateStr)
}

function isToday(day: number) {
  return (
    day === today.getDate() &&
    viewMonth.value === today.getMonth() &&
    viewYear.value === today.getFullYear()
  )
}

function isSelected(day: number) {
  const dateStr = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return dateStr === selectedDate.value
}

function selectDay(day: number) {
  selectedDate.value = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function selectDayFromAppt(appt: Appointment) {
  const date = new Date(appt.date + 'T12:00:00')

  viewYear.value = date.getFullYear()
  viewMonth.value = date.getMonth()
  selectedDate.value = appt.date
}

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
function statusLabel(status: string) {
  if (status === 'confirmed') return 'confirmada'
  if (status === 'pending') return 'pendiente'
  if (status === 'completed') return 'completada'
  return 'cancelada'
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/* ─────────────────────────────────────────────────────────
   MODAL
───────────────────────────────────────────────────────── */
const modal = reactive<{
  open: boolean
  appt: Appointment | null
}>({
  open: false,
  appt: null,
})

const form = reactive({
  patientId: '',
  date: '',
  time: '',
  reason: '',
  notes: '',
  status: 'pending' as AppointmentStatus,
})

const formErrors = reactive({
  patientId: '',
  date: '',
  time: '',
  reason: '',
})

function openModal(appt?: Appointment) {
  modal.appt = appt ?? null
  clearErrors()

  if (appt) {
    Object.assign(form, {
      patientId: appt.patientId,
      date: appt.date,
      time: appt.time,
      reason: appt.reason,
      notes: appt.notes,
      status: appt.status,
    })
  } else {
    Object.assign(form, {
      patientId: '',
      date: selectedDateStr.value,
      time: '',
      reason: '',
      notes: '',
      status: 'pending',
    })
  }

  modal.open = true
}

function openModalFromPatientQuery() {
  const patientId = route.query.patientId

  if (!patientId || typeof patientId !== 'string') return

  const exists = patientList.value.some((patient) => patient.id === patientId)

  if (!exists) return

  Object.assign(form, {
    patientId,
    date: selectedDateStr.value,
    time: '',
    reason: '',
    notes: '',
    status: 'pending',
  })

  modal.appt = null
  modal.open = true

  router.replace('/appointments')
}

function closeModal() {
  modal.open = false
}

function clearErrors() {
  Object.assign(formErrors, {
    patientId: '',
    date: '',
    time: '',
    reason: '',
  })
}

function validate() {
  clearErrors()

  let ok = true

  if (!form.patientId) {
    formErrors.patientId = 'Selecciona un paciente.'
    ok = false
  }

  if (!form.date) {
    formErrors.date = 'La fecha es requerida.'
    ok = false
  }

  if (!form.time) {
    formErrors.time = 'La hora es requerida.'
    ok = false
  }

  if (!form.reason) {
    formErrors.reason = 'Selecciona la razón.'
    ok = false
  }

  return ok
}

async function saveAppointment() {
  if (!validate()) return

  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  saving.value = true
  pageError.value = ''

  const payload = {
    user_id: user.id,
    patient_id: form.patientId,
    appointment_date: form.date,
    appointment_time: form.time,
    reason: form.notes.trim()
      ? `${form.reason} - ${form.notes.trim()}`
      : form.reason,
    status: form.status,
  }

  try {
    if (modal.appt) {
      const { error } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', modal.appt.id)
        .eq('user_id', user.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from('appointments').insert(payload)

      if (error) throw error
    }

    const date = new Date(form.date + 'T12:00:00')
    viewYear.value = date.getFullYear()
    viewMonth.value = date.getMonth()
    selectedDate.value = form.date

    await loadAppointments()
    closeModal()
  } catch (err) {
    pageError.value = err instanceof Error ? err.message : 'No se pudo guardar la cita.'
  } finally {
    saving.value = false
  }
}

/* ─────────────────────────────────────────────────────────
   ELIMINAR / CONFIRMAR
───────────────────────────────────────────────────────── */
const deleteModal = reactive<{
  open: boolean
  appt: Appointment | null
}>({
  open: false,
  appt: null,
})

function askDelete(appt: Appointment) {
  deleteModal.appt = appt
  deleteModal.open = true
}

async function deleteAppointment() {
  const user = await ensureUser()

  if (!deleteModal.appt || !user) return

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', deleteModal.appt.id)
    .eq('user_id', user.id)

  if (error) {
    pageError.value = error.message
    return
  }

  appointments.value = appointments.value.filter(
    (appointment) => appointment.id !== deleteModal.appt?.id,
  )

  deleteModal.open = false
}

async function confirmAppt(appt: Appointment) {
  const user = await ensureUser()

  if (!user) return

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appt.id)
    .eq('user_id', user.id)

  if (error) {
    pageError.value = error.message
    return
  }

  appt.status = 'confirmed'
}

onMounted(async () => {
  setTimeout(() => {
    mounted.value = true
  }, 80)

  await Promise.all([loadPatients(), loadAppointments()])

  openModalFromPatientQuery()
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   BASE
══════════════════════════════════════════════════════════ */
.appointments-page {
  padding: 2.2rem 2.4rem;
  min-height: 100vh;
  background: #f8fafb;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  opacity: 0;
  transition: opacity .4s ease;
}
.appointments-page.visible { opacity: 1; }

/* ── Header ───────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.8rem;
  animation: fadeDown .5s ease both;
}
.page-title    { font-size: 1.2rem; font-weight: 600; color: #0f1923; letter-spacing: -.5px; }
.page-subtitle { font-size: .9rem; color: #9ca3af; margin-top: 4px; }

.btn-new {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: #8E73A8;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: .9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background .2s, transform .15s, box-shadow .2s;
  white-space: nowrap;
}
.btn-new:hover { background: #7a5f97; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(142,115,168,.4); }

/* ── Layout ───────────────────────────────────────────────── */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.2rem;
  align-items: start;
  animation: fadeUp .5s .1s ease both;
}

/* ══════════════════════════════════════════════════════════
   CALENDARIO
══════════════════════════════════════════════════════════ */
.calendar-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #f0f0f5;
  padding: 1.8rem;
  box-shadow: 0 1px 12px rgba(0,0,0,.04);
}

.cal-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.4rem;
}

.cal-month {
  font-size: 1.3rem;
  font-weight: 600;
  color: #0f1923;
  letter-spacing: -.3px;
  text-transform: capitalize;
}

.cal-nav-btns { display: flex; gap: 6px; }

.nav-btn {
  width: 32px; height: 32px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 9px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #6b7280;
  transition: .2s;
}
.nav-btn:hover { border-color: #8E73A8; color: #8E73A8; background: #faf7ff; }

/* Días semana */
.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: .6rem;
}
.cal-weekdays span {
  text-align: center;
  font-size: .7rem;
  font-weight: 700;
  color: #b0b8cc;
  letter-spacing: .07em;
  padding: 4px 0;
}

/* Grilla */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cal-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: background .15s, transform .1s;
  position: relative;
  font-size: .92rem;
  color: #374151;
  font-weight: 500;
}
.cal-cell:hover:not(.empty):not(.selected) { background: #f7f4ff; color: #8E73A8; }
.cal-cell.empty { cursor: default; }

.cal-cell.today {
  font-weight: 700;
  color: #8E73A8;
}
.cal-cell.today .day-num {
  background: #f3eeff;
  border-radius: 8px;
  padding: 2px 6px;
}

.cal-cell.selected .day-num {
  background: #8E73A8;
  color: #fff;
  border-radius: 10px;
  padding: 4px 10px;
  font-weight: 700;
}
.cal-cell.selected { color: #fff; }

.day-num { z-index: 1; }

.appt-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #8E73A8;
  position: absolute;
  bottom: 5px;
}
.cal-cell.selected .appt-dot { background: rgba(255,255,255,.7); }

/* ══════════════════════════════════════════════════════════
   PANEL LATERAL
══════════════════════════════════════════════════════════ */
.day-panel {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #f0f0f5;
  padding: 1.4rem;
  box-shadow: 0 1px 12px rgba(0,0,0,.04);
  min-height: 420px;
}

.day-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0f1923;
  margin-bottom: 1.1rem;
  text-transform: capitalize;
}

.appt-list { display: flex; flex-direction: column; gap: 10px; }

.appt-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fafafa;
  border-radius: 13px;
  border: 1px solid #f0f0f5;
  cursor: pointer;
  transition: background .15s, border-color .15s, transform .1s;
}
.appt-card:hover { background: #f7f4ff; border-color: #e4d9f7; transform: translateX(2px); }
.appt-card:hover .appt-actions { opacity: 1; }

.appt-time-col { flex-shrink: 0; min-width: 44px; }
.appt-time { font-size: .88rem; font-weight: 700; color: #6b7280; }

.appt-body { flex: 1; min-width: 0; }
.appt-top-row { margin-bottom: 3px; }
.appt-name   { font-size: .9rem; font-weight: 700; color: #0f1923; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.appt-reason { font-size: .75rem; color: #9ca3af; margin-top: 2px; }

.appt-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity .2s;
  flex-shrink: 0;
}
.appt-act-btn {
  width: 26px; height: 26px;
  border: none; background: none; cursor: pointer;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  color: #9ca3af; transition: .15s;
}
.appt-act-btn:hover       { background: #f3eeff; color: #8E73A8; }
.appt-act-btn.danger:hover{ background: #fff1f1; color: #ef4444; }

/* Badge de estado */
.appt-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: .7rem;
  font-weight: 700;
  text-transform: capitalize;
}
.appt-badge.confirmed { background: #d1fae5; color: #065f46; }
.appt-badge.pending   { background: #fef3c7; color: #92400e; }
.appt-badge.cancelled { background: #fee2e2; color: #991b1b; }

/* Empty */
.day-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 2.5rem 1rem;
  text-align: center;
  color: #9ca3af;
  font-size: .88rem;
  height: 100%;
}
.day-empty-icon { font-size: 2.2rem; }
.btn-new-small {
  margin-top: 6px;
  padding: 7px 16px;
  background: #ffffff;
  color: #8E73A8;
  border: none;
  border-radius: 9px;
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
}
.btn-new-small:hover { background: #ffffff; border-radius: 1px; }

/* ══════════════════════════════════════════════════════════
   PRÓXIMAS CITAS
══════════════════════════════════════════════════════════ */
.upcoming-section {
  margin-top: 1.4rem;
  animation: fadeUp .5s .2s ease both;
}
.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f1923;
  margin-bottom: 1rem;
}
.upcoming-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}

.upcoming-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #f0f0f5;
  padding: 14px 16px;
  cursor: pointer;
  transition: .2s;
  box-shadow: 0 1px 6px rgba(0,0,0,.04);
}
.upcoming-card:hover { border-color: #e4d9f7; background: #faf7ff; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(142,115,168,.12); }

.up-date-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f3eeff;
  border-radius: 10px;
  padding: 8px 10px;
  min-width: 46px;
  flex-shrink: 0;
}
.up-day   { font-size: 1.2rem; font-weight: 700; color: #8E73A8; line-height: 1; }
.up-month { font-size: .65rem; font-weight: 700; color: #8E73A8; text-transform: uppercase; margin-top: 1px; }

.up-info { flex: 1; min-width: 0; }
.up-name   { font-size: .88rem; font-weight: 700; color: #0f1923; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.up-reason { font-size: .75rem; color: #9ca3af; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.up-time   { font-size: .75rem; color: #6b7280; margin-top: 4px; font-weight: 500; }

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
  width: 100%; max-width: 500px;
  box-shadow: 0 24px 60px rgba(0,0,0,.18);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.4rem 1.4rem 1rem;
  border-bottom: 1px solid #f3f3f8;
}
.modal-title-group { display: flex; align-items: center; gap: 12px; }
.modal-icon-box {
  width: 42px; height: 42px;
  border-radius: 12px;
  background: #f3eeff;
  color: #8E73A8;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.modal-title { font-size: 1.05rem; font-weight: 700; color: #0f1923; }
.modal-sub   { font-size: .78rem; color: #9ca3af; margin-top: 2px; }
.modal-close {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; padding: 4px; border-radius: 8px;
  display: flex; transition: .2s;
}
.modal-close:hover { color: #374151; background: #f3f4f6; }

.modal-body { padding: 1.4rem; }

/* Form */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 1.4rem; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field.full { grid-column: 1 / -1; }
.form-field label { font-size: .78rem; font-weight: 600; color: #374151; letter-spacing: .02em; }

.input-wrapper,
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.field-ico {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  pointer-events: none;
  flex-shrink: 0;
}
.textarea-ico { top: 12px; align-self: flex-start; }

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: .88rem;
  color: #0f1923;
  background: #f9fafb;
  outline: none;
  font-family: inherit;
  transition: .2s;
}
.form-field textarea { padding-left: 36px; resize: none; }
.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #8E73A8;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(142,115,168,.1);
}
.form-field input.err,
.form-field select.err { border-color: #ef4444; }
.field-err { font-size: .73rem; color: #ef4444; }

/* Status selector */
.status-selector {
  display: flex;
  gap: 8px;
}
.status-opt {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  font-size: .82rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
}
.status-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #d1d5db;
}
.status-opt.selected.confirmed { border-color: #22c55e; background: #f0fdf4; color: #065f46; }
.status-opt.selected.confirmed .status-dot { background: #22c55e; }
.status-opt.selected.pending   { border-color: #f59e0b; background: #fffbeb; color: #92400e; }
.status-opt.selected.pending   .status-dot { background: #f59e0b; }
.status-opt.selected.cancelled { border-color: #ef4444; background: #fff1f1; color: #991b1b; }
.status-opt.selected.cancelled .status-dot { background: #ef4444; }
.status-opt:hover:not(.selected) { border-color: #8E73A8; color: #8E73A8; }

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 1rem;
  border-top: 1px solid #f3f3f8;
}
.modal-footer.centered { justify-content: center; }

.btn-secondary {
  padding: 10px 20px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  font-size: .88rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
}
.btn-secondary:hover { border-color: #9ca3af; }

.btn-primary {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px;
  background: #8E73A8;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
  box-shadow: 0 3px 10px rgba(142,115,168,.3);
}
.btn-primary:hover:not(:disabled) { background: #7a5f97; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

.btn-danger {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
}
.btn-danger:hover { background: #dc2626; }

.spinner-sm {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
  display: inline-block;
}

/* Delete modal */
.delete-modal { max-width: 370px; padding: 2rem; text-align: center; }
.delete-icon-wrap {
  width: 58px; height: 58px; border-radius: 50%;
  background: #fff1f1; color: #ef4444;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto .9rem;
}
.delete-title { font-size: 1.05rem; font-weight: 700; color: #0f1923; margin-bottom: 8px; }
.delete-sub   { font-size: .84rem; color: #6b7280; line-height: 1.5; margin-bottom: 1.4rem; }

/* ── Animaciones ──────────────────────────────────────────── */
@keyframes fadeDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeUp   { from { opacity:0; transform:translateY(12px);  } to { opacity:1; transform:translateY(0); } }
@keyframes spin     { to { transform:rotate(360deg); } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s ease; }
.modal-fade-enter-from,   .modal-fade-leave-to     { opacity: 0; }

.modal-slide-enter-active { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease; }
.modal-slide-leave-active { transition: transform .2s ease, opacity .2s ease; }
.modal-slide-enter-from   { transform: scale(.92) translateY(16px); opacity: 0; }
.modal-slide-leave-to     { transform: scale(.95); opacity: 0; }

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 960px) {
  .main-layout { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .appointments-page { padding: 1.2rem 1rem; }
  .form-grid { grid-template-columns: 1fr; }
  .status-selector { flex-direction: column; }
  .upcoming-grid { grid-template-columns: 1fr; }
}
</style>