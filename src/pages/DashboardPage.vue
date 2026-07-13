<template>
  <div class="dashboard" :class="{ visible: mounted }">

    <!-- ══ BIENVENIDA ═══════════════════════════════════════ -->
    <div class="welcome-row">
      <div class="welcome-text">
        <h1 class="welcome-title">
          {{ greeting }}, <span class="welcome-name">{{ userName }}</span>
        </h1>
        <p class="welcome-sub">{{ todayLabel }} · Aquí tienes tu resumen del día</p>
      </div>
      <div class="welcome-date-badge">
        <CalendarDays :size="15" />
        {{ todayFull }}
      </div>
    </div>

    <!-- ══ KPI CARDS ════════════════════════════════════════ -->
    <div class="kpi-grid">
      <div
        v-for="(kpi, i) in kpis"
        :key="kpi.key"
        class="kpi-card"
        :style="{ '--delay': `${i * 60}ms` }"
        @click="kpi.route && router.push(kpi.route)"
        :class="{ clickable: !!kpi.route }"
      >
        <div class="kpi-top">
          <div class="kpi-icon" :style="{ background: kpi.bg, color: kpi.color }">
            <component :is="kpi.icon" :size="19" />
          </div>
          <ArrowUpRight :size="15" class="kpi-arrow" :style="{ color: kpi.color }" />
        </div>
        <div class="kpi-value" :style="{ color: kpi.color }">
          <CountUp :target="kpi.value" suffix="" />
        </div>
        <p class="kpi-label">{{ kpi.label }}</p>
        <p class="kpi-delta" :class="kpi.deltaType ?? 'neutral'">{{ kpi.delta }}</p>
      </div>
    </div>

    <!-- ══ FILA CENTRAL ═════════════════════════════════════ -->
    <div class="mid-row">

      <!-- Gráfica de crecimiento -->
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Crecimiento de pacientes</h3>
            <p class="chart-sub">Nuevos pacientes por mes</p>
          </div>
          <div class="chart-controls">
            <button
              v-for="p in chartPeriods"
              :key="p"
              class="period-btn"
              :class="{ active: chartPeriod === p }"
              @click="chartPeriod = p"
            >{{ p }}</button>
            <span class="growth-pill">
              <TrendingUp :size="13" /> +18% YTD
            </span>
          </div>
        </div>

        <!-- SVG chart -->
        <div class="chart-wrap">
          <svg class="line-chart" viewBox="0 0 680 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#3E9B92" stop-opacity=".22" />
                <stop offset="100%" stop-color="#3E9B92" stop-opacity="0" />
              </linearGradient>
            </defs>
            <!-- Grid lines -->
            <line v-for="y in gridYs" :key="y" x1="0" :y1="y" x2="680" :y2="y" class="chart-grid" />
            <!-- Area fill -->
            <path :d="areaPath" fill="url(#chartGrad)" />
            <!-- Line -->
            <path :d="linePath" fill="none" stroke="#3E9B92" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-line" />
            <!-- Dots -->
            <circle
              v-for="(pt, i) in chartPoints"
              :key="i"
              :cx="pt.x" :cy="pt.y" r="4"
              fill="#fff" stroke="#3E9B92" stroke-width="2.5"
              class="chart-dot"
            />
          </svg>
          <div class="chart-labels">
            <span v-for="l in chartLabels" :key="l">{{ l }}</span>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="actions-card">
        <h3 class="card-title">Acciones rápidas</h3>
        <div class="quick-actions">
          <button
            v-for="qa in quickActions"
            :key="qa.label"
            class="qa-btn"
            :style="{ '--qa-bg': qa.bg, '--qa-color': qa.color }"
            @click="router.push(qa.route)"
          >
            <span class="qa-icon"><component :is="qa.icon" :size="16" /></span>
            <span>{{ qa.label }}</span>
            <ChevronRight :size="14" class="qa-arrow" />
          </button>
        </div>
      </div>
    </div>

    <!-- ══ FILA INFERIOR ════════════════════════════════════ -->
    <div class="bottom-row">

      <!-- Próximas citas -->
      <div class="bottom-card appts-card">
        <div class="bottom-card-header">
          <h3 class="card-title">Citas de hoy</h3>
          <button class="view-all-btn" @click="router.push('/appointments')">
            Ver todas <ChevronRight :size="13" />
          </button>
        </div>

        <div v-if="todayAppointments.length" class="appt-list">
          <div v-for="appt in todayAppointments" :key="appt.id" class="appt-item">
            <div class="appt-time-box">
              <Clock :size="13" />
              <span>{{ appt.time }}</span>
            </div>
            <div class="appt-avatar" :style="{ background: appt.color }">{{ appt.initials }}</div>
            <div class="appt-info">
              <p class="appt-name">{{ appt.name }}</p>
              <p class="appt-type">{{ appt.type }}</p>
            </div>
            <span class="appt-status" :class="appt.status">{{ appt.statusLabel }}</span>
          </div>
        </div>

        <div v-else class="empty-state">
          <CalendarDays :size="28" />
          <p>Sin citas programadas para hoy</p>
        </div>
      </div>

      <!-- Pacientes recientes -->
      <div class="bottom-card patients-card">
        <div class="bottom-card-header">
          <h3 class="card-title">Pacientes recientes</h3>
          <button class="view-all-btn" @click="router.push('/patients')">
            Ver todos <ChevronRight :size="13" />
          </button>
        </div>

        <div class="patients-list">
          <div
            v-for="patient in recentPatients"
            :key="patient.id"
            class="patient-item"
            @click="router.push(`/patients/${patient.id}`)"
          >
            <div class="p-avatar" :style="{ background: patient.color }">{{ patient.initials }}</div>
            <div class="p-info">
              <p class="p-name">{{ patient.name }}</p>
              <p class="p-meta">{{ patient.age }} a · {{ patient.goal }}</p>
            </div>
            <div class="p-progress-wrap">
              <div class="p-progress">
                <div class="p-progress-fill" :style="{ width: patient.progress + '%', background: progressColor(patient.progress) }" />
              </div>
              <span class="p-pct">{{ patient.progress }}%</span>
            </div>
            <span class="p-status-badge" :class="patient.onTrack ? 'on-track' : 'off-track'">
              {{ patient.onTrack ? 'En progreso' : 'Atención' }}
            </span>
          </div>
        </div>
      </div>

    </div>

    <!-- ══ MINI STATS ROW ═══════════════════════════════════ -->
    <div class="mini-stats-row">
      <div
        v-for="(ms, i) in miniStats"
        :key="ms.label"
        class="mini-stat"
        :style="{ '--delay': `${i * 50}ms` }"
      >
        <div class="ms-icon-box" :style="{ background: ms.bg, color: ms.color }">
          <component :is="ms.icon" :size="17" />
        </div>
        <div>
          <p class="ms-value">{{ ms.value }}</p>
          <p class="ms-label">{{ ms.label }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Users,
  CalendarDays,
  ClipboardList,
  FileText,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Clock,
  UserPlus,
  CalendarPlus,
  ChefHat,
  Salad,
  Upload,
  UserCheck,
  Activity,
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const mounted = ref(false)
const pageError = ref('')

/* ─────────────────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────────────────── */
interface PatientRow {
  id: string
  full_name: string
  birth_date: string | null
  current_weight: number | null
  goal_weight: number | null
  created_at: string
  color: string | null
}

interface AppointmentRow {
  id: string
  patient_id: string
  appointment_date: string
  appointment_time: string
  reason: string | null
  status: string | null
}

interface DashboardStats {
  patients: number
  activePatients: number
  todayAppointments: number
  confirmedTodayAppointments: number
  mealPlans: number
  documents: number
  recipes: number
  newPatientsThisMonth: number
}

const stats = ref<DashboardStats>({
  patients: 0,
  activePatients: 0,
  todayAppointments: 0,
  confirmedTodayAppointments: 0,
  mealPlans: 0,
  documents: 0,
  recipes: 0,
  newPatientsThisMonth: 0,
})

const recentPatients = ref<
  {
    id: string
    name: string
    age: number
    goal: string
    progress: number
    onTrack: boolean
    initials: string
    color: string
  }[]
>([])

const todayAppointments = ref<
  {
    id: string
    time: string
    name: string
    type: string
    initials: string
    color: string
    status: string
    statusLabel: string
  }[]
>([])

const monthlyPatients = ref<Record<string, number>>({})

/* ─────────────────────────────────────────────────────────
   BIENVENIDA
───────────────────────────────────────────────────────── */
const userName = computed(() => {
  const first = auth.profile?.first_name ?? ''
  const last = auth.profile?.last_name ?? ''
  const fullName = `${first} ${last}`.trim()

  return fullName || 'Nutriólogo'
})

const greeting = computed(() => {
  const h = new Date().getHours()

  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'

  return 'Buenas noches'
})

const todayLabel = computed(() =>
  new Date()
    .toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^\w/, (c) => c.toUpperCase()),
)

