<template>
  <div class="meal-plan-page" :class="{ visible: mounted }">

    <!-- ══════════════════════════════════════════════════════
         COLUMNA PRINCIPAL
    ═══════════════════════════════════════════════════════ -->
    <div class="main-col">

      <!-- ── Header ──────────────────────────────────────────── -->
      <div class="page-header">
        <div>
          <h1>{{ editingMode ? 'Editar plan alimenticio' : 'Constructor de plan alimenticio' }}</h1>
          <p class="page-subtitle">
            Paciente: <strong>{{ selectedPatient || 'Sin seleccionar' }}</strong>
            <span v-if="selectedPatient"> · Semana del {{ weekRangeLabel }}</span>
          </p>
        </div>
        <div class="header-actions">
  <button class="btn-outline" @click="openPlanDetail">
    <Search :size="16" /> Ver detalle del plan
  </button>

  <button class="btn-outline" @click="previewPDF">
    <Printer :size="16" /> Vista previa PDF
  </button>

  <button class="btn-save" @click="savePlan" :disabled="saving">
  <span v-if="saving" class="spinner-sm" />
  <Save v-else :size="16" />
  {{ editingMode ? 'Actualizar plan' : 'Guardar plan' }}
</button>
</div>
      </div>

      <!-- ── Selectores: paciente + duración ───────────────────── -->
      <div class="selectors-bar">
        <div class="select-field">
          <label><User :size="13" /> Paciente</label>
          <div class="select-wrapper">
            <select v-model="selectedPatient" @change="updatePatientTargets">
  <option value="" disabled>Seleccionar paciente</option>
  <option v-for="p in patientList" :key="p" :value="p">{{ p }}</option>
</select>
            <ChevronDown :size="15" class="select-arrow" />
          </div>
        </div>

        <div class="select-field">
  <label><CalendarRange :size="13" /> Fecha de inicio</label>

  <div class="date-wrapper">
    <input
      v-model="startDate"
      type="date"
      class="date-input"
      @change="updateStartDate"
    />
  </div>
</div>

        <div class="select-field">
          <label><CalendarRange :size="13" /> Duración</label>
          <div class="duration-toggle">
            <button
              v-for="d in durationOptions"
              :key="d"
              class="duration-btn"
              :class="{ active: duration === d }"
              @click="setDuration(d)"
            >{{ d }} días</button>
          </div>
        </div>
      </div>

      <!-- ── Navegación de días — siempre visible debajo del header ── -->
      <div class="day-tabs">
        <button
          v-for="(day, i) in days"
          :key="i"
          class="day-tab"
          :class="{ active: activeDayIndex === i }"
          @click="activeDayIndex = i"
        >
          <span class="day-tab-name">{{ day.label }}</span>
          <span class="day-tab-date">{{ day.dateLabel }}</span>
        </button>
      </div>

      <!-- ── Mensaje si no hay paciente ────────────────────────── -->
      <div v-if="!selectedPatient" class="empty-patient">
        <Users :size="40" />
        <p>Selecciona un paciente para comenzar a construir su plan</p>
      </div>

      <!-- ── Bloques de comidas del día activo ─────────────────── -->
      <TransitionGroup v-else name="meal" tag="div" class="meals-list">
        <div
          v-for="meal in currentDay.meals"
          :key="meal.id"
          class="meal-card"
        >
          <div class="meal-header">
            <div class="meal-header-left">
              <div class="meal-icon-box" :style="{ background: meal.color + '18', color: meal.color }">
                <component :is="meal.icon" :size="18" />
              </div>
              <div>
                <h3 class="meal-name">{{ meal.name }}</h3>
                <div class="meal-time-edit">
  <input
    v-model="meal.timeStart"
    type="time"
    class="meal-time-input"
  />

  <span>–</span>

  <input
    v-model="meal.timeEnd"
    type="time"
    class="meal-time-input"
  />
