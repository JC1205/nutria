<template>
  <div class="patients-page">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="page-header" :class="{ visible: mounted }">
      <div class="header-left">
        <h1 class="page-title">Pacientes</h1>
        <p class="page-subtitle">{{ filteredPatients.length }} pacientes en tu consulta</p>
      </div>
      <button class="btn-add" @click="openModal('create')">
        <Plus :size="18" :stroke-width="2.5" />
        Agregar paciente
      </button>
    </div>

    <!-- ── Toolbar: búsqueda + filtros ─────────────────────── -->
    <div class="toolbar" :class="{ visible: mounted }">
      <div class="search-wrapper" :class="{ focused: searchFocused }">
        <Search :size="16" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar pacientes..."
          class="search-input"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
        <Transition name="fade">
          <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
            <X :size="14" />
          </button>
        </Transition>
      </div>

      <!-- Filtro de status -->
      <div class="filter-group">
        <button
          class="filter-btn"
          :class="{ active: showFilterMenu }"
          @click="showFilterMenu = !showFilterMenu"
          v-click-outside="() => showFilterMenu = false"
        >
          <SlidersHorizontal :size="15" />
          Filtrar
          <span v-if="activeFilter !== 'all'" class="filter-badge">1</span>
        </button>

        <Transition name="dropdown">
          <div v-if="showFilterMenu" class="filter-menu">
            <p class="filter-menu-title">Estado</p>
            <button
              v-for="opt in filterOptions"
              :key="opt.value"
              class="filter-option"
              :class="{ selected: activeFilter === opt.value }"
              @click="activeFilter = opt.value; showFilterMenu = false"
            >
              <span class="filter-dot" :class="opt.value" />
              {{ opt.label }}
              <Check v-if="activeFilter === opt.value" :size="13" class="check-icon" />
            </button>
          </div>
        </Transition>
      </div>

      <span class="results-count">{{ filteredPatients.length }} resultados</span>
    </div>

    <!-- ── Tabla ────────────────────────────────────────────── -->
    <div class="table-wrapper" :class="{ visible: mounted }">
      <table class="patients-table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="['th', col.key, { sortable: col.sortable }]"
              @click="col.sortable && setSort(col.key)"
            >
              {{ col.label }}
              <span v-if="col.sortable" class="sort-icon">
                <component
                  :is="sortKey === col.key ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown"
                  :size="13"
                  :class="{ active: sortKey === col.key }"
                />
              </span>
            </th>
            <th class="th actions-th"></th>
          </tr>
        </thead>
        <tbody>
          <TransitionGroup name="row">
            <tr
  v-for="(patient, i) in paginatedPatients"
  :key="patient.id"
  class="patient-row"
  :style="{ '--delay': `${i * 20}ms` }"
  @click="goToPatientDetail(patient.id)"
