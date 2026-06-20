<template>
  <div class="food-page" :class="{ visible: mounted }">

    <!-- ══════════════════════════════════════════════════════
         SIDEBAR DE GRUPOS
    ═══════════════════════════════════════════════════════ -->
    <aside class="groups-sidebar">
      <div class="groups-header">
  <p class="groups-label">GRUPOS ALIMENTARIOS</p>

  <div class="groups-actions">
    <button class="btn-new-group" @click="openGroupModal" title="Nuevo grupo">
      <Plus :size="14" />
    </button>

    <button
      v-if="selectedGroup"
      class="btn-delete-group-small"
      @click="askDeleteGroup"
      title="Eliminar grupo"
    >
      <Trash2 :size="14" />
    </button>
  </div>
</div>

      <div class="groups-list">
        <button
  v-for="group in foodGroups"
  :key="group.id"
  class="group-item"
  :class="{ active: selectedGroup?.id === group.id }"
  :style="{ '--group-color': group.color }"
  @click="selectGroup(group)"
>
        <span class="group-color-dot" :style="{ background: group.color }"></span>
          <span class="group-name">{{ group.name }}</span>
          <span class="group-count">{{ group.foods.length }}</span>
        </button>
      </div>
    </aside>

    <!-- ══════════════════════════════════════════════════════
         ÁREA PRINCIPAL
    ═══════════════════════════════════════════════════════ -->
    <main class="food-main">

      <!-- ── Header del grupo ──────────────────────────────── -->
      <div class="food-header">
        <div class="food-header-left">
          <div>
            <h1 class="food-title">{{ selectedGroup?.name ?? 'Selecciona un grupo' }}</h1>
            <p class="food-subtitle">
              {{ selectedGroup ? `${filteredFoods.length} alimentos en la base de datos` : 'Elige un grupo del panel izquierdo' }}
            </p>
          </div>
        </div>

        <div class="food-header-right">
          <!-- Búsqueda -->
          <div class="search-box" :class="{ focused: searchFocused }">
            <Search :size="15" class="search-ico" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar alimentos..."
              @focus="searchFocused = true"
              @blur="searchFocused = false"
            />
            <Transition name="fade">
              <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''"><X :size="13" /></button>
            </Transition>
          </div>

          <!-- Agregar alimento -->
          <button v-if="selectedGroup" class="btn-add-food" @click="openFoodModal()">
            <Plus :size="16" /> Agregar alimento
          </button>
        </div>
      </div>

      <!-- ── Tabla ─────────────────────────────────────────── -->
      <div v-if="selectedGroup" class="table-wrapper">
        <div class="table-scroll">
          <table class="food-table">
            <thead>
              <tr>
                <th class="th-sticky">NOMBRE DEL ALIMENTO</th>
                <th>CANTIDAD</th>
                <th>UNIDAD</th>
                <th>PESO (g)</th>
                <th>ENERGÍA</th>
                <th>PROTEÍNA (g)</th>
                <th>LÍPIDOS (g)</th>
                <th>H. CARBONO (g)</th>
                <th>AG SAT (g)</th>
                <th>AG MONO (g)</th>
                <th>AG POLI (g)</th>
                <th>COLEST (mg)</th>
                <th>AZÚCAR (g)</th>
                <th>FIBRA (g)</th>
                <th>VIT A (mg)</th>
                <th>VIT C (mg)</th>
                <th>ÁC FÓLICO (mg)</th>
                <th>CALCIO (mg)</th>
                <th>HIERRO (mg)</th>
                <th>POTASIO (mg)</th>
                <th>SODIO (mg)</th>
                <th>FÓSFORO (mg)</th>
                <th>CARGA GL</th>
                <th class="th-actions"></th>
              </tr>
            </thead>
            <tbody>
              <TransitionGroup name="row">
                <tr
                    v-for="(food, i) in paginatedFoods"
                    :key="food.id"
                    class="food-row"
                    :class="{ adjusted: food.portionMultiplier !== 1 }"
                    :style="{ '--delay': `${i * 30}ms` }"
                  >
                  <td class="td-sticky td-name">{{ food.name }}</td>

<td class="td-portion">
  <input
    v-if="food.portionMultiplier !== 1"
    v-model.number="food.portionMultiplier"
    type="number"
    min="0.1"
    step="0.1"
    class="portion-input"
    @click.stop
  />

  <button
    v-else
    class="portion-value"
    @dblclick.stop="food.portionMultiplier = 0.5"
    title="Doble clic para ajustar porción"
  >
    {{ displayedQuantity(food) }}
  </button>
</td>

<td class="td-unit">{{ food.unit }}</td>

<td>{{ scaled(food.weightG, food.portionMultiplier) }}</td>

<td>
  <span class="kcal-badge">
    {{ scaled(food.energyKcal, food.portionMultiplier) }} kcal
  </span>
</td>

<td>{{ scaled(food.proteinG, food.portionMultiplier) }}</td>
<td>{{ scaled(food.lipidsG, food.portionMultiplier) }}</td>
<td>{{ scaled(food.carbsG, food.portionMultiplier) }}</td>
<td>{{ scaled(food.satFatG, food.portionMultiplier) }}</td>
<td>{{ scaled(food.monoFatG, food.portionMultiplier) }}</td>
<td>{{ scaled(food.poliFatG, food.portionMultiplier) }}</td>
<td>{{ scaled(food.cholesterolMg, food.portionMultiplier) }}</td>
<td>{{ scaled(food.sugarG, food.portionMultiplier) }}</td>
<td>{{ scaled(food.fiberG, food.portionMultiplier) }}</td>
<td>{{ scaled(food.vitAMg, food.portionMultiplier) }}</td>
<td>{{ scaled(food.vitCMg, food.portionMultiplier) }}</td>
<td>{{ scaled(food.folicMg, food.portionMultiplier) }}</td>
<td>{{ scaled(food.calciumMg, food.portionMultiplier) }}</td>
<td>{{ scaled(food.ironMg, food.portionMultiplier) }}</td>
<td>{{ scaled(food.potassiumMg, food.portionMultiplier) }}</td>
<td>{{ scaled(food.sodiumMg, food.portionMultiplier) }}</td>
<td>{{ scaled(food.phosphorusMg, food.portionMultiplier) }}</td>

