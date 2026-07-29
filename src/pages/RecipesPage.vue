<template>
  <div class="recipes-page" :class="{ visible: mounted }">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Recetas</h1>
        <p class="page-subtitle">{{ filteredRecipes.length }} recetas en tu biblioteca</p>
      </div>
      <button class="btn-new" @click="openRecipeModal()">
        <Plus :size="18" :stroke-width="2.5" /> Nueva receta
      </button>
    </div>
    <p v-if="pageError" class="page-error">
  {{ pageError }}
</p>

    <!-- ── Toolbar ─────────────────────────────────────────── -->
    <div class="toolbar">
      <div class="search-box" :class="{ focused: searchFocused }">
        <Search :size="15" class="search-ico" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar recetas..."
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
        <Transition name="fade">
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''"><X :size="13" /></button>
        </Transition>
      </div>

      <div class="category-pills">
        <button
          v-for="cat in categories"
          :key="cat"
          class="pill"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >{{ cat }}</button>
      </div>
    </div>

    <!-- ── Grid de recetas ─────────────────────────────────── -->
    <TransitionGroup name="card" tag="div" class="recipes-grid">
      <div
        v-for="(recipe, i) in filteredRecipes"
        :key="recipe.id"
        class="recipe-card"
        :style="{ '--delay': `${i * 50}ms` }"
        @click="openDetailModal(recipe)"
      >
        <div class="recipe-image-wrap">
          <img v-if="recipe.image" :src="recipe.image" :alt="recipe.name" class="recipe-image" />
          <div v-else class="recipe-image-placeholder">{{ recipe.emoji }}</div>

          <div class="recipe-tags">
            <span v-for="tag in recipe.tags.slice(0,2)" :key="tag" class="recipe-tag">{{ tag }}</span>
          </div>

          <div class="recipe-quick-actions" @click.stop>
            <button class="qa-btn" @click="openRecipeModal(recipe)" title="Editar"><Pencil :size="14" /></button>
            <button class="qa-btn danger" @click="askDelete(recipe)" title="Eliminar"><Trash2 :size="14" /></button>
          </div>
        </div>

        <div class="recipe-body">
          <div class="recipe-title-row">
            <div>
              <h3 class="recipe-name">{{ recipe.name }}</h3>
              <p class="recipe-category">{{ recipe.category }}</p>
            </div>
            <ChevronRight :size="18" class="recipe-arrow" />
          </div>

          <div class="recipe-meta">
            <span class="meta-item"><Clock :size="13" /> {{ recipe.time }} min</span>
            <span class="meta-item"><Users :size="13" /> {{ recipe.servings }} porción{{ recipe.servings > 1 ? 'es' : '' }}</span>
            <span class="meta-item kcal"><Flame :size="13" /> {{ recipe.calories }} kcal</span>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- Empty state -->
    <div v-if="filteredRecipes.length === 0" class="empty-recipes">
      <span class="empty-icon">🍽️</span>
      <p class="empty-title">Sin recetas</p>
      <p class="empty-sub">Intenta con otra búsqueda o categoría.</p>
      <button class="btn-new" @click="openRecipeModal()"><Plus :size="16" /> Crear receta</button>
    </div>

    <!-- ══════════════════════════════════════════════════════
         MODAL DETALLE
    ═══════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="detailModal.open" class="modal-overlay" @click.self="detailModal.open = false">
        <Transition name="modal-slide">
          <div v-if="detailModal.open && detailModal.recipe" class="modal-card detail-modal">

            <div class="detail-hero">
              <img v-if="detailModal.recipe.image" :src="detailModal.recipe.image" :alt="detailModal.recipe.name" />
              <div v-else class="detail-hero-placeholder">{{ detailModal.recipe.emoji }}</div>
              <button class="detail-close" @click="detailModal.open = false"><X :size="18" /></button>
              <div class="detail-hero-tags">
                <span v-for="t in detailModal.recipe.tags" :key="t" class="recipe-tag">{{ t }}</span>
              </div>
            </div>

            <div class="detail-content">
              <h2 class="detail-name">{{ detailModal.recipe.name }}</h2>
              <div class="detail-meta">
                <span class="meta-item"><Clock :size="14" /> {{ detailModal.recipe.time }} min</span>
                <span class="meta-item"><Users :size="14" /> {{ detailModal.recipe.servings }} porción{{ detailModal.recipe.servings > 1 ? 'es' : '' }}</span>
                <span class="meta-item kcal"><Flame :size="14" /> {{ detailModal.recipe.calories }} kcal</span>
              </div>

              <!-- Macros -->
              <div class="macro-row">
                <div class="macro-box">
                  <span class="macro-val protein">{{ detailModal.recipe.protein }}g</span>
                  <span class="macro-lbl">Proteína</span>
                </div>
                <div class="macro-box">
                  <span class="macro-val carbs">{{ detailModal.recipe.carbs }}g</span>
                  <span class="macro-lbl">Carbohidratos</span>
                </div>
                <div class="macro-box">
                  <span class="macro-val fat">{{ detailModal.recipe.fat }}g</span>
                  <span class="macro-lbl">Grasa</span>
                </div>
              </div>

              <div class="detail-grid">
                <!-- Ingredientes -->
                <div>
                  <h3 class="detail-section-title">Ingredientes</h3>
                  <ul class="ingredients-list">
                    <li v-for="(ing, i) in detailModal.recipe.ingredients" :key="i">
                      <span class="dot-bullet" /> {{ ing }}
                    </li>
                  </ul>
                </div>

                <!-- Preparación -->
                <div>
                  <h3 class="detail-section-title">Preparación</h3>
                  <ol class="steps-list">
                    <li v-for="(step, i) in detailModal.recipe.steps" :key="i">
                      <span class="step-num">{{ i + 1 }}</span>
                      <span>{{ step }}</span>
                    </li>
                  </ol>
                </div>
              </div>

              <div class="detail-footer">
                <button class="btn-secondary" @click="detailModal.open = false">Cerrar</button>
                <button class="btn-primary" @click="openRecipeModal(detailModal.recipe!)">
                  <Pencil :size="15" /> Editar receta
                </button>
              </div>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════════════
         MODAL CREAR / EDITAR
    ═══════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="formModal.open" class="modal-overlay" @click.self="formModal.open = false">
        <Transition name="modal-slide">
          <div v-if="formModal.open" class="modal-card form-modal">

            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon-box"><ChefHat :size="19" /></div>
                <div>
                  <h2 class="modal-title">{{ formModal.recipe ? 'Editar receta' : 'Nueva receta' }}</h2>
                  <p class="modal-sub">Completa la información de la receta</p>
                </div>
              </div>
              <button class="modal-close" @click="formModal.open = false"><X :size="18" /></button>
            </div>

            <div class="modal-body">
              <form @submit.prevent="saveRecipe" novalidate>

                <!-- Imagen -->
                <div class="image-upload" :class="{ filled: rf.image }" @click="triggerFileInput">
                  <img v-if="rf.image" :src="rf.image" class="image-preview" />
                  <div v-else class="image-placeholder">
                    <ImagePlus :size="22" />
                    <span>Subir imagen (opcional)</span>
                  </div>
                  <button v-if="rf.image" type="button" class="remove-image" @click.stop="rf.image = ''">
                    <X :size="13" />
                  </button>
                  <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="handleImageUpload" />
                </div>
                <p class="image-hint">O pega una URL de imagen:</p>
                <input v-model="rf.image" type="text" placeholder="https://..." class="image-url-input" />

                <!-- Datos básicos -->
                <div class="form-grid cols2">
                  <div class="ff full">
                    <label>Nombre de la receta *</label>
                    <input v-model="rf.name" type="text" placeholder="Ej. Bowl de quinoa y vegetales" :class="{ err: re.name }" />
                    <span v-if="re.name" class="ferr">{{ re.name }}</span>
                  </div>
                  <div class="ff">
                    <label>Categoría *</label>
                    <select v-model="rf.category">
                      <option v-for="c in categories.filter(c=>c!=='Todas')" :key="c" :value="c">{{ c }}</option>
                    </select>
                  </div>
                  <div class="ff">
                    <label>Emoji (si no hay imagen)</label>
                    <div class="emoji-picker">
                      <button v-for="e in emojiOptions" :key="e" type="button"
                        class="emoji-opt" :class="{ selected: rf.emoji === e }" @click="rf.emoji = e">{{ e }}</button>
                    </div>
                  </div>
                  <div class="ff">
                    <label>Tiempo (min) *</label>
                    <input v-model.number="rf.time" type="number" min="1" placeholder="15" :class="{ err: re.time }" />
                    <span v-if="re.time" class="ferr">{{ re.time }}</span>
                  </div>
                  <div class="ff">
                    <label>Porciones *</label>
                    <input v-model.number="rf.servings" type="number" min="1" placeholder="1" :class="{ err: re.servings }" />
                    <span v-if="re.servings" class="ferr">{{ re.servings }}</span>
                  </div>
                  <div class="ff">
                    <label>Calorías (kcal)</label>
                    <input v-model.number="rf.calories" type="number" min="0" placeholder="285" />
                  </div>
                  <div class="ff">
                    <label>Proteína (g)</label>
                    <input v-model.number="rf.protein" type="number" min="0" placeholder="22" />
                  </div>
                  <div class="ff">
                    <label>Carbohidratos (g)</label>
                    <input v-model.number="rf.carbs" type="number" min="0" placeholder="38" />
                  </div>
                  <div class="ff">
                    <label>Grasa (g)</label>
                    <input v-model.number="rf.fat" type="number" min="0" placeholder="5" />
                  </div>
                </div>

                <!-- Tags -->
                <p class="form-section-label">Etiquetas</p>
                <div class="tags-input-wrap">
                  <span v-for="(tag, i) in rf.tags" :key="tag" class="tag-chip">
                    {{ tag }}
                    <button type="button" @click="rf.tags.splice(i, 1)"><X :size="11" /></button>
                  </span>
                  <input
                    v-model="tagInput"
                    type="text"
                    placeholder="Escribe y presiona Enter..."
                    class="tag-input"
                    @keydown.enter.prevent="addTag"
                    @keydown.tab.prevent="addTag"
                  />
                </div>
                <div class="tag-suggestions">
                  <button
                    v-for="s in suggestedTags" :key="s" type="button"
                    class="tag-suggestion" @click="addSuggestedTag(s)"
                  >+ {{ s }}</button>
                </div>

                <!-- Ingredientes -->
                <p class="form-section-label">Ingredientes</p>
                <div class="dynamic-list">
                  <div v-for="(ing, i) in rf.ingredients" :key="i" class="dynamic-row">
                    <span class="dyn-dot" />
                    <input v-model="rf.ingredients[i]" type="text" placeholder="Ej. ¾ taza de yogurt griego (0%)" />
                    <button type="button" class="dyn-remove" @click="rf.ingredients.splice(i, 1)">
                      <Trash2 :size="13" />
                    </button>
                  </div>
                </div>
                <button type="button" class="btn-add-line" @click="rf.ingredients.push('')">
                  <Plus :size="14" /> Agregar ingrediente
                </button>
                <span v-if="re.ingredients" class="ferr">{{ re.ingredients }}</span>

                <!-- Preparación -->
                <p class="form-section-label">Método de preparación</p>
                <div class="dynamic-list">
                  <div v-for="(step, i) in rf.steps" :key="i" class="dynamic-row">
                    <span class="dyn-step-num">{{ i + 1 }}</span>
                    <textarea v-model="rf.steps[i]" rows="1" placeholder="Describe este paso..." />
                    <button type="button" class="dyn-remove" @click="rf.steps.splice(i, 1)">
                      <Trash2 :size="13" />
                    </button>
                  </div>
                </div>
                <button type="button" class="btn-add-line" @click="rf.steps.push('')">
                  <Plus :size="14" /> Agregar paso
                </button>
                <span v-if="re.steps" class="ferr">{{ re.steps }}</span>

                <div class="modal-footer">
                  <button type="button" class="btn-secondary" @click="formModal.open = false">Cancelar</button>
                  <button type="submit" class="btn-primary" :disabled="saving">
                    <span v-if="saving" class="spinner-sm" />
                    <Check v-else :size="15" />
                    {{ formModal.recipe ? 'Guardar cambios' : 'Crear receta' }}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════════════
         MODAL ELIMINAR
    ═══════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="deleteModal.open" class="modal-overlay" @click.self="deleteModal.open = false">
        <div class="modal-card delete-modal">
          <div class="delete-icon-wrap"><Trash2 :size="26" /></div>
          <h3 class="delete-title">¿Eliminar receta?</h3>
          <p class="delete-sub">
            Se eliminará <strong>{{ deleteModal.recipe?.name }}</strong> de tu biblioteca de forma permanente.
          </p>
          <div class="modal-footer centered">
            <button class="btn-secondary" @click="deleteModal.open = false">Cancelar</button>
            <button class="btn-danger" @click="deleteRecipe"><Trash2 :size="14" /> Eliminar</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast.store'
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Check,
  ChevronRight,
  Clock,
  Users,
  Flame,
  ChefHat,
  ImagePlus,
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