>
              <!-- Nombre + avatar -->
              <td class="td td-name">
                <div class="patient-name-cell">
                  <div class="avatar" :style="{ background: patient.color }">
                    {{ patient.initials }}
                  </div>
                  <span class="patient-name">{{ patient.name }}</span>
                </div>
              </td>

              <!-- Edad -->
              <td class="td td-age">{{ patient.age }}</td>

              <!-- Sexo -->
              <td class="td td-sex">{{ patient.sex === 'F' ? 'Femenino' : 'Masculino' }}</td>

              <!-- Peso actual -->
              <td class="td td-weight">{{ patient.currentWeight }} kg</td>

              <!-- Peso meta -->
              <td class="td td-goal">
                <div class="goal-cell">
                  <span>{{ patient.goalWeight }} kg</span>
                  <span
                    class="diff-badge"
                    :class="patient.diff < 0 ? 'negative' : 'positive'"
                  >
                    {{ patient.diff > 0 ? '+' : '' }}{{ patient.diff }} kg
                  </span>
                </div>
              </td>

              <!-- Última cita -->
              <td class="td td-appt">{{ formatDate(patient.lastAppointment) }}</td>

              <!-- Status -->
              <td class="td td-status">
                <span class="status-badge" :class="patient.status.toLowerCase()">
                  {{ patient.status }}
                </span>
              </td>

              <!-- Acción -->
              <td class="td td-action" @click.stop>
                <div class="row-actions">
                  <button class="action-btn" @click="goToPatientDetail(patient.id)" title="Ver detalle">
                    <Eye :size="15" />
                  </button>
                  <button class="action-btn" @click="openModal('edit', patient)" title="Editar">
                    <Pencil :size="15" />
                  </button>
                  <button class="action-btn danger" @click="confirmDelete(patient)" title="Eliminar">
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>

          <!-- Empty state -->
          <tr v-if="filteredPatients.length === 0">
            <td colspan="8" class="empty-state">
              <div class="empty-content">
                <span class="empty-icon">🔍</span>
                <p class="empty-title">Sin resultados</p>
                <p class="empty-sub">Intenta con otro nombre o quita los filtros.</p>
                <button class="btn-clear-filters" @click="clearFilters">Limpiar filtros</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Paginación ───────────────────────────────────────── -->
    <div v-if="totalPages > 1" class="pagination" :class="{ visible: mounted }">
      <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
        <ChevronLeft :size="15" />
      </button>
      <button
        v-for="p in totalPages"
        :key="p"
        class="page-btn"
        :class="{ active: p === currentPage }"
        @click="currentPage = p"
      >{{ p }}</button>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
        <ChevronRight :size="15" />
      </button>
    </div>

    <!-- ══════════════════════════════════════════════════════
         MODAL — Crear / Editar / Detalle
    ═══════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="modal.open" class="modal-overlay" @click.self="closeModal">
        <Transition name="modal-slide">
          <div v-if="modal.open" class="modal-card">

            <!-- Header modal -->
            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon-box" :class="modal.mode">
                  <UserPlus v-if="modal.mode === 'create'" :size="20" />
                  <Pencil    v-else-if="modal.mode === 'edit'"  :size="20" />
                  <User      v-else                              :size="20" />
                </div>
                <div>
                  <h2 class="modal-title">
                    {{ modal.mode === 'create' ? 'Nuevo paciente'
                     : modal.mode === 'edit'   ? 'Editar paciente'
                     : modal.patient?.name }}
                  </h2>
                  <p class="modal-sub">
                    {{ modal.mode === 'create' ? 'Completa la información del paciente'
                     : modal.mode === 'edit'   ? 'Modifica los datos del paciente'
                     : `${modal.patient?.age} años · ${modal.patient?.sex === 'F' ? 'Femenino' : 'Masculino'}` }}
                  </p>
                </div>
              </div>
              <button class="modal-close" @click="closeModal"><X :size="18" /></button>
            </div>

            <!-- ── DETALLE ── -->
            

            <!-- ── FORMULARIO Crear / Editar ── -->
            <div v-if="modal.mode === 'create' || modal.mode === 'edit'" class="modal-body">
              <form @submit.prevent="savePatient" novalidate>
                <div class="form-grid">
  <div class="form-field full">
    <label>Nombre completo</label>
    <input
      v-model="form.name"
      type="text"
      placeholder="Ej. María González"
      :class="{ err: formErrors.name }"
    />
    <span v-if="formErrors.name" class="field-err">{{ formErrors.name }}</span>
  </div>

  <div class="form-field">
    <label>Fecha de nacimiento</label>
    <input
      v-model="form.birthDate"
      type="date"
      :class="{ err: formErrors.birthDate }"
    />
    <span v-if="formErrors.birthDate" class="field-err">{{ formErrors.birthDate }}</span>
  </div>

  <div class="form-field">
    <label>Sexo</label>
    <select v-model="form.sex">
      <option value="F">Femenino</option>
      <option value="M">Masculino</option>
    </select>
  </div>
  <div class="form-field">
  <label>Altura (cm)</label>
  <input
    v-model.number="form.heightCm"
    type="number"
    step="0.1"
    placeholder="165"
    :class="{ err: formErrors.heightCm }"
  />
  <span v-if="formErrors.heightCm" class="field-err">
    {{ formErrors.heightCm }}
  </span>