<td>
  <span
    class="gl-badge"
    :class="glClass(scaled(food.glycemicLoad, food.portionMultiplier))"
  >
    {{ scaled(food.glycemicLoad, food.portionMultiplier) }}
  </span>
</td>
                  <td class="td-actions" @click.stop>
                    <div class="row-acts">
                    <button
  v-if="food.portionMultiplier !== 1"
  class="act-btn"
  @click="resetTemporaryPortion(food)"
  title="Restaurar porción original"
>
  ↺
</button>
                      <button class="act-btn" @click="openFoodModal(food)" title="Editar"><Pencil :size="13" /></button>
                      <button class="act-btn danger" @click="askDeleteFood(food)" title="Eliminar"><Trash2 :size="13" /></button>
                    </div>
                  </td>
                </tr>
              </TransitionGroup>

              <tr v-if="filteredFoods.length === 0">
                <td colspan="24" class="empty-cell">
                  <div class="empty-state">
                    <span>🥦</span>
                    <p>Sin alimentos en este grupo</p>
                    <button class="btn-add-food small" @click="openFoodModal()">+ Agregar alimento</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="pg-btn" :disabled="page === 1" @click="page--"><ChevronLeft :size="14" /></button>
          <button
            v-for="p in totalPages" :key="p"
            class="pg-btn" :class="{ active: p === page }"
            @click="page = p"
          >{{ p }}</button>
          <button class="pg-btn" :disabled="page === totalPages" @click="page++"><ChevronRight :size="14" /></button>
        </div>
      </div>

      <!-- Empty: sin grupo seleccionado -->
      <div v-else class="no-group">
        <span class="no-group-icon">🍽️</span>
        <p>Selecciona un grupo del panel izquierdo para ver sus alimentos</p>
      </div>

    </main>

    <!-- ══════════════════════════════════════════════════════
         MODAL: Nuevo / Editar alimento
    ═══════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="foodModal.open" class="modal-overlay" @click.self="foodModal.open = false">
        <Transition name="modal-slide">
          <div v-if="foodModal.open" class="modal-card food-modal-card">

            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon-box"><Utensils :size="18" /></div>
                <div>
                  <h2 class="modal-title">{{ foodModal.food ? 'Editar alimento' : 'Nuevo alimento' }}</h2>
                  <p class="modal-sub">{{ selectedGroup?.name }}</p>
                </div>
              </div>
              <button class="modal-close" @click="foodModal.open = false"><X :size="17" /></button>
            </div>

            <div class="modal-body">
              <form @submit.prevent="saveFood" novalidate>

                <!-- Bloque: Identificación -->
                <p class="form-section-label">Identificación</p>
                <div class="form-grid cols3">
                  <div class="ff full-3">
                    <label>Nombre del alimento *</label>
                    <input v-model="ff.name" type="text" placeholder="Ej. Brócoli" :class="{ err: fe.name }" />
                    <span v-if="fe.name" class="ferr">{{ fe.name }}</span>
                  </div>
                  <div class="ff">
                    <label>Cantidad *</label>
                    <input v-model.number="ff.quantity" type="number" step="0.1" min="0" placeholder="1" :class="{ err: fe.quantity }" />
                    <span v-if="fe.quantity" class="ferr">{{ fe.quantity }}</span>
                  </div>
                  <div class="ff">
                    <label>Unidad *</label>
                    <select v-model="ff.unit">
                      <option>taza</option><option>pieza</option><option>porción</option>
                      <option>cucharada</option><option>cucharadita</option><option>gramo</option>
                      <option>ml</option><option>rebanada</option><option>otro</option>
                    </select>
                  </div>
                  <div class="ff">
                    <label>Peso neto (g) *</label>
                    <input v-model.number="ff.weightG" type="number" step="0.1" min="0" placeholder="156" :class="{ err: fe.weightG }" />
                    <span v-if="fe.weightG" class="ferr">{{ fe.weightG }}</span>
                  </div>
                </div>

                <!-- Bloque: Macronutrimentos -->
                <p class="form-section-label">Macronutrimentos</p>
                <div class="form-grid cols3">
                  <div class="ff"><label>Energía (kcal)</label><input v-model.number="ff.energyKcal" type="number" step="0.1" min="0" placeholder="55" /></div>
                  <div class="ff"><label>Proteína (g)</label><input v-model.number="ff.proteinG" type="number" step="0.1" min="0" placeholder="3.7" /></div>
                  <div class="ff"><label>Lípidos (g)</label><input v-model.number="ff.lipidsG" type="number" step="0.1" min="0" placeholder="0.6" /></div>
                  <div class="ff"><label>H. carbono (g)</label><input v-model.number="ff.carbsG" type="number" step="0.1" min="0" placeholder="11.2" /></div>
                  <div class="ff"><label>Azúcar (g)</label><input v-model.number="ff.sugarG" type="number" step="0.1" min="0" placeholder="2.2" /></div>
                  <div class="ff"><label>Fibra (g)</label><input v-model.number="ff.fiberG" type="number" step="0.1" min="0" placeholder="2.6" /></div>
                </div>

                <!-- Bloque: Ácidos grasos -->
                <p class="form-section-label">Ácidos grasos y colesterol</p>
                <div class="form-grid cols3">
                  <div class="ff"><label>AG saturados (g)</label><input v-model.number="ff.satFatG" type="number" step="0.01" min="0" placeholder="0.1" /></div>
                  <div class="ff"><label>AG monoinsaturados (g)</label><input v-model.number="ff.monoFatG" type="number" step="0.01" min="0" placeholder="0.02" /></div>
                  <div class="ff"><label>AG poliinsaturados (g)</label><input v-model.number="ff.poliFatG" type="number" step="0.01" min="0" placeholder="0.03" /></div>
                  <div class="ff"><label>Colesterol (mg)</label><input v-model.number="ff.cholesterolMg" type="number" step="0.1" min="0" placeholder="0" /></div>
                </div>

                <!-- Bloque: Vitaminas y minerales -->
                <p class="form-section-label">Vitaminas y minerales</p>
                <div class="form-grid cols3">
                  <div class="ff"><label>Vitamina A (mg)</label><input v-model.number="ff.vitAMg" type="number" step="0.001" min="0" placeholder="0.03" /></div>
                  <div class="ff"><label>Ácido ascórbico / Vit C (mg)</label><input v-model.number="ff.vitCMg" type="number" step="0.1" min="0" placeholder="89.2" /></div>
                  <div class="ff"><label>Ácido fólico (mg)</label><input v-model.number="ff.folicMg" type="number" step="0.001" min="0" placeholder="0.063" /></div>
                  <div class="ff"><label>Calcio (mg)</label><input v-model.number="ff.calciumMg" type="number" step="0.1" min="0" placeholder="42" /></div>
                  <div class="ff"><label>Hierro (mg)</label><input v-model.number="ff.ironMg" type="number" step="0.01" min="0" placeholder="0.66" /></div>
                  <div class="ff"><label>Potasio (mg)</label><input v-model.number="ff.potassiumMg" type="number" step="0.1" min="0" placeholder="288" /></div>
                  <div class="ff"><label>Sodio (mg)</label><input v-model.number="ff.sodiumMg" type="number" step="0.1" min="0" placeholder="30" /></div>
                  <div class="ff"><label>Fósforo (mg)</label><input v-model.number="ff.phosphorusMg" type="number" step="0.1" min="0" placeholder="66" /></div>
                  <div class="ff"><label>Carga glucémica</label><input v-model.number="ff.glycemicLoad" type="number" step="0.1" min="0" placeholder="1.2" /></div>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn-sec" @click="foodModal.open = false">Cancelar</button>
                  <button type="submit" class="btn-pri" :disabled="savingFood">
                    <span v-if="savingFood" class="spinner-sm" />
                    <Check v-else :size="14" />
                    {{ foodModal.food ? 'Guardar cambios' : 'Agregar alimento' }}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>

    <Transition name="modal-fade">
  <div v-if="deleteGroup.open" class="modal-overlay" @click.self="deleteGroup.open = false">
    <div class="modal-card" style="max-width:360px;padding:1.8rem;text-align:center">
      <div class="del-icon"><Trash2 :size="24" /></div>

      <h3 class="del-title">¿Eliminar grupo?</h3>

      <p class="del-sub">
        Se eliminará el grupo
        <strong>{{ deleteGroup.group?.name }}</strong>
        y todos sus alimentos.
      </p>

      <div class="modal-footer" style="justify-content:center;border:none;padding-top:.8rem">
        <button class="btn-sec" @click="deleteGroup.open = false">
          Cancelar
        </button>

        <button class="btn-danger" @click="doDeleteGroup">
          <Trash2 :size="13" /> Eliminar
        </button>
      </div>
    </div>
  </div>
