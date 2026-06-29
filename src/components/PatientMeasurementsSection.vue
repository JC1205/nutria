<template>
  <section class="measurements-section">
    <!-- Header -->
    <div class="measurements-header">
      <div>
        <h2>Seguimiento de medidas</h2>
        <p>Registra y visualiza el progreso físico del paciente.</p>
      </div>

      <button class="btn-add-measurement" @click="openCreateModal">
        <Plus :size="17" />
        Registrar medidas
      </button>
    </div>

    <!-- Empty / Loading -->
    <div v-if="loading" class="loading-card">
      <span class="spinner"></span>
      Cargando mediciones...
    </div>

    <template v-else>
      <!-- Summary cards -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon" :style="{ background: softColor }">
            <Scale :size="18" :color="patientColor" />
          </div>
          <div>
            <span>Último peso</span>
            <strong>{{ latest?.weight_kg ?? 0 }} kg</strong>
            <p :class="weightChange <= 0 ? 'good' : 'warn'">
              {{ formatChange(weightChange, 'kg') }}
            </p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon" :style="{ background: softColor }">
            <Ruler :size="18" :color="patientColor" />
          </div>
          <div>
            <span>Abdomen</span>
            <strong>{{ latest?.abdomen_cm ?? 0 }} cm</strong>
            <p :class="abdomenChange <= 0 ? 'good' : 'warn'">
              {{ formatChange(abdomenChange, 'cm') }}
            </p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon" :style="{ background: softColor }">
            <Activity :size="18" :color="patientColor" />
          </div>
          <div>
            <span>Grasa corporal</span>
            <strong>{{ latest?.fat_pct ?? 0 }}%</strong>
            <p :class="fatChange <= 0 ? 'good' : 'warn'">
              {{ formatChange(fatChange, '%') }}
            </p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon" :style="{ background: softColor }">
            <Dumbbell :size="18" :color="patientColor" />
          </div>
          <div>
            <span>Músculo</span>
            <strong>{{ latest?.muscle_kg ?? 0 }} kg</strong>
            <p :class="muscleChange >= 0 ? 'good' : 'warn'">
              {{ formatChange(muscleChange, 'kg') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h3>Gráfica de progreso</h3>
            <p>{{ chartSubtitle }}</p>
          </div>

          <div class="chart-tabs">
            <button
              v-for="option in chartOptions"
              :key="option.key"
              :class="{ active: activeChart === option.key }"
              @click="activeChart = option.key"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div v-if="measurements.length < 2" class="empty-chart">
          <LineChart :size="32" />
          <p>Registra al menos 2 mediciones para visualizar la gráfica.</p>
        </div>

        <div v-else class="chart-wrap">
          <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="chart-svg">
            <defs>
              <linearGradient id="measurementFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" :stop-color="patientColor" stop-opacity="0.22" />
                <stop offset="100%" :stop-color="patientColor" stop-opacity="0.02" />
              </linearGradient>
            </defs>

            <line
              v-for="y in gridYs"
              :key="y"
              x1="0"
              :y1="y"
              :x2="W"
              :y2="y"
              class="grid-line"
            />

            <path :d="areaPath" fill="url(#measurementFill)" />
            <path :d="linePath" fill="none" :stroke="patientColor" stroke-width="3" />

            <circle
              v-for="(point, index) in chartPoints"
              :key="index"
              :cx="point.x"
              :cy="point.y"
              r="4"
              :fill="patientColor"
            />
          </svg>

          <div class="chart-labels">
            <span v-for="label in chartLabels" :key="label">{{ label }}</span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        <div class="table-header">
          <h3>Historial de mediciones</h3>
          <span>{{ measurements.length }} registros</span>
        </div>

        <div v-if="measurements.length === 0" class="empty-state">
          <Inbox :size="34" />
          <h4>Sin mediciones registradas</h4>
          <p>Agrega la primera medición para comenzar el seguimiento.</p>
          <button class="btn-add-empty" @click="openCreateModal">
            Registrar primera medición
          </button>
        </div>

        <div v-else class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Peso</th>
                <th>Abdomen</th>
                <th>Brazo</th>
                <th>Brazo comp.</th>
                <th>Pantorrilla</th>
                <th>Grasa</th>
                <th>Músculo</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in measurements" :key="item.id">
                <td>{{ formatDate(item.measured_at) }}</td>
                <td>{{ value(item.weight_kg, 'kg') }}</td>
                <td>{{ value(item.abdomen_cm, 'cm') }}</td>
                <td>{{ value(item.arm_cm, 'cm') }}</td>
                <td>{{ value(item.contracted_arm_cm, 'cm') }}</td>
                <td>{{ value(item.calf_cm, 'cm') }}</td>
                <td>{{ value(item.fat_kg, 'kg') }} / {{ value(item.fat_pct, '%') }}</td>
                <td>{{ value(item.muscle_kg, 'kg') }} / {{ value(item.muscle_pct, '%') }}</td>
                <td>
                  <div class="table-actions">
                    <button @click="openEditModal(item)" title="Editar">
                      <Pencil :size="14" />
                    </button>
                    <button class="danger" @click="askDelete(item)" title="Eliminar">
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Modal crear/editar -->
    <Transition name="modal-fade">
      <div v-if="modal.open" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <h3>{{ modal.mode === 'create' ? 'Registrar medidas' : 'Editar medidas' }}</h3>
              <p>Completa los datos del seguimiento del paciente.</p>
            </div>

            <button class="modal-close" @click="closeModal">
              <X :size="18" />
            </button>
          </div>

          <form class="modal-body" @submit.prevent="saveMeasurement">
            <div class="form-grid">
              <div class="form-field">
                <label>Fecha</label>
                <input v-model="form.measured_at" type="date" />
              </div>

              <div class="form-field">
                <label>Peso actual (kg)</label>
                <input v-model.number="form.weight_kg" type="number" step="0.1" placeholder="70.5" />
              </div>

              <div class="form-field">
                <label>Circunferencia abdomen (cm)</label>
                <input v-model.number="form.abdomen_cm" type="number" step="0.1" placeholder="82" />
              </div>

              <div class="form-field">
                <label>Brazo (cm)</label>
                <input v-model.number="form.arm_cm" type="number" step="0.1" placeholder="30" />
              </div>

              <div class="form-field">
                <label>Brazo comprimido (cm)</label>
                <input v-model.number="form.contracted_arm_cm" type="number" step="0.1" placeholder="32" />
              </div>

              <div class="form-field">
                <label>Pantorrilla (cm)</label>
                <input v-model.number="form.calf_cm" type="number" step="0.1" placeholder="36" />
              </div>

              <div class="form-field">
                <label>Grasa (kg)</label>
                <input v-model.number="form.fat_kg" type="number" step="0.1" placeholder="18" />
              </div>

              <div class="form-field">
                <label>Grasa (%)</label>
                <input v-model.number="form.fat_pct" type="number" step="0.1" placeholder="24" />
              </div>

              <div class="form-field">
                <label>Músculo (kg)</label>
                <input v-model.number="form.muscle_kg" type="number" step="0.1" placeholder="45" />
              </div>

              <div class="form-field">
                <label>Músculo (%)</label>
                <input v-model.number="form.muscle_pct" type="number" step="0.1" placeholder="38" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">
                Cancelar
              </button>

              <button type="submit" class="btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-sm"></span>
                <Check v-else :size="15" />
                {{ modal.mode === 'create' ? 'Guardar medición' : 'Guardar cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal eliminar -->
    <Transition name="modal-fade">
      <div v-if="deleteModal.open" class="modal-overlay" @click.self="deleteModal.open = false">
        <div class="delete-card">
          <div class="delete-icon">
            <Trash2 :size="26" />
          </div>

          <h3>¿Eliminar medición?</h3>
          <p>Esta acción no se puede deshacer.</p>

          <div class="modal-footer centered">
            <button class="btn-secondary" @click="deleteModal.open = false">
              Cancelar
            </button>

            <button class="btn-danger" :disabled="deleteModal.deleting" @click="deleteMeasurement">
              <Trash2 :size="15" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  Plus,
  X,
  Check,
  Pencil,
  Trash2,
  Inbox,
  Scale,
  Ruler,
  Activity,
  Dumbbell,
  LineChart,
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

const props = defineProps<{
  patientId: string
  patientColor: string
}>()

const auth = useAuthStore()
const toast = useToastStore()

interface MeasurementRow {
  id: string
  user_id: string
  patient_id: string
  measured_at: string
  weight_kg: number | null
  abdomen_cm: number | null
  arm_cm: number | null
  contracted_arm_cm: number | null
  calf_cm: number | null
  fat_kg: number | null
  fat_pct: number | null
  muscle_kg: number | null
  muscle_pct: number | null
  notes: string | null
  created_at: string
}

const measurements = ref<MeasurementRow[]>([])
const loading = ref(false)
const saving = ref(false)

const activeChart = ref<'weight' | 'abdomen' | 'fat' | 'muscle'>('weight')

const chartOptions = [
  { key: 'weight', label: 'Peso' },
  { key: 'abdomen', label: 'Abdomen' },
  { key: 'fat', label: 'Grasa %' },
  { key: 'muscle', label: 'Músculo kg' },
] as const

const modal = reactive<{
  open: boolean
  mode: 'create' | 'edit'
  measurement: MeasurementRow | null
}>({
  open: false,
  mode: 'create',
  measurement: null,
})

const deleteModal = reactive<{
  open: boolean
  measurement: MeasurementRow | null
  deleting: boolean
}>({
  open: false,
  measurement: null,
  deleting: false,
})

const form = reactive({
  measured_at: new Date().toISOString().slice(0, 10),
  weight_kg: null as number | null,
  abdomen_cm: null as number | null,
  arm_cm: null as number | null,
  contracted_arm_cm: null as number | null,
  calf_cm: null as number | null,
  fat_kg: null as number | null,
  fat_pct: null as number | null,
  muscle_kg: null as number | null,
  muscle_pct: null as number | null,
})

const patientColor = computed(() => props.patientColor || '#3E9B92')

const softColor = computed(() => {
  return `${patientColor.value}18`
})

const latest = computed(() => {
  return measurements.value[0] ?? null
})

const previous = computed(() => {
  return measurements.value[1] ?? null
})

const weightChange = computed(() => diff(latest.value?.weight_kg, previous.value?.weight_kg))
const abdomenChange = computed(() => diff(latest.value?.abdomen_cm, previous.value?.abdomen_cm))
const fatChange = computed(() => diff(latest.value?.fat_pct, previous.value?.fat_pct))
const muscleChange = computed(() => diff(latest.value?.muscle_kg, previous.value?.muscle_kg))

const chartSubtitle = computed(() => {
  const option = chartOptions.find((item) => item.key === activeChart.value)
  return option ? `Evolución de ${option.label.toLowerCase()}` : 'Evolución del paciente'
})

function diff(current?: number | null, prev?: number | null) {
  if (current == null || prev == null) return 0
  return Number((current - prev).toFixed(1))
}

function formatChange(value: number, unit: string) {
  if (!value) return 'Sin cambio'
  return `${value > 0 ? '+' : ''}${value} ${unit}`
}

function resetForm() {
  Object.assign(form, {
    measured_at: new Date().toISOString().slice(0, 10),
    weight_kg: null,
    abdomen_cm: null,
    arm_cm: null,
    contracted_arm_cm: null,
    calf_cm: null,
    fat_kg: null,
    fat_pct: null,
    muscle_kg: null,
    muscle_pct: null,
  })
}

function openCreateModal() {
  resetForm()
  modal.mode = 'create'
  modal.measurement = null
  modal.open = true
}

function openEditModal(item: MeasurementRow) {
  modal.mode = 'edit'
  modal.measurement = item

  Object.assign(form, {
    measured_at: item.measured_at,
    weight_kg: item.weight_kg,
    abdomen_cm: item.abdomen_cm,
    arm_cm: item.arm_cm,
    contracted_arm_cm: item.contracted_arm_cm,
    calf_cm: item.calf_cm,
    fat_kg: item.fat_kg,
    fat_pct: item.fat_pct,
    muscle_kg: item.muscle_kg,
    muscle_pct: item.muscle_pct,
    notes: item.notes ?? '',
  })

  modal.open = true
}

function closeModal() {
  modal.open = false
}

async function ensureUser() {
  if (!auth.user) {
    await auth.loadUser()
  }

  return auth.user
}

function toNullableNumber(value: number | null) {
  return value === null || Number.isNaN(value) ? null : value
}

async function loadMeasurements() {
  const user = await ensureUser()

  if (!user || !props.patientId) return

  loading.value = true

  const { data, error } = await supabase
    .from('patient_measurements')
    .select('*')
    .eq('user_id', user.id)
    .eq('patient_id', props.patientId)
    .order('measured_at', { ascending: false })

  loading.value = false

  if (error) {
    toast.error(error.message)
    return
  }

  measurements.value = (data ?? []) as MeasurementRow[]
}

async function saveMeasurement() {
  const user = await ensureUser()

  if (!user) {
    toast.error('No hay una sesión activa.')
    return
  }

  saving.value = true

  const payload = {
    user_id: user.id,
    patient_id: props.patientId,
    measured_at: form.measured_at,

    weight_kg: toNullableNumber(form.weight_kg),
    abdomen_cm: toNullableNumber(form.abdomen_cm),
    arm_cm: toNullableNumber(form.arm_cm),
    contracted_arm_cm: toNullableNumber(form.contracted_arm_cm),
    calf_cm: toNullableNumber(form.calf_cm),

    fat_kg: toNullableNumber(form.fat_kg),
    fat_pct: toNullableNumber(form.fat_pct),

    muscle_kg: toNullableNumber(form.muscle_kg),
    muscle_pct: toNullableNumber(form.muscle_pct),

    updated_at: new Date().toISOString(),
  }

  try {
    if (modal.mode === 'create') {
      const { error } = await supabase.from('patient_measurements').insert(payload)
      if (error) throw error
    }

    if (modal.mode === 'edit' && modal.measurement) {
      const { error } = await supabase
        .from('patient_measurements')
        .update(payload)
        .eq('id', modal.measurement.id)
        .eq('user_id', user.id)

      if (error) throw error
    }

    await loadMeasurements()
    modal.open = false

    toast.success(
      modal.mode === 'create'
        ? 'Medición registrada correctamente.'
        : 'Medición actualizada correctamente.',
    )
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'No se pudo guardar la medición.')
  } finally {
    saving.value = false
  }
}

function askDelete(item: MeasurementRow) {
  deleteModal.measurement = item
  deleteModal.open = true
}

async function deleteMeasurement() {
  const item = deleteModal.measurement
  const user = await ensureUser()

  if (!item || !user) return

  deleteModal.deleting = true

  try {
    const { error } = await supabase
      .from('patient_measurements')
      .delete()
      .eq('id', item.id)
      .eq('user_id', user.id)

    if (error) throw error

    measurements.value = measurements.value.filter((measurement) => measurement.id !== item.id)

    deleteModal.open = false
    deleteModal.measurement = null

    toast.success('Medición eliminada correctamente.')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'No se pudo eliminar la medición.')
  } finally {
    deleteModal.deleting = false
  }
}

function value(value: number | null, unit: string) {
  if (value == null) return '—'
  return `${value} ${unit}`
}

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/* ── Chart SVG ──────────────────────────────────────────── */
const W = 680
const H = 190
const PAD = 18

function chartValue(item: MeasurementRow) {
  if (activeChart.value === 'weight') return Number(item.weight_kg ?? 0)
  if (activeChart.value === 'abdomen') return Number(item.abdomen_cm ?? 0)
  if (activeChart.value === 'fat') return Number(item.fat_pct ?? 0)
  return Number(item.muscle_kg ?? 0)
}

const chartData = computed(() => {
  return [...measurements.value]
    .reverse()
    .filter((item) => chartValue(item) > 0)
})

const chartLabels = computed(() => {
  return chartData.value.map((item) =>
    new Date(item.measured_at + 'T12:00:00').toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    }),
  )
})