</div>
  <div class="form-field">
    <label>Celular</label>
    <input
      v-model="form.phone"
      type="tel"
      placeholder="Ej. 6441234567"
    />
  </div>

  <div class="form-field">
    <label>Peso actual (kg)</label>
    <input
      v-model.number="form.currentWeight"
      type="number"
      step="0.1"
      placeholder="78.2"
      :class="{ err: formErrors.currentWeight }"
    />
    <span v-if="formErrors.currentWeight" class="field-err">
      {{ formErrors.currentWeight }}
    </span>
  </div>

  <div class="form-field">
    <label>Peso meta (kg)</label>
    <input
      v-model.number="form.goalWeight"
      type="number"
      step="0.1"
      placeholder="65"
      :class="{ err: formErrors.goalWeight }"
    />
    <span v-if="formErrors.goalWeight" class="field-err">
      {{ formErrors.goalWeight }}
    </span>
  </div>

  <div class="form-field">
    <label>Calorías diarias</label>
    <input
      v-model.number="form.dailyCalories"
      type="number"
      placeholder="2000"
    />
  </div>

  <div class="form-field">
    <label>Calorías objetivo</label>
    <input
      v-model.number="form.targetCalories"
      type="number"
      placeholder="1800"
    />
  </div>

  <div class="form-field full">
    <label>Alergias</label>
    <textarea
      v-model="form.allergies"
      rows="2"
      placeholder="Ej. Gluten, mariscos, lactosa"
    ></textarea>
  </div>

  <div class="form-field full">
    <label>Enfermedades</label>
    <textarea
      v-model="form.diseases"
      rows="2"
      placeholder="Ej. Diabetes, hipertensión, hipotiroidismo"
    ></textarea>
  </div>

  <div class="form-field full">
    <label>Suplementos</label>
    <textarea
      v-model="form.supplements"
      rows="2"
      placeholder="Ej. Creatina, omega 3, vitamina D"
    ></textarea>
  </div>

  <div class="form-field full">
    <label>Alimentos que no le gustan</label>
    <textarea
      v-model="form.dislikedFoods"
      rows="2"
      placeholder="Ej. Brócoli, pescado, hígado"
    ></textarea>
  </div>

  <div class="form-field">
    <label>Tipo de ejercicio</label>
    <input
      v-model="form.exerciseType"
      type="text"
      placeholder="Ej. Pesas, cardio, caminata"
    />
  </div>

  <div class="form-field">
    <label>Intensidad</label>
    <select v-model="form.exerciseIntensity">
      <option value="">Sin registrar</option>
      <option value="Baja">Baja</option>
      <option value="Moderada">Moderada</option>
      <option value="Alta">Alta</option>
    </select>
  </div>

  <div class="form-field">
    <label>Horas por sesión</label>
    <input
      v-model.number="form.exerciseHours"
      type="number"
      step="0.1"
      placeholder="1.5"
    />
  </div>

  <div class="form-field">
    <label>Días por semana</label>
    <input
      v-model.number="form.exerciseDays"
      type="number"
      min="0"
      max="7"
      placeholder="4"
    />
  </div>

  <div class="form-field full">
    <label>Estado</label>
    <select v-model="form.status">
      <option value="Active">Activo</option>
      <option value="Inactive">Inactivo</option>
    </select>
  </div>
</div>
                <div class="modal-footer">
                  <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
                  <button type="submit" class="btn-primary" :disabled="saving">
                    <span v-if="saving" class="spinner-sm" />
                    <span v-else><Check :size="15" /></span>
                    {{ modal.mode === 'create' ? 'Guardar paciente' : 'Guardar cambios' }}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ── Modal confirmar eliminación ─────────────────────── -->
    <Transition name="modal-fade">
      <div v-if="deleteModal.open" class="modal-overlay" @click.self="deleteModal.open = false">
        <div class="modal-card delete-modal">
          <div class="delete-icon-wrap">
            <Trash2 :size="28" />
          </div>
          <h3 class="delete-title">¿Eliminar paciente?</h3>
          <p class="delete-sub">Esta acción no se puede deshacer. Se eliminará a <strong>{{ deleteModal.patient?.name }}</strong> y toda su información.</p>
          <div class="modal-footer centered">
            <button class="btn-secondary" @click="deleteModal.open = false">Cancelar</button>
            <button class="btn-danger" @click="deletePatient">
              <Trash2 :size="15" /> Eliminar
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Plus,
  Search,
  X,
  SlidersHorizontal,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  User,
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
const auth = useAuthStore()

/* ── Directiva click-outside ─────────────────────────────── */
type ClickOutsideElement = HTMLElement & {
  _clickOutside?: (e: Event) => void
}

const vClickOutside = {
  mounted(el: ClickOutsideElement, binding: { value: () => void }) {
    el._clickOutside = (e: Event) => {
      if (!el.contains(e.target as Node)) binding.value()
    }

    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: ClickOutsideElement) {
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside)
    }
  },
}