/* ─────────────────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────────────────── */
interface RecipeRow {
  id: string
  user_id: string
  name: string
  image_url: string | null
  preparation_method: string | null
  tags: string[] | null

  category: string | null
  emoji: string | null
  prep_time_min: number | null
  servings: number | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null

  created_at: string
  updated_at: string
}

interface IngredientRow {
  id: string
  recipe_id: string
  name: string
  created_at: string
  updated_at: string
}

interface Recipe {
  id: string
  name: string
  category: string
  emoji: string
  image: string
  time: number
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  tags: string[]
  ingredients: string[]
  steps: string[]
}

/* ─────────────────────────────────────────────────────────
   STORE
───────────────────────────────────────────────────────── */
const auth = useAuthStore()

/* ─────────────────────────────────────────────────────────
   ESTADO GENERAL
───────────────────────────────────────────────────────── */
const mounted = ref(false)
const searchQuery = ref('')
const searchFocused = ref(false)
const activeCategory = ref('Todas')
const saving = ref(false)
const loading = ref(false)
const pageError = ref('')

const recipes = ref<Recipe[]>([])

const categories = ['Todas', 'Desayuno', 'Comida', 'Cena', 'Snacks', 'Smoothies', 'Ensaladas']
const emojiOptions = ['🥗', '🍲', '🥙', '🍛', '🍱', '🥞', '🍳', '🥤', '🍝', '🥘', '🍜', '🥪', '🍤', '🍣']