</div>
              </div>
            </div>
            <button class="btn-add-food" @click="openFoodPicker(meal)">
              <Plus :size="15" /> Agregar alimento
            </button>
          </div>

          <!-- Foods agregados -->
          <div v-if="meal.foods.length" class="meal-foods">
            <TransitionGroup name="food-item">
              <div v-for="(food, fi) in meal.foods" :key="food.uid" class="food-row">
                <div class="food-info">
                  <span class="food-name">{{ food.name }}</span>
                  <span class="food-qty">{{ food.quantity }} {{ food.unit }}</span>
                </div>
                <div class="food-macros">
                  <span class="fmac kcal">{{ food.energyKcal }} kcal</span>
                  <span class="fmac">P {{ food.proteinG }}g</span>
                  <span class="fmac">C {{ food.carbsG }}g</span>
                  <span class="fmac">G {{ food.lipidsG }}g</span>
                </div>
                <button class="remove-food-btn" @click="removeFood(meal, fi)">
                  <X :size="14" />
                </button>
              </div>
            </TransitionGroup>
          </div>

          <!-- Empty / drop zone -->
          <div
            v-else
            class="drop-zone"
            @click="openFoodPicker(meal)"
          >
            <Inbox :size="16" />
            Haz clic en "Agregar alimento" para comenzar
          </div>
        </div>
      </TransitionGroup>

    </div>

    <!-- ══════════════════════════════════════════════════════
         PANEL LATERAL — Resumen nutricional
    ═══════════════════════════════════════════════════════ -->
    <aside class="summary-panel">
      <h2 class="summary-title">Resumen diario</h2>

      <!-- Calorías totales -->
      <div class="summary-card calories-card">
        <div class="calories-ring-wrap">
          <svg viewBox="0 0 120 120" class="calories-ring">
            <circle cx="60" cy="60" r="52" class="ring-bg" />
            <circle
              cx="60" cy="60" r="52"
              class="ring-fill"
              :style="{
                strokeDasharray: 327,
                strokeDashoffset: 327 - (327 * Math.min(caloriesPct, 100) / 100)
              }"
            />
          </svg>
          <div class="calories-center">
            <span class="calories-value">{{ dayTotals.calories }}</span>
            <span class="calories-label">kcal</span>
          </div>
        </div>
        <p class="calories-target">Meta: {{ caloricTarget }} kcal</p>
      </div>

      <!-- Macros -->
      <div class="summary-card macro-card protein">
        <div class="macro-top">
          <span class="macro-name"><Beef :size="14" /> Proteína</span>
          <span class="macro-amounts">{{ dayTotals.protein }}g <span class="macro-target">/ {{ macroTargets.protein }}g</span></span>
        </div>
        <div class="macro-bar"><div class="macro-fill" :style="{ width: macroPct('protein') + '%' }" /></div>
        <span class="macro-pct">{{ macroPct('protein') }}% del objetivo</span>
      </div>

      <div class="summary-card macro-card carbs">
        <div class="macro-top">
          <span class="macro-name"><Wheat :size="14" /> Carbohidratos</span>
          <span class="macro-amounts">{{ dayTotals.carbs }}g <span class="macro-target">/ {{ macroTargets.carbs }}g</span></span>
        </div>
        <div class="macro-bar"><div class="macro-fill" :style="{ width: macroPct('carbs') + '%' }" /></div>
        <span class="macro-pct">{{ macroPct('carbs') }}% del objetivo</span>
      </div>

      <div class="summary-card macro-card fat">
        <div class="macro-top">
          <span class="macro-name"><Droplet :size="14" /> Grasa</span>
          <span class="macro-amounts">{{ dayTotals.fat }}g <span class="macro-target">/ {{ macroTargets.fat }}g</span></span>
        </div>
        <div class="macro-bar"><div class="macro-fill" :style="{ width: macroPct('fat') + '%' }" /></div>
        <span class="macro-pct">{{ macroPct('fat') }}% del objetivo</span>
      </div>

      <!-- Por comida -->
      <p class="by-meal-label">Por comida</p>
      <div class="by-meal-list">
        <div v-for="meal in currentDay.meals" :key="meal.id" class="by-meal-item">
          <span class="bm-icon-box" :style="{ background: meal.color + '18', color: meal.color }">
            <component :is="meal.icon" :size="14" />
          </span>
          <span class="bm-name">{{ meal.name }}</span>
          <span class="bm-kcal">{{ mealTotal(meal) }} kcal</span>
        </div>
      </div>
    </aside>

    <!-- ══════════════════════════════════════════════════════
         MODAL: Selector de alimento / receta
    ═══════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="foodPicker.open" class="modal-overlay" @click.self="closeFoodPicker">
        <Transition name="modal-slide">
          <div v-if="foodPicker.open" class="modal-card picker-modal">

            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon-box"><Search :size="18" /></div>
                <div>
                  <h2 class="modal-title">Agregar al plan</h2>
                  <p class="modal-sub">{{ foodPicker.meal?.name }} · {{ currentDay.label }}</p>
                </div>
              </div>
              <button class="modal-close" @click="closeFoodPicker"><X :size="18" /></button>
            </div>

            <!-- Tabs: Alimentos / Recetas -->
            <div class="source-tabs">
              <button
                class="source-tab"
                :class="{ active: pickerSource === 'foods' }"
                @click="switchSource('foods')"
              >
                <Apple :size="15" /> Alimentos
              </button>
              <button
                class="source-tab"
                :class="{ active: pickerSource === 'recipes' }"
                @click="switchSource('recipes')"
              >
                <ChefHat :size="15" /> Recetas guardadas
              </button>
            </div>

            <div class="modal-body">

              <!-- ══ Vista: lista (alimentos o recetas) ══ -->
              <template v-if="!pickerSelectedFood && !pickerSelectedRecipe">

                <!-- Búsqueda -->
                <div class="picker-search">
                  <Search :size="15" class="ps-ico" />
                  <input
                    v-model="pickerSearch"
                    type="text"
                    :placeholder="pickerSource === 'foods' ? 'Buscar alimento...' : 'Buscar receta...'"
                    autofocus
                  />
                </div>

                <!-- Filtro de grupo (solo alimentos) -->
                <div v-if="pickerSource === 'foods'" class="picker-groups">
                  <button
                    v-for="g in foodGroups"
                    :key="g.id"
                    class="pg-pill"
                    :class="{ active: pickerGroup === g.id }"
                    @click="pickerGroup = g.id"
                  >{{ g.name }}</button>
                </div>

                <!-- Filtro de categoría (solo recetas) -->
                <div v-else class="picker-groups">
                  <button
                    v-for="c in recipeCategories"
                    :key="c"
                    class="pg-pill"
                    :class="{ active: pickerRecipeCategory === c }"
                    @click="pickerRecipeCategory = c"
                  >{{ c }}</button>
                </div>

                <!-- Resultados: alimentos -->
                <div v-if="pickerSource === 'foods'" class="picker-results">
                  <button
                    v-for="food in pickerFoodResults"
                    :key="food.id"
                    class="picker-food-item"
                    @click="selectPickerFood(food)"
                  >
                    <div class="pf-info">
                      <span class="pf-name">{{ food.name }}</span>
                      <span class="pf-qty">{{ food.quantity }} {{ food.unit }} ({{ food.weightG }}g)</span>
                    </div>
                    <span class="pf-kcal">{{ food.energyKcal }} kcal</span>
                    <ChevronRight :size="15" class="pf-arrow" />
                  </button>

                  <div v-if="pickerFoodResults.length === 0" class="picker-empty">
                    <Inbox :size="22" />
                    <p>Sin resultados</p>
                  </div>
                </div>

                <!-- Resultados: recetas -->
                <div v-else class="picker-results">
                  <button
                    v-for="recipe in pickerRecipeResults"
                    :key="recipe.id"
                    class="picker-recipe-item"
                    @click="selectPickerRecipe(recipe)"
                  >
                    <div class="pr-thumb">
                      <img v-if="recipe.image" :src="recipe.image" :alt="recipe.name" />
                      <ChefHat v-else :size="18" />
                    </div>
                    <div class="pf-info">
                      <span class="pf-name">{{ recipe.name }}</span>
                      <span class="pf-qty">{{ recipe.category }} · {{ recipe.ingredients.length }} ingredientes</span>
                    </div>
                    <span class="pf-kcal">{{ recipe.calories }} kcal</span>
                    <ChevronRight :size="15" class="pf-arrow" />
                  </button>

                  <div v-if="pickerRecipeResults.length === 0" class="picker-empty">
                    <Inbox :size="22" />
                    <p>Sin recetas en esta categoría</p>
                  </div>
                </div>
              </template>

              <!-- ══ Vista: cantidad de un alimento individual ══ -->
              <Transition name="fade">
                <div v-if="pickerSelectedFood" class="quantity-step">
                  <button class="back-link" @click="pickerSelectedFood = null"><ChevronLeft :size="14" /> Regresar</button>
                  <div class="qs-food-name">{{ pickerSelectedFood.name }}</div>
                  <div class="qs-row">
                    <div class="ff">
                      <label>Cantidad</label>
                      <input v-model.number="pickerQty" type="number" min="0.25" step="0.25" />
                    </div>
                    <div class="ff">
                      <label>Unidad</label>
                      <input :value="pickerSelectedFood.unit" disabled />
                    </div>
                  </div>
                  <div class="qs-preview">
                    ≈ {{ Math.round(pickerSelectedFood.energyKcal * pickerQty) }} kcal ·
                    P {{ (pickerSelectedFood.proteinG * pickerQty).toFixed(1) }}g ·
                    C {{ (pickerSelectedFood.carbsG * pickerQty).toFixed(1) }}g ·
                    G {{ (pickerSelectedFood.lipidsG * pickerQty).toFixed(1) }}g
                  </div>
                  <div class="qs-actions">
                    <button class="btn-secondary" @click="pickerSelectedFood = null">Cancelar</button>
                    <button class="btn-primary" @click="confirmAddFood"><Check :size="14" /> Agregar al plan</button>
                  </div>
                </div>
              </Transition>

              <!-- ══ Vista: cantidad por ingrediente de una receta ══ -->
              <Transition name="fade">
                <div v-if="pickerSelectedRecipe" class="quantity-step recipe-step">
                  <button class="back-link" @click="pickerSelectedRecipe = null"><ChevronLeft :size="14" /> Regresar</button>
                  <div class="qs-food-name">{{ pickerSelectedRecipe.name }}</div>
                  <p class="qs-recipe-hint">Ajusta la cantidad de cada ingrediente para este paciente</p>

                  <div class="ingredient-qty-list">
                    <div
  v-for="(ing, i) in recipeIngredientQtys"
  :key="i"
  class="ingredient-qty-row"
>
  <div class="iq-main">
    <input
      v-if="ing.editing"
      v-model="ing.label"
      class="iq-edit-input"
      type="text"
      autofocus
      @blur="finishEditIngredient(i)"
      @keydown.enter.prevent="finishEditIngredient(i)"
    />

    <span
      v-else
      class="iq-name"
      title="Doble clic para editar la porción"
      @dblclick="startEditIngredient(i)"
    >
      {{ ing.label }}
    </span>

    <small class="iq-help">Doble clic para cambiar la porción</small>
  </div>
</div>
                  </div>

                  <div class="qs-preview">
                    ≈ {{ Math.round(pickerSelectedRecipe.calories * recipeServingMultiplier) }} kcal ·
                    P {{ (pickerSelectedRecipe.protein * recipeServingMultiplier).toFixed(1) }}g ·
                    C {{ (pickerSelectedRecipe.carbs * recipeServingMultiplier).toFixed(1) }}g ·
                    G {{ (pickerSelectedRecipe.fat * recipeServingMultiplier).toFixed(1) }}g
                  </div>

                  <div class="qs-actions">
                    <button class="btn-secondary" @click="pickerSelectedRecipe = null">Cancelar</button>
                    <button class="btn-primary" @click="confirmAddRecipe"><Check :size="14" /> Agregar al plan</button>
                  </div>
                </div>
              </Transition>

            </div>

          </div>
        </Transition>
      </div>
    </Transition>

<!-- ══════════════════════════════════════════════════════
     MODAL: Detalle completo del plan