/* ── Tipos ───────────────────────────────────────────────── */
interface PatientRow {
  id: string
  user_id: string
  full_name: string
  birth_date: string | null
  height_cm: number | null
  current_weight: number | null
  goal_weight: number | null
  sex: string | null
  phone: string | null
  allergies: string | null
  diseases: string | null
  supplements: string | null
  disliked_foods: string | null
  daily_calories: number | null
  target_calories: number | null
  exercise_type: string | null
  exercise_intensity: string | null
  exercise_hours: number | null
  exercise_days: number | null
  created_at: string
  updated_at: string
}

interface Patient {
  id: string
  name: string
  initials: string
  color: string
  age: number
  birthDate: string | null
  heightCm: number | null
  sex: 'F' | 'M'
  phone: string | null

  currentWeight: number
  goalWeight: number
  diff: number

  allergies: string | null
  diseases: string | null
  supplements: string | null
  dislikedFoods: string | null

  dailyCalories: number | null
  targetCalories: number | null

  exerciseType: string | null
  exerciseIntensity: string | null
  exerciseHours: number | null
  exerciseDays: number | null

  lastAppointment: string
  status: 'Active' | 'Inactive'
}

/* ── Store ───────────────────────────────────────────────── */
const route = useRoute()
const router = useRouter()

function goToPatientDetail(patientId: string) {
    router.push(`/patients/${patientId}`)
}

/* ── Estado ──────────────────────────────────────────────── */
const mounted = ref(false)
const searchQuery = ref('')
const searchFocused = ref(false)
const showFilterMenu = ref(false)
const activeFilter = ref('all')
const sortKey = ref('name')
const sortDir = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const PAGE_SIZE = 10
const saving = ref(false)
const loading = ref(false)
const pageError = ref('')

const filterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
]

const columns = [
  { key: 'name', label: 'NOMBRE', sortable: true },
  { key: 'age', label: 'EDAD', sortable: true },
  { key: 'sex', label: 'SEXO', sortable: false },
  { key: 'currentWeight', label: 'PESO ACTUAL', sortable: true },
  { key: 'goalWeight', label: 'PESO META', sortable: false },
  { key: 'lastAppointment', label: 'ÚLTIMA CITA', sortable: true },
  { key: 'status', label: 'ESTADO', sortable: true },
]

/* ── Helpers ─────────────────────────────────────────────── */
const AVATAR_COLORS = [
  '#e74c7d',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#6366f1',
  '#ec4899',
  '#14b8a6',
]

function makeColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length] ?? '#8E73A8'
}

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

function birthDateFromAge(age: number) {
  const year = new Date().getFullYear() - age
  return `${year}-01-01`
}

function mapPatient(row: PatientRow, index: number): Patient {
  const currentWeight = Number(row.current_weight ?? 0)
  const goalWeight = Number(row.goal_weight ?? 0)
  const diff = Number((goalWeight - currentWeight).toFixed(1))

  return {
    id: row.id,
    name: row.full_name,
    initials: getInitials(row.full_name),
    color: makeColor(index),
    age: calculateAge(row.birth_date),
    birthDate: row.birth_date,
    heightCm: row.height_cm,
    sex: row.sex === 'male' ? 'M' : 'F',
    phone: row.phone,

    currentWeight,
    goalWeight,
    diff,

    allergies: row.allergies,
    diseases: row.diseases,
    supplements: row.supplements,
    dislikedFoods: row.disliked_foods,

    dailyCalories: row.daily_calories,
    targetCalories: row.target_calories,

    exerciseType: row.exercise_type,
    exerciseIntensity: row.exercise_intensity,
    exerciseHours: row.exercise_hours,
    exerciseDays: row.exercise_days,

    lastAppointment: row.created_at,
    status: 'Active',
  }
}

/* ── Datos desde Supabase ───────────────────────────────── */
const patients = ref<Patient[]>([])

async function loadPatients() {
  if (!auth.user) {
    await auth.loadUser()
  }

  if (!auth.user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  loading.value = true
  pageError.value = ''

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })

  loading.value = false

  if (error) {
    pageError.value = error.message
    return
  }

  patients.value = (data ?? []).map((row, index) => mapPatient(row as PatientRow, index))
}