const toast = useToastStore()

async function ensureUser() {
  if (!auth.user) {
    await auth.loadUser()
  }

  return auth.user
}

/* ─────────────────────────────────────────────────────────
   MAPEO
───────────────────────────────────────────────────────── */
function splitSteps(value: string | null) {
  if (!value) return []

  return value
    .split('\n')
    .map((step) => step.trim())
    .filter(Boolean)
}

function mapRecipe(row: RecipeRow, ingredients: IngredientRow[]): Recipe {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? 'Comida',
    emoji: row.emoji ?? '🥗',
    image: row.image_url ?? '',
    time: Number(row.prep_time_min ?? 0),
    servings: Number(row.servings ?? 1),
    calories: Number(row.calories ?? 0),
    protein: Number(row.protein_g ?? 0),
    carbs: Number(row.carbs_g ?? 0),
    fat: Number(row.fat_g ?? 0),
    tags: row.tags ?? [],
    ingredients: ingredients
      .filter((ingredient) => ingredient.recipe_id === row.id)
      .map((ingredient) => ingredient.name),
    steps: splitSteps(row.preparation_method),
  }
}

/* ─────────────────────────────────────────────────────────
   CARGAR RECETAS
───────────────────────────────────────────────────────── */
async function loadRecipes() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  loading.value = true
  pageError.value = ''

  const { data: recipesData, error: recipesError } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (recipesError) {
    loading.value = false
    pageError.value = recipesError.message
    return
  }

  const recipeIds = (recipesData ?? []).map((recipe) => recipe.id)

  let ingredientsData: IngredientRow[] = []

  if (recipeIds.length > 0) {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .in('recipe_id', recipeIds)
      .order('created_at', { ascending: true })

    if (error) {
      loading.value = false
      pageError.value = error.message
      return
    }

    ingredientsData = (data ?? []) as IngredientRow[]
  }

  recipes.value = ((recipesData ?? []) as RecipeRow[]).map((recipe) =>
    mapRecipe(recipe, ingredientsData),
  )

  loading.value = false
}