══════════════════════════════════════════════════════ -->
<Transition name="modal-fade">
  <div
    v-if="planDetailModal.open"
    class="modal-overlay"
    @click.self="planDetailModal.open = false"
  >
    <Transition name="modal-slide">
      <div v-if="planDetailModal.open" class="modal-card plan-detail-modal">
        <div class="modal-header">
          <div class="modal-title-group">
            <div class="modal-icon-box">
              <Search :size="18" />
            </div>

            <div>
              <h2 class="modal-title">Detalle del plan alimenticio</h2>
              <p class="modal-sub">
                {{ selectedPatient || 'Sin paciente' }} · {{ duration }} días
              </p>
            </div>
          </div>

          <button class="modal-close" @click="planDetailModal.open = false">
            <X :size="18" />
          </button>
        </div>

        <div class="modal-body">
          <div v-if="!hasPlanItems" class="plan-detail-empty">
            <Inbox :size="30" />
            <p>Este plan todavía no tiene alimentos o recetas agregadas.</p>
          </div>

          <div v-else class="plan-detail-content">
            <div class="plan-detail-patient">
              <div>
                <span>Paciente</span>
                <strong>{{ selectedPatient }}</strong>
              </div>

              <div>
                <span>Duración</span>
                <strong>{{ duration }} días</strong>
              </div>

              <div>
                <span>Meta diaria</span>
                <strong>{{ caloricTarget }} kcal</strong>
              </div>

              <div>
                <span>Periodo</span>
                <strong>{{ weekRangeLabel }}</strong>
              </div>
            </div>

            <div
              v-for="(day, dayIndex) in days"
              :key="dayIndex"
              class="plan-detail-day"
            >
              <div class="plan-detail-day-header">
                <div>
                  <h3>Día {{ dayIndex + 1 }} · {{ day.label }}</h3>
                  <p>{{ day.dateLabel }}</p>
                </div>

                <strong>
                  {{
                    day.meals.reduce((sum, meal) => sum + mealTotal(meal), 0)
                  }} kcal
                </strong>
              </div>

              <div class="plan-detail-meals">
                <div
                  v-for="meal in day.meals"
                  :key="meal.id"
                  class="plan-detail-meal"
                >
                  <div class="plan-detail-meal-header">
                    <div>
                      <span
                        class="detail-meal-icon"
                        :style="{ background: meal.color + '18', color: meal.color }"
                      >
                        <component :is="meal.icon" :size="14" />
                      </span>

                      <strong>{{ meal.name }}</strong>
                    </div>

                    <span>{{ mealTotal(meal) }} kcal</span>
                  </div>

                  <div v-if="meal.foods.length" class="plan-detail-foods">
                    <div
                      v-for="food in meal.foods"
                      :key="food.uid"
                      class="plan-detail-food"
                    >
                      <div class="detail-food-main">
                        <strong>{{ food.name }}</strong>

                        <p>
                          {{ food.quantity }} {{ food.unit }}
                          <span v-if="food.source === 'recipe'">
                            · receta guardada
                          </span>
                        </p>

                        <ul
                          v-if="food.adjustedIngredients?.length"
                          class="detail-ingredients"
                        >
                          <li
                            v-for="ingredient in food.adjustedIngredients"
                            :key="ingredient"
                          >
                            {{ ingredient }}
                          </li>
                        </ul>
                      </div>

                      <div class="detail-food-macros">
                        <span class="kcal">
                          {{ Math.round(food.energyKcal * food.quantity) }} kcal
                        </span>

                        <span>
                          P {{ Number((food.proteinG * food.quantity).toFixed(1)) }}g
                        </span>

                        <span>
                          C {{ Number((food.carbsG * food.quantity).toFixed(1)) }}g
                        </span>

                        <span>
                          G {{ Number((food.lipidsG * food.quantity).toFixed(1)) }}g
                        </span>
                      </div>
                    </div>
                  </div>

                  <p v-else class="plan-detail-no-food">
                    Sin alimentos agregados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="planDetailModal.open = false">
            Cerrar
          </button>

          <button class="btn-save" @click="savePlan" :disabled="saving || !hasPlanItems">
            <span v-if="saving" class="spinner-sm" />
            <Save v-else :size="15" />
            Guardar plan
          </button>
        </div>
      </div>
    </Transition>
  </div>
</Transition>

<!-- ══════════════════════════════════════════════════════
     MODAL: Vista previa PDF
══════════════════════════════════════════════════════ -->
<Transition name="modal-fade">
  <div
    v-if="pdfPreviewModal.open"
    class="modal-overlay"
    @click.self="pdfPreviewModal.open = false"
  >
    <Transition name="modal-slide">
      <div v-if="pdfPreviewModal.open" class="modal-card pdf-preview-modal">
        <div class="modal-header">
          <div class="modal-title-group">
            <div class="modal-icon-box">
              <Printer :size="18" />
            </div>

            <div>
              <h2 class="modal-title">Vista previa del documento</h2>
              <p class="modal-sub">
                Plan alimenticio listo para generar PDF
              </p>
            </div>
          </div>

          <button class="modal-close" @click="pdfPreviewModal.open = false">
            <X :size="18" />
          </button>
        </div>

        <div class="pdf-preview-body">
          <div ref="pdfContentRef">
            <MealPlanPdfPreview
  :selected-patient="selectedPatient"
  :duration="duration"
  :caloric-target="caloricTarget"
  :week-range-label="weekRangeLabel"
  :days="days"
/>
          </div>
        </div>

        <div class="modal-footer pdf-actions">
  <button class="btn-secondary" @click="pdfPreviewModal.open = false">
    Cerrar
  </button>

  <button
    class="btn-save"
    @click="savePlanPDFDocument"
    :disabled="savingPdfDocument"
  >
    <span v-if="savingPdfDocument" class="spinner-sm" />
    <Save v-else :size="15" />
    Guardar documento
  </button>

  <button
    class="btn-save"
    @click="downloadPlanPDF"
    :disabled="generatingPdf"
  >
    <span v-if="generatingPdf" class="spinner-sm" />
    <Printer v-else :size="15" />
    Descargar PDF
  </button>
</div>
      </div>
    </Transition>
  </div>
</Transition>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import MealPlanPdfPreview from '@/components/MealPlanPdfPreview.vue'
import {
  Printer,
  Save,
  User,
  ChevronDown,
  CalendarRange,
  Plus,
  X,
  Check,
  Inbox,
  Search,
  ChevronRight,
  ChevronLeft,
  Beef,
  Wheat,
  Droplet,
  Sunrise,
  Apple,
  Sun,
  Cookie,
  Moon,
  ChefHat,
  Minus,
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

/* ─────────────────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────────────────── */
interface PatientOption {
  id: string
  full_name: string
  target_calories: number | null
  daily_calories: number | null
}

interface FoodGroupOption {
  id: string
  name: string
}

interface FoodRow {
  id: string
  food_group_id: string
  name: string
  quantity: number | null
  unit: string | null
  net_weight_g: number | null
  energy_kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  lipids_g: number | null
}

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

interface PlanFood extends FoodItem {
  uid: string
  source?: 'food' | 'recipe'
  recipeId?: string
  recipeName?: string
  adjustedIngredients?: string[]
}

interface RecipeRow {
  id: string
  name: string
  image_url: string | null
  preparation_method: string | null
  tags: string[] | null
  category: string | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  servings: number | null
}

interface IngredientRow {
  id: string
  recipe_id: string
  name: string
}

interface Recipe {
  id: string
  name: string
  category: string
  image: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servings: number
  ingredients: string[]
}

interface RecipeIngredientQty {
  label: string
  multiplier: number
  editing: boolean
}

interface Meal {
  id: string
  name: string
  timeStart: string
  timeEnd: string
  icon: any
  color: string
  foods: PlanFood[]
}

interface DayPlan {
  label: string
  dateLabel: string
  fullDate: string
  meals: Meal[]
}

/* ─────────────────────────────────────────────────────────
   STORE / ROUTE
───────────────────────────────────────────────────────── */
const auth = useAuthStore()
const route = useRoute()

/* ─────────────────────────────────────────────────────────
   ESTADO GENERAL
───────────────────────────────────────────────────────── */
const mounted = ref(false)
const saving = ref(false)
const pageError = ref('')
const savedMealPlanId = ref<string | null>(null)
const savingPdfDocument = ref(false)

const patientOptions = ref<PatientOption[]>([])
const patientList = ref<string[]>([])
const selectedPatient = ref('')

const durationOptions = [2, 5, 7]
const duration = ref(7)
const activeDayIndex = ref(0)

const startDate = ref(new Date().toISOString().slice(0, 10))

const caloricTarget = ref(1800)

const editingMealPlanId = ref<string | null>(null)
const editingMode = computed(() => !!editingMealPlanId.value)

const macroTargets = computed(() => {
  const calories = caloricTarget.value || 1800

  return {
    protein: Math.round((calories * 0.2) / 4),
    carbs: Math.round((calories * 0.5) / 4),
    fat: Math.round((calories * 0.3) / 9),
  }
})

const selectedPatientId = computed(() => {
  const patient = patientOptions.value.find((p) => p.full_name === selectedPatient.value)

  return patient?.id ?? ''
})

const pdfPreviewModal = reactive({
  open: false,
})

const generatingPdf = ref(false)
const pdfContentRef = ref<HTMLElement | null>(null)

/* ─────────────────────────────────────────────────────────
   USUARIO
───────────────────────────────────────────────────────── */
async function ensureUser() {
  if (!auth.user) {
    await auth.loadUser()
  }

  return auth.user
}

/* ─────────────────────────────────────────────────────────
   PACIENTES
───────────────────────────────────────────────────────── */
async function loadPatients() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

const { data, error } = await supabase
  .from('patients')
  .select('id, full_name, target_calories, daily_calories')
  .eq('user_id', user.id)
  .order('full_name', { ascending: true })

  if (error) {
    pageError.value = error.message
    return
  }

  patientOptions.value = data ?? []
  patientList.value = patientOptions.value.map((patient) => patient.full_name)

  const queryPatientId = route.query.patientId

  if (typeof queryPatientId === 'string') {
    const patientFromQuery = patientOptions.value.find((patient) => patient.id === queryPatientId)

    if (patientFromQuery) {
      selectedPatient.value = patientFromQuery.full_name
      updatePatientTargets()
    }
  }
}

function updatePatientTargets() {
  const patient = patientOptions.value.find((p) => p.full_name === selectedPatient.value)

  if (!patient) return

  caloricTarget.value = Number(patient.target_calories ?? patient.daily_calories ?? 1800)
}

