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
        <button class="btn-appt" @click="goToNewAppointment">
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
                   {{ d }}
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
    <div class="card-head">
      <h2 class="card-title">Planes de comida asignados</h2>

      <button class="btn-appt" @click="goToNewMealPlan">
        Crear plan
      </button>
    </div>

    <div class="meal-plans-list">
      <div v-if="loadingMealPlans" class="empty-state">
        Cargando planes...
      </div>

      <div v-else-if="!mealPlans.length" class="empty-state">
        Este paciente todavía no tiene planes guardados.
      </div>

      <template v-else>
        <button
  v-for="plan in mealPlans"
  :key="plan.id"
  class="meal-plan-item"
  @click="openMealPlanDetail(plan)"
>
  <div class="meal-plan-icon">
    🥗
  </div>

  <div class="meal-plan-info">
    <strong>{{ plan.title }}</strong>

    <span>
      {{ plan.duration_days }} días

      <template v-if="plan.start_date">
        · Inicio: {{ formatDate(plan.start_date) }}
      </template>

      · Guardado: {{ formatDate(plan.created_at) }}
    </span>

    <p v-if="plan.notes">
      {{ plan.notes }}
    </p>
  </div>

  <div class="meal-plan-actions">
  <span class="meal-plan-action">Ver plan</span>

  <button
  class="delete-mini-btn"
  @click.stop="askDeleteMealPlan(plan)"
  title="Eliminar plan"
>
  Eliminar
</button>
</div>
</button>
      </template>
    </div>
  </div>
</div>

      <!-- ══ TAB: Documentos ══ -->
      <div v-if="activeTab === 'documents'" class="tab-pane">
  <div class="card">
    <h2 class="card-title">Documentos</h2>

    <div class="documents-list">
      <div v-if="loadingDocuments" class="empty-state">
        Cargando documentos...
      </div>

      <div v-else-if="!documents.length" class="empty-state">
        No hay documentos guardados para este paciente.
      </div>

      <template v-else>
        <button
          v-for="doc in documents"
          :key="doc.id"
          class="document-item"
          @click="openDocument(doc)"
        >
          <div class="document-icon">
            <FileText :size="18" />
          </div>

          <div class="document-info">
            <strong>{{ doc.name }}</strong>

            <span>
              {{ doc.type === 'meal_plan_pdf' ? 'Plan alimenticio PDF' : 'Documento' }}

              <template v-if="doc.file_size_kb">
                · {{ doc.file_size_kb }} KB
              </template>

              · {{ formatDate(doc.created_at) }}
            </span>
          </div>

          <div class="document-actions">
  <span class="document-action">Abrir</span>

  <button
  class="delete-mini-btn"
  @click.stop="askDeleteDocument(doc)"
  title="Eliminar documento"
>
  Eliminar
</button>
</div>
        </button>
      </template>
    </div>
  </div>
</div>

    </div><!-- /tab-content -->