/* ── Computed: filtrado + ordenado + paginado ────────────── */
const filteredPatients = computed(() => {
  let list = patients.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((patient) => patient.name.toLowerCase().includes(q))
  }

  if (activeFilter.value !== 'all') {
    list = list.filter((patient) => patient.status.toLowerCase() === activeFilter.value)
  }

  list = [...list].sort((a: any, b: any) => {
    const va = a[sortKey.value]
    const vb = b[sortKey.value]

    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1

    return 0
  })

  return list
})

const totalPages = computed(() => Math.ceil(filteredPatients.value.length / PAGE_SIZE))

const paginatedPatients = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredPatients.value.slice(start, start + PAGE_SIZE)
})

function setSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function clearFilters() {
  searchQuery.value = ''
  activeFilter.value = 'all'
  currentPage.value = 1
}

/* ── Formato de fecha ────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/* ── Modal ───────────────────────────────────────────────── */
const modal = reactive<{
  open: boolean
  mode: 'create' | 'edit' | 'detail'
  patient: Patient | null
}>({
  open: false,
  mode: 'create',
  patient: null,
})

const form = reactive({
  name: '',
  birthDate: '',
  sex: 'F' as 'F' | 'M',
  phone: '',
  heightCm: null as number | null,
  currentWeight: null as number | null,
  goalWeight: null as number | null,

  allergies: '',
  diseases: '',
  supplements: '',
  dislikedFoods: '',

  dailyCalories: null as number | null,
  targetCalories: null as number | null,

  exerciseType: '',
  exerciseIntensity: '',
  exerciseHours: null as number | null,
  exerciseDays: null as number | null,

  status: 'Active' as 'Active' | 'Inactive',
})

const formErrors = reactive({
  name: '',
  birthDate: '',
  currentWeight: '',
  goalWeight: '',
  heightCm: '',
})

function openModal(mode: 'create' | 'edit' | 'detail', patient?: Patient) {
  modal.mode = mode
  modal.patient = patient ?? null
  modal.open = true

  clearFormErrors()

  if (mode === 'edit' && patient) {
    form.name = patient.name
    form.birthDate = patient.birthDate ?? ''
    form.sex = patient.sex
    form.phone = patient.phone ?? ''

    form.heightCm = patient.heightCm
    form.currentWeight = patient.currentWeight
    form.goalWeight = patient.goalWeight

    form.allergies = patient.allergies ?? ''
    form.diseases = patient.diseases ?? ''
    form.supplements = patient.supplements ?? ''
    form.dislikedFoods = patient.dislikedFoods ?? ''

    form.dailyCalories = patient.dailyCalories
    form.targetCalories = patient.targetCalories

    form.exerciseType = patient.exerciseType ?? ''
    form.exerciseIntensity = patient.exerciseIntensity ?? ''
    form.exerciseHours = patient.exerciseHours
    form.exerciseDays = patient.exerciseDays

    form.status = patient.status
  } else if (mode === 'create') {
    Object.assign(form, {
      name: '',
      birthDate: '',
      sex: 'F',
      phone: '',

      heightCm: null,
      currentWeight: null,
      goalWeight: null,

      allergies: '',
      diseases: '',
      supplements: '',
      dislikedFoods: '',

      dailyCalories: null,
      targetCalories: null,

      exerciseType: '',
      exerciseIntensity: '',
      exerciseHours: null,
      exerciseDays: null,

      status: 'Active',
    })
  }
}

function openEditFromQuery() {
  const editId = route.query.edit

  if (!editId || typeof editId !== 'string') return

  const patientToEdit = patients.value.find((patient) => patient.id === editId)

  if (!patientToEdit) return

  openModal('edit', patientToEdit)

  router.replace('/patients')
}

function closeModal() {
  modal.open = false
}

function clearFormErrors() {
  Object.assign(formErrors, {
    name: '',
    birthDate: '',
    currentWeight: '',
    goalWeight: '',
  })
}

function validateForm() {
  clearFormErrors()

  let ok = true

  if (!form.name.trim()) {
    formErrors.name = 'El nombre es requerido.'
    ok = false
  }

  if (!form.birthDate) {
    formErrors.birthDate = 'La fecha de nacimiento es requerida.'
    ok = false
  }
  if (!form.heightCm || form.heightCm < 50) {
  formErrors.heightCm = 'Ingresa una altura válida.'
  ok = false
}

  if (!form.currentWeight || form.currentWeight < 1) {
    formErrors.currentWeight = 'Ingresa el peso actual.'
    ok = false
  }

  if (!form.goalWeight || form.goalWeight < 1) {
    formErrors.goalWeight = 'Ingresa el peso meta.'
    ok = false
  }

  return ok
}