</Transition>

    <!-- ══ MODAL: Nuevo grupo ══════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="groupModal.open" class="modal-overlay" @click.self="groupModal.open = false">
        <div class="modal-card" style="max-width:400px">
          <div class="modal-header">
            <div class="modal-title-group">
              <div class="modal-icon-box"><Layers :size="18" /></div>
              <div>
                <h2 class="modal-title">Nuevo grupo alimentario</h2>
                <p class="modal-sub">Crea una nueva categoría de alimentos</p>
              </div>
            </div>
            <button class="modal-close" @click="groupModal.open = false"><X :size="17" /></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveGroup" novalidate>
              <div class="form-grid cols1" style="margin-bottom:1.2rem">
                <div class="ff">
                  <label>Nombre del grupo *</label>
                  <input v-model="gf.name" type="text" placeholder="Ej. Leguminosas" :class="{ err: ge.name }" />
                  <span v-if="ge.name" class="ferr">{{ ge.name }}</span>
                </div>
                <div class="ff">
  <label>Color del grupo</label>

  <div class="color-picker">
    <button
      v-for="color in colorOptions"
      :key="color"
      type="button"
      class="color-opt"
      :class="{ selected: gf.color === color }"
      :style="{ background: color }"
      @click="gf.color = color"
    ></button>
  </div>
</div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-sec" @click="groupModal.open = false">Cancelar</button>
                <button type="submit" class="btn-pri">
                  <Check :size="14" /> Crear grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ MODAL: Confirmar eliminar alimento ═════════════ -->
    <Transition name="modal-fade">
      <div v-if="deleteFood.open" class="modal-overlay" @click.self="deleteFood.open = false">
        <div class="modal-card" style="max-width:360px;padding:1.8rem;text-align:center">
          <div class="del-icon"><Trash2 :size="24" /></div>
          <h3 class="del-title">¿Eliminar alimento?</h3>
          <p class="del-sub">Se eliminará <strong>{{ deleteFood.food?.name }}</strong> del grupo {{ selectedGroup?.name }}.</p>
          <div class="modal-footer" style="justify-content:center;border:none;padding-top:.8rem">
            <button class="btn-sec" @click="deleteFood.open = false">Cancelar</button>
            <button class="btn-danger" @click="doDeleteFood"><Trash2 :size="13" /> Eliminar</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Layers,
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