<Transition name="modal-fade">
  <div v-if="editModalOpen" class="modal-overlay" @click.self="editModalOpen = false">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Editar paciente</h2>
          <p class="modal-sub">Actualiza la información del paciente</p>
        </div>

        <button class="modal-close" @click="editModalOpen = false">×</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="saveEditPatient">
          <div class="form-grid">
            <div class="form-field full">
              <label>Nombre completo</label>
              <input v-model="editForm.name" type="text" />
            </div>

            <div class="form-field">
              <label>Fecha de nacimiento</label>
              <input v-model="editForm.birthDate" type="date" />
            </div>

            <div class="form-field">
              <label>Sexo</label>
              <select v-model="editForm.sex">
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </select>
            </div>

            <div class="form-field">
              <label>Teléfono</label>
              <input v-model="editForm.phone" type="tel" />
            </div>

            <div class="form-field">
              <label>Altura (cm)</label>
              <input v-model.number="editForm.heightCm" type="number" step="0.1" />
            </div>

            <div class="form-field">
              <label>Peso actual (kg)</label>
              <input v-model.number="editForm.currentWeight" type="number" step="0.1" />
            </div>

            <div class="form-field">
              <label>Peso meta (kg)</label>
              <input v-model.number="editForm.goalWeight" type="number" step="0.1" />
            </div>

            <div class="form-field">
              <label>Calorías diarias</label>
              <input v-model.number="editForm.dailyCalories" type="number" />
            </div>

            <div class="form-field">
              <label>Calorías objetivo</label>
              <input v-model.number="editForm.targetCalories" type="number" />
            </div>

            <div class="form-field full">
              <label>Alergias</label>
              <textarea v-model="editForm.allergies" rows="2"></textarea>
            </div>

            <div class="form-field full">
              <label>Enfermedades</label>
              <textarea v-model="editForm.diseases" rows="2"></textarea>
            </div>

            <div class="form-field full">
              <label>Suplementos</label>
              <textarea v-model="editForm.supplements" rows="2"></textarea>
            </div>

            <div class="form-field full">
              <label>Alimentos que no le gustan</label>
              <textarea v-model="editForm.dislikedFoods" rows="2"></textarea>
            </div>

            <div class="form-field">
              <label>Tipo de ejercicio</label>
              <input v-model="editForm.exerciseType" type="text" />
            </div>

            <div class="form-field">
              <label>Intensidad</label>
              <select v-model="editForm.exerciseIntensity">
                <option value="">Sin registrar</option>
                <option value="Baja">Baja</option>
                <option value="Moderada">Moderada</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <div class="form-field">
              <label>Horas por sesión</label>
              <input v-model.number="editForm.exerciseHours" type="number" step="0.1" />
            </div>

            <div class="form-field">
              <label>Días por semana</label>
              <input v-model.number="editForm.exerciseDays" type="number" min="0" max="7" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="editModalOpen = false">
              Cancelar
            </button>

            <button type="submit" class="btn-appt" :disabled="savingEdit">
              {{ savingEdit ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</Transition>

<Transition name="modal-fade">
  <div
    v-if="mealPlanDetailModal.open"
    class="modal-overlay"
    @click.self="mealPlanDetailModal.open = false"
  >
    <div class="modal-card meal-plan-detail-modal">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">
            {{ selectedMealPlan?.title || 'Detalle del plan' }}
          </h2>

          <p class="modal-sub">
            {{ selectedMealPlan?.duration_days }} días
            <template v-if="selectedMealPlan?.start_date">
              · Inicio: {{ formatDate(selectedMealPlan.start_date) }}
            </template>
          </p>
        </div>

        <button class="modal-close" @click="mealPlanDetailModal.open = false">
          ×
        </button>
      </div>

      <div class="plan-detail-summary">
        <div>
          <span>Paciente</span>
          <strong>{{ patient.name }}</strong>
        </div>

        <div>
          <span>Duración</span>
          <strong>{{ selectedMealPlan?.duration_days || 0 }} días</strong>
        </div>

        <div>
          <span>Inicio</span>
          <strong>
            {{ selectedMealPlan?.start_date ? formatDate(selectedMealPlan.start_date) : 'Sin fecha' }}
          </strong>
        </div>

        <div>
          <span>Elementos</span>
          <strong>{{ selectedMealPlanItems.length }}</strong>
        </div>
      </div>

      <div class="modal-body plan-detail-body">
        <div v-if="loadingMealPlanDetail" class="empty-state">
          Cargando detalle del plan...
        </div>

        <div v-else-if="!selectedMealPlanItems.length" class="empty-state">
          Este plan no tiene alimentos guardados.
        </div>

        <div v-else class="saved-plan-detail">
          <div
            v-for="dayNumber in selectedMealPlan?.duration_days || 0"
            :key="dayNumber"
            class="saved-plan-day"
          >
            <div class="saved-plan-day-title">
              <div>
                <h3>Día {{ dayNumber }}</h3>
                <p>{{ itemsByDay(dayNumber).length }} elementos guardados</p>
              </div>

              <span>{{ itemsByDay(dayNumber).length }}</span>
            </div>

            <div class="saved-plan-meals">
              <div
                v-for="mealType in ['desayuno', 'colacion_manana', 'comida', 'colacion_tarde', 'cena']"
                :key="mealType"
                class="saved-plan-meal"
              >
                <div class="saved-plan-meal-title">
                  {{ mealTypeLabel(mealType) }}
                </div>

                <div
                  v-if="itemsByMeal(dayNumber, mealType).length"
                  class="saved-plan-foods"
                >
                  <div
                    v-for="item in itemsByMeal(dayNumber, mealType)"
                    :key="item.id"
                    class="saved-plan-food"
                  >
                    <strong>{{ cleanPortionNote(item.portion_notes) }}</strong>

                    <p v-if="cleanPortionDetail(item.portion_notes)">
                      {{ cleanPortionDetail(item.portion_notes) }}
                    </p>
                  </div>
                </div>

                <p v-else class="saved-plan-empty-meal">
                  Sin alimentos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer plan-detail-footer">
        <button class="btn-secondary" @click="mealPlanDetailModal.open = false">
          Cerrar
        </button>

        <button class="btn-appt" @click="editMealPlan(selectedMealPlan)">
          <Pencil :size="15" />
          Editar plan
        </button>
      </div>
    </div>
  </div>
</Transition>
<Transition name="modal-fade">
  <div
    v-if="deleteMealPlanModal.open"
    class="modal-overlay"
    @click.self="deleteMealPlanModal.open = false"
  >
    <div class="modal-card delete-modal">
      <div class="delete-icon">
        🗑️
      </div>

      <h3 class="delete-title">¿Eliminar plan?</h3>

      <p class="delete-sub">
        Se eliminará el plan
        <strong>{{ deleteMealPlanModal.plan?.title }}</strong>
        y todos sus alimentos guardados.
      </p>

      <div class="delete-actions">
        <button
          class="btn-secondary"
          @click="deleteMealPlanModal.open = false"
          :disabled="deleteMealPlanModal.deleting"
        >
          Cancelar
        </button>

        <button
          class="btn-danger"
          @click="deleteMealPlan"
          :disabled="deleteMealPlanModal.deleting"
        >
          {{ deleteMealPlanModal.deleting ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </div>
    </div>
  </div>
</Transition>
<Transition name="modal-fade">
  <div
    v-if="deleteDocumentModal.open"
    class="modal-overlay"
    @click.self="deleteDocumentModal.open = false"
  >
    <div class="modal-card delete-modal">
      <div class="delete-icon">
        📄
      </div>

      <h3 class="delete-title">¿Eliminar documento?</h3>

      <p class="delete-sub">
        Se eliminará el documento
        <strong>{{ deleteDocumentModal.document?.name }}</strong>
        del paciente y también del almacenamiento.
      </p>

      <div class="delete-actions">
        <button
          class="btn-secondary"
          @click="deleteDocumentModal.open = false"
          :disabled="deleteDocumentModal.deleting"
        >
          Cancelar
        </button>

        <button
          class="btn-danger"
          @click="deleteDocument"
          :disabled="deleteDocumentModal.deleting"
        >
          {{ deleteDocumentModal.deleting ? 'Eliminando...' : 'Eliminar' }}
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
import { useToastStore } from '@/stores/toast.store'
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

const editModalOpen = ref(false)
const savingEdit = ref(false)

const documents = ref<DocumentRow[]>([])
const loadingDocuments = ref(false)

const mealPlans = ref<MealPlanRow[]>([])
const loadingMealPlans = ref(false)

const selectedMealPlan = ref<MealPlanRow | null>(null)
const selectedMealPlanItems = ref<MealPlanItemRow[]>([])
const loadingMealPlanDetail = ref(false)

const toast = useToastStore()

const mealPlanDetailModal = reactive({
  open: false,
})

const deleteMealPlanModal = reactive<{
  open: boolean
  plan: MealPlanRow | null
  deleting: boolean
}>({
  open: false,
  plan: null,
  deleting: false,
})

const deleteDocumentModal = reactive<{
  open: boolean
  document: DocumentRow | null
  deleting: boolean
}>({
  open: false,
  document: null,
  deleting: false,
})

const editForm = reactive({
  name: '',
  birthDate: '',
  sex: 'F' as 'F' | 'M',
  phone: '',

  heightCm: null as number | null,
  currentWeight: null as number | null,
  goalWeight: null as number | null,

  dailyCalories: null as number | null,
  targetCalories: null as number | null,

  allergies: '',
  diseases: '',
  supplements: '',
  dislikedFoods: '',

  exerciseType: '',
  exerciseIntensity: '',
  exerciseHours: null as number | null,
  exerciseDays: null as number | null,
})

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
  birthDate: string | null
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
  color: '#3E9B92',
  age: 0,
  birthDate: null,
  sex: 'F',
  height: 0,
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

interface DocumentRow {
  id: string
  name: string
  type: string
  file_path: string | null
  file_size_kb: number | null
  meal_plan_id: string | null
  created_at: string
}

interface MealPlanRow {
  id: string
  title: string
  duration_days: number
  start_date: string | null
  notes: string | null
  created_at: string
}

interface MealPlanItemRow {
  id: string
  meal_plan_id: string
  recipe_id: string | null
  day_number: number
  meal_type: string
  portion_notes: string | null
  order_index: number | null
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
    color: data.color ?? '#3E9B92',
    age: calculateAge(data.birth_date),
    sex: data.sex === 'male' ? 'M' : 'F',
    birthDate: data.birth_date,
    // Por ahora tu tabla patients no tiene estatura.
    // Después podemos agregar height_cm a la base de datos.
    height: Number(data.height_cm ?? 0),

    currentWeight,
    goalWeight,
    phone: data.phone ?? 'Sin registrar',
    status: data.status === 'Inactive' ? 'Inactive' : 'Active',
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


async function ensureUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}


async function loadDocuments() {
  const user = await ensureUser()

  if (!user || !patient.value) return

  loadingDocuments.value = true

  const { data, error } = await supabase
    .from('documents')
    .select('id, name, type, file_path, file_size_kb, meal_plan_id, created_at')
    .eq('user_id', user.id)
    .eq('patient_id', patient.value.id)
    .order('created_at', { ascending: false })

  loadingDocuments.value = false

  if (error) {
    pageError.value = error.message
    return
  }

  documents.value = data ?? []
}

async function openDocument(doc: DocumentRow) {
  if (!doc.file_path) {
  pageError.value = 'Este documento no tiene archivo asociado.'
  toast.error(pageError.value)
  return
}

  const { data, error } = await supabase.storage
    .from('nutria-files')
    .createSignedUrl(doc.file_path, 60)

  if (error) {
  pageError.value = error.message
  toast.error(pageError.value)
  return
}

  window.open(data.signedUrl, '_blank')
}

function askDeleteDocument(doc: DocumentRow) {
  deleteDocumentModal.document = doc
  deleteDocumentModal.open = true
}

async function deleteDocument() {
  const doc = deleteDocumentModal.document

  if (!doc) return

  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  deleteDocumentModal.deleting = true
  pageError.value = ''

  try {
    if (doc.file_path) {
      const { error: storageError } = await supabase.storage
        .from('nutria-files')
        .remove([doc.file_path])

      if (storageError) throw storageError
    }

    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', doc.id)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    documents.value = documents.value.filter((item) => item.id !== doc.id)

    deleteDocumentModal.open = false
    deleteDocumentModal.document = null

    toast.success('Documento eliminado correctamente.')
  } catch (err) {
    pageError.value =
      err instanceof Error
        ? err.message
        : 'No se pudo eliminar el documento.'

    toast.error(pageError.value)
  } finally {
    deleteDocumentModal.deleting = false
  }
}

async function loadMealPlans() {
  const user = await ensureUser()

  if (!user || !patient.value) return

  loadingMealPlans.value = true

  const { data, error } = await supabase
    .from('meal_plans')
    .select('id, title, duration_days, start_date, notes, created_at')
    .eq('user_id', user.id)
    .eq('patient_id', patient.value.id)
    .order('created_at', { ascending: false })

  loadingMealPlans.value = false

  if (error) {
    pageError.value = error.message
    return
  }

  mealPlans.value = data ?? []
}

function askDeleteMealPlan(plan: MealPlanRow) {
  deleteMealPlanModal.plan = plan
  deleteMealPlanModal.open = true
}

async function deleteMealPlan() {
  const plan = deleteMealPlanModal.plan

  if (!plan) return

  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  deleteMealPlanModal.deleting = true
  pageError.value = ''

  try {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', plan.id)
      .eq('user_id', user.id)

    if (error) throw error

    mealPlans.value = mealPlans.value.filter((item) => item.id !== plan.id)

    if (selectedMealPlan.value?.id === plan.id) {
      mealPlanDetailModal.open = false
      selectedMealPlan.value = null
      selectedMealPlanItems.value = []
    }

    deleteMealPlanModal.open = false
    deleteMealPlanModal.plan = null

    toast.success('Plan eliminado correctamente.')
  } catch (err) {
    pageError.value =
      err instanceof Error
        ? err.message
        : 'No se pudo eliminar el plan.'

        toast.error(pageError.value)
  } finally {
    deleteMealPlanModal.deleting = false
  }
}

function goToNewMealPlan() {
  router.push({
    path: '/meal-plans',
    query: {
      patientId: patient.value?.id,
    },
  })
}

function editMealPlan(plan: MealPlanRow | null) {
  if (!plan) return

  router.push({
    path: '/meal-plans',
    query: {
      patientId: patient.value.id,
      mealPlanId: plan.id,
      mode: 'edit',
    },
  })
}

async function openMealPlanDetail(plan: MealPlanRow) {
  selectedMealPlan.value = plan
  selectedMealPlanItems.value = []
  mealPlanDetailModal.open = true
  loadingMealPlanDetail.value = true
  pageError.value = ''

  const { data, error } = await supabase
    .from('meal_plan_items')
    .select('id, meal_plan_id, recipe_id, day_number, meal_type, portion_notes, order_index')
    .eq('meal_plan_id', plan.id)
    .order('day_number', { ascending: true })
    .order('order_index', { ascending: true })

  loadingMealPlanDetail.value = false

  if (error) {
    pageError.value = error.message
    return
  }

  selectedMealPlanItems.value = data ?? []
}

function mealTypeLabel(type: string) {
  const labels: Record<string, string> = {
    desayuno: 'Desayuno',
    colacion_manana: 'Colación matutina',
    comida: 'Comida',
    colacion_tarde: 'Colación vespertina',
    cena: 'Cena',
  }

  return labels[type] ?? type
}

function itemsByDay(dayNumber: number) {
  return selectedMealPlanItems.value.filter((item) => item.day_number === dayNumber)
}

function itemsByMeal(dayNumber: number, mealType: string) {
  return selectedMealPlanItems.value.filter(
    (item) => item.day_number === dayNumber && item.meal_type === mealType,
  )
}

function cleanPortionNote(note: string | null) {
  if (!note) return 'Sin descripción'

  const parts = note.split('|').map((part) => part.trim())

  return parts[0] ?? note
}

function cleanPortionDetail(note: string | null) {
  if (!note) return ''

  const parts = note.split('|').map((part) => part.trim())

  return parts.slice(1).join(' · ')
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
  editModalOpen.value = true

  editForm.name = patient.value.name
  editForm.birthDate = patient.value.birthDate ?? ''
  editForm.sex = patient.value.sex
  editForm.phone = patient.value.phone === 'Sin registrar' ? '' : patient.value.phone

  editForm.heightCm = patient.value.height
  editForm.currentWeight = patient.value.currentWeight
  editForm.goalWeight = patient.value.goalWeight

  editForm.dailyCalories = patient.value.caloricGoal
  editForm.targetCalories = patient.value.caloricGoal

  editForm.exerciseType = patient.value.exerciseType === 'Sin registrar' ? '' : patient.value.exerciseType
  editForm.exerciseIntensity = patient.value.exerciseIntensity
  editForm.exerciseHours = patient.value.exerciseHours
  editForm.exerciseDays = patient.value.exerciseDays

  editForm.allergies = patient.value.allergies.join(', ')
  editForm.dislikedFoods = patient.value.dislikes.join(', ')
  editForm.diseases = patient.value.conditions.map((c) => c.name).join(', ')
  editForm.supplements = patient.value.supplements.map((s) => s.name).join(', ')
}

function goToNewAppointment() {
  router.push({
    path: '/appointments',
    query: {
      patientId: patient.value.id,
    },
  })
}


async function saveEditPatient() {
  if (!auth.user) return

  savingEdit.value = true
  pageError.value = ''

  const payload = {
    full_name: editForm.name.trim(),
    birth_date: editForm.birthDate || null,
    sex: editForm.sex === 'F' ? 'female' : 'male',
    phone: editForm.phone.trim() || null,

    height_cm: editForm.heightCm,
    current_weight: editForm.currentWeight,
    goal_weight: editForm.goalWeight,

    daily_calories: editForm.dailyCalories,
    target_calories: editForm.targetCalories,

    allergies: editForm.allergies.trim() || null,
    diseases: editForm.diseases.trim() || null,
    supplements: editForm.supplements.trim() || null,
    disliked_foods: editForm.dislikedFoods.trim() || null,

    exercise_type: editForm.exerciseType.trim() || null,
    exercise_intensity: editForm.exerciseIntensity || null,
    exercise_hours: editForm.exerciseHours,
    exercise_days: editForm.exerciseDays,
  }

  const { error } = await supabase
    .from('patients')
    .update(payload)
    .eq('id', patient.value.id)
    .eq('user_id', auth.user.id)

  savingEdit.value = false

  if (error) {
    pageError.value = error.message
    return
  }

  editModalOpen.value = false
  await loadPatient()
}

onMounted(async () => {
  setTimeout(() => {
    mounted.value = true
  }, 80)

  await loadPatient()
  await loadMealPlans()
  await loadDocuments()
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
.back-btn:hover { color: #3E9B92; background: #e6f8f6; }

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
  border-radius: 40px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; font-weight: 700; color: #fff;
  flex-shrink: 0;
}

.hero-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f1923;
  letter-spacing: -.4px;
  margin-bottom: 0;
  margin-top: 0;
  padding-bottom: 9px;
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
.btn-edit:hover { border-color: #3E9B92; color: #3E9B92; background: #f1fbfa; }

.btn-appt {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px;
  background: #3E9B92;
  color: #fff;
  border: none;
  border-radius: 11px;
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: .2s;
}
.btn-appt:hover { background: #357d76; transform: translateY(-1px);  box-shadow: 0 4px 14px rgba(175, 175, 176, 0.35); }
.btn-appt.small { padding: 7px 14px; font-size: .82rem; }

/* ── Tabs ─────────────────────────────────────────────────── */
.tabs-bar {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid #f0f0f5;
  margin-bottom: 1.6rem;
  flex-wrap: wrap;
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
.tab-btn:hover { color: #3E9B92; }
.tab-btn.active {
  color: #3E9B92;
  font-weight: 600;
  border-bottom-color: #3E9B92;
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
.prog-goal     { font-size: 1.1rem; font-weight: 700; color: #3E9B92; }

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
  background: linear-gradient(90deg, #3E9B92, #3E9B92);
  border-radius: 10px;
  transition: width 1s ease;
}
.prog-pct { font-size: .8rem; font-weight: 700; color: #3E9B92; min-width: 32px; }
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
.hs-val   { font-size: 1rem; font-weight: 700; color: #3E9B92; }

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
.meas-table tr:hover td { background: #f1fbfa; }

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
  background: #e6f8f6;
  border-radius: 10px;
  padding: 8px 12px;
  min-width: 50px;
  flex-shrink: 0;
}
.appt-day   { font-size: 1.2rem; font-weight: 700; color: #3E9B92; line-height: 1; }
.appt-month { font-size: .68rem; font-weight: 600; color: #3E9B92; text-transform: uppercase; }
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
.doc-download:hover { border-color: #3E9B92; color: #3E9B92; }

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
.doc-upload:hover { border-color: #3E9B92; color: #3E9B92; }
.upload-icon { font-size: 1.5rem; display: block; margin-bottom: 6px; }
.doc-upload a { color: #3E9B92; font-weight: 600; text-decoration: none; }

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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 25, 35, 0.45);
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
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #f3f3f8;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f1923;
  margin-bottom: 0;
}

.modal-sub {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 2px;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 1.5rem;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 13px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.88rem;
  color: #0f1923;
  background: #f9fafb;
  outline: none;
  font-family: inherit;
}

.form-field textarea {
  resize: vertical;
  min-height: 70px;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #3E9B92;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(142, 115, 168, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 1rem;
  border-top: 1px solid #f3f3f8;
  background: #fff;
  bottom: 0;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
}

@media (max-width: 600px) {
  .modal-overlay {
    align-items: flex-start;
    padding: 0.75rem;
  }

  .modal-card {
    max-width: 100%;
    max-height: 95vh;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.document-item {
  width: 100%;
  border: 1.5px solid #f0f0f5;
  background: #fff;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: .2s ease;
}

.document-item:hover {
  border-color: #3E9B92;
  background: #f1fbfa;
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(142, 115, 168, .12);
}

.document-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #e6f8f6;
  color: #3E9B92;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.document-info strong {
  font-size: .88rem;
  color: #0f1923;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-info span {
  font-size: .75rem;
  color: #9ca3af;
  font-weight: 600;
  line-height: 1.35;
}

.document-action {
  flex-shrink: 0;
  padding: 7px 12px;
  border-radius: 999px;
  background: #e6f8f6;
  color: #3E9B92;
  font-size: .76rem;
  font-weight: 800;
  transition: .2s ease;
}

.document-item:hover .document-action {
  background: #3E9B92;
  color: #fff;
}

.empty-state {
  padding: 1.2rem;
  border: 1.5px dashed #e5e7eb;
  border-radius: 14px;
  background: #fafafa;
  color: #9ca3af;
  font-size: .86rem;
  font-weight: 600;
  text-align: center;
}

@media (max-width: 560px) {
  .document-item {
    align-items: flex-start;
  }

  .document-action {
    display: none;
  }

  .document-info strong {
    white-space: normal;
  }
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 1rem;
}

.meal-plans-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meal-plan-item {
  width: 100%;
  border: 1.5px solid #f0f0f5;
  background: #fff;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: .2s ease;
}

.meal-plan-item:hover {
  border-color: #3E9B92;
  background: #f1fbfa;
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(142, 115, 168, .12);
}

.meal-plan-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #e6f8f6;
  color: #3E9B92;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.2rem;
}

.meal-plan-info {
  flex: 1;
  min-width: 0;
}

.meal-plan-info strong {
  display: block;
  font-size: .9rem;
  color: #0f1923;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meal-plan-info span {
  display: block;
  font-size: .75rem;
  color: #9ca3af;
  font-weight: 600;
  line-height: 1.35;
}

.meal-plan-info p {
  margin-top: 6px;
  font-size: .78rem;
  color: #6b7280;
  line-height: 1.35;
}

.empty-state {
  padding: 1.2rem;
  border: 1.5px dashed #e5e7eb;
  border-radius: 14px;
  background: #fafafa;
  color: #9ca3af;
  font-size: .86rem;
  font-weight: 600;
  text-align: center;
}

@media (max-width: 560px) {
  .card-head {
    flex-direction: column;
    align-items: stretch;
  }

  .card-head .btn-appt {
    width: 100%;
    justify-content: center;
  }

  .meal-plan-item {
    padding: 12px;
  }

  .meal-plan-info strong {
    white-space: normal;
  }
}


.meal-plan-item {
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.meal-plan-action {
  flex-shrink: 0;
  padding: 7px 12px;
  border-radius: 999px;
  background: #e6f8f6;
  color: #3E9B92;
  font-size: .76rem;
  font-weight: 800;
  transition: .2s ease;
}

.meal-plan-item:hover .meal-plan-action {
  background: #3E9B92;
  color: #fff;
}

.meal-plan-detail-modal {
  max-width: 860px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.plan-modal-hero {
  background: linear-gradient(135deg, #3E9B92, #3E9B92);
  color: #fff;
  padding: 1.35rem 1.5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.plan-modal-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.plan-modal-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(131, 84, 84, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.55rem;
  flex-shrink: 0;
}

.plan-modal-main h2 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

.plan-modal-main p {
  margin-top: 4px;
  font-size: .82rem;
  opacity: .86;
  font-weight: 600;
}

.modal-close.light {
  color: #fff;
  background: rgba(255, 255, 255, .15);
}

.modal-close.light:hover {
  background: rgba(255, 255, 255, .25);
}

.plan-modal-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 1rem 1.3rem;
  background: #f1fbfa;
  border-bottom: 1px solid #eee6f8;
}

.plan-modal-summary div {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.plan-modal-summary span {
  font-size: .68rem;
  color: #9ca3af;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.plan-modal-summary strong {
  font-size: .84rem;
  color: #0f1923;
  font-weight: 850;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-modal-body {
  overflow-y: auto;
  padding: 1.2rem 1.3rem;
}

.meal-plan-detail-modal {
  max-width: 820px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.plan-detail-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 1rem 1.3rem;
  background: #f1fbfa;
  border-bottom: 1px solid #e8faf8;
}

.plan-detail-summary div {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.plan-detail-summary span {
  font-size: .68rem;
  color: #9ca3af;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.plan-detail-summary strong {
  font-size: .84rem;
  color: #0f1923;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-detail-body {
  overflow-y: auto;
  padding: 1.2rem 1.3rem;
}

.saved-plan-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.saved-plan-day {
  border: 1.5px solid #eeeef5;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}

.saved-plan-day-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 15px;
  background: #f8fafb;
  border-bottom: 1px solid #eeeef5;
}

.saved-plan-day-title h3 {
  font-size: .95rem;
  font-weight: 700;
  color: #0f1923;
  margin: 0;
}

.saved-plan-day-title p {
  margin-top: 2px;
  font-size: .73rem;
  color: #9ca3af;
  font-weight: 600;
}

.saved-plan-day-title > span {
  min-width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #e6f8f6;
  color: #3E9B92;
  font-size: .78rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.saved-plan-meals {
  display: flex;
  flex-direction: column;
}

.saved-plan-meal {
  padding: 13px 15px;
  border-bottom: 1px solid #f4f4f8;
}

.saved-plan-meal:last-child {
  border-bottom: none;
}

.saved-plan-meal-title {
  font-size: .82rem;
  font-weight: 800;
  color: #3E9B92;
  margin-bottom: 8px;
}

.saved-plan-foods {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.saved-plan-food {
  padding: 9px 10px;
  border-radius: 12px;
  background: #fafafa;
  border: 1px solid #f1f1f6;
}

.saved-plan-food strong {
  display: block;
  font-size: .84rem;
  color: #0f1923;
  font-weight: 600;
}

.saved-plan-food p {
  margin-top: 3px;
  font-size: .74rem;
  color: #6b7280;
  line-height: 1.38;
}

.saved-plan-empty-meal {
  font-size: .76rem;
  color: #b0b8cc;
  font-style: italic;
  margin: 0;
}

.plan-detail-footer {
  padding: 1rem 1.3rem;
  border-top: 1px solid #f0f0f5;
  background: #fff;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

@media (max-width: 760px) {
  .plan-detail-summary {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .plan-detail-summary {
    grid-template-columns: 1fr;
  }

  .saved-plan-day-title {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .plan-detail-footer {
    flex-direction: column;
  }

  .plan-detail-footer .btn-secondary,
  .plan-detail-footer .btn-appt {
    width: 100%;
    justify-content: center;
  }
}

.document-actions,
.meal-plan-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.delete-mini-btn {
  border: 1.5px solid #fecaca;
  background: #fff1f1;
  color: #dc2626;
  border-radius: 999px;
  padding: 7px 11px;
  font-size: .74rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: .2s ease;
}

.delete-mini-btn:hover {
  background: #fee2e2;
  border-color: #ef4444;
  transform: translateY(-1px);
}

@media (max-width: 560px) {
  .document-actions,
  .meal-plan-actions {
    align-items: flex-end;
    flex-direction: column;
    gap: 6px;
  }

  .delete-mini-btn {
    padding: 6px 10px;
  }
}

.delete-modal {
  max-width: 380px;
  padding: 1.8rem;
  text-align: center;
}

.delete-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: #fff1f1;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin: 0 auto 1rem;
}

.delete-title {
  font-size: 1.15rem;
  font-weight: 850;
  color: #0f1923;
  margin: 0;
}

.delete-sub {
  margin: .55rem 0 1.3rem;
  font-size: .88rem;
  color: #6b7280;
  line-height: 1.5;
}

.delete-sub strong {
  color: #0f1923;
  font-weight: 850;
}

.delete-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  font-size: .86rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: .2s ease;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-danger:disabled,
.btn-secondary:disabled {
  opacity: .65;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .delete-actions {
    flex-direction: column;
  }

  .delete-actions .btn-secondary,
  .delete-actions .btn-danger {
    width: 100%;
  }
}
</style>