<template>
  <div class="patient-detail" :class="{ visible: mounted }">

    <!-- ── Back ───────────────────────────────────────────── -->
    <button class="back-btn" @click="router.push('/patients')">
      <ArrowLeft :size="16" /> Regresar a Pacientes
    </button>

    <!-- ── Hero header ────────────────────────────────────── -->
    <div class="hero" :class="{ visible: mounted }">
      <div class="hero-left">
        <div class="hero-avatar" :style="{ background: patient.color }">
          {{ patient.initials }}
        </div>
        <div class="hero-info">
          <h1 class="hero-name">{{ patient.name }}</h1>
          <div class="hero-meta">
            <span>{{ patient.age }} años</span>
            <span class="dot">·</span>
            <span>{{ patient.sex === 'F' ? 'Femenino' : 'Masculino' }}</span>
            <span class="dot">·</span>
            <span class="status-badge" :class="patient.status.toLowerCase()">
              {{ patient.status === 'Active' ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
      </div>
      <div class="hero-actions">
        <button class="btn-edit" @click="openEditModal">
          <Pencil :size="15" /> Editar
        </button>
        <button class="btn-appt">
          <CalendarPlus :size="15" /> Agendar cita
        </button>
      </div>
    </div>

    <!-- ── Tabs ───────────────────────────────────────────── -->
    <div class="tabs-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" :size="15" />
        {{ tab.label }}
      </button>
    </div>

    <!-- ════════════════════════════════════════════════════
         CONTENIDO DE TABS
    ═══════════════════════════════════════════════════════ -->
    <div class="tab-content">

      <!-- ══ TAB: Información General ══ -->
      <div v-if="activeTab === 'general'" class="tab-pane">
        <div class="content-grid">

          <!-- Columna izquierda -->
          <div class="col-main">

            <!-- Información Personal -->
            <div class="card">
              <h2 class="card-title">Información personal</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">NOMBRE COMPLETO</span>
                  <span class="info-value">{{ patient.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">EDAD</span>
                  <span class="info-value">{{ patient.age }} años</span>
                </div>
                <div class="info-item">
                  <span class="info-label">SEXO</span>
                  <span class="info-value">{{ patient.sex === 'F' ? 'Femenino' : 'Masculino' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">ESTATURA</span>
                  <span class="info-value">{{ patient.height }} cm</span>
                </div>
                <div class="info-item">
                  <span class="info-label">PESO ACTUAL</span>
                  <span class="info-value">{{ patient.currentWeight }} kg</span>
                </div>
                <div class="info-item">
                  <span class="info-label">PESO META</span>
                  <span class="info-value">{{ patient.goalWeight }} kg</span>
                </div>
                <div class="info-item">
                  <span class="info-label">TELÉFONO</span>
                  <span class="info-value">{{ patient.phone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">OBJETIVO CALÓRICO</span>
                  <span class="info-value">{{ patient.caloricGoal }} kcal / día</span>
                </div>
              </div>
            </div>

            <!-- Estilo de vida -->
            <div class="card">
              <h2 class="card-title">Estilo de vida</h2>
              <div class="lifestyle-grid">
                <div class="lifestyle-item">
                  <div class="ls-icon" style="background:#eff6ff">💧</div>
                  <div>
                    <span class="ls-label">Consumo de agua</span>
                    <span class="ls-value">{{ patient.waterIntake }} L / día</span>
                  </div>
                </div>
                <div class="lifestyle-item">
                  <div class="ls-icon" style="background:#fdf4ff">🍽️</div>
                  <div>
                    <span class="ls-label">Comidas al día</span>
                    <span class="ls-value">{{ patient.mealsPerDay }} comidas</span>
                  </div>
                </div>
                <div class="lifestyle-item">
                  <div class="ls-icon" style="background:#f0fdf4">🏋️</div>
                  <div>
                    <span class="ls-label">Tipo de ejercicio</span>
                    <span class="ls-value">{{ patient.exerciseType }}</span>
                  </div>
                </div>
                <div class="lifestyle-item">
                  <div class="ls-icon" style="background:#fff7ed">⚡</div>
                  <div>
                    <span class="ls-label">Intensidad</span>
                    <span class="ls-value">
                      <span class="intensity-badge" :class="patient.exerciseIntensity.toLowerCase()">
                        {{ patient.exerciseIntensity }}
                      </span>
                    </span>
                  </div>
                </div>
                <div class="lifestyle-item">
                  <div class="ls-icon" style="background:#fef2f2">⏱️</div>
                  <div>
                    <span class="ls-label">Duración por sesión</span>
                    <span class="ls-value">{{ patient.exerciseHours }} h / sesión</span>
                  </div>
                </div>
                <div class="lifestyle-item">
                  <div class="ls-icon" style="background:#f0f9ff">📅</div>
                  <div>
                    <span class="ls-label">Días por semana</span>
                    <span class="ls-value">{{ patient.exerciseDays }} días / semana</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Alergias -->
            <div class="card">
              <h2 class="card-title">Alergias alimentarias</h2>
              <div v-if="patient.allergies.length" class="tag-list">
                <span v-for="a in patient.allergies" :key="a" class="tag tag-red">
                  <AlertTriangle :size="11" /> {{ a }}
                </span>
              </div>
              <p v-else class="empty-tag">Sin alergias registradas</p>
            </div>

            <!-- Comida que no le gusta -->
            <div class="card">
              <h2 class="card-title">Alimentos no preferidos</h2>
              <div v-if="patient.dislikes.length" class="tag-list">
                <span v-for="d in patient.dislikes" :key="d" class="tag tag-gray">
                  😣 {{ d }}
                </span>
              </div>
              <p v-else class="empty-tag">Sin registros</p>
            </div>

          </div>

          <!-- Columna derecha: métricas -->
          <div class="col-side">

            <!-- BMI -->
            <div class="metric-card">
              <div class="metric-top">
                <span class="metric-name">IMC</span>
                <span class="metric-tag" :class="bmiCategory.cls">{{ bmiCategory.label }}</span>
              </div>
              <div class="metric-value">{{ bmi }}</div>
              <div class="metric-unit">kg/m²</div>
              <div class="bmi-bar">
                <div class="bmi-fill" :style="{ width: bmiBarWidth + '%', background: bmiCategory.color }" />
              </div>
            </div>

            <!-- BMR -->
            <div class="metric-card">
              <div class="metric-top">
                <span class="metric-name">TMB</span>
                <span class="metric-tag blue">Tasa metabólica basal</span>
              </div>
              <div class="metric-value">{{ bmr }}</div>
              <div class="metric-unit">kcal / día</div>
            </div>

            <!-- TDEE -->
            <div class="metric-card">
              <div class="metric-top">
                <span class="metric-name">TDEE</span>
                <span class="metric-tag green">Gasto energético total</span>
              </div>
              <div class="metric-value">{{ tdee }}</div>
              <div class="metric-unit">kcal / día</div>
            </div>

            <!-- Body Fat estimado -->
            <div class="metric-card">
              <div class="metric-top">
                <span class="metric-name">Grasa corporal est.</span>
                <span class="metric-tag purple">Estimado</span>
              </div>
              <div class="metric-value">{{ bodyFat }}</div>
              <div class="metric-unit">%</div>
            </div>

            <!-- Progreso peso -->
            <div class="metric-card">
              <div class="metric-top">
                <span class="metric-name">Progreso de peso</span>
              </div>
              <div class="progress-info">
                <span class="prog-current">{{ patient.currentWeight }} kg</span>
                <span class="prog-arrow">→</span>
                <span class="prog-goal">{{ patient.goalWeight }} kg</span>
              </div>
              <div class="prog-bar-wrap">
                <div class="prog-bar">
                  <div class="prog-fill" :style="{ width: weightProgress + '%' }" />
                </div>
                <span class="prog-pct">{{ weightProgress }}%</span>
              </div>
              <p class="prog-diff" :class="weightDiff < 0 ? 'neg' : 'pos'">
                {{ weightDiff > 0 ? '+' : '' }}{{ weightDiff }} kg por alcanzar la meta
              </p>
            </div>

          </div>
        </div>
      </div>

      <!-- ══ TAB: Historial Médico ══ -->
      <div v-if="activeTab === 'medical'" class="tab-pane">
        <div class="content-grid">
          <div class="col-main">

            <!-- Enfermedades -->
            <div class="card">
              <h2 class="card-title">Enfermedades / Condiciones</h2>
              <div v-if="patient.conditions.length" class="condition-list">
                <div v-for="c in patient.conditions" :key="c.name" class="condition-item">
                  <div class="condition-dot" :class="c.severity" />
                  <div>
                    <p class="condition-name">{{ c.name }}</p>
                    <p class="condition-since">Desde {{ c.since }}</p>
                  </div>
                  <span class="cond-badge" :class="c.severity">{{ c.severity }}</span>
                </div>
              </div>
              <p v-else class="empty-tag">Sin condiciones registradas</p>
            </div>

            <!-- Suplementos -->
            <div class="card">
              <h2 class="card-title">Suplementos</h2>
              <div v-if="patient.supplements.length" class="supplement-list">
                <div v-for="s in patient.supplements" :key="s.name" class="supplement-item">
                  <div class="supp-icon">💊</div>
                  <div class="supp-info">
                    <p class="supp-name">{{ s.name }}</p>
                    <p class="supp-dose">{{ s.dose }} · {{ s.frequency }}</p>
                  </div>
                </div>
              </div>
              <p v-else class="empty-tag">Sin suplementos registrados</p>
            </div>

          </div>
          <div class="col-side">
            <div class="card">
              <h2 class="card-title">Resumen de salud</h2>
              <div class="health-summary">
                <div class="hs-item">
                  <span class="hs-label">Condiciones</span>
                  <span class="hs-val">{{ patient.conditions.length }}</span>
                </div>
                <div class="hs-item">
                  <span class="hs-label">Alergias</span>
                  <span class="hs-val">{{ patient.allergies.length }}</span>
                </div>
                <div class="hs-item">
                  <span class="hs-label">Suplementos activos</span>
                  <span class="hs-val">{{ patient.supplements.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ TAB: Mediciones ══ -->
      <div v-if="activeTab === 'measurements'" class="tab-pane">
        <div class="card">
          <h2 class="card-title">Historial de mediciones</h2>
          <table class="meas-table">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>PESO (kg)</th>
                <th>CINTURA (cm)</th>
                <th>CADERA (cm)</th>
                <th>% GRASA</th>
                <th>MASA MUSCULAR (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in patient.measurements" :key="m.date">
                <td>{{ formatDate(m.date) }}</td>
                <td>{{ m.weight }}</td>
                <td>{{ m.waist }}</td>
                <td>{{ m.hip }}</td>
                <td>{{ m.bodyFat }}%</td>
                <td>{{ m.muscle }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══ TAB: Citas ══ -->
      <div v-if="activeTab === 'appointments'" class="tab-pane">
        <div class="card">
          <div class="card-header-row">
            <h2 class="card-title">Citas</h2>
            <button class="btn-appt small">
              <CalendarPlus :size="14" /> Nueva cita
            </button>
          </div>
          <div class="appt-list">
            <div v-for="a in patient.appointments" :key="a.date" class="appt-item">
              <div class="appt-date-box">
                <span class="appt-day">{{ new Date(a.date).getDate() }}</span>
                <span class="appt-month">{{ new Date(a.date).toLocaleDateString('es-MX',{month:'short'}) }}</span>
              </div>
              <div class="appt-info">
                <p class="appt-type">{{ a.type }}</p>
                <p class="appt-notes">{{ a.notes }}</p>
              </div>
              <span class="appt-badge" :class="a.status">{{ a.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ TAB: Planes de comida ══ -->
      <div v-if="activeTab === 'mealplans'" class="tab-pane">
        <div class="card">
          <h2 class="card-title">Planes de comida asignados</h2>
          <div class="plan-list">
            <div v-for="p in patient.mealPlans" :key="p.name" class="plan-item">
              <div class="plan-icon">🥗</div>
              <div class="plan-info">
                <p class="plan-name">{{ p.name }}</p>
                <p class="plan-meta">{{ p.calories }} kcal · {{ p.start }} → {{ p.end }}</p>
              </div>
              <span class="plan-badge" :class="p.active ? 'active' : ''">
                {{ p.active ? 'Activo' : 'Finalizado' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ TAB: Documentos ══ -->
      <div v-if="activeTab === 'documents'" class="tab-pane">
        <div class="card">
          <h2 class="card-title">Documentos</h2>
          <div class="doc-list">
            <div v-for="d in patient.documents" :key="d.name" class="doc-item">
              <div class="doc-icon">📄</div>
              <div class="doc-info">
                <p class="doc-name">{{ d.name }}</p>
                <p class="doc-date">{{ formatDate(d.date) }}</p>
              </div>
              <button class="doc-download">⬇ Descargar</button>
            </div>
          </div>
          <div class="doc-upload">
            <span class="upload-icon">📎</span>
            <p>Arrastra archivos aquí o <a href="#">selecciona</a></p>
          </div>
        </div>
      </div>

    </div><!-- /tab-content -->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Pencil,
  CalendarPlus,
  User,
  ClipboardList,
  Ruler,
  CalendarDays,
  Utensils,
  FileText,
  AlertTriangle,
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const mounted = ref(false)
const activeTab = ref('general')
const loading = ref(false)
const pageError = ref('')

const tabs = [
  { key: 'general', label: 'Info. General', icon: User },
  { key: 'medical', label: 'Historial médico', icon: ClipboardList },
  { key: 'measurements', label: 'Mediciones', icon: Ruler },
  { key: 'appointments', label: 'Citas', icon: CalendarDays },
  { key: 'mealplans', label: 'Planes de comida', icon: Utensils },
  { key: 'documents', label: 'Documentos', icon: FileText },
]

interface PatientView {
  id: string
  name: string
  initials: string
  color: string
  age: number
  sex: 'F' | 'M'
  height: number
  currentWeight: number
  goalWeight: number
  phone: string
  status: 'Active' | 'Inactive'
  caloricGoal: number

  waterIntake: number
  mealsPerDay: number
  exerciseType: string
  exerciseIntensity: string
  exerciseHours: number
  exerciseDays: number

  allergies: string[]
  dislikes: string[]

  conditions: {
    name: string
    since: string
    severity: 'moderate' | 'controlled' | 'severe'
  }[]

  supplements: {
    name: string
    dose: string
    frequency: string
  }[]

  measurements: {
    date: string
    weight: number
    waist: number
    hip: number
    bodyFat: number
    muscle: number
  }[]

  appointments: {
    date: string
    type: string
    notes: string
    status: string
  }[]

  mealPlans: {
    name: string
    calories: number
    start: string
    end: string
    active: boolean
  }[]

  documents: {
    name: string
    date: string
  }[]
}

const patient = ref<PatientView>({
  id: '',
  name: '',
  initials: '',
  color: '#8E73A8',
  age: 0,
  sex: 'F',
  height: 165,
  currentWeight: 0,
  goalWeight: 0,
  phone: '',
  status: 'Active',
  caloricGoal: 0,

  waterIntake: 0,
  mealsPerDay: 0,
  exerciseType: 'Sin registrar',
  exerciseIntensity: 'Moderada',
  exerciseHours: 0,
  exerciseDays: 0,

  allergies: [],
  dislikes: [],
  conditions: [],
  supplements: [],
  measurements: [],
  appointments: [],
  mealPlans: [],
  documents: [],
})

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function calculateAge(birthDate: string | null) {
  if (!birthDate) return 0

  const today = new Date()
  const birth = new Date(birthDate)

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

function splitText(value: string | null) {
  if (!value) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function mapDiseases(value: string | null) {
  return splitText(value).map((name) => ({
    name,
    since: 'No especificado',
    severity: 'controlled' as const,
  }))
}

function mapSupplements(value: string | null) {
  return splitText(value).map((name) => ({
    name,
    dose: 'No especificado',
    frequency: 'No especificado',
  }))
}

async function loadPatient() {
  const patientId = route.params.id as string

  if (!auth.user) {
    await auth.loadUser()
  }

  if (!auth.user) {
    router.push('/login')
    return
  }

  loading.value = true
  pageError.value = ''

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .eq('user_id', auth.user.id)
    .single()

  if (error) {
    loading.value = false
    pageError.value = error.message
    return
  }

  const [
    appointmentsResult,
    mealPlansResult,
    documentsResult,
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .eq('user_id', auth.user.id)
      .order('appointment_date', { ascending: false }),

    supabase
      .from('meal_plans')
      .select('*')
      .eq('patient_id', patientId)
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('documents')
      .select('*')
      .eq('patient_id', patientId)
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false }),
  ])

  loading.value = false

  const currentWeight = Number(data.current_weight ?? 0)
  const goalWeight = Number(data.goal_weight ?? 0)

  patient.value = {
    id: data.id,
    name: data.full_name,
    initials: getInitials(data.full_name),
    color: '#8E73A8',
    age: calculateAge(data.birth_date),
    sex: data.sex === 'male' ? 'M' : 'F',

    // Por ahora tu tabla patients no tiene estatura.
    // Después podemos agregar height_cm a la base de datos.
    height: 165,

    currentWeight,
    goalWeight,
    phone: data.phone ?? 'Sin registrar',
    status: 'Active',
    caloricGoal: Number(data.target_calories ?? data.daily_calories ?? 0),

    // Por ahora tu tabla no tiene water_intake ni meals_per_day en esta versión simple.
    waterIntake: 0,
    mealsPerDay: 0,

    exerciseType: data.exercise_type ?? 'Sin registrar',
    exerciseIntensity: data.exercise_intensity ?? 'Moderada',
    exerciseHours: Number(data.exercise_hours ?? 0),
    exerciseDays: Number(data.exercise_days ?? 0),

    allergies: splitText(data.allergies),
    dislikes: splitText(data.disliked_foods),

    conditions: mapDiseases(data.diseases),
    supplements: mapSupplements(data.supplements),

    // Todavía no creamos tabla de mediciones/consultas, por eso queda vacío.
    measurements: [],

    appointments: (appointmentsResult.data ?? []).map((appointment: any) => ({
      date: appointment.appointment_date,
      type: appointment.reason ?? 'Cita',
      notes: appointment.reason ?? 'Sin notas',
      status: appointment.status ?? 'pending',
    })),

    mealPlans: (mealPlansResult.data ?? []).map((plan: any) => ({
      name: plan.title,
      calories: Number(data.target_calories ?? 0),
      start: plan.start_date
        ? new Date(plan.start_date).toLocaleDateString('es-MX', {
            month: 'short',
            year: 'numeric',
          })
        : 'Sin fecha',
      end: plan.duration_days ? `${plan.duration_days} días` : 'Sin duración',
      active: true,
    })),

    documents: (documentsResult.data ?? []).map((document: any) => ({
      name: document.name,
      date: document.created_at,
    })),
  }
}

/* ── Cálculos automáticos ────────────────────────────────── */
const bmi = computed(() => {
  if (!patient.value.height || !patient.value.currentWeight) return '0.0'

  const h = patient.value.height / 100
  return (patient.value.currentWeight / (h * h)).toFixed(1)
})

const bmiCategory = computed(() => {
  const v = Number(bmi.value)

  if (v < 18.5) return { label: 'Bajo peso', cls: 'blue', color: '#3b82f6' }
  if (v < 25) return { label: 'Normal', cls: 'green', color: '#22c55e' }
  if (v < 30) return { label: 'Sobrepeso', cls: 'amber', color: '#f59e0b' }

  return { label: 'Obesidad', cls: 'red', color: '#ef4444' }
})

const bmiBarWidth = computed(() => {
  const value = ((Number(bmi.value) - 15) / 25) * 100
  return Math.max(0, Math.min(value, 100))
})

const bmr = computed(() => {
  const p = patient.value

  if (!p.currentWeight || !p.height || !p.age) return 0

  if (p.sex === 'F') {
    return Math.round(10 * p.currentWeight + 6.25 * p.height - 5 * p.age - 161)
  }

  return Math.round(10 * p.currentWeight + 6.25 * p.height - 5 * p.age + 5)
})

const activityFactor = computed(() => {
  const days = patient.value.exerciseDays

  if (days <= 1) return 1.2
  if (days <= 3) return 1.375
  if (days <= 5) return 1.55

  return 1.725
})

const tdee = computed(() => Math.round(bmr.value * activityFactor.value))

const bodyFat = computed(() => {
  const value = Number(bmi.value)
  const age = patient.value.age
  const sex = patient.value.sex === 'F' ? 1 : 0

  if (!value || !age) return '0.0'

  return (1.2 * value + 0.23 * age - 10.8 * (1 - sex) - 5.4).toFixed(1)
})

const weightDiff = computed(() => {
  return Number((patient.value.goalWeight - patient.value.currentWeight).toFixed(1))
})

const weightProgress = computed(() => {
  const start = Math.max(patient.value.currentWeight, patient.value.goalWeight + 10)
  const goal = patient.value.goalWeight
  const current = patient.value.currentWeight

  if (start === goal) return 0

  const progress = ((start - current) / (start - goal)) * 100

  return Math.max(0, Math.min(Math.round(progress), 100))
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function openEditModal() {
  router.push('/patients')
}

onMounted(async () => {
  await loadPatient()

  setTimeout(() => {
    mounted.value = true
  }, 80)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   BASE
══════════════════════════════════════════════════════════ */
.patient-detail {
  padding: 1rem 2rem;
  min-height: 100vh;
  background: #f8fafb;
  font-family: 'Inter','Segoe UI',sans-serif;
  opacity: 0;
  transition: opacity .4s ease;
}
.patient-detail.visible { opacity: 1; }

/* ── Back btn ─────────────────────────────────────────────── */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: .85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  font-family: inherit;
  transition: color .2s, background .2s;
  margin-bottom: 1.4rem;
}
.back-btn:hover { color: #8E73A8; background: #f3eeff; }

/* ── Hero ─────────────────────────────────────────────────── */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.6rem;
  flex-wrap: wrap;
  gap: 1rem;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity .5s ease, transform .5s ease;
}
.hero.visible { opacity: 1; transform: translateY(0); }

.hero-left { display: flex; align-items: center; gap: 16px; }

.hero-avatar {
  width: 68px; height: 68px;
  border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; font-weight: 700; color: #fff;
  flex-shrink: 0;
}

.hero-name {
  font-size: 1.8rem;
  font-weight: 600;
  color: #0f1923;
  letter-spacing: -.4px;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  font-size: .9rem;
  color: #6b7280;
}

.dot { color: #d1d5db; }

.status-badge {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: .75rem;
  font-weight: 600;
}
.status-badge.active   { background: #d1fae5; color: #065f46; }
.status-badge.inactive { background: #f3f4f6; color: #6b7280; }

.hero-actions { display: flex; align-items: center; gap: 10px; }

.btn-edit {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 11px;
  font-size: .88rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
}
.btn-edit:hover { border-color: #8E73A8; color: #8E73A8; background: #faf7ff; }

.btn-appt {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px;
  background: #8E73A8;
  color: #fff;
  border: none;
  border-radius: 11px;
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
}
.btn-appt:hover { background: #7a5f97; transform: translateY(-1px);  box-shadow: 0 4px 14px rgba(142,115,168,.35); }
.btn-appt.small { padding: 7px 14px; font-size: .82rem; }

/* ── Tabs ─────────────────────────────────────────────────── */
.tabs-bar {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid #f0f0f5;
  margin-bottom: 1.6rem;
  overflow-x: auto;
  padding-bottom: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: .86rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: color .2s;
}
.tab-btn:hover { color: #8E73A8; }
.tab-btn.active {
  color: #8E73A8;
  font-weight: 600;
  border-bottom-color: #8E73A8;
}

/* ── Grid layout ──────────────────────────────────────────── */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.2rem;
  align-items: start;
}

.col-main { display: flex; flex-direction: column; gap: 1.2rem; }
.col-side  { display: flex; flex-direction: column; gap: 1.2rem; position: sticky; top: 1rem; }

/* ── Card ─────────────────────────────────────────────────── */
.card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  padding: 1.4rem;
  box-shadow: 0 1px 10px rgba(0,0,0,.04);
  animation: fadeUp .4s ease both;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f1923;
  margin-bottom: 1.1rem;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.1rem;
}
.card-header-row .card-title { margin-bottom: 0; }

/* ── Info grid ────────────────────────────────────────────── */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}

.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-label {
  font-size: .67rem;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: .07em;
}
.info-value { font-size: .97rem; font-weight: 500; color: #0f1923; }

/* ── Lifestyle ────────────────────────────────────────────── */
.lifestyle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.lifestyle-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fafafa;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #f3f3f8;
}

.ls-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.ls-label { display: block; font-size: .7rem; color: #9ca3af; font-weight: 600; letter-spacing: .03em; margin-bottom: 3px; }
.ls-value { font-size: .92rem; font-weight: 600; color: #0f1923; }

.intensity-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: .75rem;
  font-weight: 600;
}
.intensity-badge.baja    { background: #d1fae5; color: #065f46; }
.intensity-badge.moderada{ background: #fef3c7; color: #92400e; }
.intensity-badge.alta    { background: #fee2e2; color: #991b1b; }

/* ── Tags ─────────────────────────────────────────────────── */
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }

.tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: .78rem;
  font-weight: 600;
}
.tag-red  { background: #fee2e2; color: #991b1b; }
.tag-gray { background: #f3f4f6; color: #374151; }

.empty-tag { font-size: .85rem; color: #9ca3af; font-style: italic; }

/* ── Métricas ─────────────────────────────────────────────── */
.metric-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #f0f0f5;
  padding: 1.1rem 1.2rem;
  box-shadow: 0 1px 8px rgba(0,0,0,.04);
  animation: fadeUp .4s ease both;
}

.metric-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.metric-name { font-size: .8rem; font-weight: 600; color: #6b7280; }

.metric-tag {
  font-size: .68rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 20px;
}
.metric-tag.amber  { background: #fef3c7; color: #92400e; }
.metric-tag.green  { background: #d1fae5; color: #065f46; }
.metric-tag.blue   { background: #dbeafe; color: #1e40af; }
.metric-tag.purple { background: #ede9fe; color: #5b21b6; }
.metric-tag.red    { background: #fee2e2; color: #991b1b; }

.metric-value { font-size: 2rem; font-weight: 700; color: #0f1923; line-height: 1.1; }
.metric-unit  { font-size: .75rem; color: #9ca3af; margin-top: 2px; }

.bmi-bar {
  height: 5px;
  background: #f3f4f6;
  border-radius: 10px;
  margin-top: 10px;
  overflow: hidden;
}
.bmi-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 1s ease;
}

/* Progress peso */
.progress-info { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
.prog-current  { font-size: 1.1rem; font-weight: 700; color: #0f1923; }
.prog-arrow    { color: #9ca3af; }
.prog-goal     { font-size: 1.1rem; font-weight: 700; color: #8E73A8; }

.prog-bar-wrap { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.prog-bar {
  flex: 1;
  height: 6px;
  background: #f3f4f6;
  border-radius: 10px;
  overflow: hidden;
}
.prog-fill {
  height: 100%;
  background: linear-gradient(90deg, #8E73A8, #6b50a0);
  border-radius: 10px;
  transition: width 1s ease;
}
.prog-pct { font-size: .8rem; font-weight: 700; color: #8E73A8; min-width: 32px; }
.prog-diff { font-size: .78rem; margin-top: 6px; font-weight: 600; }
.prog-diff.neg { color: #be185d; }
.prog-diff.pos { color: #065f46; }

/* ── Enfermedades ─────────────────────────────────────────── */
.condition-list { display: flex; flex-direction: column; gap: 10px; }
.condition-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fafafa;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #f3f3f8;
}
.condition-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
}
.condition-dot.moderate   { background: #f59e0b; }
.condition-dot.controlled { background: #22c55e; }
.condition-dot.severe     { background: #ef4444; }

.condition-name  { font-size: .9rem; font-weight: 600; color: #0f1923; }
.condition-since { font-size: .75rem; color: #9ca3af; margin-top: 2px; }

.cond-badge {
  margin-left: auto;
  font-size: .7rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}
.cond-badge.moderate   { background: #fef3c7; color: #92400e; }
.cond-badge.controlled { background: #d1fae5; color: #065f46; }
.cond-badge.severe     { background: #fee2e2; color: #991b1b; }

/* ── Suplementos ──────────────────────────────────────────── */
.supplement-list { display: flex; flex-direction: column; gap: 10px; }
.supplement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fafafa;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #f3f3f8;
}
.supp-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: #f5f3ff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
.supp-name { font-size: .9rem; font-weight: 600; color: #0f1923; }
.supp-dose { font-size: .75rem; color: #9ca3af; margin-top: 2px; }

/* ── Health summary ───────────────────────────────────────── */
.health-summary { display: flex; flex-direction: column; gap: 10px; }
.hs-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafb;
  border-radius: 10px;
}
.hs-label { font-size: .85rem; color: #6b7280; }
.hs-val   { font-size: 1rem; font-weight: 700; color: #8E73A8; }

/* ── Tabla mediciones ─────────────────────────────────────── */
.meas-table { width: 100%; border-collapse: collapse; }
.meas-table th {
  padding: 10px 14px;
  font-size: .67rem;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: .07em;
  text-align: left;
  border-bottom: 1px solid #f3f3f8;
  background: #fafafe;
}
.meas-table td {
  padding: 12px 14px;
  font-size: .88rem;
  color: #374151;
  border-bottom: 1px solid #f7f7fb;
}
.meas-table tr:last-child td { border-bottom: none; }
.meas-table tr:hover td { background: #faf8ff; }

/* ── Citas ────────────────────────────────────────────────── */
.appt-list { display: flex; flex-direction: column; gap: 10px; }
.appt-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fafafa;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid #f3f3f8;
}
.appt-date-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f3eeff;
  border-radius: 10px;
  padding: 8px 12px;
  min-width: 50px;
  flex-shrink: 0;
}
.appt-day   { font-size: 1.2rem; font-weight: 700; color: #8E73A8; line-height: 1; }
.appt-month { font-size: .68rem; font-weight: 600; color: #8E73A8; text-transform: uppercase; }
.appt-type  { font-size: .9rem; font-weight: 600; color: #0f1923; }
.appt-notes { font-size: .78rem; color: #9ca3af; margin-top: 3px; }
.appt-badge {
  margin-left: auto;
  font-size: .7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}
.appt-badge.confirmed { background: #d1fae5; color: #065f46; }
.appt-badge.pending   { background: #fef3c7; color: #92400e; }

/* ── Planes ───────────────────────────────────────────────── */
.plan-list { display: flex; flex-direction: column; gap: 10px; }
.plan-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fafafa;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid #f3f3f8;
}
.plan-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: #f0fdf4;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; flex-shrink: 0;
}
.plan-name { font-size: .9rem; font-weight: 600; color: #0f1923; }
.plan-meta { font-size: .75rem; color: #9ca3af; margin-top: 2px; }
.plan-badge {
  margin-left: auto;
  font-size: .7rem; font-weight: 700;
  padding: 4px 10px; border-radius: 20px;
  background: #f3f4f6; color: #6b7280;
}
.plan-badge.active { background: #d1fae5; color: #065f46; }

/* ── Documentos ───────────────────────────────────────────── */
.doc-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1rem; }
.doc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fafafa;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid #f3f3f8;
}
.doc-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: #eff6ff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
.doc-name { font-size: .9rem; font-weight: 600; color: #0f1923; }
.doc-date { font-size: .75rem; color: #9ca3af; margin-top: 2px; }
.doc-download {
  margin-left: auto;
  padding: 6px 12px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  font-size: .75rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
  white-space: nowrap;
}
.doc-download:hover { border-color: #8E73A8; color: #8E73A8; }

.doc-upload {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  color: #9ca3af;
  font-size: .85rem;
  transition: border-color .2s;
  cursor: pointer;
}
.doc-upload:hover { border-color: #8E73A8; color: #8E73A8; }
.upload-icon { font-size: 1.5rem; display: block; margin-bottom: 6px; }
.doc-upload a { color: #8E73A8; font-weight: 600; text-decoration: none; }

/* ── Animaciones ──────────────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; }
  .col-side { position: static; }
}
@media (max-width: 640px) {
  .patient-detail { padding: 1.2rem 1rem; }
  .hero { flex-direction: column; align-items: flex-start; }
  .info-grid, .lifestyle-grid { grid-template-columns: 1fr; }
  .hero-name { font-size: 1.4rem; }
  .tabs-bar { gap: 0; }
  .tab-btn { padding: 10px 12px; font-size: .78rem; }
}
</style>