/* ─────────────────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────────────────── */
interface FoodRow {
  id: string
  user_id: string
  food_group_id: string
  name: string

  quantity: number | null
  unit: string | null
  net_weight_g: number | null

  energy_kcal: number | null
  protein_g: number | null
  lipids_g: number | null
  carbs_g: number | null

  saturated_fat_g: number | null
  monounsaturated_fat_g: number | null
  polyunsaturated_fat_g: number | null
  cholesterol_mg: number | null

  sugar_g: number | null
  fiber_g: number | null

  vitamin_a_mg: number | null
  ascorbic_acid_mg: number | null
  folic_acid_mg: number | null
  calcium_mg: number | null
  iron_mg: number | null
  potassium_mg: number | null
  sodium_mg: number | null
  phosphorus_mg: number | null

  glycemic_load: number | null

  created_at: string
  updated_at: string
}

interface FoodGroupRow {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string | null
  created_at: string
  updated_at: string
}

interface Food {
  id: string
  name: string
  quantity: number
  unit: string
  weightG: number
  energyKcal: number
  proteinG: number
  lipidsG: number
  carbsG: number
  satFatG: number
  monoFatG: number
  poliFatG: number
  cholesterolMg: number
  sugarG: number
  fiberG: number
  vitAMg: number
  vitCMg: number
  folicMg: number
  calciumMg: number
  ironMg: number
  potassiumMg: number
  sodiumMg: number
  phosphorusMg: number
  glycemicLoad: number

  portionMultiplier: number
}

interface FoodGroup {
  id: string
  name: string
  color: string
  foods: Food[]
}

/* ─────────────────────────────────────────────────────────
   STORE
───────────────────────────────────────────────────────── */
const auth = useAuthStore()

/* ─────────────────────────────────────────────────────────
   ESTADO
───────────────────────────────────────────────────────── */
const mounted = ref(false)
const searchQuery = ref('')
const searchFocused = ref(false)
const page = ref(1)
const PAGE_SIZE = 15
const savingFood = ref(false)
const savingGroup = ref(false)
const loading = ref(false)
const pageError = ref('')

const selectedGroup = ref<FoodGroup | null>(null)
const foodGroups = ref<FoodGroup[]>([])

const colorOptions = [
  '#8E73A8',
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#84cc16',
  '#6366f1',
  '#f97316',
]

async function ensureUser() {
  if (!auth.user) {
    await auth.loadUser()
  }

  return auth.user
}

/* ─────────────────────────────────────────────────────────
   MAPEO SUPABASE → VISTA
───────────────────────────────────────────────────────── */
function mapFood(row: FoodRow): Food {
  return {
    id: row.id,
    name: row.name,
    quantity: Number(row.quantity ?? 0),
    unit: row.unit ?? '',
    weightG: Number(row.net_weight_g ?? 0),

    energyKcal: Number(row.energy_kcal ?? 0),
    proteinG: Number(row.protein_g ?? 0),
    lipidsG: Number(row.lipids_g ?? 0),
    carbsG: Number(row.carbs_g ?? 0),

    satFatG: Number(row.saturated_fat_g ?? 0),
    monoFatG: Number(row.monounsaturated_fat_g ?? 0),
    poliFatG: Number(row.polyunsaturated_fat_g ?? 0),
    cholesterolMg: Number(row.cholesterol_mg ?? 0),

    sugarG: Number(row.sugar_g ?? 0),
    fiberG: Number(row.fiber_g ?? 0),

    vitAMg: Number(row.vitamin_a_mg ?? 0),
    vitCMg: Number(row.ascorbic_acid_mg ?? 0),
    folicMg: Number(row.folic_acid_mg ?? 0),
    calciumMg: Number(row.calcium_mg ?? 0),
    ironMg: Number(row.iron_mg ?? 0),
    potassiumMg: Number(row.potassium_mg ?? 0),
    sodiumMg: Number(row.sodium_mg ?? 0),
    phosphorusMg: Number(row.phosphorus_mg ?? 0),

    glycemicLoad: Number(row.glycemic_load ?? 0),

    portionMultiplier: 1,
  }
}

function mapFoodToPayload(foodGroupId: string) {
  if (!auth.user) {
    throw new Error('No hay una sesión activa.')
  }

  return {
    user_id: auth.user.id,
    food_group_id: foodGroupId,

    name: ff.name.trim(),

    quantity: ff.quantity,
    unit: ff.unit,
    net_weight_g: ff.weightG,

    energy_kcal: ff.energyKcal,
    protein_g: ff.proteinG,
    lipids_g: ff.lipidsG,
    carbs_g: ff.carbsG,

    saturated_fat_g: ff.satFatG,
    monounsaturated_fat_g: ff.monoFatG,
    polyunsaturated_fat_g: ff.poliFatG,
    cholesterol_mg: ff.cholesterolMg,

    sugar_g: ff.sugarG,
    fiber_g: ff.fiberG,

    vitamin_a_mg: ff.vitAMg,
    ascorbic_acid_mg: ff.vitCMg,
    folic_acid_mg: ff.folicMg,
    calcium_mg: ff.calciumMg,
    iron_mg: ff.ironMg,
    potassium_mg: ff.potassiumMg,
    sodium_mg: ff.sodiumMg,
    phosphorus_mg: ff.phosphorusMg,

    glycemic_load: ff.glycemicLoad,
  }
}