async function savePatient() {
  if (!validateForm()) return

  if (!auth.user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  saving.value = true
  pageError.value = ''

const payload = {
  user_id: auth.user.id,
  full_name: form.name.trim(),
  birth_date: form.birthDate || null,
  sex: form.sex === 'F' ? 'female' : 'male',
  phone: form.phone.trim() || null,

  height_cm: form.heightCm,
  current_weight: form.currentWeight,
  goal_weight: form.goalWeight,

  allergies: form.allergies.trim() || null,
  diseases: form.diseases.trim() || null,
  supplements: form.supplements.trim() || null,
  disliked_foods: form.dislikedFoods.trim() || null,

  daily_calories: form.dailyCalories,
  target_calories: form.targetCalories,

  exercise_type: form.exerciseType.trim() || null,
  exercise_intensity: form.exerciseIntensity || null,
  exercise_hours: form.exerciseHours,
  exercise_days: form.exerciseDays,
}

  try {
    if (modal.mode === 'create') {
      const { error } = await supabase.from('patients').insert(payload)

      if (error) throw error
    }

    if (modal.mode === 'edit' && modal.patient) {
      const { error } = await supabase
        .from('patients')
        .update(payload)
        .eq('id', modal.patient.id)
        .eq('user_id', auth.user.id)

      if (error) throw error
    }

    await loadPatients()
    closeModal()
  } catch (err) {
    pageError.value = err instanceof Error ? err.message : 'No se pudo guardar el paciente.'
  } finally {
    saving.value = false
  }
}

/* ── Eliminar ────────────────────────────────────────────── */
const deleteModal = reactive<{
  open: boolean
  patient: Patient | null
}>({
  open: false,
  patient: null,
})

function confirmDelete(patient: Patient) {
  deleteModal.patient = patient
  deleteModal.open = true
}

async function deletePatient() {
  if (!deleteModal.patient || !auth.user) return

  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', deleteModal.patient.id)
    .eq('user_id', auth.user.id)

  if (error) {
    pageError.value = error.message
    return
  }

  patients.value = patients.value.filter((patient) => patient.id !== deleteModal.patient?.id)
  deleteModal.open = false
}

onMounted(async () => {
  setTimeout(() => {
    mounted.value = true
  }, 80)

  await loadPatients()
  openEditFromQuery()
})

watch(
  () => route.query.edit,
  () => {
    openEditFromQuery()
  },
)

</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   BASE
══════════════════════════════════════════════════════════ */
.patients-page {
  padding: 2.2rem 2.4rem;
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: #f8fafb;
}

/* ── Header ───────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  opacity: 0;
  transform: translateY(-12px);
  transition: opacity .5s ease, transform .5s ease;
}
.page-header.visible { opacity: 1; transform: translateY(0); }

.page-title    { font-size: 1.5rem; font-weight: 500; color: #0f1923; letter-spacing: -.5px; }
.page-subtitle { font-size: .9rem; color: #9ca3af; margin-top: 4px; }

.btn-add {
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
.btn-add:hover { background: #7a5f97; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(142,115,168,.4); }
.btn-add:active { transform: translateY(0); }

/* ── Toolbar ──────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.2rem;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity .5s ease .1s, transform .5s ease .1s;

  position: relative;
  z-index: 100;
}
.toolbar.visible { opacity: 1; transform: translateY(0); }

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 14px;
  flex: 1;
  max-width: 420px;
  transition: border-color .2s, box-shadow .2s;
}
.search-wrapper.focused { border-color: #8E73A8; box-shadow: 0 0 0 4px rgba(142,115,168,.1); }

.search-icon { color: #9ca3af; flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: .9rem;
  color: #0f1923;
  background: transparent;
  font-family: inherit;
}
.search-input::placeholder { color: #c0cad5; }

.clear-search {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  padding: 2px;
  border-radius: 4px;
  transition: color .2s;
}
.clear-search:hover { color: #374151; }

/* Filter btn */
.filter-group {
  position: relative;
  z-index: 200;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: .88rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: border-color .2s, background .2s;
  white-space: nowrap;
  position: relative;
}
.filter-btn:hover, .filter-btn.active { border-color: #8E73A8; color: #8E73A8; background: #faf7ff; }

.filter-badge {
  position: absolute;
  top: -6px; right: -6px;
  width: 17px; height: 17px;
  background: #8E73A8;
  color: #fff;
  font-size: .65rem;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 8px;
  min-width: 170px;
  box-shadow: 0 8px 32px rgba(0,0,0,.1);
  z-index: 50;
}
.filter-menu-title { font-size: .68rem; font-weight: 700; color: #b0b8cc; letter-spacing: .08em; padding: 4px 8px 6px; }
.filter-option {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: .85rem;
  color: #374151;
  border-radius: 8px;
  font-family: inherit;
  transition: background .15s;
}
.filter-option:hover { background: #f7f4ff; }
.filter-option.selected { color: #8E73A8; font-weight: 600; }

.filter-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  background: #d1d5db;
}
.filter-dot.active   { background: #22c55e; }
.filter-dot.inactive { background: #e5e7eb; }
.filter-dot.all      { background: #8E73A8; }
.check-icon { margin-left: auto; color: #8E73A8; }

.results-count { font-size: .82rem; color: #9ca3af; margin-left: auto; white-space: nowrap; }

/* ── Tabla ────────────────────────────────────────────────── */
.table-wrapper {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  overflow: hidden;
  box-shadow: 0 1px 12px rgba(0,0,0,.04);
  opacity: 0;
  transform: translateY(12px);
  transition: opacity .5s ease .15s, transform .5s ease .15s;
}
.table-wrapper.visible { opacity: 1; transform: translateY(0); }

.patients-table { width: 100%; border-collapse: collapse; }

.th {
  padding: 13px 16px;
  font-size: .68rem;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: .07em;
  text-align: left;
  border-bottom: 1px solid #f3f3f8;
  white-space: nowrap;
  background: #fafafe;
  user-select: none;
}
.th.sortable { cursor: pointer; }
.th.sortable:hover { color: #8E73A8; }

.sort-icon {
  display: inline-flex;
  vertical-align: middle;
  margin-left: 4px;
  color: #d1d5db;
}
.sort-icon svg.active { color: #8E73A8; }

.patient-row {
  cursor: pointer;
  transition: background .15s;
  animation: rowIn .3s ease var(--delay, 0ms) both;
}
.patient-row:hover { background: #faf8ff; }
.patient-row:hover .row-actions { opacity: 1; }

.td {
  padding: 14px 16px;
  font-size: .88rem;
  color: #374151;
  border-bottom: 1px solid #f7f7fb;
  vertical-align: middle;
}

.patient-name-cell { display: flex; align-items: center; gap: 12px; }

.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .78rem; font-weight: 700; color: #fff;
  flex-shrink: 0;
}

.patient-name { font-weight: 600; color: #0f1923; }

.goal-cell { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.diff-badge {
  font-size: .72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
}
.diff-badge.negative { background: #fce7f3; color: #be185d; }
.diff-badge.positive { background: #d1fae5; color: #065f46; }

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: .75rem;
  font-weight: 600;
}
.status-badge.active   { background: #d1fae5; color: #065f46; }
.status-badge.inactive { background: #f3f4f6; color: #6b7280; }

/* Row actions */
.row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity .2s;
}

.action-btn {
  width: 30px; height: 30px;
  border: none; background: none; cursor: pointer;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #9ca3af;
  transition: background .15s, color .15s;
}
.action-btn:hover       { background: #f3eeff; color: #8E73A8; }
.action-btn.danger:hover{ background: #fff1f1; color: #ef4444; }

/* Empty state */
.empty-state { text-align: center; padding: 3rem; }
.empty-content { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.empty-icon  { font-size: 2.5rem; }
.empty-title { font-size: 1rem; font-weight: 600; color: #374151; }
.empty-sub   { font-size: .85rem; color: #9ca3af; }
.btn-clear-filters {
  margin-top: 8px;
  padding: 8px 18px;
  border: 1.5px solid #8E73A8;
  background: none;
  border-radius: 10px;
  color: #8E73A8;
  font-size: .85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background .2s, color .2s;
}
.btn-clear-filters:hover { background: #8E73A8; color: #fff; }

/* ── Paginación ───────────────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 1.4rem;
  opacity: 0;
  transition: opacity .5s ease .2s;
}
.pagination.visible { opacity: 1; }

.page-btn {
  min-width: 34px; height: 34px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 9px;
  font-size: .85rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit;
  transition: .2s;
}
.page-btn:hover:not(:disabled):not(.active) { border-color: #8E73A8; color: #8E73A8; }
.page-btn.active { background: #8E73A8; border-color: #8E73A8; color: #fff; font-weight: 700; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ══════════════════════════════════════════════════════════
   MODALES
══════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,25,35,.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-card {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  box-shadow: 0 24px 60px rgba(0,0,0,.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #f3f3f8;
}
.modal-title-group { display: flex; align-items: center; gap: 12px; }
.modal-icon-box {
  width: 42px; height: 42px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.modal-icon-box.create { background: #f3eeff; color: #8E73A8; }
.modal-icon-box.edit   { background: #fffbeb; color: #d97706; }
.modal-icon-box.detail { background: #eff6ff; color: #2563eb; }

.modal-title { font-size: 1.1rem; font-weight: 700; color: #0f1923; margin-bottom: 0; }
.modal-sub   { font-size: .8rem; color: #9ca3af; margin-top: 2px; }

.modal-close {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; padding: 4px; border-radius: 8px;
  display: flex; transition: color .2s, background .2s;
}
.modal-close:hover { color: #374151; background: #f3f4f6; }

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

/* Detail */
.detail-avatar {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 700; color: #fff;
  margin: 0 auto 1.2rem;
}
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 1.5rem; }
.detail-item { background: #f8fafb; border-radius: 10px; padding: 12px 14px; }
.detail-label { font-size: .72rem; font-weight: 600; color: #9ca3af; letter-spacing: .04em; display: block; margin-bottom: 4px; }
.detail-value { font-size: 1rem; font-weight: 600; color: #0f1923; }
.detail-value.diff.neg { color: #be185d; }
.detail-value.diff.pos { color: #065f46; }

/* Form */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 1.5rem; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field.full { grid-column: 1 / -1; }
.form-field label { font-size: .78rem; font-weight: 600; color: #374151; letter-spacing: .02em; }
.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 13px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: .88rem;
  color: #0f1923;
  background: #f9fafb;
  outline: none;
  font-family: inherit;
  transition: border-color .2s, box-shadow .2s;
}
.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #8E73A8;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(142,115,168,.1);
}

.form-field textarea {
  resize: vertical;
  min-height: 70px;
}

.form-field input.err { border-color: #ef4444; }
.field-err { font-size: .73rem; color: #ef4444; }

/* Modal footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 1rem;
  border-top: 1px solid #f3f3f8;
  background: #fff;
  bottom: 0;
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
  box-shadow: 0 3px 10px rgba(239,68,68,.25);
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
.delete-modal { max-width: 380px; padding: 2rem; text-align: center; }
.delete-icon-wrap {
  width: 60px; height: 60px; border-radius: 50%;
  background: #fff1f1; color: #ef4444;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem;
}
.delete-title { font-size: 1.1rem; font-weight: 700; color: #0f1923; margin-bottom: 8px; }
.delete-sub   { font-size: .85rem; color: #6b7280; line-height: 1.5; margin-bottom: 1.5rem; }

/* ── Animaciones ──────────────────────────────────────────── */
@keyframes rowIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(360deg); } }

/* TransitionGroup filas */
.row-enter-active { animation: rowIn .3s ease; }
.row-leave-active { transition: opacity .2s, transform .2s; }
.row-leave-to     { opacity: 0; transform: translateX(-10px); }

/* Modal fade */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s ease; }
.modal-fade-enter-from,   .modal-fade-leave-to     { opacity: 0; }

/* Modal slide */
.modal-slide-enter-active { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease; }
.modal-slide-leave-active { transition: transform .2s ease, opacity .2s ease; }
.modal-slide-enter-from   { transform: scale(.92) translateY(16px); opacity: 0; }
.modal-slide-leave-to     { transform: scale(.95) translateY(8px);  opacity: 0; }

/* Dropdown filtros */
.dropdown-enter-active { transition: all .2s cubic-bezier(.34,1.56,.64,1); }
.dropdown-leave-active { transition: all .15s ease; }
.dropdown-enter-from   { opacity: 0; transform: translateY(-6px) scale(.97); }
.dropdown-leave-to     { opacity: 0; transform: translateY(-4px) scale(.97); }

/* Fade genérico */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }




/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 900px) {
  .patients-page { padding: 1.4rem 1rem; }
  .page-title { font-size: 1.5rem; }
  .td-appt, .td-sex { display: none; }
}
@media (max-width: 600px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-wrapper { max-width: 100%; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>