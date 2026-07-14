<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-overlay" @click.self="handleClose">
      <Transition name="modal-slide">
        <div v-if="open" class="modal-card quick-dish-edit-modal">
          <div class="modal-header">
            <div class="modal-title-group">
              <div class="modal-icon-box"><Pencil :size="18" /></div>
              <div>
                <h2 class="modal-title">Editar platillo rápido</h2>
                <p class="modal-sub">Modifica el nombre o los ingredientes</p>
              </div>
            </div>
            <button class="modal-close" @click="handleClose"><X :size="18" /></button>
          </div>

          <div class="modal-body">
            <div class="quick-dish-step">

              <div class="quick-dish-name">
                <label>Nombre del platillo</label>
                <input
                  v-model="localName"
                  type="text"
                  placeholder="Ingresa el nombre del platillo..."
                />
              </div>

              <div class="picker-search">
                <Search :size="15" class="ps-ico" />
                <input
                  v-model="searchText"
                  type="text"
                  placeholder="Buscar ingrediente guardado..."
                />
              </div>

              <div class="quick-food-results">
                <button
                  v-for="food in filteredFoods"
                  :key="food.id"
                  class="quick-food-option"
                  @click="addIngredient(food)"
                >
                  <div>
                    <strong>{{ food.name }}</strong>
                    <span>{{ food.quantity }} {{ food.unit }} · {{ food.energyKcal }} kcal</span>
                  </div>
                  <Plus :size="14" />
                </button>
              </div>

              <div class="quick-ingredients-box">
                <div class="quick-ingredients-head">
                  <span>Ingredientes agregados</span>
                  <small>{{ localIngredients.length }}</small>
                </div>

                <div v-if="!localIngredients.length" class="quick-empty">
                  <Inbox :size="18" />
                  <p>Agrega ingredientes desde tus alimentos guardados.</p>
                </div>

                <div
                  v-for="(item, index) in localIngredients"
                  :key="item.food.id"
                  class="quick-ingredient-row"
                >
                  <div class="quick-ing-info">
                    <strong>{{ item.food.name }}</strong>
                    <span>{{ item.food.unit }}</span>
                  </div>

                  <input
                    v-model="item.quantityText"
                    type="text"
                    inputmode="decimal"
                    placeholder="1/2"
                    class="quick-ing-qty"
                  />

                  <button class="quick-remove" @click="removeIngredient(index)">
                    <X :size="13" />
                  </button>
                </div>
              </div>

              <div class="qs-preview quick-preview">
                ≈ {{ Math.round(totals.calories) }} kcal ·
                P {{ totals.protein.toFixed(1) }}g ·
                C {{ totals.carbs.toFixed(1) }}g ·
                G {{ totals.fat.toFixed(1) }}g
              </div>
            </div>
          </div>

          <div class="modal-footer quick-edit-footer">
            <button class="btn-danger" @click="handleDelete">
              <Trash2 :size="14" /> Eliminar platillo
            </button>

            <div class="footer-right-actions">
              <button class="btn-secondary" @click="handleClose">Cancelar</button>
              <button class="btn-primary" @click="handleSave" :disabled="!canSave">
                <Check :size="14" /> Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X, Search, Plus, Inbox, Check, Trash2, Pencil } from 'lucide-vue-next'

/* ─────────────────────────────────────────────────────────
   TIPOS (idealmente muévelos a un archivo compartido,
   p. ej. @/types/mealPlan.ts, e impórtalos aquí y en la
   página principal para no duplicarlos)
───────────────────────────────────────────────────────── */
interface FoodItem {
  id: string
  group: string
  name: string
  quantity: number
  unit: string
  weightG: number
  energyKcal: number
  proteinG: number
  carbsG: number
  lipidsG: number
}

interface QuickDishIngredient {
  food: FoodItem
  quantityText: string
}