/* ─────────────────────────────────────────────────────────
   DÍAS Y COMIDAS
───────────────────────────────────────────────────────── */
const MEAL_TEMPLATE = (): Meal[] => [
  {
    id: 'breakfast',
    name: 'Desayuno',
    timeStart: '07:00',
    timeEnd: '08:00',
    icon: Sunrise,
    color: '#f59e0b',
    foods: [],
  },
  {
    id: 'am-snack',
    name: 'Colación matutina',
    timeStart: '10:00',
    timeEnd: '10:30',
    icon: Apple,
    color: '#ef4444',
    foods: [],
  },
  {
    id: 'lunch',
    name: 'Comida',
    timeStart: '13:00',
    timeEnd: '14:00',
    icon: Sun,
    color: '#eab308',
    foods: [],
  },
  {
    id: 'pm-snack',
    name: 'Colación vespertina',
    timeStart: '16:00',
    timeEnd: '16:30',
    icon: Cookie,
    color: '#a16207',
    foods: [],
  },
  {
    id: 'dinner',
    name: 'Cena',
    timeStart: '19:00',
    timeEnd: '20:00',
    icon: Moon,
    color: '#6366f1',
    foods: [],
  },
]

const weekdayLabels = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

function safeDate(dateString: string) {
  return new Date(dateString + 'T12:00:00')
}

function buildDays(daysCount: number): DayPlan[] {
  const baseDate = safeDate(startDate.value)

  return Array.from({ length: daysCount }, (_, index) => {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + index)

    return {
      label: weekdayLabels[date.getDay()] ?? `Día ${index + 1}`,
      dateLabel: date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
      }),
      fullDate: date.toISOString().slice(0, 10),
      meals: MEAL_TEMPLATE(),
    }
  })
}

const days = ref<DayPlan[]>(buildDays(duration.value))

const EMPTY_DAY: DayPlan = {
  label: 'Día',
  dateLabel: '',
  fullDate: startDate.value,
  meals: MEAL_TEMPLATE(),
}

function setDuration(daysCount: number) {
  duration.value = daysCount
  days.value = buildDays(daysCount)
  activeDayIndex.value = 0
}

function updateStartDate() {
  days.value = buildDays(duration.value)
  activeDayIndex.value = 0
}

const currentDay = computed<DayPlan>(() => {
  return days.value[activeDayIndex.value] ?? EMPTY_DAY
})

const weekRangeLabel = computed(() => {
  if (!days.value.length) return ''

  const first = days.value[0]
  const last = days.value[days.value.length - 1]

  if (!first || !last) return ''

  const year = safeDate(first.fullDate).getFullYear()

  return `${first.dateLabel} – ${last.dateLabel}, ${year}`
})


function mealIdFromSupabase(type: string) {
  const map: Record<string, string> = {
    desayuno: 'breakfast',
    colacion_manana: 'am-snack',
    comida: 'lunch',
    colacion_tarde: 'pm-snack',
    cena: 'dinner',
  }

  return map[type] ?? 'lunch'
}

function parseNumberFromText(text: string, fallback = 0) {
  const match = text.match(/[\d.]+/)

  return match ? Number(match[0]) : fallback
}

function planFoodFromPortionNote(item: {
  id: string
  recipe_id: string | null
  portion_notes: string | null
}): PlanFood {
  const note = item.portion_notes ?? ''
  const parts = note.split('|').map((part) => part.trim())

  const name = parts[0] || 'Alimento sin nombre'
  const portion = parts[1] || '1 porción'
  const kcalText = parts.find((part) => part.includes('kcal')) ?? ''
  const proteinText = parts.find((part) => part.startsWith('P ')) ?? ''
  const carbsText = parts.find((part) => part.startsWith('C ')) ?? ''
  const fatText = parts.find((part) => part.startsWith('G ')) ?? ''
  const ingredientsText = parts.find((part) => part.startsWith('Ingredientes:'))

  const quantity = parseNumberFromText(portion, 1)
  const unit = item.recipe_id ? 'receta' : portion.replace(String(quantity), '').trim() || 'porción'

  const adjustedIngredients = ingredientsText
    ? ingredientsText
        .replace('Ingredientes:', '')
        .split(';')
        .map((ingredient) => ingredient.trim())
        .filter(Boolean)
    : []

  return {
    id: item.recipe_id ?? item.id,
    group: item.recipe_id ? 'recipe' : 'guardado',
    name,
    quantity,
    unit,
    weightG: 0,
    energyKcal: parseNumberFromText(kcalText, 0),
    proteinG: parseNumberFromText(proteinText, 0),
    carbsG: parseNumberFromText(carbsText, 0),
    lipidsG: parseNumberFromText(fatText, 0),
    source: item.recipe_id ? 'recipe' : 'food',
    recipeId: item.recipe_id ?? undefined,
    recipeName: item.recipe_id ? name : undefined,
    adjustedIngredients,
    uid: `saved-${item.id}`,
  }
}

async function loadMealPlanForEdit(mealPlanId: string) {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  pageError.value = ''

  const { data: plan, error: planError } = await supabase
    .from('meal_plans')
    .select('id, patient_id, title, duration_days, start_date, notes')
    .eq('id', mealPlanId)
    .eq('user_id', user.id)
    .single()

  if (planError) {
    pageError.value = planError.message
    return
  }

  const { data: items, error: itemsError } = await supabase
    .from('meal_plan_items')
    .select('id, recipe_id, day_number, meal_type, portion_notes, order_index')
    .eq('meal_plan_id', mealPlanId)
    .order('day_number', { ascending: true })
    .order('order_index', { ascending: true })

  if (itemsError) {
    pageError.value = itemsError.message
    return
  }

  editingMealPlanId.value = plan.id
  savedMealPlanId.value = plan.id

  duration.value = plan.duration_days
  startDate.value = plan.start_date ?? startDate.value

  const patientFromPlan = patientOptions.value.find((patient) => patient.id === plan.patient_id)

  if (patientFromPlan) {
    selectedPatient.value = patientFromPlan.full_name
    updatePatientTargets()
  }

  days.value = buildDays(duration.value)

  ;(items ?? []).forEach((item) => {
    const day = days.value[item.day_number - 1]
    if (!day) return

    const mealId = mealIdFromSupabase(item.meal_type)
    const meal = day.meals.find((m) => m.id === mealId)

    if (!meal) return

    meal.foods.push(
      planFoodFromPortionNote({
        id: item.id,
        recipe_id: item.recipe_id,
        portion_notes: item.portion_notes,
      }),
    )
  })

  activeDayIndex.value = 0
}

/* ─────────────────────────────────────────────────────────
   TOTALES NUTRICIONALES
───────────────────────────────────────────────────────── */
function mealTotal(meal: Meal) {
  return Math.round(meal.foods.reduce((sum, food) => sum + food.energyKcal * food.quantity, 0))
}

const dayTotals = computed(() => {
  const meals = currentDay.value.meals
  const allFoods = meals.flatMap((meal) => meal.foods)

  return {
    calories: Math.round(allFoods.reduce((sum, food) => sum + food.energyKcal * food.quantity, 0)),
    protein: Math.round(allFoods.reduce((sum, food) => sum + food.proteinG * food.quantity, 0)),
    carbs: Math.round(allFoods.reduce((sum, food) => sum + food.carbsG * food.quantity, 0)),
    fat: Math.round(allFoods.reduce((sum, food) => sum + food.lipidsG * food.quantity, 0)),
  }
})

const caloriesPct = computed(() => {
  if (!caloricTarget.value) return 0

  return Math.round((dayTotals.value.calories / caloricTarget.value) * 100)
})

function macroPct(key: 'protein' | 'carbs' | 'fat') {
  const value = dayTotals.value[key]
  const target = macroTargets.value[key]

  if (!target) return 0

  return Math.min(Math.round((value / target) * 100), 100)
}

/* ─────────────────────────────────────────────────────────
   ALIMENTOS DESDE SUPABASE
───────────────────────────────────────────────────────── */
const foodGroups = ref<FoodGroupOption[]>([
  {
    id: 'all',
    name: 'Todos',
  },
])

const allFoods = ref<FoodItem[]>([])

function mapFood(row: FoodRow): FoodItem {
  return {
    id: row.id,
    group: row.food_group_id,
    name: row.name,
    quantity: Number(row.quantity ?? 1),
    unit: row.unit ?? '',
    weightG: Number(row.net_weight_g ?? 0),
    energyKcal: Number(row.energy_kcal ?? 0),
    proteinG: Number(row.protein_g ?? 0),
    carbsG: Number(row.carbs_g ?? 0),
    lipidsG: Number(row.lipids_g ?? 0),
  }
}