const chartPoints = computed(() => {
  const data = chartData.value

  if (!data.length) return []

  const values = data.map(chartValue)
  const max = Math.max(...values)
  const min = Math.min(...values)

  const range = max - min || 1

  return values.map((value, index) => ({
    x: data.length === 1 ? W / 2 : PAD + (index / (data.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (value - min) / range) * (H - PAD * 2),
  }))
})

const linePath = computed(() => {
  const points = chartPoints.value

  if (!points.length) return ''

  return points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`

    const prev = points[index - 1]
    if (!prev) return acc

    const cpx = (prev.x + point.x) / 2

    return `${acc} C ${cpx} ${prev.y} ${cpx} ${point.y} ${point.x} ${point.y}`
  }, '')
})

const areaPath = computed(() => {
  const points = chartPoints.value

  const first = points[0]
  const last = points[points.length - 1]

  if (!first || !last) return ''

  return `${linePath.value} L ${last.x} ${H} L ${first.x} ${H} Z`
})

const gridYs = computed(() => [PAD, H * 0.35, H * 0.65, H - PAD])

onMounted(loadMeasurements)
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   SECCIÓN BASE
══════════════════════════════════════════════════════════ */
.measurements-section {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

/* ── Header ───────────────────────────────────────────────── */
.measurements-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.measurements-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f1923;
  letter-spacing: -.2px;
}

.measurements-header p {
  color: #9ca3af;
  font-size: .84rem;
  margin-top: 3px;
}

/* ── Botones de acción ────────────────────────────────────── */
.btn-add-measurement,
.btn-add-empty {
  border: none;
  background: #3E9B92;
  color: #fff;
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 600;
  font-size: .86rem;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: background .2s, transform .15s, box-shadow .2s;
}
.btn-add-measurement:hover,
.btn-add-empty:hover {
  background: #358e85;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(62, 155, 146, .36);
}
.btn-add-measurement:active,
.btn-add-empty:active { transform: translateY(0); }

/* ── Cards base ───────────────────────────────────────────── */
.loading-card,
.chart-card,
.table-card,
.summary-card {
  background: #fff;
  border: 1px solid #f0f0f5;
  border-radius: 16px;
  box-shadow: 0 1px 12px rgba(0, 0, 0, .04);
}

/* ── Loading ──────────────────────────────────────────────── */
.loading-card {
  padding: 2rem;
  color: #9ca3af;
  font-size: .88rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

/* ── Spinners ─────────────────────────────────────────────── */
.spinner {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2.5px solid rgba(62, 155, 146, .2);
  border-top-color: #3E9B92;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}

.spinner-sm {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, .35);
  border-top-color: #fff;
  animation: spin .7s linear infinite;
  display: inline-block;
}

/* ══════════════════════════════════════════════════════════
   SUMMARY CARDS
══════════════════════════════════════════════════════════ */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .9rem;
}

.summary-card {
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform .2s, box-shadow .2s;
}
.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, .07);
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-card span {
  font-size: .74rem;
  color: #9ca3af;
  font-weight: 600;
  letter-spacing: .02em;
}

.summary-card strong {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f1923;
  margin-top: 2px;
  letter-spacing: -.3px;
}

.summary-card p {
  font-size: .71rem;
  margin-top: 3px;
  font-weight: 600;
}

.good { color: #16a34a; }
.warn { color: #d97706; }

/* ══════════════════════════════════════════════════════════
   CHART CARD
══════════════════════════════════════════════════════════ */
.chart-card {
  padding: 1.3rem 1.4rem 1rem;
}

.chart-header,
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.1rem;
}

.chart-header h3,
.table-header h3 {
  font-size: .98rem;
  color: #0f1923;
  font-weight: 700;
}

.chart-header p {
  font-size: .76rem;
  color: #9ca3af;
  margin-top: 3px;
}

.table-header span {
  font-size: .76rem;
  color: #9ca3af;
  font-weight: 600;
}

/* Chart tabs */
.chart-tabs {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  padding: 3px;
  border-radius: 30px;
}

.chart-tabs button {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
  font-size: .76rem;
  font-family: inherit;
  color: #6b7280;
  transition: background .2s, color .2s, box-shadow .2s;
}

.chart-tabs button.active {
  background: #fff;
  color: #3E9B92;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
}

/* Chart SVG */
.chart-wrap { height: 220px; }

.chart-svg {
  width: 100%;
  height: 190px;
  overflow: visible;
}

.grid-line {
  stroke: #f0f0f5;
  stroke-width: 1;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin-top: 6px;
  font-size: .7rem;
  color: #b0b8cc;
  font-weight: 600;
}

/* Empty chart */
.empty-chart {
  padding: 2.4rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #c0c5d0;
  gap: 8px;
}
.empty-chart p {
  margin-top: 0;
  color: #9ca3af;
  font-size: .84rem;
}

/* ══════════════════════════════════════════════════════════
   TABLE CARD
══════════════════════════════════════════════════════════ */
.table-card {
  overflow: hidden;
  padding-bottom: 1rem;
}

.table-header {
  padding: 1.2rem 1.3rem 0;
}

.table-scroll {
  overflow-x: auto;
  margin: 0 1.3rem;
  border: 1.5px solid #eef0f4;
  border-radius: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 920px;
}

th {
  text-align: left;
  background: #fafafe;
  color: #9ca3af;
  font-size: .68rem;
  letter-spacing: .07em;
  font-weight: 700;
  padding: 11px 14px;
  white-space: nowrap;
  border-bottom: 1px solid #f0f0f5;
}

td {
  padding: 13px 14px;
  border-bottom: 1px solid #f7f7fb;
  font-size: .84rem;
  color: #374151;
  font-weight: 400;
  white-space: nowrap;
}

tr:last-child td { border-bottom: none; }
tr:hover td { background: #f6faf9; }

/* Table actions */
.table-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity .2s;
}
tr:hover .table-actions { opacity: 1; }

.table-actions button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s, color .15s;
}
.table-actions button:hover       { background: #eef6f5; color: #3E9B92; }
.table-actions button.danger:hover{ background: #fff1f1; color: #ef4444; }

/* Empty state (tabla) */
.empty-state {
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #c0c5d0;
  gap: 8px;
}
.empty-state h4 {
  color: #374151;
  font-size: .95rem;
  font-weight: 700;
  margin-top: 2px;
}
.empty-state p {
  margin-top: 0;
  color: #9ca3af;
  font-size: .84rem;
}

/* ══════════════════════════════════════════════════════════
   MODALES
══════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 25, 35, .45);
  backdrop-filter: blur(4px);
  z-index: 1000;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Modal crear / editar */
.modal-card {
  background: #fff;
  width: min(740px, 100%);
  max-height: 90vh;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(15, 25, 35, .18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.3rem 1.4rem 1rem;
  border-bottom: 1px solid #f3f3f8;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
}

.modal-header h3 {
  font-size: 1.02rem;
  font-weight: 700;
  color: #0f1923;
}

.modal-header p {
  color: #9ca3af;
  font-size: .8rem;
  margin-top: 3px;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 9px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s, color .15s;
  flex-shrink: 0;
}
.modal-close:hover { background: #e5e7eb; color: #0f1923; }

.modal-body {
  padding: 1.3rem;
  overflow-y: auto;
}

/* Form grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.form-field.full { grid-column: 1 / -1; }

.form-field label {
  display: block;
  font-size: .77rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
  letter-spacing: .02em;
}

.form-field input,
.form-field textarea {
  width: 90%;
  border: 1.5px solid #e5e7eb;
  border-radius: 11px;
  padding: 10px 12px;
  outline: none;
  font-family: inherit;
  font-size: .87rem;
  color: #0f1923;
  background: #f9fafb;
  transition: border-color .2s, box-shadow .2s, background .2s;
}

.form-field textarea {
    width: 95%;
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: #3E9B92;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(62, 155, 146, .1);
}

.form-field textarea { resize: none; }

/* Modal footer */
.modal-footer {
  padding-top: 1rem;
  border-top: 1px solid #f3f3f8;
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 4px;
}
.modal-footer.centered { justify-content: center; }

/* Botones del modal */
.btn-secondary {
  padding: 10px 20px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  font-size: .86rem;
  font-weight: 600;
  font-family: inherit;
  color: #374151;
  cursor: pointer;
  transition: border-color .2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-secondary:hover { border-color: #9ca3af; }

.btn-primary {
  padding: 10px 20px;
  background: #3E9B92;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: .86rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background .2s, box-shadow .2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 3px 10px rgba(62, 155, 146, .28);
}
.btn-primary:hover:not(:disabled) { background: #358e85; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

.btn-danger {
  padding: 10px 20px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: .86rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background .2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-danger:hover:not(:disabled) { background: #dc2626; }
.btn-danger:disabled { opacity: .6; cursor: not-allowed; }

/* ── Modal eliminar ───────────────────────────────────────── */
.delete-card {
  background: #fff;
  width: min(380px, 100%);
  padding: 1.8rem;
  text-align: center;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(15, 25, 35, .18);
}

.delete-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto .9rem;
  border-radius: 50%;
  background: #fff1f1;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-card h3 {
  color: #0f1923;
  font-size: 1.05rem;
  font-weight: 700;
}

.delete-card p {
  color: #9ca3af;
  margin-top: 5px;
  font-size: .84rem;
}

/* ══════════════════════════════════════════════════════════
   TRANSICIONES
══════════════════════════════════════════════════════════ */
.modal-fade-enter-active { transition: opacity .25s ease; }
.modal-fade-leave-active { transition: opacity .2s ease;  }
.modal-fade-enter-from,
.modal-fade-leave-to     { opacity: 0; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════════ */
@media (max-width: 980px) {
  .summary-grid { grid-template-columns: repeat(2, 1fr); }

  .chart-header,
  .measurements-header { flex-direction: column; align-items: flex-start; }

  .chart-tabs { overflow-x: auto; }
}

@media (max-width: 640px) {
  .summary-grid,
  .form-grid    { grid-template-columns: 1fr; }

  .modal-footer { flex-direction: column-reverse; }

  .btn-secondary,
  .btn-primary,
  .btn-danger   { width: 100%; justify-content: center; }
}
</style>