const todayFull = computed(() =>
  new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }),
)

/* ─────────────────────────────────────────────────────────
   COUNTER
───────────────────────────────────────────────────────── */
const CountUp = defineComponent({
  props: {
    target: {
      type: Number,
      default: 0,
    },
    suffix: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    const current = ref(0)

    function animate() {
      current.value = 0

      const target = props.target ?? 0
      const step = Math.max(1, Math.ceil(target / 40))

      const timer = setInterval(() => {
        current.value = Math.min(current.value + step, target)

        if (current.value >= target) {
          clearInterval(timer)
        }
      }, 18)
    }

    onMounted(animate)

    watch(
      () => props.target,
      () => animate(),
    )

    return () => h('span', `${current.value}${props.suffix}`)
  },
})

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
const COLORS = ['#e74c7d', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#3E9B92']

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function colorFor(value: string | number) {
  const text = String(value)
  const sum = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  return COLORS[sum % COLORS.length] ?? '#3E9B92'
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function monthStartISO() {
  const date = new Date()

  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
}

function calculateAge(birthDate: string | null) {
  if (!birthDate) return 0

  const birth = new Date(birthDate)
  const today = new Date()

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

function calculateProgress(currentWeight: number | null, goalWeight: number | null) {
  if (!currentWeight || !goalWeight) return 45

  const diff = Math.abs(currentWeight - goalWeight)

  if (diff <= 1) return 90
  if (diff <= 3) return 72
  if (diff <= 6) return 55

  return 35
}

function progressColor(p: number) {
  if (p >= 70) return '#3E9B92'
  if (p >= 40) return '#d97706'

  return '#ef4444'
}

function statusLabel(status: string | null) {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
  }

  return labels[status ?? 'pending'] ?? 'Pendiente'
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

async function ensureUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}


const todayAppointmentsDelta = computed(() => {
  const preview = todayAppointments.value.slice(0, 2)

  if (!preview.length) {
    return 'Sin citas para hoy'
  }

  return preview
    .map((appt) => `${appt.time} · ${appt.name}`)
    .join(' / ')
})

/* ─────────────────────────────────────────────────────────
   KPIs
───────────────────────────────────────────────────────── */
const kpis = computed(() => [
  {
  key: 'appts',
  label: 'Citas hoy',
  value: stats.value.todayAppointments,
delta: todayAppointmentsDelta.value,
  deltaType: 'neutral',
  icon: CalendarDays,
  color: '#d97706',
  bg: '#fffbeb',
  route: '/appointments',
},
  {
    key: 'patients',
    label: 'Total pacientes',
    value: stats.value.patients,
    delta: `+${stats.value.newPatientsThisMonth} este mes`,
    deltaType: stats.value.newPatientsThisMonth > 0 ? 'positive' : 'neutral',
    icon: Users,
    color: '#2563eb',
    bg: '#eff6ff',
    route: '/patients',
  },
  {
    key: 'active',
    label: 'Pacientes activos',
    value: stats.value.activePatients,
    delta: stats.value.patients
      ? `${Math.round((stats.value.activePatients / stats.value.patients) * 100)}% del total`
      : 'Sin pacientes',
    deltaType: 'positive',
    icon: UserCheck,
    color: '#3E9B92',
    bg: '#eef6f5',
    route: '/patients',
  },
  {
    key: 'plans',
    label: 'Planes creados',
    value: stats.value.mealPlans,
    delta: 'Planes guardados',
    deltaType: 'positive',
    icon: ClipboardList,
    color: '#7c3aed',
    bg: '#f5f3ff',
    route: '/meal-plans',
  },
])

const miniStats = computed(() => [
  {
    label: 'Documentos',
    value: String(stats.value.documents),
    icon: FileText,
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    label: 'Recetas',
    value: String(stats.value.recipes),
    icon: BookOpen,
    color: '#3E9B92',
    bg: '#eef6f5',
  },
  {
    label: 'Citas hoy',
    value: String(stats.value.todayAppointments),
    icon: Activity,
    color: '#d97706',
    bg: '#fffbeb',
  },
  {
    label: 'Nuevos (mes)',
    value: String(stats.value.newPatientsThisMonth),
    icon: UserPlus,
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
])

/* ─────────────────────────────────────────────────────────
   GRÁFICA
───────────────────────────────────────────────────────── */
const chartPeriods = ['6M', '1A', '2A']
const chartPeriod = ref('1A')

function buildMonthLabels(monthCount: number) {
  const labels: string[] = []
  const keys: string[] = []
  const now = new Date()

  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '')

    keys.push(key)
    labels.push(label.charAt(0).toUpperCase() + label.slice(1))
  }

  return { labels, keys }
}

const currentChart = computed(() => {
  const months = chartPeriod.value === '6M' ? 6 : chartPeriod.value === '1A' ? 12 : 24
  const { labels, keys } = buildMonthLabels(months)

  return {
    labels,
    values: keys.map((key) => monthlyPatients.value[key] ?? 0),
  }
})

const chartLabels = computed(() => currentChart.value.labels)

const W = 680
const H = 180
const PAD = 14

const chartPoints = computed(() => {
  const vals = currentChart.value.values.length ? currentChart.value.values : [0]
  const maxValue = Math.max(...vals, 1)
  const minValue = 0

  return vals.map((v, i) => ({
    x: vals.length === 1 ? W / 2 : PAD + (i / (vals.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (v - minValue) / (maxValue - minValue || 1)) * (H - PAD * 2),
  }))
})

const linePath = computed(() => {
  const points = chartPoints.value

  if (!points.length) return ''

  return points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`

    const prev = points[i - 1]

    if (!prev) return acc

    const cpx = (prev.x + pt.x) / 2

    return `${acc} C ${cpx} ${prev.y} ${cpx} ${pt.y} ${pt.x} ${pt.y}`
  }, '')
})

const areaPath = computed(() => {
  const pts = chartPoints.value

  const first = pts[0]
  const last = pts[pts.length - 1]

  if (!first || !last) return ''

  return `${linePath.value} L ${last.x} ${H} L ${first.x} ${H} Z`
})

const gridYs = computed(() => [PAD, H * 0.33, H * 0.66, H - PAD])

/* ─────────────────────────────────────────────────────────
   ACCIONES RÁPIDAS
───────────────────────────────────────────────────────── */
const quickActions = [
  {
    label: 'Nuevo paciente',
    icon: UserPlus,
    route: '/patients',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    label: 'Agendar cita',
    icon: CalendarPlus,
    route: '/appointments',
    color: '#3E9B92',
    bg: '#eef6f5',
  },
  {
    label: 'Crear receta',
    icon: ChefHat,
    route: '/recipes',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    label: 'Crear plan',
    icon: Salad,
    route: '/meal-plans',
    color: '#d97706',
    bg: '#fffbeb',
  },
  {
    label: 'Subir documento',
    icon: Upload,
    route: '/documents',
    color: '#0891b2',
    bg: '#ecfeff',
  },
]

/* ─────────────────────────────────────────────────────────
   CARGA DE DATOS
───────────────────────────────────────────────────────── */
async function loadDashboard() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    toast.error(pageError.value)
    return
  }

  pageError.value = ''

  const today = todayISO()
  const monthStart = monthStartISO()

const [
  patientsCountResult,
  activePatientsResult,
  newPatientsResult,
  todayAppointmentsResult,
  mealPlansResult,
  documentsResult,
  recipesResult,
  recentPatientsResult,
  todaysApptsResult,
  allPatientsForChartResult,
] = await Promise.all([
  supabase
    .from('patients')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id),

  supabase
    .from('patients')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['Active', 'active']),

  supabase
    .from('patients')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', monthStart),

  supabase
    .from('appointments')
    .select('id, status', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('appointment_date', today),

  supabase
    .from('meal_plans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id),

  supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id),

  supabase
    .from('recipes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id),

  supabase
    .from('patients')
    .select('id, full_name, birth_date, current_weight, goal_weight, created_at, color')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(4),

  supabase
    .from('appointments')
    .select('id, patient_id, appointment_date, appointment_time, reason, status')
    .eq('user_id', user.id)
    .eq('appointment_date', today)
    .order('appointment_time', { ascending: true }),

  supabase
    .from('patients')
    .select('created_at')
    .eq('user_id', user.id),
])

  const firstError =
    patientsCountResult.error ||
    newPatientsResult.error ||
    todayAppointmentsResult.error ||
    mealPlansResult.error ||
    documentsResult.error ||
    recipesResult.error ||
    recentPatientsResult.error ||
    todaysApptsResult.error ||
    allPatientsForChartResult.error

  if (firstError) {
    pageError.value = firstError.message
    toast.error(pageError.value)
    return
  }

  const todayApptsData = todayAppointmentsResult.data ?? []

  stats.value = {
    patients: patientsCountResult.count ?? 0,
    activePatients: activePatientsResult.count ?? 0,
    todayAppointments: todayAppointmentsResult.count ?? 0,
    confirmedTodayAppointments: todayApptsData.filter((appt) => appt.status === 'confirmed').length,
    mealPlans: mealPlansResult.count ?? 0,
    documents: documentsResult.count ?? 0,
    recipes: recipesResult.count ?? 0,
    newPatientsThisMonth: newPatientsResult.count ?? 0,
  }

  recentPatients.value = ((recentPatientsResult.data ?? []) as PatientRow[]).map((patient) => {
    const progress = calculateProgress(patient.current_weight, patient.goal_weight)

    return {
      id: patient.id,
      name: patient.full_name,
      age: calculateAge(patient.birth_date),
      goal: patient.goal_weight ? `Meta: ${patient.goal_weight} kg` : 'Sin meta registrada',
      progress,
      onTrack: progress >= 40,
      initials: initials(patient.full_name),
      color: patient.color ?? '#3E9B92',
    }
  })

  const appts = (todaysApptsResult.data ?? []) as AppointmentRow[]
  const patientIds = [...new Set(appts.map((appt) => appt.patient_id).filter(Boolean))]

  let patientMap: Record<string, { name: string; color: string }> = {}

  if (patientIds.length > 0) {
    const { data: apptPatients, error: apptPatientsError } = await supabase
      .from('patients')
      .select('id, full_name, color')
      .in('id', patientIds)
      .eq('user_id', user.id)

    if (apptPatientsError) {
      pageError.value = apptPatientsError.message
      toast.error(pageError.value)
      return
    }

    patientMap = Object.fromEntries(
  (apptPatients ?? []).map((patient) => [
    patient.id,
    {
      name: patient.full_name,
      color: patient.color ?? '#3E9B92',
    },
  ]),
)
  }

 todayAppointments.value = appts.map((appt) => {
  const patientInfo = patientMap[appt.patient_id]

  const name = patientInfo?.name ?? 'Paciente'
  const color = patientInfo?.color ?? '#3E9B92'

  return {
    id: appt.id,
    time: formatTime(appt.appointment_time),
    name,
    type: appt.reason || 'Consulta',
    initials: initials(name),
    color,
    status: appt.status ?? 'pending',
    statusLabel: statusLabel(appt.status),
  }
})


  const monthCounts: Record<string, number> = {}

  ;(allPatientsForChartResult.data ?? []).forEach((patient: { created_at: string }) => {
    const date = new Date(patient.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    monthCounts[key] = (monthCounts[key] ?? 0) + 1
  })

  monthlyPatients.value = monthCounts
}

onMounted(async () => {
  if (!auth.profile) {
    await auth.loadUser()
  }

  await loadDashboard()

  setTimeout(() => {
    mounted.value = true
  }, 80)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   BASE
══════════════════════════════════════════════════════════ */
.dashboard {
  padding: 2rem 2.2rem 2.4rem;
  min-height: 100vh;
  background: #f8fafb;
  font-family: 'Inter','Segoe UI',sans-serif;
  opacity: 0;
  transition: opacity .4s ease;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}
.dashboard.visible { opacity: 1; }

/* ══════════════════════════════════════════════════════════
   BIENVENIDA
══════════════════════════════════════════════════════════ */
.welcome-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  animation: fadeDown .55s ease both;
}

.welcome-title {
  font-size: 1.9rem;
  font-weight: 600;
  color: #0f1923;
  letter-spacing: -.5px;
  line-height: 1.15;
  font-style: italic;
}
.welcome-name { color: #3E9B92; font-weight: 500; font-style: normal;}
.welcome-sub  { font-size: .88rem; color: #9ca3af; margin-top: 5px; }

.welcome-date-badge {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 30px;
  font-size: .8rem; font-weight: 600; color: #6b7280;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ══════════════════════════════════════════════════════════
   KPI GRID
══════════════════════════════════════════════════════════ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.kpi-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #f0f0f5;
  padding: 1.2rem 1.3rem 1.1rem;
  box-shadow: 0 1px 10px rgba(0,0,0,.04);
  animation: fadeUp .5s ease var(--delay, 0ms) both;
  transition: transform .2s, box-shadow .2s;
}
.kpi-card.clickable { cursor: pointer; }
.kpi-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,.09);
}

.kpi-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: .9rem;
}
.kpi-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.kpi-arrow { opacity: .5; transition: opacity .2s; }
.kpi-card:hover .kpi-arrow { opacity: 1; }

.kpi-value {
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -.5px;
  margin-bottom: 4px;
}
.kpi-label { font-size: .82rem; color: #6b7280; font-weight: 500; }
.kpi-delta {
  font-size: .74rem;
  font-weight: 700;
  margin-top: 6px;
}
.kpi-delta.positive { color: #16a34a; }
.kpi-delta.neutral  { color: #d97706; }
.kpi-delta.negative { color: #ef4444; }

/* ══════════════════════════════════════════════════════════
   MID ROW
══════════════════════════════════════════════════════════ */
.mid-row {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1rem;
}

/* ── Gráfica ──────────────────────────────────────────────── */
.chart-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #f0f0f5;
  padding: 1.4rem 1.5rem 1rem;
  box-shadow: 0 1px 10px rgba(0,0,0,.04);
  animation: fadeUp .5s .1s ease both;
}

.chart-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 1.2rem; gap: 1rem; flex-wrap: wrap;
}
.chart-title { font-size: 1rem; font-weight: 700; color: #0f1923; }
.chart-sub   { font-size: .78rem; color: #9ca3af; margin-top: 3px; }

.chart-controls { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

.period-btn {
  padding: 5px 12px;
  border: 1.5px solid #e5e7eb;
  background: #fff; border-radius: 20px;
  font-size: .76rem; font-weight: 700; color: #6b7280;
  cursor: pointer; font-family: inherit; transition: .2s;
}
.period-btn:hover  { border-color: #3E9B92; color: #3E9B92; }
.period-btn.active { background: #3E9B92; border-color: #3E9B92; color: #fff; }

.growth-pill {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 12px;
  background: #d1fae5; color: #065f46;
  border-radius: 20px;
  font-size: .74rem; font-weight: 700;
}

.chart-wrap { position: relative; }

.line-chart {
  width: 100%; height: 180px;
  overflow: visible;
  display: block;
}

.chart-grid {
  stroke: #f0f0f5;
  stroke-width: 1;
}

.chart-line { transition: d .5s ease; }

.chart-dot {
  transition: r .2s;
}
.chart-dot:hover { r: 6; }

.chart-labels {
  display: flex; justify-content: space-between;
  padding: 6px 0 0;
}
.chart-labels span { font-size: .7rem; color: #b0b8cc; font-weight: 600; text-align: center; flex: 1; }

/* ── Acciones rápidas ─────────────────────────────────────── */
.actions-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #f0f0f5;
  padding: 1.4rem 1.2rem;
  box-shadow: 0 1px 10px rgba(0,0,0,.04);
  animation: fadeUp .5s .15s ease both;
}

.card-title { font-size: .98rem; font-weight: 700; color: #0f1923; margin-bottom: 1rem; }

.quick-actions { display: flex; flex-direction: column; gap: 8px; }

.qa-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border: none; border-radius: 11px;
  background: var(--qa-bg);
  color: var(--qa-color);
  cursor: pointer; font-family: inherit;
  font-size: .85rem; font-weight: 600;
  transition: .2s; text-align: left;
  width: 100%;
}
.qa-btn:hover { filter: brightness(.94); transform: translateX(2px); }

.qa-icon {
  width: 30px; height: 30px; border-radius: 9px;
  background: rgba(0,0,0,.06);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.qa-btn span:nth-child(2) { flex: 1; }
.qa-arrow { opacity: .5; }
.qa-btn:hover .qa-arrow { opacity: 1; }

/* ══════════════════════════════════════════════════════════
   BOTTOM ROW
══════════════════════════════════════════════════════════ */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.bottom-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #f0f0f5;
  padding: 1.4rem 1.4rem 1rem;
  box-shadow: 0 1px 10px rgba(0,0,0,.04);
  animation: fadeUp .5s .2s ease both;
}

.bottom-card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.1rem;
}
.view-all-btn {
  display: flex; align-items: center; gap: 3px;
  background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: .8rem; font-weight: 600;
  color: #3E9B92; transition: opacity .2s;
}
.view-all-btn:hover { opacity: .75; }

/* Citas */
.appt-list { display: flex; flex-direction: column; gap: 8px; }

.appt-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f3f3f8;
  transition: background .15s;
}
.appt-item:hover { background: #f6faf9; }

.appt-time-box {
  display: flex; align-items: center; gap: 4px;
  font-size: .75rem; font-weight: 700; color: #6b7280;
  min-width: 52px; flex-shrink: 0;
}

.appt-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .68rem; font-weight: 800; color: #fff;
  flex-shrink: 0;
}

.appt-info { flex: 1; min-width: 0; }
.appt-name { font-size: .86rem; font-weight: 700; color: #0f1923; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0;}
.appt-type { font-size: .72rem; color: #9ca3af; margin-top: 1px; }

.appt-status {
  font-size: .68rem; font-weight: 700;
  padding: 3px 9px; border-radius: 20px;
  flex-shrink: 0;
}
.appt-status.confirmed { background: #d1fae5; color: #065f46; }
.appt-status.pending   { background: #fef3c7; color: #92400e; }

/* Pacientes */
.patients-list { display: flex; flex-direction: column; gap: 8px; }

.patient-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f3f3f8;
  cursor: pointer; transition: background .15s;
}
.patient-item:hover { background: #f6faf9; }

.p-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 800; color: #fff;
  flex-shrink: 0;
}

.p-info { flex: 1; min-width: 0; }
.p-name { font-size: .86rem; font-weight: 700; color: #0f1923; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0;}
.p-meta { font-size: .72rem; color: #9ca3af; margin-top: 1px; }

.p-progress-wrap { display: flex; align-items: center; gap: 6px; flex-shrink: 0; width: 80px; }
.p-progress { flex: 1; height: 5px; background: #f0f0f5; border-radius: 10px; overflow: hidden; }
.p-progress-fill { height: 100%; border-radius: 10px; transition: width .8s ease; }
.p-pct { font-size: .72rem; font-weight: 700; color: #6b7280; min-width: 28px; text-align: right; }

.p-status-badge {
  font-size: .66rem; font-weight: 700;
  padding: 3px 9px; border-radius: 20px; flex-shrink: 0;
}
.p-status-badge.on-track  { background: #d1fae5; color: #065f46; }
.p-status-badge.off-track { background: #fee2e2; color: #991b1b; }

/* Empty */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 1.8rem; color: #c0c5d0; text-align: center;
}
.empty-state p { font-size: .84rem; font-weight: 500; color: #9ca3af; }

/* ══════════════════════════════════════════════════════════
   MINI STATS
══════════════════════════════════════════════════════════ */
.mini-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.mini-stat {
  display: flex; align-items: center; gap: 13px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  padding: 1rem 1.2rem;
  box-shadow: 0 1px 8px rgba(0,0,0,.04);
  animation: fadeUp .5s ease var(--delay, 0ms) both;
  transition: transform .2s;
}
.mini-stat:hover { transform: translateY(-2px); }

.ms-icon-box {
  width: 38px; height: 38px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ms-value { font-size: 1.3rem; font-weight: 800; color: #0f1923; line-height: 1; margin-bottom: 0;}
.ms-label { font-size: .73rem; color: #9ca3af; margin-top: 3px; font-weight: 500; }

/* ══════════════════════════════════════════════════════════
    ANIMACIONES
══════════════════════════════════════════════════════════ */
@keyframes fadeDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeUp   { from { opacity:0; transform:translateY(14px);  } to { opacity:1; transform:translateY(0); } }


/* ══════════════════════════════════════════════════════════
    RESPONSIVE
══════════════════════════════════════════════════════════ */

/* ── Tablet / sidebar oculto ─────────────────────────────── */
@media (max-width: 1100px) {
  .kpi-grid       { grid-template-columns: repeat(2, 1fr); }
  .mini-stats-row { grid-template-columns: repeat(2, 1fr); }
  .mid-row        { grid-template-columns: 1fr; }
  .bottom-row     { grid-template-columns: 1fr; }
}

/* ── Móvil — sidebar desaparece, aparece hamburguesa ─────── */
@media (max-width: 767px) {
  .dashboard {
    padding: 3.5rem 1rem 1.8rem;
    gap: 1rem;
  }

  /* Welcome: columna, badge debajo */
  .welcome-row {
    flex-direction: column;
    align-items: flex-start;
    gap: .5rem;
  }

  .welcome-title {
    font-size: 1.35rem;
    line-height: 1.25;
  }

  .welcome-name {
    /* Si el nombre es largo se parte en línea propia */
    display: inline;
  }

  .welcome-sub { font-size: .82rem; }

  .welcome-date-badge {
    align-self: flex-start;
    font-size: .74rem;
    padding: 5px 12px;
  }

  /* KPI 2 columnas */
  .kpi-grid { grid-template-columns: 1fr 1fr; gap: .7rem; }
  .kpi-card { padding: 1rem 1rem .9rem; }
  .kpi-value { font-size: 1.75rem; }
  .kpi-icon  { width: 36px; height: 36px; border-radius: 10px; }

  /* Mini stats 2 columnas */
  .mini-stats-row { grid-template-columns: 1fr 1fr; gap: .7rem; }
  .mini-stat { padding: .9rem 1rem; gap: 10px; }
  .ms-icon-box { width: 34px; height: 34px; border-radius: 9px; }
  .ms-value { font-size: 1.15rem; }

  /* Acciones rápidas: 2 columnas en tablet */
  .quick-actions { display: grid; grid-template-columns: 1fr 1fr; }

  /* Chart controls se envuelven */
  .chart-controls { flex-wrap: wrap; gap: 5px; }
}

/* ── Móvil pequeño ────────────────────────────────────────── */
@media (max-width: 480px) {
  .dashboard { padding: 4.8rem .85rem 1.4rem; gap: .85rem; }

  .welcome-title { font-size: 1.18rem; }

  /* KPI: mantener 2 columnas, más compacto */
  .kpi-grid { gap: .55rem; }
  .kpi-card { padding: .9rem .9rem .85rem; }
  .kpi-value { font-size: 1.55rem; }
  .kpi-label { font-size: .76rem; }
  .kpi-delta { font-size: .68rem; margin-top: 4px; }

  /* Mini stats: 2 columnas */
  .mini-stats-row { gap: .55rem; }
  .mini-stat { padding: .8rem .9rem; }
  .ms-value { font-size: 1.05rem; }
  .ms-label { font-size: .68rem; }

  /* Acciones rápidas: 1 columna */
  .quick-actions { grid-template-columns: 1fr; }
  .qa-btn { font-size: .82rem; }

  /* Citas: ocultar tipo de consulta para ganar espacio */
  .appt-type { display: none; }
  .appt-time-box { min-width: 42px; font-size: .7rem; }
  .appt-name { font-size: .82rem; }

  /* Pacientes: ocultar barra de progreso */
  .p-progress-wrap { display: none; }
  .p-name { font-size: .82rem; }

  /* Growth pill */
  .growth-pill { font-size: .68rem; padding: 4px 9px; }
}

.kpi-delta {
  font-size: .74rem;
  font-weight: 700;
  margin-top: 6px;
}
</style>