const props = defineProps<{
  open: boolean
  name: string
  ingredients: QuickDishIngredient[]
  allFoods: FoodItem[]
}>()

const emit = defineEmits<{
  close: []
  save: [payload: { name: string; ingredients: QuickDishIngredient[] }]
  delete: []
}>()

/* ─────────────────────────────────────────────────────────
   ESTADO LOCAL (copia editable, no se toca al padre
   hasta que se confirme "Guardar cambios")
───────────────────────────────────────────────────────── */
const localName = ref('')
const localIngredients = ref<QuickDishIngredient[]>([])
const searchText = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    localName.value = props.name
    localIngredients.value = props.ingredients.map((item) => ({
      food: { ...item.food },
      quantityText: item.quantityText,
    }))
    searchText.value = ''
  },
  { immediate: true },
)

/* ─────────────────────────────────────────────────────────
   BÚSQUEDA DE INGREDIENTES
───────────────────────────────────────────────────────── */
const filteredFoods = computed(() => {
  const query = searchText.value.toLowerCase().trim()

  if (!query) return props.allFoods.slice(0, 8)

  return props.allFoods
    .filter((food) => food.name.toLowerCase().includes(query))
    .slice(0, 8)
})

function addIngredient(food: FoodItem) {
  const existing = localIngredients.value.find((item) => item.food.id === food.id)

  if (existing) {
    const currentQty = parseQuantityInput(existing.quantityText)
    existing.quantityText = String(Number((currentQty + 1).toFixed(2)))
    return
  }

  localIngredients.value.push({ food, quantityText: '1' })
}

function removeIngredient(index: number) {
  localIngredients.value.splice(index, 1)
}

function parseQuantityInput(value: string) {
  const cleanValue = value.trim().replace(',', '.')

  if (!cleanValue) return 0

  if (cleanValue.includes('/')) {
    const [top, bottom] = cleanValue.split('/')
    const numerator = Number(top)
    const denominator = Number(bottom)

    if (!numerator || !denominator) return 0

    return numerator / denominator
  }

  const numberValue = Number(cleanValue)
  return Number.isFinite(numberValue) ? numberValue : 0
}