/* ─────────────────────────────────────────────────────────
   CARGAR DATOS
───────────────────────────────────────────────────────── */

function isValidColor(value: string | null) {
  if (!value) return false

  return /^#[0-9A-F]{6}$/i.test(value)
}

function getGroupColor(value: string | null): string {
  return isValidColor(value) ? value as string : '#3E9B92 '
}

async function loadFoodGroups() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  loading.value = true
  pageError.value = ''

  const { data: groupsData, error: groupsError } = await supabase
    .from('food_groups')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (groupsError) {
    loading.value = false
    pageError.value = groupsError.message
    return
  }

  const { data: foodsData, error: foodsError } = await supabase
    .from('foods')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  loading.value = false

  if (foodsError) {
    pageError.value = foodsError.message
    return
  }

  const foods = (foodsData ?? []) as FoodRow[]

foodGroups.value = ((groupsData ?? []) as FoodGroupRow[]).map((group) => ({
  id: group.id,
  name: group.name,
  color: getGroupColor(group.color),
  foods: foods
    .filter((food) => food.food_group_id === group.id)
    .map((food) => mapFood(food)),
}))

  if (!selectedGroup.value && foodGroups.value.length > 0) {
    selectedGroup.value = foodGroups.value[0] ?? null
  } else if (selectedGroup.value) {
    const updatedSelectedGroup = foodGroups.value.find(
      (group) => group.id === selectedGroup.value?.id,
    )

    selectedGroup.value = updatedSelectedGroup ?? foodGroups.value[0] ?? null
  }
}

/* ─────────────────────────────────────────────────────────
   COMPUTED
───────────────────────────────────────────────────────── */
const filteredFoods = computed(() => {
  if (!selectedGroup.value) return []

  const q = searchQuery.value.toLowerCase().trim()

  if (!q) return selectedGroup.value.foods

  return selectedGroup.value.foods.filter((food) => food.name.toLowerCase().includes(q))
})

const totalPages = computed(() => Math.ceil(filteredFoods.value.length / PAGE_SIZE))

const paginatedFoods = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE

  return filteredFoods.value.slice(start, start + PAGE_SIZE)
})

function selectGroup(group: FoodGroup) {
  selectedGroup.value = group
  searchQuery.value = ''
  page.value = 1
}

function glClass(gl: number) {
  if (gl <= 10) return 'low'
  if (gl <= 19) return 'mid'

  return 'high'
}


function scaled(value: number, multiplier: number) {
  return Number((value * multiplier).toFixed(2))
}

function displayedQuantity(food: Food) {
  return Number((food.quantity * food.portionMultiplier).toFixed(2))
}

function resetTemporaryPortion(food: Food) {
  food.portionMultiplier = 1
}

/* ─────────────────────────────────────────────────────────
   MODAL ALIMENTO
───────────────────────────────────────────────────────── */
const foodModal = reactive<{
  open: boolean
  food: Food | null
}>({
  open: false,
  food: null,
})

const EMPTY_FF = () => ({
  name: '',
  quantity: 1,
  unit: 'taza',
  weightG: 0,

  energyKcal: 0,
  proteinG: 0,
  lipidsG: 0,
  carbsG: 0,

  satFatG: 0,
  monoFatG: 0,
  poliFatG: 0,
  cholesterolMg: 0,

  sugarG: 0,
  fiberG: 0,

  vitAMg: 0,
  vitCMg: 0,
  folicMg: 0,
  calciumMg: 0,
  ironMg: 0,
  potassiumMg: 0,
  sodiumMg: 0,
  phosphorusMg: 0,

  glycemicLoad: 0,
})

const ff = reactive(EMPTY_FF())

const fe = reactive({
  name: '',
  quantity: '',
  weightG: '',
})

function openFoodModal(food?: Food) {
  foodModal.food = food ?? null

  Object.assign(fe, {
    name: '',
    quantity: '',
    weightG: '',
  })

  if (food) {
    Object.assign(ff, { ...food })
  } else {
    Object.assign(ff, EMPTY_FF())
  }

  foodModal.open = true
}

function validateFood() {
  let ok = true

  fe.name = ff.name.trim() ? '' : 'El nombre es requerido.'
  fe.quantity = ff.quantity > 0 ? '' : 'Ingresa una cantidad.'
  fe.weightG = ff.weightG > 0 ? '' : 'Ingresa el peso neto.'

  if (fe.name || fe.quantity || fe.weightG) {
    ok = false
  }

  return ok
}

async function saveFood() {
  if (!validateFood() || !selectedGroup.value) return

  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  savingFood.value = true
  pageError.value = ''

  try {
    const payload = mapFoodToPayload(selectedGroup.value.id)

    if (foodModal.food) {
      const { error } = await supabase
        .from('foods')
        .update(payload)
        .eq('id', foodModal.food.id)
        .eq('user_id', user.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from('foods').insert(payload)

      if (error) throw error
    }

    await loadFoodGroups()
    foodModal.open = false
  } catch (err) {
    pageError.value = err instanceof Error ? err.message : 'No se pudo guardar el alimento.'
  } finally {
    savingFood.value = false
  }
}

/* ─────────────────────────────────────────────────────────
   MODAL GRUPO
───────────────────────────────────────────────────────── */
const groupModal = reactive({
  open: false,
})

const gf = reactive({
  name: '',
  color: '#3E9B92 ',
})

const ge = reactive({
  name: '',
})

function openGroupModal() {
  gf.name = ''
  gf.color = '#3E9B92 '
  ge.name = ''
  groupModal.open = true
}

async function saveGroup() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  if (!gf.name.trim()) {
    ge.name = 'El nombre es requerido.'
    return
  }

  savingGroup.value = true
  pageError.value = ''

  const { data, error } = await supabase
    .from('food_groups')
    .insert({
      user_id: user.id,
      name: gf.name.trim(),
      description: null,
      color: gf.color,
    })
    .select()
    .single()

  savingGroup.value = false

  if (error) {
    pageError.value = error.message
    return
  }

  groupModal.open = false

  await loadFoodGroups()

  const createdGroup = foodGroups.value.find((group) => group.id === data.id)

  if (createdGroup) {
    selectGroup(createdGroup)
  }
}