async function loadFoodData() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  const { data: groupsData, error: groupsError } = await supabase
    .from('food_groups')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (groupsError) {
    pageError.value = groupsError.message
    return
  }

  foodGroups.value = [
    {
      id: 'all',
      name: 'Todos',
    },
    ...((groupsData ?? []) as FoodGroupOption[]),
  ]

  const { data: foodsData, error: foodsError } = await supabase
    .from('foods')
    .select(`
      id,
      food_group_id,
      name,
      quantity,
      unit,
      net_weight_g,
      energy_kcal,
      protein_g,
      carbs_g,
      lipids_g
    `)
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (foodsError) {
    pageError.value = foodsError.message
    return
  }

  allFoods.value = ((foodsData ?? []) as FoodRow[]).map((food) => mapFood(food))
}

/* ─────────────────────────────────────────────────────────
   RECETAS DESDE SUPABASE
───────────────────────────────────────────────────────── */
const allRecipes = ref<Recipe[]>([])

const recipeCategories = computed(() => {
  const categories = allRecipes.value.map((recipe) => recipe.category).filter(Boolean)

  return ['Todas', ...Array.from(new Set(categories))]
})

function mapRecipe(row: RecipeRow, ingredients: IngredientRow[]): Recipe {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? 'Comida',
    image: row.image_url ?? '',
    calories: Number(row.calories ?? 0),
    protein: Number(row.protein_g ?? 0),
    carbs: Number(row.carbs_g ?? 0),
    fat: Number(row.fat_g ?? 0),
    servings: Number(row.servings ?? 1),
    ingredients: ingredients
      .filter((ingredient) => ingredient.recipe_id === row.id)
      .map((ingredient) => ingredient.name),
  }
}

async function loadRecipes() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  const { data: recipeData, error: recipeError } = await supabase
    .from('recipes')
    .select(`
      id,
      name,
      image_url,
      preparation_method,
      tags,
      category,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      servings
    `)
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (recipeError) {
    pageError.value = recipeError.message
    return
  }

  const recipeIds = (recipeData ?? []).map((recipe) => recipe.id)

  let ingredients: IngredientRow[] = []

  if (recipeIds.length > 0) {
    const { data: ingredientData, error: ingredientError } = await supabase
      .from('recipe_ingredients')
      .select('id, recipe_id, name')
      .in('recipe_id', recipeIds)

    if (ingredientError) {
      pageError.value = ingredientError.message
      return
    }

    ingredients = (ingredientData ?? []) as IngredientRow[]
  }

  allRecipes.value = ((recipeData ?? []) as RecipeRow[]).map((recipe) =>
    mapRecipe(recipe, ingredients),
  )
}

/* ─────────────────────────────────────────────────────────
   SELECTOR DE ALIMENTOS / RECETAS
───────────────────────────────────────────────────────── */
const foodPicker = reactive<{
  open: boolean
  meal: Meal | null
}>({
  open: false,
  meal: null,
})

const planDetailModal = reactive({
  open: false,
})

const hasPlanItems = computed(() => {
  return days.value.some((day) =>
    day.meals.some((meal) => meal.foods.length > 0),
  )
})

function openPlanDetail() {
  planDetailModal.open = true
}

const pickerSource = ref<'foods' | 'recipes'>('foods')
const pickerSearch = ref('')
const pickerGroup = ref('all')
const pickerRecipeCategory = ref('Todas')

const pickerSelectedFood = ref<FoodItem | null>(null)
const pickerSelectedRecipe = ref<Recipe | null>(null)

const pickerQty = ref(1)
const recipeIngredientQtys = ref<RecipeIngredientQty[]>([])

const recipeServingMultiplier = computed(() => 1)

function openFoodPicker(meal: Meal) {
  foodPicker.meal = meal
  foodPicker.open = true

  pickerSource.value = 'foods'
  pickerSearch.value = ''
  pickerGroup.value = 'all'
  pickerRecipeCategory.value = 'Todas'
  pickerSelectedFood.value = null
  pickerSelectedRecipe.value = null
  recipeIngredientQtys.value = []
  pickerQty.value = 1
}

function closeFoodPicker() {
  foodPicker.open = false
  foodPicker.meal = null
  pickerSelectedFood.value = null
  pickerSelectedRecipe.value = null
  recipeIngredientQtys.value = []
}

function switchSource(source: 'foods' | 'recipes') {
  pickerSource.value = source
  pickerSearch.value = ''
  pickerSelectedFood.value = null
  pickerSelectedRecipe.value = null
  recipeIngredientQtys.value = []
}

const pickerFoodResults = computed(() => {
  let list = allFoods.value

  if (pickerGroup.value !== 'all') {
    list = list.filter((food) => food.group === pickerGroup.value)
  }

  const query = pickerSearch.value.toLowerCase().trim()

  if (query) {
    list = list.filter((food) => food.name.toLowerCase().includes(query))
  }

  return list
})

const pickerRecipeResults = computed(() => {
  let list = allRecipes.value

  if (pickerRecipeCategory.value !== 'Todas') {
    list = list.filter((recipe) => recipe.category === pickerRecipeCategory.value)
  }

  const query = pickerSearch.value.toLowerCase().trim()

  if (query) {
    list = list.filter((recipe) => recipe.name.toLowerCase().includes(query))
  }

  return list
})

function selectPickerFood(food: FoodItem) {
  pickerSelectedFood.value = food
  pickerQty.value = 1
}

function selectPickerRecipe(recipe: Recipe) {
  pickerSelectedRecipe.value = recipe

  recipeIngredientQtys.value = recipe.ingredients.map((ingredient) => ({
    label: ingredient,
    multiplier: 1,
    editing: false,
  }))
}

function adjustIngredientQty(index: number, amount: number) {
  const ingredient = recipeIngredientQtys.value[index]

  if (!ingredient) return

  ingredient.multiplier = Math.max(0, Number((ingredient.multiplier + amount).toFixed(2)))
}

function startEditIngredient(index: number) {
  const ingredient = recipeIngredientQtys.value[index]

  if (!ingredient) return

  ingredient.editing = true
}

function finishEditIngredient(index: number) {
  const ingredient = recipeIngredientQtys.value[index]

  if (!ingredient) return

  ingredient.label = ingredient.label.trim()

  if (!ingredient.label) {
    ingredient.label = 'Ingrediente sin nombre'
  }

  ingredient.editing = false
}

function confirmAddFood() {
  if (!foodPicker.meal || !pickerSelectedFood.value) return

  const food = pickerSelectedFood.value

  foodPicker.meal.foods.push({
    ...food,
    quantity: pickerQty.value,
    source: 'food',
    uid: `${food.id}-${Date.now()}`,
  })

  closeFoodPicker()
}

function confirmAddRecipe() {
  if (!foodPicker.meal || !pickerSelectedRecipe.value) return

  const recipe = pickerSelectedRecipe.value
  const multiplier = recipeServingMultiplier.value

  foodPicker.meal.foods.push({
    id: recipe.id,
    group: 'recipe',
    name: recipe.name,
    quantity: multiplier,
    unit: 'receta',
    weightG: 0,
    energyKcal: recipe.calories,
    proteinG: recipe.protein,
    carbsG: recipe.carbs,
    lipidsG: recipe.fat,
    source: 'recipe',
    recipeId: recipe.id,
    recipeName: recipe.name,
    adjustedIngredients: recipeIngredientQtys.value.map((ingredient) => ingredient.label),
    uid: `recipe-${recipe.id}-${Date.now()}`,
  })

  closeFoodPicker()
}

function removeFood(meal: Meal, index: number) {
  meal.foods.splice(index, 1)
}

/* ─────────────────────────────────────────────────────────
   GUARDAR PLAN
───────────────────────────────────────────────────────── */
function mealTypeForSupabase(mealId: string) {
  const map: Record<string, string> = {
    breakfast: 'desayuno',
    'am-snack': 'colacion_manana',
    lunch: 'comida',
    'pm-snack': 'colacion_tarde',
    dinner: 'cena',
  }

  return map[mealId] ?? 'comida'
}

function buildPortionNotes(food: PlanFood) {
  if (food.source === 'recipe') {
  const ingredientsText = food.adjustedIngredients?.length
    ? ` | Ingredientes: ${food.adjustedIngredients.join('; ')}`
    : ''

  return `${food.name} | ${Number(food.quantity.toFixed(2))} receta | ${Math.round(
    food.energyKcal * food.quantity,
  )} kcal | P ${Number((food.proteinG * food.quantity).toFixed(1))}g | C ${Number(
    (food.carbsG * food.quantity).toFixed(1),
  )}g | G ${Number((food.lipidsG * food.quantity).toFixed(1))}g${ingredientsText}`
}

  return `${food.name} | ${food.quantity} ${food.unit} | ${Math.round(
    food.energyKcal * food.quantity,
  )} kcal | P ${Number((food.proteinG * food.quantity).toFixed(1))}g | C ${Number(
    (food.carbsG * food.quantity).toFixed(1),
  )}g | G ${Number((food.lipidsG * food.quantity).toFixed(1))}g`
}