/* ─────────────────────────────────────────────────────────
   TOTALES Y ACCIONES
───────────────────────────────────────────────────────── */
const totals = computed(() => {
  return localIngredients.value.reduce(
    (acc, item) => {
      const qty = parseQuantityInput(item.quantityText)

      acc.calories += item.food.energyKcal * qty
      acc.protein += item.food.proteinG * qty
      acc.carbs += item.food.carbsG * qty
      acc.fat += item.food.lipidsG * qty

      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
})

const canSave = computed(() => {
  return localName.value.trim().length > 0 && localIngredients.value.length > 0
})

function handleSave() {
  if (!canSave.value) return

  emit('save', {
    name: localName.value.trim(),
    ingredients: localIngredients.value.map((item) => ({
      food: item.food,
      quantityText: item.quantityText,
    })),
  })
}

function handleClose() {
  emit('close')
}

function handleDelete() {
  emit('delete')
}
</script>

<style scoped>
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
.picker-modal { max-height: 85vh; display: flex; flex-direction: column; }

.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.3rem 1.3rem 1rem;
  border-bottom: 1px solid #f3f3f8;
  flex-shrink: 0;
}
.modal-title-group { display: flex; align-items: center; gap: 11px; }
.modal-icon-box {
  width: 40px; height: 40px; border-radius: 11px;
  background: #e6f8f6; color: #3E9B92;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.modal-title { font-size: 1rem; font-weight: 700; color: #0f1923; }
.modal-sub   { font-size: .78rem; color: #9ca3af; margin-top: 2px; }
.modal-close {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; padding: 4px; border-radius: 7px; display: flex; transition: .2s;
}
.modal-close:hover { color: #374151; background: #f3f4f6; }

.modal-body { padding: 1.2rem 1.3rem; overflow-y: auto; }

.quick-dish-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 10px;
}


.quick-dish-name label {
  display: block;
  color: #667085;
  font-size: .78rem;
  font-weight: 800;
  margin-bottom: .4rem;
}

.quick-dish-name input {
  width: 95%;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  padding: .82rem .9rem;
  background: #f9fafb;
  color: #0f1923;
  outline: none;
  font-family: inherit;
  margin-bottom: 10px;
}

.quick-dish-name input:focus {
  background: #fff;
  border-color: #3E9B92;
  box-shadow: 0 0 0 4px rgba(62, 155, 146, .12);
}

.quick-food-results {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .55rem;
  max-height: 170px;
  overflow-y: auto;
}

.quick-food-option {
  border: 1.5px solid #eef0f4;
  background: #fff;
  border-radius: 14px;
  padding: .75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .7rem;
  cursor: pointer;
  transition: .2s ease;
  text-align: left;
}

.quick-food-option:hover {
  border-color: #3E9B92;
  background: #f4fbfa;
}

.quick-food-option strong {
  display: block;
  color: #0f1923;
  font-size: .82rem;
  font-weight: 600;
}

.quick-food-option span {
  display: block;
  color: #8a98a8;
  font-size: .72rem;
  margin-top: .2rem;
}

.quick-ingredients-box {
  border: 1.5px solid #eef0f4;
  border-radius: 16px;
  background: #fcfcfd;
  overflow: hidden;
}

.quick-ingredients-head {
  padding: .75rem .9rem;
  border-bottom: 1px solid #eef0f4;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-ingredients-head span {
  font-size: .78rem;
  font-weight: 700;
  color: #0f1923;
}

.quick-ingredients-head small {
  color: #98a2b3;
  font-weight: 700;
}

.quick-empty {
  padding: 1.2rem;
  text-align: center;
  color: #98a2b3;
  display: grid;
  place-items: center;
  gap: .35rem;
}

.quick-empty p {
  font-size: .78rem;
}

.quick-ingredient-row {
  padding: .7rem .9rem;
  display: grid;
  grid-template-columns: 1fr 82px 32px;
  gap: .6rem;
  align-items: center;
  border-top: 1px solid #eef0f4;
}

.quick-ing-info strong {
  color: #0f1923;
  font-size: .82rem;
  font-weight: 600;
  display: block;
}

.quick-ing-info span {
  color: #8a98a8;
  font-size: .72rem;
}

.quick-ing-qty {
  width: 100%;
  border: 1.5px solid #e5e7eb;
  border-radius: 11px;
  padding: .45rem;
  text-align: center;
  font-weight: 600;
  outline: none;
}

.quick-ing-qty:focus {
  border-color: #3E9B92;
  box-shadow: 0 0 0 3px rgba(62, 155, 146, .1);
}

.quick-remove {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 10px;
  background: #fff1f2;
  color: #e11d48;
  display: grid;
  place-items: center;
  cursor: pointer;
  margin-left: 10px;
}

.quick-preview {
  background: #f4fbfa;
  border: 1px solid #dcefed;
}.quick-dish-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 10px;
}


.quick-dish-name label {
  display: block;
  color: #667085;
  font-size: .78rem;
  font-weight: 800;
  margin-bottom: .4rem;
}

.quick-dish-name input {
  width: 95%;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  padding: .82rem .9rem;
  background: #f9fafb;
  color: #0f1923;
  outline: none;
  font-family: inherit;
  margin-bottom: 10px;
}

.quick-dish-name input:focus {
  background: #fff;
  border-color: #3E9B92;
  box-shadow: 0 0 0 4px rgba(62, 155, 146, .12);
}

.quick-food-results {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .55rem;
  max-height: 170px;
  overflow-y: auto;
}

.quick-food-option {
  border: 1.5px solid #eef0f4;
  background: #fff;
  border-radius: 14px;
  padding: .75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .7rem;
  cursor: pointer;
  transition: .2s ease;
  text-align: left;
}

.quick-food-option:hover {
  border-color: #3E9B92;
  background: #f4fbfa;
}

.quick-food-option strong {
  display: block;
  color: #0f1923;
  font-size: .82rem;
  font-weight: 600;
}

.quick-food-option span {
  display: block;
  color: #8a98a8;
  font-size: .72rem;
  margin-top: .2rem;
}

.quick-ingredients-box {
  border: 1.5px solid #eef0f4;
  border-radius: 16px;
  background: #fcfcfd;
  overflow: hidden;
}

.quick-ingredients-head {
  padding: .75rem .9rem;
  border-bottom: 1px solid #eef0f4;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-ingredients-head span {
  font-size: .78rem;
  font-weight: 700;
  color: #0f1923;
}

.quick-ingredients-head small {
  color: #98a2b3;
  font-weight: 700;
}

.quick-empty {
  padding: 1.2rem;
  text-align: center;
  color: #98a2b3;
  display: grid;
  place-items: center;
  gap: .35rem;
}

.quick-empty p {
  font-size: .78rem;
}

.quick-ingredient-row {
  padding: .7rem .9rem;
  display: grid;
  grid-template-columns: 1fr 82px 32px;
  gap: .6rem;
  align-items: center;
  border-top: 1px solid #eef0f4;
}

.quick-ing-info strong {
  color: #0f1923;
  font-size: .82rem;
  font-weight: 600;
  display: block;
}

.quick-ing-info span {
  color: #8a98a8;
  font-size: .72rem;
}

.quick-ing-qty {
  width: 100%;
  border: 1.5px solid #e5e7eb;
  border-radius: 11px;
  padding: .45rem;
  text-align: center;
  font-weight: 600;
  outline: none;
}

.quick-ing-qty:focus {
  border-color: #3E9B92;
  box-shadow: 0 0 0 3px rgba(62, 155, 146, .1);
}

.quick-remove {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 10px;
  background: #fff1f2;
  color: #e11d48;
  display: grid;
  place-items: center;
  cursor: pointer;
  margin-left: 10px;
}

.quick-preview {
  background: #f4fbfa;
  border: 1px solid #dcefed;
}

.picker-search {
  display: flex; align-items: center; gap: 9px;
  border: 1.5px solid #e5e7eb;
  border-radius: 11px;
  padding: 10px 13px;
  margin-bottom: .9rem;
  transition: .2s;
}
.picker-search:focus-within { border-color: #3E9B92; box-shadow: 0 0 0 3px rgba(142,115,168,.1); }
.ps-ico { color: #9ca3af; flex-shrink: 0; }
.picker-search input { flex: 1; border: none; outline: none; font-size: .87rem; font-family: inherit; background: transparent; }

.picker-search:focus-within { border-color: #3E9B92; box-shadow: 0 0 0 3px rgba(142,115,168,.1); }
.ps-ico { color: #9ca3af; flex-shrink: 0; }
.picker-search input { flex: 1; border: none; outline: none; font-size: .87rem; font-family: inherit; background: transparent; }

.picker-groups { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 1rem; }
.pg-pill {
  padding: 6px 13px;
  border: 1.5px solid #e5e7eb;
  background: #fff; border-radius: 20px;
  font-size: .78rem; font-weight: 600; color: #6b7280;
  cursor: pointer; font-family: inherit; transition: .15s;
}
.pg-pill:hover { border-color: #3E9B92; color: #3E9B92; }
.pg-pill.active { background: #3E9B92; border-color: #3E9B92; color: #fff; }

.picker-results { display: flex; flex-direction: column; gap: 6px; max-height: 280px; overflow-y: auto; }

.picker-food-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #f3f3f8;
  background: #fafafa;
  border-radius: 11px;
  cursor: pointer;
  font-family: inherit;
  transition: .15s;
  text-align: left;
}
.picker-food-item:hover { background: #f0fdfb; border-color: #dbfaf6; }

.pf-info { flex: 1; display: flex; flex-direction: column; }
.pf-name { font-size: .87rem; font-weight: 600; color: #0f1923; }
.pf-qty  { font-size: .74rem; color: #9ca3af; margin-top: 1px; }
.pf-kcal { font-size: .78rem; font-weight: 700; color: #16a34a; flex-shrink: 0; }
.pf-arrow { color: #c0c5d0; flex-shrink: 0; }

.picker-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 2rem; color: #b0b8cc;
}
.picker-empty p { font-size: .85rem; }

/* Quantity step */
.quantity-step {
  margin-top: 1rem;
  padding: 1rem;
  background: #f1fbfa;
  border: 1px solid #e6f8f6;
  border-radius: 13px;
}
.qs-food-name { font-size: .92rem; font-weight: 700; color: #0f1923; margin-bottom: .7rem; }
.qs-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: .7rem; }
.ff { display: flex; flex-direction: column; gap: 4px; }
.ff label { font-size: .73rem; font-weight: 600; color: #6b7280; }
.ff input {
  padding: 8px 11px;
  border: 1.5px solid #e5e7eb; border-radius: 9px;
  font-size: .85rem; color: #0f1923; background: #fff;
  outline: none; font-family: inherit; transition: .2s;
}
.ff input:focus { border-color: #3E9B92; box-shadow: 0 0 0 3px rgba(142,115,168,.1); }
.ff input:disabled { background: #f3f4f6; color: #9ca3af; }

.qs-preview { font-size: .78rem; color: #6b7280; margin-bottom: .8rem; line-height: 1.5; }

.qs-actions { display: flex; justify-content: flex-end; gap: 9px; }
.btn-secondary {
  padding: 8px 16px;
  border: 1.5px solid #e5e7eb; background: #fff;
  border-radius: 9px; font-size: .82rem; font-weight: 600;
  color: #374151; cursor: pointer; font-family: inherit; transition: .2s;
}
.btn-secondary:hover { border-color: #a5a5a5; background: #ffffff; color: #a5a5a5; }



.btn-primary {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; background: #3E9B92; color: #fff;
  border: none; border-radius: 9px; font-size: .82rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: .2s;
}
.btn-primary:hover { background: #357d76; }

.spinner-sm {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .6s linear infinite; display: inline-block;
}

.plan-detail-modal .modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 1rem 1.3rem;
  border-top: 1px solid #f3f3f8;
  background: #fff;
  flex-shrink: 0;
}

.plan-detail-modal .btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 18px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  border-radius: 10px;
  font-size: .86rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
}

.plan-detail-modal .btn-secondary:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.plan-detail-modal .btn-save {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 20px;
  background: #3E9B92;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: .86rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
  box-shadow: 0 4px 14px rgba(22,163,74,.25);
}

.plan-detail-modal .btn-save:hover:not(:disabled) {
  background: #357d76;
  transform: translateY(-1px);
}

.plan-detail-modal .btn-save:disabled {
  opacity: .65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 18px;
  border: none;
  border-radius: 11px;
  background: #e11d48;
  color: #fff;
  font-family: inherit;
  font-size: .86rem;
  font-weight: 750;
  cursor: pointer;
  transition: .2s ease;
}

.btn-danger:hover {
  background: #be123c;
  transform: translateY(-1px);
}

.quick-dish-edit-modal {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  width: 100%;
  max-width: 520px;
}

.quick-dish-edit-modal .modal-header,
.quick-dish-edit-modal .modal-footer {
  flex-shrink: 0;
}

.quick-dish-edit-modal .modal-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* clave: sin esto flexbox no deja que el hijo haga scroll */
}

.quick-edit-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.footer-right-actions {
  display: flex;
  gap: 0.6rem;
}
</style>