/* ─────────────────────────────────────────────────────────
   ELIMINAR ALIMENTO
───────────────────────────────────────────────────────── */
const deleteFood = reactive<{
  open: boolean
  food: Food | null
}>({
  open: false,
  food: null,
})

function askDeleteFood(food: Food) {
  deleteFood.food = food
  deleteFood.open = true
}

async function doDeleteFood() {
  const user = await ensureUser()

  if (!deleteFood.food || !selectedGroup.value || !user) return



  const { error } = await supabase
    .from('foods')
    .delete()
    .eq('id', deleteFood.food.id)
    .eq('user_id', user.id)

  if (error) {
    pageError.value = error.message
    return
  }

  deleteFood.open = false

  await loadFoodGroups()
}

/* ─────────────────────────────────────────────────────────
   ELIMINAR GRUPO
───────────────────────────────────────────────────────── */
const deleteGroup = reactive<{
  open: boolean
  group: FoodGroup | null
}>({
  open: false,
  group: null,
})

function askDeleteGroup() {
  if (!selectedGroup.value) return

  deleteGroup.group = selectedGroup.value
  deleteGroup.open = true
}

async function doDeleteGroup() {
  const user = await ensureUser()

  if (!deleteGroup.group || !user) return

  const groupId = deleteGroup.group.id

  const { error } = await supabase
    .from('food_groups')
    .delete()
    .eq('id', groupId)
    .eq('user_id', user.id)

  if (error) {
    pageError.value = error.message
    return
  }

  deleteGroup.open = false
  deleteGroup.group = null

  if (selectedGroup.value?.id === groupId) {
    selectedGroup.value = null
  }

  await loadFoodGroups()
}

onMounted(async () => {
  await loadFoodGroups()

  setTimeout(() => {
    mounted.value = true
  }, 80)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   LAYOUT RAÍZ
══════════════════════════════════════════════════════════ */
.food-page {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter','Segoe UI',sans-serif;
  background: #f8fafb;
  opacity: 0;
  transition: opacity .4s ease;
}
.food-page.visible { opacity: 1; }

/* ══════════════════════════════════════════════════════════
   SIDEBAR GRUPOS
══════════════════════════════════════════════════════════ */
.groups-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #f0f0f5;
  display: flex;
  flex-direction: column;
  padding: .8rem .6rem;
  overflow-y: auto;
  animation: fadeRight .5s ease both;
}

.groups-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .4rem .5rem .8rem;
}

.groups-label {
  font-size: .62rem;
  font-weight: 700;
  color: #b0b8cc;
  letter-spacing: .1em;
}