async function savePlan() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  if (!selectedPatientId.value) {
    pageError.value = 'Selecciona un paciente antes de guardar el plan.'
    return
  }

  saving.value = true
  pageError.value = ''

  try {
    let mealPlanId = editingMealPlanId.value

    if (editingMealPlanId.value) {
      const { error: updateError } = await supabase
        .from('meal_plans')
        .update({
          patient_id: selectedPatientId.value,
          title: `Plan alimenticio - ${selectedPatient.value}`,
          duration_days: duration.value,
          start_date: startDate.value,
          notes: `Meta calórica diaria: ${caloricTarget.value} kcal`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingMealPlanId.value)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      const { error: deleteItemsError } = await supabase
        .from('meal_plan_items')
        .delete()
        .eq('meal_plan_id', editingMealPlanId.value)

      if (deleteItemsError) throw deleteItemsError
    } else {
      const { data: mealPlan, error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          patient_id: selectedPatientId.value,
          title: `Plan alimenticio - ${selectedPatient.value}`,
          duration_days: duration.value,
          start_date: startDate.value,
          notes: `Meta calórica diaria: ${caloricTarget.value} kcal`,
        })
        .select('id')
        .single()

      if (mealPlanError) throw mealPlanError

      mealPlanId = mealPlan.id
      editingMealPlanId.value = mealPlan.id
      savedMealPlanId.value = mealPlan.id
    }

    if (!mealPlanId) {
      throw new Error('No se pudo obtener el ID del plan.')
    }

    savedMealPlanId.value = mealPlanId

    const items = days.value.flatMap((day, dayIndex) =>
      day.meals.flatMap((meal) =>
        meal.foods.map((food, foodIndex) => ({
          meal_plan_id: mealPlanId,
          recipe_id: food.source === 'recipe' ? food.recipeId ?? null : null,
          day_number: dayIndex + 1,
          meal_type: mealTypeForSupabase(meal.id),
          portion_notes: buildPortionNotes(food),
          order_index: foodIndex,
        })),
      ),
    )

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('meal_plan_items').insert(items)

      if (itemsError) throw itemsError
    }
  } catch (err) {
    pageError.value = err instanceof Error ? err.message : 'No se pudo guardar el plan.'
  } finally {
    saving.value = false
  }
}

/* ─────────────────────────────────────────────────────────
   PDF
───────────────────────────────────────────────────────── */
function previewPDF() {
  pdfPreviewModal.open = true
}

async function downloadPlanPDF() {
  if (!pdfContentRef.value) return

  generatingPdf.value = true

  try {
    const html2pdf = (await import('html2pdf.js')).default

    const patientName =
  typeof selectedPatient === 'string'
    ? selectedPatient
    : selectedPatient.value || 'paciente'

const filename = `plan-alimenticio-${patientName}.pdf`
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9.-]/g, '')

    await html2pdf()
  .set({
    margin: [6, 6, 6, 6],
    filename,
    image: {
      type: 'jpeg',
      quality: 0.98,
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
  })
  .from(pdfContentRef.value)
  .save()
  } finally {
    generatingPdf.value = false
  }
}