/* ─────────────────────────────────────────────────────────
   FILTRADO
───────────────────────────────────────────────────────── */
const filteredRecipes = computed(() => {
  let list = recipes.value

  if (activeCategory.value !== 'Todas') {
    list = list.filter((recipe) => recipe.category === activeCategory.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()

    list = list.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  return list
})

/* ─────────────────────────────────────────────────────────
   MODAL DETALLE
───────────────────────────────────────────────────────── */
const detailModal = reactive<{
  open: boolean
  recipe: Recipe | null
}>({
  open: false,
  recipe: null,
})

function openDetailModal(recipe: Recipe) {
  detailModal.recipe = recipe
  detailModal.open = true
}

/* ─────────────────────────────────────────────────────────
   MODAL FORMULARIO
───────────────────────────────────────────────────────── */
const formModal = reactive<{
  open: boolean
  recipe: Recipe | null
}>({
  open: false,
  recipe: null,
})

const fileInput = ref<HTMLInputElement | null>(null)
const tagInput = ref('')

const EMPTY_RF = () => ({
  name: '',
  category: 'Desayuno',
  emoji: '🥗',
  image: '',
  time: null as number | null,
  servings: 1,
  calories: null as number | null,
  protein: null as number | null,
  carbs: null as number | null,
  fat: null as number | null,
  tags: [] as string[],
  ingredients: [''] as string[],
  steps: [''] as string[],
})

const rf = reactive(EMPTY_RF())

const re = reactive({
  name: '',
  time: '',
  servings: '',
  ingredients: '',
  steps: '',
})

const suggestedTags = computed(() => {
  const common = [
    'Alto en proteína',
    'Bajo en grasa',
    'Vegano',
    'Sin gluten',
    'Bajo en carbohidratos',
    'Meal prep',
    'Alto en fibra',
    'Bajo en azúcar',
  ]

  return common.filter((tag) => !rf.tags.includes(tag)).slice(0, 5)
})

function openRecipeModal(recipe?: Recipe) {
  detailModal.open = false
  formModal.recipe = recipe ?? null

  Object.assign(re, {
    name: '',
    time: '',
    servings: '',
    ingredients: '',
    steps: '',
  })

  tagInput.value = ''

  if (recipe) {
    Object.assign(rf, {
      name: recipe.name,
      category: recipe.category,
      emoji: recipe.emoji,
      image: recipe.image,
      time: recipe.time,
      servings: recipe.servings,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      tags: [...recipe.tags],
      ingredients: recipe.ingredients.length ? [...recipe.ingredients] : [''],
      steps: recipe.steps.length ? [...recipe.steps] : [''],
    })
  } else {
    Object.assign(rf, EMPTY_RF())
  }

  formModal.open = true
}

function addTag() {
  const value = tagInput.value.trim()

  if (value && !rf.tags.includes(value)) {
    rf.tags.push(value)
  }

  tagInput.value = ''
}

function addSuggestedTag(tag: string) {
  if (!rf.tags.includes(tag)) {
    rf.tags.push(tag)
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]

  if (!file) return

  const reader = new FileReader()

  reader.onload = () => {
    rf.image = reader.result as string
  }

  reader.readAsDataURL(file)
}

function validateRecipe() {
  let ok = true

  re.name = rf.name.trim() ? '' : 'El nombre es requerido.'
  re.time = rf.time && rf.time > 0 ? '' : 'Ingresa el tiempo de preparación.'
  re.servings = rf.servings && rf.servings > 0 ? '' : 'Ingresa el número de porciones.'
  re.ingredients = rf.ingredients.some((ingredient) => ingredient.trim())
    ? ''
    : 'Agrega al menos un ingrediente.'
  re.steps = rf.steps.some((step) => step.trim()) ? '' : 'Agrega al menos un paso.'

  if (re.name || re.time || re.servings || re.ingredients || re.steps) {
    ok = false
  }

  return ok
}

/* ─────────────────────────────────────────────────────────
   GUARDAR RECETA
───────────────────────────────────────────────────────── */
async function saveRecipe() {
  if (!validateRecipe()) return

  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  saving.value = true
  pageError.value = ''

  const cleanIngredients = rf.ingredients
    .map((ingredient) => ingredient.trim())
    .filter(Boolean)

  const cleanSteps = rf.steps
    .map((step) => step.trim())
    .filter(Boolean)

  const payload = {
    user_id: user.id,
    name: rf.name.trim(),
    image_url: rf.image.trim() || null,
    preparation_method: cleanSteps.join('\n'),
    tags: rf.tags,

    category: rf.category,
    emoji: rf.emoji,
    prep_time_min: rf.time ?? 0,
    servings: rf.servings,
    calories: rf.calories ?? 0,
    protein_g: rf.protein ?? 0,
    carbs_g: rf.carbs ?? 0,
    fat_g: rf.fat ?? 0,
  }

  try {
    let recipeId = formModal.recipe?.id ?? ''

    if (formModal.recipe) {
      const { error } = await supabase
        .from('recipes')
        .update(payload)
        .eq('id', formModal.recipe.id)
        .eq('user_id', user.id)

      if (error) throw error

      recipeId = formModal.recipe.id

      const { error: deleteIngredientsError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId)

      if (deleteIngredientsError) throw deleteIngredientsError
    } else {
      const { data, error } = await supabase
        .from('recipes')
        .insert(payload)
        .select('id')
        .single()

      if (error) throw error

      recipeId = data.id
    }

    if (cleanIngredients.length > 0) {
      const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(
        cleanIngredients.map((ingredient) => ({
          recipe_id: recipeId,
          name: ingredient,
        })),
      )

      if (ingredientsError) throw ingredientsError
    }

    await loadRecipes()

    formModal.open = false

toast.success(formModal.recipe ? 'Receta actualizada correctamente.' : 'Receta agregada correctamente.')
  } catch (err) {
    pageError.value = err instanceof Error ? err.message : 'No se pudo guardar la receta.'
    toast.error(pageError.value)
  } finally {
    saving.value = false
  }
}

/* ─────────────────────────────────────────────────────────
   ELIMINAR
───────────────────────────────────────────────────────── */
const deleteModal = reactive<{
  open: boolean
  recipe: Recipe | null
}>({
  open: false,
  recipe: null,
})

function askDelete(recipe: Recipe) {
  deleteModal.recipe = recipe
  deleteModal.open = true
}

async function deleteRecipe() {
  const user = await ensureUser()

  if (!deleteModal.recipe || !user) {
    pageError.value = 'No hay una sesión activa.'
    toast.error(pageError.value)
    return
  }

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', deleteModal.recipe.id)
    .eq('user_id', user.id)

  if (error) {
    pageError.value = error.message
    toast.error(pageError.value)
    return
  }

  deleteModal.open = false
  deleteModal.recipe = null

  await loadRecipes()

  toast.success('Receta eliminada correctamente.')
}

onMounted(async () => {
  await loadRecipes()

  setTimeout(() => {
    mounted.value = true
  }, 80)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   BASE
══════════════════════════════════════════════════════════ */
.recipes-page {
  padding: 2.2rem 2.4rem;
  min-height: 100vh;
  background: #f8fafb;
  font-family: 'Inter','Segoe UI',sans-serif;
  opacity: 0;
  transition: opacity .4s ease;
}
.recipes-page.visible { opacity: 1; }

/* ── Header ───────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  animation: fadeDown .5s ease both;
}
.page-title    { font-size: 1.5rem; font-weight: 500; color: #0f1923; letter-spacing: -.5px; }
.page-subtitle { font-size: .9rem; color: #9ca3af; margin-top: 4px; }

.btn-new {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 20px;
  background: #3E9B92; color: #fff;
  border: none; border-radius: 12px;
  font-size: .9rem; font-weight: 600;
  font-family: inherit; cursor: pointer;
  transition: .2s;

  white-space: nowrap;
}
.btn-new:hover { background: #357d76; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(172, 172, 172, 0.4); }

/* ── Toolbar ──────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 1.6rem;
  flex-wrap: wrap;
  animation: fadeDown .5s .05s ease both;
}

.search-box {
  display: flex; align-items: center; gap: 9px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 14px;
  max-width: 320px;
  flex: 1;
  transition: .2s;
}
.search-box.focused { border-color: #3E9B92; box-shadow: 0 0 0 4px rgba(142,115,168,.1); }
.search-ico { color: #9ca3af; flex-shrink: 0; }
.search-box input { border: none; outline: none; font-size: .9rem; color: #0f1923; background: transparent; font-family: inherit; width: 100%; }
.search-box input::placeholder { color: #c0cad5; }
.clear-btn { background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; padding: 2px; border-radius: 4px; transition: color .2s; }
.clear-btn:hover { color: #374151; }

.category-pills { display: flex; gap: 8px; flex-wrap: wrap; }

.pill {
  padding: 9px 18px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 30px;
  font-size: .85rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
  white-space: nowrap;
}
.pill:hover { border-color: #3E9B92; color: #3E9B92; }
.pill.active { background: #3E9B92; border-color: #3E9B92; color: #fff; }

/* ── Grid de recetas ──────────────────────────────────────── */
.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.2rem;
}

.recipe-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #f0f0f5;
  overflow: hidden;
  cursor: pointer;
  transition: transform .25s ease, box-shadow .25s ease;
  animation: cardIn .4s ease var(--delay, 0ms) both;
}
.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(142,115,168,.18);
}
.recipe-card:hover .recipe-image { transform: scale(1.06); }
.recipe-card:hover .recipe-quick-actions { opacity: 1; }
.recipe-card:hover .recipe-arrow { transform: translateX(3px); color: #3E9B92; }

.recipe-image-wrap {
  position: relative;
  height: 170px;
  overflow: hidden;
  background: linear-gradient(135deg, #e6f8f6, #e6f8f6);
}

.recipe-image {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform .4s ease;
}

.recipe-image-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 3.5rem;
}

.recipe-tags {
  position: absolute;
  top: 10px; left: 10px;
  display: flex; gap: 6px; flex-wrap: wrap;
}

.recipe-tag {
  background: rgba(255,255,255,.95);
  color: #0f1923;
  font-size: .68rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.recipe-quick-actions {
  position: absolute;
  top: 10px; right: 10px;
  display: flex; gap: 5px;
  opacity: 0;
  transition: opacity .2s;
}
.qa-btn {
  width: 30px; height: 30px;
  border: none; border-radius: 9px;
  background: rgba(255,255,255,.95);
  color: #374151;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: .15s;
  backdrop-filter: blur(4px);
}
.qa-btn:hover { background: #e6f8f6; color: #3E9B92; }
.qa-btn.danger:hover { background: #fff1f1; color: #ef4444; }

.recipe-body { padding: 1rem 1.1rem 1.1rem; }

.recipe-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.recipe-name     { font-size: 1.02rem; font-weight: 500; color: #0f1923; line-height: 1.3; }
.recipe-category { font-size: .78rem; color: #9ca3af; margin-top: 2px; }
.recipe-arrow    { color: #c0c5d0; flex-shrink: 0; margin-top: 2px; transition: .2s; }

.recipe-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f3f8;
  flex-wrap: wrap;
}
.meta-item {
  display: flex; align-items: center; gap: 5px;
  font-size: .78rem; color: #6b7280; font-weight: 500;
}
.meta-item.kcal { color: #16a34a; font-weight: 700; }

/* Empty */
.empty-recipes {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 4rem 1rem; color: #9ca3af;
}
.empty-icon  { font-size: 3rem; }
.empty-title { font-size: 1.05rem; font-weight: 700; color: #374151; }
.empty-sub   { font-size: .85rem; }

/* ══════════════════════════════════════════════════════════
   MODAL BASE
══════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,25,35,.5);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
}

.modal-card {
  background: #fff;
  border-radius: 22px;
  width: 100%; max-width: 520px;
  box-shadow: 0 24px 60px rgba(0,0,0,.2);
  overflow: hidden;
}

/* ── Modal detalle ────────────────────────────────────────── */
.detail-modal {
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 22px;
  clip-path: inset(0 round 22px);
}

.detail-hero {
  position: relative;
  height: 280px;
  background: linear-gradient(135deg, #e6f8f6, #ede6ff);
}
.detail-hero img { width: 100%; height: 100%; object-fit: cover; }
.detail-hero-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 5rem;
}
.detail-close {
  position: absolute; top: 14px; right: 14px;
  width: 36px; height: 36px;
  background: rgba(255,255,255,.95);
  border: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #374151; transition: .2s;
}
.detail-close:hover { background: #fff; transform: scale(1.05); }

.detail-hero-tags {
  position: absolute; bottom: 14px; left: 14px;
  display: flex; gap: 6px; flex-wrap: wrap;
}

.detail-content { padding: 1.6rem; }
.detail-name { font-size: 1.4rem; font-weight: 700; color: #0f1923; margin-bottom: 8px; }
.detail-meta { display: flex; gap: 16px; margin-bottom: 1.2rem; flex-wrap: wrap; }

.macro-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  background: #f8fafb;
  border-radius: 14px;
  padding: 1rem;
  margin-bottom: 1.4rem;
}
.macro-box { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.macro-val { font-size: 1.3rem; font-weight: 700; }
.macro-val.protein { color: #2563eb; }
.macro-val.carbs   { color: #d97706; }
.macro-val.fat     { color: #16a34a; }
.macro-lbl { font-size: .75rem; color: #9ca3af; font-weight: 500; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.6rem;
  margin-bottom: 1.4rem;
}

.detail-section-title { font-size: .9rem; font-weight: 700; color: #0f1923; margin-bottom: .8rem; }

.ingredients-list { display: flex; flex-direction: column; gap: 9px; list-style: none; }
.ingredients-list li { display: flex; align-items: flex-start; gap: 9px; font-size: .87rem; color: #374151; line-height: 1.4; }
.dot-bullet { width: 6px; height: 6px; border-radius: 50%; background: #3E9B92; margin-top: 6px; flex-shrink: 0; }

.steps-list { display: flex; flex-direction: column; gap: 12px; list-style: none; }
.steps-list li { display: flex; align-items: flex-start; gap: 10px; font-size: .87rem; color: #374151; line-height: 1.45; }
.step-num {
  width: 22px; height: 22px; border-radius: 50%;
  background: #3E9B92; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: .72rem; font-weight: 700; flex-shrink: 0;
}

.detail-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding-top: 1.2rem; border-top: 1px solid #f3f3f8;
}

/* ── Modal formulario ─────────────────────────────────────── */
.form-modal {
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 22px;
  clip-path: inset(0 round 22px);
}

.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.4rem 1.4rem 1rem;
  border-bottom: 1px solid #f3f3f8;
  position: sticky; top: 0; background: #fff; z-index: 2;
}
.modal-title-group { display: flex; align-items: center; gap: 12px; }
.modal-icon-box {
  width: 42px; height: 42px; border-radius: 12px;
  background: #e6f8f6; color: #3E9B92;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.modal-title { font-size: 1.05rem; font-weight: 700; color: #0f1923; margin-bottom: 0; }
.modal-sub   { font-size: .78rem; color: #9ca3af; margin-top: 2px; }
.modal-close {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; padding: 4px; border-radius: 8px; display: flex; transition: .2s;
}
.modal-close:hover { color: #374151; background: #f3f4f6; }

.modal-body { padding: 1.4rem; }

/* Imagen upload */
.image-upload {
  position: relative;
  height: 150px;
  border: 2px dashed #e5e7eb;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  overflow: hidden;
  margin-bottom: 8px;
  transition: border-color .2s;
  background: #fafafb;
}
.image-upload:hover { border-color: #3E9B92; }
.image-upload.filled { border-style: solid; }

.image-placeholder {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: #9ca3af; font-size: .85rem; font-weight: 500;
}
.image-preview { width: 100%; height: 100%; object-fit: cover; }
.remove-image {
  position: absolute; top: 8px; right: 8px;
  width: 26px; height: 26px;
  background: rgba(0,0,0,.55);
  border: none; border-radius: 50%;
  color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.hidden-input { display: none; }

.image-hint { font-size: .73rem; color: #9ca3af; margin-bottom: 6px; }
.image-url-input {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid #e5e7eb; border-radius: 9px;
  font-size: .84rem; color: #0f1923; background: #f9fafb;
  outline: none; font-family: inherit; margin-bottom: 1.2rem;
  transition: .2s;
}
.image-url-input:focus { border-color: #3E9B92; background: #fff; box-shadow: 0 0 0 3px rgba(142,115,168,.1); }

/* Form grid */
.form-grid { display: grid; gap: 12px; margin-bottom: .2rem; }
.cols2 { grid-template-columns: 1fr 1fr; }

.ff { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
.ff.full { grid-column: 1 / -1; }
.ff label { font-size: .76rem; font-weight: 600; color: #374151; }
.ff input, .ff select, .ff textarea {
  padding: 9px 12px;
  border: 1.5px solid #e5e7eb; border-radius: 9px;
  font-size: .86rem; color: #0f1923; background: #f9fafb;
  outline: none; font-family: inherit; transition: .2s;
}
.ff input:focus, .ff select:focus, .ff textarea:focus {
  border-color: #3E9B92; background: #fff; box-shadow: 0 0 0 3px rgba(142,115,168,.1);
}
.ff input.err { border-color: #ef4444; }
.ferr { font-size: .72rem; color: #ef4444; }

.emoji-picker { display: flex; flex-wrap: wrap; gap: 6px; }
.emoji-opt {
  width: 34px; height: 34px; font-size: 1.05rem;
  border: 1.5px solid #e5e7eb; border-radius: 8px;
  background: #f9fafb; cursor: pointer; transition: .15s;
  display: flex; align-items: center; justify-content: center;
}
.emoji-opt:hover { border-color: #3E9B92; background: #e6f8f6; }
.emoji-opt.selected { border-color: #3E9B92; background: #e6f8f6; box-shadow: 0 0 0 3px rgba(142,115,168,.12); }

/* Section labels */
.form-section-label {
  font-size: .7rem; font-weight: 700; color: #b0b8cc;
  letter-spacing: .1em; margin: 1.2rem 0 .7rem;
}

/* Tags input */
.tags-input-wrap {
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
  padding: 8px 10px;
  border: 1.5px solid #e5e7eb; border-radius: 10px;
  background: #f9fafb;
  min-height: 44px;
}
.tags-input-wrap:focus-within { border-color: #3E9B92; background: #fff; box-shadow: 0 0 0 3px rgba(174, 173, 174, 0.1); }

.tag-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 9px;
  background: #e6f8f6; color: #3E9B92;
  border-radius: 20px; font-size: .76rem; font-weight: 600;
}
.tag-chip button { background: none; border: none; cursor: pointer; color: #3E9B92; display: flex; padding: 0; }

.tag-input { flex: 1; min-width: 120px; border: none; background: none; outline: none; font-size: .85rem; font-family: inherit; }

.tag-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.tag-suggestion {
  padding: 5px 11px;
  border: 1.5px dashed #e5e7eb;
  background: none; border-radius: 20px;
  font-size: .75rem; font-weight: 600; color: #9ca3af;
  cursor: pointer; font-family: inherit; transition: .15s;
}
.tag-suggestion:hover { border-color: #3E9B92; color: #3E9B92; }

/* Dynamic lists (ingredientes / pasos) */
.dynamic-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.dynamic-row { display: flex; align-items: center; gap: 8px; }

.dyn-dot { width: 6px; height: 6px; border-radius: 50%; background: #d1d5db; flex-shrink: 0; }
.dyn-step-num {
  width: 22px; height: 22px; border-radius: 50%;
  background: #e6f8f6; color: #3E9B92;
  display: flex; align-items: center; justify-content: center;
  font-size: .72rem; font-weight: 700; flex-shrink: 0;
}

.dynamic-row input, .dynamic-row textarea {
  flex: 1;
  padding: 8px 12px;
  border: 1.5px solid #e5e7eb; border-radius: 9px;
  font-size: .85rem; color: #0f1923; background: #f9fafb;
  outline: none; font-family: inherit; resize: none; transition: .2s;
}
.dynamic-row input:focus, .dynamic-row textarea:focus {
  border-color: #3E9B92; background: #fff; box-shadow: 0 0 0 3px rgba(142,115,168,.1);
}

.dyn-remove {
  width: 28px; height: 28px; flex-shrink: 0;
  border: none; background: none; cursor: pointer;
  color: #c0c5d0; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  transition: .15s;
}
.dyn-remove:hover { background: #fff1f1; color: #ef4444; }

.btn-add-line {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border: 1.5px dashed #e6f8f6;
  background: #f4fbfa; border-radius: 9px;
  font-size: .82rem; font-weight: 600; color: #3E9B92;
  cursor: pointer; font-family: inherit; transition: .2s;
  margin-bottom: 4px;
}
.btn-add-line:hover { background: #e6f8f6; border-style: solid; }

/* Modal footer */
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding-top: 1.2rem; margin-top: .8rem;
  border-top: 1px solid #f3f3f8;
}
.modal-footer.centered { justify-content: center; }

.btn-secondary {
  padding: 10px 20px;
  border: 1.5px solid #e5e7eb; background: #fff;
  border-radius: 10px; font-size: .88rem; font-weight: 600;
  color: #374151; cursor: pointer; font-family: inherit; transition: .2s;
}
.btn-secondary:hover { border-color: #9ca3af; }

.btn-primary {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px; background: #3E9B92; color: #fff;
  border: none; border-radius: 10px; font-size: .88rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: .2s;
  box-shadow: 0 3px 10px rgba(142,115,168,.3);
}
.btn-primary:hover:not(:disabled) { background: #357d76; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

.btn-danger {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px; background: #ef4444; color: #fff;
  border: none; border-radius: 10px; font-size: .88rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: .2s;
}
.btn-danger:hover { background: #dc2626; }

.spinner-sm {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .6s linear infinite; display: inline-block;
}

/* Delete modal */
.delete-modal { max-width: 380px; padding: 2rem; text-align: center; }
.delete-icon-wrap {
  width: 58px; height: 58px; border-radius: 50%;
  background: #fff1f1; color: #ef4444;
  display: flex; align-items: center; justify-content: center; margin: 0 auto .9rem;
}
.delete-title { font-size: 1.05rem; font-weight: 700; color: #0f1923; margin-bottom: 8px; }
.delete-sub   { font-size: .84rem; color: #6b7280; line-height: 1.5; margin-bottom: 1.4rem; }

/* ── Animaciones ──────────────────────────────────────────── */
@keyframes fadeDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
@keyframes cardIn   { from { opacity:0; transform:translateY(16px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
@keyframes spin     { to { transform:rotate(360deg); } }

.card-enter-active { animation: cardIn .35s ease; }
.card-leave-active { transition: opacity .2s, transform .2s; position: absolute; }
.card-leave-to     { opacity: 0; transform: scale(.9); }
.card-move         { transition: transform .3s ease; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s ease; }
.modal-fade-enter-from,   .modal-fade-leave-to     { opacity: 0; }

.modal-slide-enter-active { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease; }
.modal-slide-leave-active { transition: transform .2s ease, opacity .2s ease; }
.modal-slide-enter-from   { transform: scale(.92) translateY(16px); opacity: 0; }
.modal-slide-leave-to     { transform: scale(.96); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity .15s; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }



.page-error {
  margin-bottom: 1rem;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fff1f1;
  color: #dc2626;
  border: 1px solid #fecaca;
  font-size: .85rem;
  font-weight: 600;
}

.detail-modal::-webkit-scrollbar,
.form-modal::-webkit-scrollbar {
  width: 8px;
}

.detail-modal::-webkit-scrollbar-track,
.form-modal::-webkit-scrollbar-track {
  background: transparent;
}

.detail-modal::-webkit-scrollbar-thumb,
.form-modal::-webkit-scrollbar-thumb {
  background: #c7c7d1;
  border-radius: 20px;
}

.detail-modal::-webkit-scrollbar-thumb:hover,
.form-modal::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* ── Responsive ───────────────────────────────────────────── */


/* ── Tablet ───────────────────────────────────────────────── */
@media (max-width: 900px) {
  .recipes-page { padding: 1.6rem 1.4rem; }

  /* Grid de recetas: 2 columnas */
  .recipes-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }

  /* Pills de categoría: scroll horizontal */
  .category-pills {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 2px;
  }
  .category-pills::-webkit-scrollbar { display: none; }

  .pill { flex-shrink: 0; }

  /* Acciones de card siempre visibles en touch */
  .recipe-quick-actions { opacity: 1; }
}

/* ── Móvil ────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .recipes-page {
    /* Espacio para el botón hamburguesa */
    padding: 4rem 1rem 1.8rem;
  }

  /* Header: columna */
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: .75rem;
    margin-bottom: 1rem;
    
  }

  .btn-new {
    width: 100%;
    justify-content: center;
    padding: 12px;
  }

  /* Toolbar: búsqueda ancho completo, pills en fila con scroll */
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .search-box {
    max-width: 100%;
  }

  /* Pills: contenedor con scroll, no se desborda */
  .category-pills {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 6px;
    /* Evita que el scroll afecte el ancho del padre */
    width: 100%;
    padding-bottom: 4px;
    /* Permite que el contenido salga del padding del padre sin crear scroll en el body */
    margin-left: -1rem;
    margin-right: -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    box-sizing: content-box;
  }
  .category-pills::-webkit-scrollbar { display: none; }

  .pill {
    flex-shrink: 0;
    white-space: nowrap;
  }

  /* Grid de recetas: 1 columna */
  .recipes-grid { grid-template-columns: 1fr; gap: .85rem; }

  /* Altura de imagen de la card */
  .recipe-image-wrap { height: 180px; }

  /* Acciones siempre visibles en touch */
  .recipe-quick-actions { opacity: 1; }

  /* ── Modal detalle ── */
  .detail-modal {
    max-width: 100%;
    width: 100%;
    border-radius: 20px;
    max-height: 92vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .detail-hero   { height: 200px; }
  .detail-name   { font-size: 1.2rem; }
  .detail-content { padding: 1.2rem; overflow-y: auto; flex: 1; }

  /* Macros: igual de 3 columnas, solo más compacto */
  .macro-val  { font-size: 1.1rem; }
  .macro-lbl  { font-size: .7rem; }

  /* Grid ingredientes / preparación: 1 columna */
  .detail-grid { grid-template-columns: 1fr; gap: 1rem; }

  .detail-footer { flex-direction: column-reverse; gap: 8px; }
  .detail-footer .btn-secondary,
  .detail-footer .btn-primary { width: 100%; justify-content: center; }

  /* ── Modal formulario ── */
  .form-modal {
    max-width: 100%;
    width: 100%;
    border-radius: 20px;
    max-height: 92vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .form-modal .modal-body {
    overflow-y: auto;
    flex: 1;
  }

  /* Overlay centrado igual que otros módulos */
  .modal-overlay {
    padding: 1.5rem;
    align-items: center;
    overflow-y: auto;
  }

  /* Upload de imagen */
  .image-upload { height: 120px; }

  /* Form grid: 1 columna */
  .cols2 { grid-template-columns: 1fr; }

  /* Tags */
  .tag-suggestions { gap: 5px; }

  /* Modal footer */
  .modal-footer { flex-direction: column-reverse; gap: 8px; }
  .btn-secondary,
  .btn-primary,
  .btn-danger { width: 100%; justify-content: center; }

  /* Modal eliminar */
  .delete-modal { max-width: 100%; width: 100%; }
}

/* ── Móvil pequeño ────────────────────────────────────────── */
@media (max-width: 480px) {
  .recipes-page { padding: 4.8rem .75rem 1.5rem; }

  .recipe-image-wrap { height: 160px; }

  .recipe-name { font-size: .95rem; }

  .detail-hero { height: 170px; }

  /* Emoji picker más compacto */
  .emoji-picker { gap: 5px; }
  .emoji-opt    { width: 32px; height: 32px; font-size: 1rem; }
}

</style>