.btn-new-group {
  width: 24px; height: 24px;
  border: 1.5px solid #e5e7eb;
  border-radius: 7px;
  background: #fafafe;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #3E9B92 ;
  transition: .2s;
}
.btn-new-group:hover { background: #e6f8f6; border-color: #cbb8e8; }


.groups-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-delete-group-small {
  width: 24px;
  height: 24px;
  border: 1.5px solid #fecaca;
  border-radius: 7px;
  background: #fff1f1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  transition: .2s;
}

.btn-delete-group-small:hover {
  background: #fee2e2;
  border-color: #ef4444;
}

.groups-list { display: flex; flex-direction: column; gap: 2px; }

.group-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border-radius: 11px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: .86rem;
  color: #5a6070;
  font-weight: 500;
  transition: background .15s, color .15s;
  text-align: left;
}
.group-item:hover:not(.active) { background: #f1fbfa; color: #3E9B92 ; }
.group-item.active {
  background: linear-gradient(135deg, #f1fbfa, #f1fbfa);
  color: #3E9B92 ;
  font-weight: 700;
}


.group-name  { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.group-count {
  font-size: .72rem;
  font-weight: 700;
  background: rgba(142,115,168,.12);
  color: #3E9B92 ;
  padding: 2px 7px;
  border-radius: 20px;
  flex-shrink: 0;
}
.group-item.active .group-count { background: rgba(142,115,168,.18); }

.group-color-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(0,0,0,.04);
}

.group-item.active {
  background: color-mix(in srgb, var(--group-color, #3E9B92 ) 12%, white);
  color: #374151;
  font-weight: 700;
}

/* ══════════════════════════════════════════════════════════
   ÁREA PRINCIPAL
══════════════════════════════════════════════════════════ */
.food-main {
  flex: 1;
  padding: 2rem 2.2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  min-width: 0;
}

/* Header */
.food-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  animation: fadeDown .5s ease both;
}
.food-header-left { display: flex; align-items: center; gap: 14px; }

.food-title    { font-size: 1.5rem; font-weight: 500; color: #0f1923; letter-spacing: -.4px; }
.food-subtitle { font-size: .85rem; color: #9ca3af; margin-top: 3px; }

.food-header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.search-box {
  display: flex; align-items: center; gap: 8px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 11px;
  padding: 9px 13px;
  transition: .2s;
  min-width: 200px;
}
.search-box.focused { border-color: #3E9B92 ; box-shadow: 0 0 0 4px rgba(142,115,168,.1); }
.search-ico { color: #9ca3af; flex-shrink: 0; }
.search-box input {
  border: none; outline: none;
  font-size: .88rem; color: #0f1923;
  background: transparent; font-family: inherit; width: 100%;
}
.search-box input::placeholder { color: #c0cad5; }
.clear-btn {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; display: flex; padding: 2px; border-radius: 4px; transition: color .2s;
}
.clear-btn:hover { color: #374151; }

.btn-add-food {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 16px;
  background: #3E9B92 ; color: #fff;
  border: none; border-radius: 11px;
  font-size: .86rem; font-weight: 600;
  cursor: pointer; font-family: inherit;
  white-space: nowrap;
}
.btn-add-food:hover { background: #357d76; transform: translateY(-1px);  transition: .2s; box-shadow: 0 3px 12px rgba(164, 163, 164, 0.3); }
.btn-add-food.small { padding: 7px 14px; font-size: .8rem; margin-top: 6px; }

/* ══════════════════════════════════════════════════════════
   TABLA
══════════════════════════════════════════════════════════ */
.table-wrapper {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  box-shadow: 0 1px 12px rgba(0,0,0,.04);
  overflow: hidden;
  animation: fadeUp .5s .1s ease both;
}

.table-scroll { overflow-x: auto; }

.food-table { width: 100%; border-collapse: collapse; white-space: nowrap; }

.food-table th {
  padding: 11px 14px;
  font-size: .63rem;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: .07em;
  text-align: left;
  border-bottom: 1px solid #f3f3f8;
  background: #fafafe;
}

.th-sticky {
  position: sticky; left: 0;
  background: #fafafe;
  z-index: 3;
  box-shadow: 2px 0 8px rgba(0,0,0,.04);
}

.th-actions { width: 60px; }

.food-row {
  transition: background .12s;
  animation: rowIn .3s ease var(--delay, 0ms) both;
}
.food-row:hover { background: #f1fbfa; }
.food-row:hover .row-acts { opacity: 1; }

.food-table td {
  padding: 12px 14px;
  font-size: .84rem;
  color: #374151;
  border-bottom: 1px solid #f7f7fb;
  vertical-align: middle;
}
.food-table tr:last-child td { border-bottom: none; }

.td-sticky {
  position: sticky; left: 0;
  background: #fff;
  z-index: 2;
  box-shadow: 2px 0 8px rgba(0,0,0,.04);
}
.food-row:hover .td-sticky { background: #f1fbfa; }

.td-name  { font-weight: 700; color: #0f1923; min-width: 160px; }
.td-unit  { color: #6b7280; }
.td-actions { text-align: right; }

.kcal-badge {
  display: inline-flex;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: .75rem;
  font-weight: 700;
  background: #d1fae5;
  color: #065f46;
}

.gl-badge {
  display: inline-flex;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: .75rem;
  font-weight: 700;
}
.gl-badge.low  { background: #d1fae5; color: #065f46; }
.gl-badge.mid  { background: #fef3c7; color: #92400e; }
.gl-badge.high { background: #fee2e2; color: #991b1b; }

.row-acts {
  display: flex; align-items: center; gap: 3px;
  justify-content: flex-end;
  opacity: 0; transition: opacity .2s;
}
.act-btn {
  width: 26px; height: 26px;
  border: none; background: none; cursor: pointer;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  color: #9ca3af; transition: .15s;
}
.act-btn:hover        { background: #e6f8f6; color: #3E9B92 ; }
.act-btn.danger:hover { background: #fff1f1; color: #ef4444; }

/* Empty */
.empty-cell { text-align: center; padding: 3rem !important; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #9ca3af; }
.empty-state span { font-size: 2rem; }
.empty-state p { font-size: .88rem; font-weight: 500; }

/* Paginación */
.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 5px; padding: 1rem;
  border-top: 1px solid #f3f3f8;
}
.pg-btn {
  min-width: 32px; height: 32px;
  border: 1.5px solid #e5e7eb; background: #fff;
  border-radius: 8px; font-size: .82rem; font-weight: 500;
  color: #374151; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit; transition: .2s;
}
.pg-btn:hover:not(:disabled):not(.active) { border-color: #3E9B92 ; color: #3E9B92 ; }
.pg-btn.active { background: #3E9B92 ; border-color: #3E9B92 ; color: #fff; font-weight: 700; }
.pg-btn:disabled { opacity: .4; cursor: not-allowed; }

/* No grupo */
.no-group {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px; color: #9ca3af; font-size: .9rem;
}
.no-group-icon { font-size: 3rem; }

/* ══════════════════════════════════════════════════════════
   MODALES
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
  width: 100%; max-width: 520px;
  box-shadow: 0 24px 60px rgba(0,0,0,.18);
  overflow: hidden;
}

.food-modal-card { max-width: 680px; max-height: 90vh; overflow-y: auto; }

.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.3rem 1.3rem 1rem;
  border-bottom: 1px solid #f3f3f8;
  position: sticky; top: 0; background: #fff; z-index: 2;
}.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,25,35,.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  background: #fff;
  border-radius: 22px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  box-shadow: 0 24px 60px rgba(0,0,0,.18);
  overflow: hidden;

  display: flex;
  flex-direction: column;
}

.food-modal-card {
  max-width: 680px;
}

/* Header fijo arriba */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.3rem 1.3rem 1rem;
  border-bottom: 1px solid #f3f3f8;
  background: #fff;
  flex-shrink: 0;
  z-index: 2;
}
.modal-title-group { display: flex; align-items: center; gap: 11px; }
.modal-icon-box {
  width: 40px; height: 40px; border-radius: 11px;
  background: #e6f8f6; color: #3E9B92 ;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.modal-title { font-size: 1rem; font-weight: 600; color: #0f1923; margin-bottom: 0;}
.modal-sub   { font-size: .78rem; color: #9ca3af; margin-top: 2px; }
.modal-close {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; padding: 4px; border-radius: 7px; display: flex; transition: .2s;
}
.modal-close:hover { color: #374151; background: #f3f4f6; }

.modal-body {
  padding: 1.3rem;
  overflow-y: auto;
  flex: 1;
}

/* Form sections */
.form-section-label {
  font-size: .68rem; font-weight: 700; color: #b0b8cc;
  letter-spacing: .1em; margin-bottom: .7rem; margin-top: 1rem;
}
.form-section-label:first-child { margin-top: 0; }

.form-grid { display: grid; gap: 12px; margin-bottom: .2rem; }
.cols3     { grid-template-columns: repeat(3, 1fr); }
.cols1     { grid-template-columns: 1fr; }

.ff { display: flex; flex-direction: column; gap: 5px; }
.ff.full-3 { grid-column: 1 / -1; }

.ff label { font-size: .75rem; font-weight: 600; color: #374151; letter-spacing: .02em; }
.ff input, .ff select {
  padding: 9px 11px;
  border: 1.5px solid #e5e7eb; border-radius: 9px;
  font-size: .86rem; color: #0f1923; background: #f9fafb;
  outline: none; font-family: inherit; transition: .2s;
}
.ff input:focus, .ff select:focus {
  border-color: #3E9B92 ; background: #fff;
  box-shadow: 0 0 0 3px rgba(142,115,168,.1);
}
.ff input.err { border-color: #ef4444; }
.ferr { font-size: .72rem; color: #ef4444; }


/* Modal footer */
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding-top: 1rem; border-top: 1px solid #f3f3f8; margin-top: .4rem;
}

.btn-sec {
  padding: 9px 18px;
  border: 1.5px solid #e5e7eb; background: #fff;
  border-radius: 9px; font-size: .86rem; font-weight: 600;
  color: #374151; cursor: pointer; font-family: inherit; transition: .2s;
}
.btn-sec:hover { border-color: #9ca3af; }

.btn-pri {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px; background: #3E9B92 ; color: #fff;
  border: none; border-radius: 9px; font-size: .86rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: .2s;
  box-shadow: 0 3px 10px rgba(142,115,168,.3);
}
.btn-pri:hover:not(:disabled) { background: #357d76; }
.btn-pri:disabled { opacity: .6; cursor: not-allowed; }

.btn-danger {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px; background: #ef4444; color: #fff;
  border: none; border-radius: 9px; font-size: .86rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: .2s;
}
.btn-danger:hover { background: #dc2626; }

/* Delete inline */
.del-icon {
  width: 54px; height: 54px; border-radius: 50%;
  background: #fff1f1; color: #ef4444;
  display: flex; align-items: center; justify-content: center; margin: 0 auto .8rem;
}
.del-title { font-size: 1rem; font-weight: 700; color: #0f1923; margin-bottom: 6px; }
.del-sub   { font-size: .83rem; color: #6b7280; line-height: 1.5; margin-bottom: 1rem; }

.spinner-sm {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .6s linear infinite; display: inline-block;
}

/* ── Transiciones ─────────────────────────────────────────── */
@keyframes fadeDown  { from { opacity:0; transform:translateY(-10px);  } to { opacity:1; transform:translateY(0); } }
@keyframes fadeUp    { from { opacity:0; transform:translateY(12px);   } to { opacity:1; transform:translateY(0); } }
@keyframes fadeRight { from { opacity:0; transform:translateX(-12px);  } to { opacity:1; transform:translateX(0); } }
@keyframes rowIn     { from { opacity:0; transform:translateY(6px);    } to { opacity:1; transform:translateY(0); } }
@keyframes spin      { to { transform:rotate(360deg); } }

.row-enter-active { animation: rowIn .25s ease; }
.row-leave-active { transition: opacity .15s; }
.row-leave-to     { opacity: 0; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s ease; }
.modal-fade-enter-from,   .modal-fade-leave-to     { opacity: 0; }

.modal-slide-enter-active { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease; }
.modal-slide-leave-active { transition: transform .2s ease, opacity .2s ease; }
.modal-slide-enter-from   { transform: scale(.92) translateY(14px); opacity: 0; }
.modal-slide-leave-to     { transform: scale(.96); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity .15s; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-opt {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: .15s;
}

.color-opt:hover {
  transform: translateY(-1px);
}

.color-opt.selected {
  border-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(15,25,35,.12);
}

.food-row.adjusted {
  background: #fffbeb;
}

.food-row.adjusted .td-sticky {
  background: #fffbeb;
}

.td-portion {
  min-width: 90px;
}

.portion-value {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: .84rem;
  color: #374151;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 6px;
}

.portion-value:hover {
  background: #e6f8f6;
  color: #3E9B92 ;
}

.portion-input {
  width: 72px;
  padding: 5px 7px;
  border: 1.5px solid #f59e0b;
  border-radius: 7px;
  font-size: .8rem;
  outline: none;
  background: #fff;
}

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 900px) {
  .food-page { flex-direction: column; }
  .groups-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; border-right: none; border-bottom: 1px solid #f0f0f5; padding: .6rem; }
  .groups-list { flex-direction: row; flex-wrap: wrap; }
  .groups-header { width: 100%; }
  .cols3 { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 580px) {
  .food-main { padding: 1rem; }
  .food-header { flex-direction: column; align-items: flex-start; }
  .food-header-right { width: 100%; }
  .search-box { flex: 1; min-width: unset; }
  .cols3 { grid-template-columns: 1fr; }
}

</style>