async function generatePlanPDFBlob() {
  if (!pdfContentRef.value) {
    pdfPreviewModal.open = true
    await nextTick()
  }

  if (!pdfContentRef.value) {
    throw new Error('No se encontró el contenido del PDF.')
  }

  const html2pdfModule = await import('html2pdf.js')
  const html2pdf = html2pdfModule.default

  const blob = await html2pdf()
    .set({
      margin: [6, 6, 6, 6],
      image: {
        type: 'jpeg',
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
    })
    .from(pdfContentRef.value)
    .outputPdf('blob')

  return blob as Blob
}

async function savePlanPDFDocument() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  if (!selectedPatientId.value) {
    pageError.value = 'Selecciona un paciente antes de guardar el documento.'
    return
  }

  savingPdfDocument.value = true
  pageError.value = ''

  try {
    if (!savedMealPlanId.value) {
      await savePlan()
    }

    if (!savedMealPlanId.value) {
      throw new Error('Primero guarda el plan antes de guardar el documento.')
    }

    pdfPreviewModal.open = true
    await nextTick()

    const pdfBlob = await generatePlanPDFBlob()

    const patientName = selectedPatient.value || 'paciente'

    const cleanPatientName = patientName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    const fileName = `plan-alimenticio-${cleanPatientName}-${Date.now()}.pdf`

    const filePath = `${user.id}/meal-plans/${savedMealPlanId.value}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('nutria-files')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) throw uploadError

    const fileSizeKb = Number((pdfBlob.size / 1024).toFixed(2))

    console.log('Guardando documento con:', {
  user_id: user.id,
  patient_id: selectedPatientId.value,
  meal_plan_id: savedMealPlanId.value,
  fileName,
  filePath,
  fileSizeKb,
})

    const { error: documentError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        patient_id: selectedPatientId.value,
        meal_plan_id: savedMealPlanId.value,
        name: fileName,
        type: 'meal_plan_pdf',
        file_url: null,
        file_path: filePath,
        file_size_kb: fileSizeKb,
      })

    if (documentError) throw documentError

    pageError.value = ''
    alert('Documento PDF guardado correctamente.')
  } catch (err) {
    pageError.value =
      err instanceof Error
        ? err.message
        : 'No se pudo guardar el documento PDF.'
  } finally {
    savingPdfDocument.value = false
  }
}

/* ─────────────────────────────────────────────────────────
   INICIO
───────────────────────────────────────────────────────── */
onMounted(async () => {
  await Promise.all([loadPatients(), loadFoodData(), loadRecipes()])

  const queryMealPlanId = route.query.mealPlanId

  if (typeof queryMealPlanId === 'string') {
    await loadMealPlanForEdit(queryMealPlanId)
  }

  setTimeout(() => {
    mounted.value = true
  }, 80)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   LAYOUT BASE
══════════════════════════════════════════════════════════ */
.meal-plan-page {
  display: flex;
  gap: 1.4rem;
  min-height: 100vh;
  padding: 2rem 2.2rem;
  background: #f8fafb;
  font-family: 'Inter','Segoe UI',sans-serif;
  opacity: 0;
  transition: opacity .4s ease;
  align-items: flex-start;
}
.meal-plan-page.visible { opacity: 1; }

.main-col { flex: 1; min-width: 0; }

/* ── Header ───────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.2rem;
  animation: fadeDown .5s ease both;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.page-title    { font-size: 1.5rem; font-weight: 500; color: #0f1923; letter-spacing: -.4px; }
.page-subtitle { font-size: .87rem; color: #9ca3af; margin-top: 4px; }
.page-subtitle strong { color: #374151; }

.header-actions { display: flex; gap: 10px; }

.btn-outline {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px;
  border: 1.5px solid #e5e7eb; background: #fff;
  border-radius: 11px; font-size: .86rem; font-weight: 600;
  color: #374151; cursor: pointer; font-family: inherit; transition: .2s;
}
.btn-outline:hover { border-color: #3E9B92; color: #3E9B92; }

.btn-save {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px;
  background: #16a34a; color: #fff;
  border: none; border-radius: 11px; font-size: .86rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: .2s;
  box-shadow: 0 4px 14px rgba(22,163,74,.3);
}
.btn-save:hover:not(:disabled) { background: #15803d; transform: translateY(-1px); }
.btn-save:disabled { opacity: .7; cursor: not-allowed; }

/* ── Selectores ───────────────────────────────────────────── */
.selectors-bar {
  background: #fff;
  border: 1px solid #f0f0f5;
  border-radius: 16px;
  padding: 1.1rem 1.3rem;
  margin-bottom: 1.2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem;
  align-items: flex-end;
  animation: fadeDown .5s .05s ease both;
}

.select-field { display: flex; flex-direction: column; gap: 6px; }
.select-field label {
  display: flex; align-items: center; gap: 5px;
  font-size: .75rem; font-weight: 700; color: #6b7280; letter-spacing: .03em;
}

.select-wrapper { position: relative; }
.select-wrapper select {
  appearance: none;
  padding: 9px 34px 9px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: .87rem;
  color: #0f1923;
  background: #f9fafb;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  min-width: 200px;
  transition: .2s;
}
.select-wrapper select:focus { border-color: #3E9B92; background: #fff; box-shadow: 0 0 0 3px rgba(142,115,168,.1); }
.select-arrow { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }

.duration-toggle { display: flex; gap: 4px; background: #f3f4f6; padding: 3px; border-radius: 11px; }
.duration-btn {
  padding: 7px 16px;
  border: none; background: none;
  border-radius: 8px;
  font-size: .83rem; font-weight: 600;
  color: #6b7280; cursor: pointer; font-family: inherit; transition: .2s;
}
.duration-btn:hover:not(.active) { color: #374151; }
.duration-btn.active { background: #3E9B92; color: #fff; box-shadow: 0 2px 8px rgba(142,115,168,.3); }

/* Day tabs */
.day-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  flex: 1;
  min-width: 240px;
}
.day-tab {
  display: flex; flex-direction: column; align-items: center;
  padding: 7px 14px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
  flex-shrink: 0;
  min-width: 64px;
  margin-bottom: 18px;

}
.day-tab:hover:not(.active) { border-color: #81b8b3; }
.day-tab.active { background: #3E9B92; border-color: #3E9B92; }
.day-tab-name { font-size: .74rem; font-weight: 700; color: #374151; }
.day-tab.active .day-tab-name { color: #fff; }
.day-tab-date { font-size: .66rem; color: #9ca3af; margin-top: 1px; }
.day-tab.active .day-tab-date { color: rgba(255,255,255,.8); }

/* Empty patient */
.empty-patient {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 4rem 1rem; color: #9ca3af;
  background: #fff; border: 1px dashed #e5e7eb; border-radius: 16px;
}
.empty-patient p { font-size: .92rem; font-weight: 500; }

/* ── Meal cards ───────────────────────────────────────────── */
.meals-list { display: flex; flex-direction: column; gap: 1rem; }

.meal-card {
  background: #fff;
  border: 1px solid #f0f0f5;
  border-radius: 16px;
  padding: 1.2rem 1.3rem;
  box-shadow: 0 1px 10px rgba(0,0,0,.04);
  animation: fadeUp .4s ease both;
}

.meal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .9rem;
  flex-wrap: wrap;
  gap: 10px;
}
.meal-header-left { display: flex; align-items: center; gap: 12px; }

.meal-icon-box {
  width: 38px; height: 38px;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.meal-name { font-size: .98rem; font-weight: 500; color: #0f1923; }
.meal-time { font-size: .78rem; color: #9ca3af; }

.btn-add-food {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px;
  background: #e6f8f6; color: #3E9B92;
  border: none; border-radius: 9px;
  font-size: .82rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: .2s;
  white-space: nowrap;
}
.btn-add-food:hover { background: #e6f8f6; }

/* Drop zone */
.drop-zone {
  display: flex; align-items: center; gap: 8px;
  padding: 1rem;
  border: 1.5px dashed #e5e7eb;
  border-radius: 11px;
  color: #b0b8cc;
  font-size: .84rem;
  cursor: pointer;
  transition: .2s;
}
.drop-zone:hover { border-color: #3E9B92; color: #3E9B92; background: #f1fbfa; }

/* Food rows */
.meal-foods { display: flex; flex-direction: column; gap: 6px; }

.food-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #f3f3f8;
}

.food-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.food-name { font-size: .87rem; font-weight: 600; color: #0f1923; }
.food-qty  { font-size: .75rem; color: #9ca3af; margin-top: 1px; }

.food-macros { display: flex; gap: 10px; flex-shrink: 0; }
.fmac { font-size: .74rem; color: #6b7280; font-weight: 500; white-space: nowrap; }
.fmac.kcal { color: #16a34a; font-weight: 700; }

.remove-food-btn {
  width: 26px; height: 26px;
  border: none; background: none; cursor: pointer;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  color: #c0c5d0; transition: .15s; flex-shrink: 0;
}
.remove-food-btn:hover { background: #fff1f1; color: #ef4444; }

/* ══════════════════════════════════════════════════════════
   PANEL LATERAL — Resumen
══════════════════════════════════════════════════════════ */
.summary-panel {
  width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeLeft .5s .1s ease both;
}

.summary-title { font-size: 1.1rem; font-weight: 700; color: #0f1923; margin-bottom: 2px; }

.summary-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  padding: 1.1rem;
  box-shadow: 0 1px 10px rgba(0,0,0,.04);
}

/* Calories ring */
.calories-card { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.calories-ring-wrap { position: relative; width: 120px; height: 120px; }
.calories-ring { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-bg   { fill: none; stroke: #f3f4f6; stroke-width: 10; }
.ring-fill {
  fill: none; stroke: #16a34a; stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
}
.calories-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.calories-value { font-size: 1.7rem; font-weight: 700; color: #16a34a; line-height: 1; }
.calories-label { font-size: .72rem; color: #9ca3af; margin-top: 2px; }
.calories-target { font-size: .8rem; color: #6b7280; font-weight: 500; }

/* Macro cards */
.macro-card.protein { background: #eff6ff; border-color: #dbeafe; }
.macro-card.carbs   { background: #fffbeb; border-color: #fef3c7; }
.macro-card.fat     { background: #f0fdf4; border-color: #d1fae5; }

.macro-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.macro-name { display: flex; align-items: center; gap: 6px; font-size: .82rem; font-weight: 700; }
.macro-card.protein .macro-name { color: #1e40af; }
.macro-card.carbs   .macro-name { color: #92400e; }
.macro-card.fat     .macro-name { color: #065f46; }

.macro-amounts { font-size: .85rem; font-weight: 700; color: #0f1923; }
.macro-target  { font-size: .75rem; font-weight: 500; color: #9ca3af; }

.macro-bar { height: 6px; background: rgba(0,0,0,.06); border-radius: 10px; overflow: hidden; margin-bottom: 6px; }
.macro-fill { height: 100%; border-radius: 10px; transition: width .8s ease; }
.macro-card.protein .macro-fill { background: #2563eb; }
.macro-card.carbs   .macro-fill { background: #d97706; }
.macro-card.fat     .macro-fill { background: #16a34a; }

.macro-pct { font-size: .72rem; color: #6b7280; font-weight: 600; }

/* By meal */
.by-meal-label {
  font-size: .68rem; font-weight: 700; color: #b0b8cc;
  letter-spacing: .08em; margin: .4rem 0 .2rem;
}
.by-meal-list { display: flex; flex-direction: column; gap: 4px; }
.by-meal-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px;
  border-radius: 9px;
  transition: background .15s;
}
.by-meal-item:hover { background: #f1fbfa; }
.bm-icon-box {
  width: 26px; height: 26px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.bm-name { flex: 1; font-size: .82rem; color: #374151; font-weight: 500; }
.bm-kcal { font-size: .78rem; color: #9ca3af; font-weight: 600; }

/* ══════════════════════════════════════════════════════════
   MODAL: Selector de alimento
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
.btn-secondary:hover { border-color: #9ca3af; }

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

/* ── Animaciones ──────────────────────────────────────────── */
@keyframes fadeDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeUp   { from { opacity:0; transform:translateY(10px);  } to { opacity:1; transform:translateY(0); } }
@keyframes fadeLeft { from { opacity:0; transform:translateX(12px);  } to { opacity:1; transform:translateX(0); } }
@keyframes spin     { to { transform:rotate(360deg); } }

.meal-enter-active { animation: fadeUp .35s ease; }
.meal-leave-active { transition: opacity .2s; }
.meal-leave-to     { opacity: 0; }

.food-item-enter-active { animation: fadeUp .25s ease; }
.food-item-leave-active { transition: opacity .15s, transform .15s; position: absolute; }
.food-item-leave-to     { opacity: 0; transform: translateX(-8px); }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s ease; }
.modal-fade-enter-from,   .modal-fade-leave-to     { opacity: 0; }

.modal-slide-enter-active { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease; }
.modal-slide-leave-active { transition: transform .2s ease, opacity .2s ease; }
.modal-slide-enter-from   { transform: scale(.92) translateY(16px); opacity: 0; }
.modal-slide-leave-to     { transform: scale(.96); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s, transform .2s; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; transform: translateY(-6px); }

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 1100px) {
  .meal-plan-page { flex-direction: column; }
  .summary-panel { width: 100%; position: static; }
}
@media (max-width: 600px) {
  .meal-plan-page { padding: 1.2rem 1rem; }
  .page-header { flex-direction: column; align-items: stretch; }
  .header-actions { width: 100%; }
  .btn-outline, .btn-save { flex: 1; justify-content: center; }
  .selectors-bar { flex-direction: column; align-items: stretch; }
  .select-wrapper select { width: 100%; min-width: unset; }
}

/* ══════════════════════════════════════════════════════════
   TABS ALIMENTOS / RECETAS
══════════════════════════════════════════════════════════ */
.source-tabs {
  display: flex;
  gap: 8px;
  padding: 1rem 1.3rem 0;
  background: #fff;
}

.source-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 12px;
  border: 1.5px solid #e5e7eb;
  background: #f9fafb;
  color: #6b7280;
  border-radius: 11px;
  font-size: .84rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
}

.source-tab:hover {
  border-color: #3E9B92;
  color: #3E9B92;
  background: #f1fbfa;
}

.source-tab.active {
  background: #3E9B92;
  border-color: #3E9B92;
  color: #fff;
  box-shadow: 0 4px 12px rgba(142,115,168,.25);
}

/* ══════════════════════════════════════════════════════════
   RESULTADOS DE RECETAS
══════════════════════════════════════════════════════════ */
.picker-recipe-item {
  display: flex;
  align-items: center;
  gap: 10px;
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

.picker-recipe-item:hover {
  background: #f0fdfb;
  border-color: #dbfaf6;
}

.pr-thumb {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #e6f8f6;
  color: #3E9B92;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.pr-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ══════════════════════════════════════════════════════════
   BOTÓN REGRESAR EN MODAL
══════════════════════════════════════════════════════════ */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  background: none;
  color: #3E9B92;
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  margin-bottom: .75rem;
  transition: .2s;
}

.back-link:hover {
  color: #357d76;
  transform: translateX(-2px);
}

/* ══════════════════════════════════════════════════════════
   RECETA: AJUSTAR INGREDIENTES
══════════════════════════════════════════════════════════ */
.recipe-step {
  background: #fff;
  border: 1.5px solid #e6f8f6;
}

.qs-recipe-hint {
  font-size: .78rem;
  color: #9ca3af;
  margin-top: -4px;
  margin-bottom: .9rem;
}

.ingredient-qty-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 1rem;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 3px;
}

.ingredient-qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 10px;
  border: 1px solid #f0f0f5;
  border-radius: 11px;
  background: #fafafa;
}

.iq-name {
  flex: 1;
  font-size: .82rem;
  font-weight: 600;
  color: #374151;
  line-height: 1.35;
}

.iq-controls {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.iq-step {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 8px;
  background: #e6f8f6;
  color: #3E9B92;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: .15s;
}

.iq-step:hover {
  background: #e7dbfa;
}

.iq-input {
  width: 58px;
  height: 28px;
  text-align: center;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: .8rem;
  font-weight: 700;
  color: #0f1923;
  background: #fff;
  outline: none;
  font-family: inherit;
}

.iq-input:focus {
  border-color: #3E9B92;
  box-shadow: 0 0 0 3px rgba(142,115,168,.1);
}

/* ══════════════════════════════════════════════════════════
   SCROLL SUAVE DENTRO DE LISTAS DEL MODAL
══════════════════════════════════════════════════════════ */
.picker-results::-webkit-scrollbar,
.ingredient-qty-list::-webkit-scrollbar,
.modal-body::-webkit-scrollbar {
  width: 7px;
}

.picker-results::-webkit-scrollbar-track,
.ingredient-qty-list::-webkit-scrollbar-track,
.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.picker-results::-webkit-scrollbar-thumb,
.ingredient-qty-list::-webkit-scrollbar-thumb,
.modal-body::-webkit-scrollbar-thumb {
  background: #bfbfc0;
  border-radius: 20px;
}

.picker-results::-webkit-scrollbar-thumb:hover,
.ingredient-qty-list::-webkit-scrollbar-thumb:hover,
.modal-body::-webkit-scrollbar-thumb:hover {
  background: #bfa8dc;
}

.picker-modal {
  max-width: 620px;
}

.iq-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.iq-name {
  font-size: .82rem;
  font-weight: 600;
  color: #374151;
  line-height: 1.35;
  cursor: text;
  padding: 3px 5px;
  border-radius: 7px;
  transition: .15s;
}

.iq-name:hover {
  background: #e6f8f6;
  color: #3E9B92;
}

.iq-help {
  font-size: .66rem;
  color: #b0b8cc;
  font-weight: 500;
}

.iq-edit-input {
  width: 100%;
  padding: 7px 9px;
  border: 1.5px solid #3E9B92;
  border-radius: 8px;
  font-size: .82rem;
  font-weight: 600;
  color: #0f1923;
  background: #fff;
  outline: none;
  font-family: inherit;
  box-shadow: 0 0 0 3px rgba(142,115,168,.1);
}

/* ══════════════════════════════════════════════════════════
   MODAL DETALLE DEL PLAN
══════════════════════════════════════════════════════════ */
.plan-detail-modal {
  max-width: 850px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.plan-detail-modal .modal-body {
  overflow-y: auto;
}

.plan-detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 11px;
  padding: 3rem 1rem;
  color: #9ca3af;
  text-align: center;
}

.plan-detail-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plan-detail-patient {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  background: #f8fafb;
  border: 1px solid #f0f0f5;
  border-radius: 15px;
  padding: 1rem;
}

.plan-detail-patient div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.plan-detail-patient span {
  font-size: .7rem;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.plan-detail-patient strong {
  font-weight: 500;
  font-size: .86rem;
  color: #0f1923;
}

.plan-detail-day {
  border: 1px solid #f0f0f5;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}

.plan-detail-day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #e6f8f6;
  padding: .9rem 1rem;
}

.plan-detail-day-header h3 {
  font-size: .95rem;
  font-weight: 700;
  color: #3E9B92;
}

.plan-detail-day-header p {
  font-size: .75rem;
  color: #9ca3af;
  margin-top: 2px;
}

.plan-detail-day-header > strong {
  color: #16a34a;
  font-size: .9rem;
}

.plan-detail-meals {
  display: flex;
  flex-direction: column;
}

.plan-detail-meal {
  padding: .95rem 1rem;
  border-top: 1px solid #f3f3f8;
}

.plan-detail-meal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .65rem;
}

.plan-detail-meal-header > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-detail-meal-header strong {
  font-size: .88rem;
  color: #0f1923;
}

.plan-detail-meal-header > span {
  font-size: .8rem;
  color: #16a34a;
  font-weight: 800;
}

.detail-meal-icon {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-detail-foods {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-detail-food {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: .8rem;
  background: #fafafa;
  border: 1px solid #f3f3f8;
  border-radius: 12px;
}

.detail-food-main {
  flex: 1;
  min-width: 0;
}

.detail-food-main strong {
  font-weight: 500;
  font-size: .86rem;
  color: #0f1923;
}

.detail-food-main p {
  font-size: .75rem;
  color: #9ca3af;
  margin-top: 2px;
}

.detail-ingredients {
  margin-top: 7px;
  padding-left: 1rem;
  font-size: .74rem;
  color: #6b7280;
  line-height: 1.5;
}

.detail-food-macros {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  font-size: .74rem;
  color: #6b7280;
  font-weight: 600;
  white-space: nowrap;
}

.detail-food-macros .kcal {
  color: #16a34a;
  font-weight: 800;
}

.plan-detail-no-food {
  font-size: .78rem;
  color: #b0b8cc;
  font-style: italic;
  padding-left: 36px;
}

/* Responsive detalle */
@media (max-width: 760px) {
  .plan-detail-patient {
    grid-template-columns: 1fr 1fr;
  }

  .plan-detail-food {
    flex-direction: column;
  }

  .detail-food-macros {
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .plan-detail-patient {
    grid-template-columns: 1fr;
  }
}

/* ══════════════════════════════════════════════════════════
   FOOTER Y BOTONES DEL MODAL DETALLE
══════════════════════════════════════════════════════════ */
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
  background: #765f8b;
  transform: translateY(-1px);
}

.plan-detail-modal .btn-save:disabled {
  opacity: .65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive botones del modal */
@media (max-width: 520px) {
  .plan-detail-modal .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .plan-detail-modal .btn-secondary,
  .plan-detail-modal .btn-save {
    width: 100%;
  }
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* ══════════════════════════════════════════════════════════
   FECHA DE INICIO
══════════════════════════════════════════════════════════ */
.date-wrapper {
  position: relative;
}

.date-input {
  padding: 9px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: .87rem;
  color: #0f1923;
  background: #f9fafb;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  min-width: 140px;
  transition: .2s;
}

.date-input:focus {
  border-color: #3E9B92;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(142,115,168,.1);
}

/* ══════════════════════════════════════════════════════════
   HORARIOS EDITABLES DE COMIDAS
══════════════════════════════════════════════════════════ */
.meal-time-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;

}

.meal-time-edit span {
  color: #9ca3af;
  font-size: .75rem;
}

.meal-time-input {
  width: 82px;
  padding: 5px 7px;
  border: 1.4px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  color: #6b7280;
  font-size: .75rem;
  font-family: inherit;
  outline: none;
  transition: .2s;
    min-width: 100px;
}

.meal-time-input:focus {
  border-color: #3E9B92;
  background: #fff;
  color: #0f1923;
  box-shadow: 0 0 0 3px rgba(142,115,168,.1);
}

/* ══════════════════════════════════════════════════════════
   MODAL PDF PREVIEW
══════════════════════════════════════════════════════════ */
.pdf-preview-modal {
  max-width: 920px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
}

.pdf-preview-body {
  background: #f3f4f6;
  padding: 1.2rem;
  overflow-y: auto;
}

.pdf-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 1rem 1.3rem;
  border-top: 1px solid #f3f3f8;
  background: #fff;
}

/* ══════════════════════════════════════════════════════════
   DOCUMENTO PDF
══════════════════════════════════════════════════════════ */
.pdf-preview-modal {
  max-width: 920px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
}

.pdf-preview-body {
  background: #f3f4f6;
  padding: 1.2rem;
  overflow-y: auto;
}

.pdf-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 1rem 1.3rem;
  border-top: 1px solid #f3f3f8;
  background: #fff;
}

</style>