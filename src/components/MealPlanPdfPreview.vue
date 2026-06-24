<template>
  <div class="pdf-document">

    <!-- ── HEADER ──────────────────────────────────────────── -->
    <div class="doc-header">
      <div class="clinic-block">
        <div class="clinic-logo">
          <img :src="nutriaLogo" alt="Nutria" class="clinic-logo-img" />
        </div>
        <div class="clinic-text">
          <p>{{ doctorName }}</p>
          <span>{{ contactLine }}</span>
        </div>
      </div>

      <div class="doc-title-block">
        <h2>Plan alimenticio</h2>
        <p>Emitido: {{ issuedDate }}</p>
      </div>
    </div>

    <!-- ── PATIENT INFO ────────────────────────────────────── -->
    <section class="info-section soft">
      <p class="section-label">Información del paciente</p>

      <div class="info-grid">
        <div>
          <span>Paciente</span>
          <strong>{{ selectedPatient || 'Sin seleccionar' }}</strong>
        </div>

        <div>
          <span>Periodo</span>
          <strong>{{ weekRangeLabel }}</strong>
        </div>

        <div>
          <span>Duración</span>
          <strong>{{ duration }} días</strong>
        </div>

        <div>
          <span>Fecha de inicio</span>
          <strong>{{ startDateLabel }}</strong>
        </div>
      </div>
    </section>

    <!-- ── MEAL PLAN ───────────────────────────────────────── -->
    <section class="plan-section">
      <div class="plan-title-row">
        <h3>Plan de comidas</h3>
        <span>{{ duration }} días</span>
      </div>

      <div
        v-for="(day, dayIndex) in days"
        :key="dayIndex"
        class="day-section"
      >
        <div class="day-title">
          <span class="day-number">{{ String(dayIndex + 1).padStart(2, '0') }}</span>
          <div class="day-title-text">
            <h4>{{ day.label }}</h4>
            <p>{{ day.dateLabel }}</p>
          </div>
        </div>

        <div
          v-for="meal in day.meals"
          :key="meal.id"
          class="meal-simple"
        >
          <div class="meal-simple-head">
            <strong>{{ meal.name }}</strong>
            <span>{{ meal.timeStart }} – {{ meal.timeEnd }}</span>
          </div>

          <ul v-if="meal.foods.length" class="meal-simple-list">
            <template
              v-for="food in meal.foods"
              :key="food.uid"
            >
              <li v-if="food.source !== 'recipe'">
                {{ food.quantity }} {{ food.unit }} de {{ food.name }}
              </li>

              <li v-else>
                {{ food.name }}

                <ul
                  v-if="food.adjustedIngredients?.length"
                  class="ingredient-simple-list"
                >
                  <li
                    v-for="ingredient in food.adjustedIngredients"
                    :key="ingredient"
                  >
                    {{ ingredient }}
                  </li>
                </ul>
              </li>
            </template>
          </ul>

          <p v-else class="empty-meal">
            Sin alimentos agregados
          </p>
        </div>
      </div>
    </section>

    <!-- ── RECOMMENDATIONS ─────────────────────────────────── -->
<section v-if="recommendationLines.length" class="notes-section">
  <h3>Recomendaciones generales</h3>

  <ul>
    <li
      v-for="(recommendation, index) in recommendationLines"
      :key="index"
    >
      {{ recommendation }}
    </li>
  </ul>
</section>

    <!-- ── FOOTER ──────────────────────────────────────────── -->
    <footer class="doc-footer">
      <p>
        Documento generado con Nutría. Este plan es personal y debe seguirse bajo supervisión profesional.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import nutriaLogo from '@/assets/logo-nutria-07.png'

interface PlanFood {
  uid: string
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
  source?: 'food' | 'recipe'
  recipeId?: string
  recipeName?: string
  adjustedIngredients?: string[]
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

const props = defineProps<{
  selectedPatient: string
  duration: number
  caloricTarget: number
  weekRangeLabel: string
  days: DayPlan[]
  generalRecommendations?: string

  doctorName?: string
  doctorEmail?: string
  doctorPhone?: string
}>()

const doctorName = computed(() => {
  return props.doctorName || 'Nutriólogo'
})

const contactLine = computed(() => {
  const items = []

  if (props.doctorEmail) {
    items.push(`Correo: ${props.doctorEmail}`)
  }

  if (props.doctorPhone) {
    items.push(`Tel: ${props.doctorPhone}`)
  }

  return items.length ? items.join(' · ') : 'Sin datos de contacto'
})

const issuedDate = new Date().toLocaleDateString('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const startDateLabel = props.days[0]?.dateLabel ?? 'Sin fecha'

const recommendationLines = computed(() => {
  return (props.generalRecommendations ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   DOCUMENTO BASE
══════════════════════════════════════════════════════════ */
.pdf-document {
  width: 720px;
  min-height: 1018px;
  margin: 0 auto;
  background: #ffffff;
  color: #1a1a1a;
  font-family: Georgia, 'Times New Roman', serif;
  box-shadow: 0 18px 50px rgba(15, 25, 35, .18);
  border-radius: 20px;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
}

/* Borde superior decorativo de marca */
.pdf-document::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 6px;
  background: linear-gradient(90deg, #3E9B92 0%, #5fb6ab 50%, #3E9B92 100%);
}

/* ══════════════════════════════════════════════════════════
   HEADER
══════════════════════════════════════════════════════════ */
.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 28px;
  padding: 40px 42px 28px;
  border-bottom: 2px solid #3E9B92;
  background:
    radial-gradient(circle at 100% 0%, rgba(62,155,146,.06), transparent 55%),
    #ffffff;
}

.doc-header > * { min-width: 0; }

.clinic-block {
  display: flex;
  align-items: center;
  gap: 1px;
}

.clinic-logo {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.clinic-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.clinic-text {
  border-left: 2px solid #ffffff;
  padding-left: 14px;
}

.clinic-block p {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #0f1923;
  margin-top: 0;
  letter-spacing: -.1px;
}

.clinic-block span {
  display: block;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.doc-title-block {
  text-align: right;
  flex-shrink: 1;
  max-width: 260px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.doc-kicker {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: #3E9B92;
  margin-bottom: 5px;
}

.doc-title-block h2 {
    font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #0f1923;
  margin: 0;
  white-space: normal;
  word-break: normal;
  line-height: 1.2;
}

.doc-title-block p {
  display: block;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 11px;
  color: #6b7280;
  margin-top: 7px;
}


/* ══════════════════════════════════════════════════════════
   INFO PACIENTE
══════════════════════════════════════════════════════════ */
.info-section {
  padding: 24px 42px;
  border-bottom: 1px solid #e2e8f0;
}

.info-section.soft {
  background: #ffffff;
}

.section-label {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 10.5px;
  color: #3E9B92;
  text-transform: uppercase;
  letter-spacing: .1em;
  font-weight: 800;
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.info-grid div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 12px;
  border-left: 2px solid #d9ece9;
}

.info-grid span {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 9.5px;
  color: #8a93a3;
  text-transform: uppercase;
  letter-spacing: .04em;
  font-weight: 700;
}

.info-grid strong {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 12.5px;
  color: #0f1923;
  font-weight: 600;
}

/* ══════════════════════════════════════════════════════════
   PLAN DE COMIDAS
══════════════════════════════════════════════════════════ */
.plan-section {
  padding: 28px 42px;
  border-bottom: 1px solid #e2e8f0;
}

.plan-title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ece3cf;
}

.plan-title-row h3 {
  font-size: 17px;
  font-weight: 700;
  color: #0f1923;
  margin: 0;
  letter-spacing: -.2px;
}

.plan-title-row span {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 11px;
  color: #3E9B92;
  font-weight: 700;
  letter-spacing: .03em;
}

.day-section {
  margin-bottom: 22px;
  break-inside: avoid;
  page-break-inside: avoid;
}

.day-section:last-child { margin-bottom: 0; }

.day-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.day-number {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: #3E9B92;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.day-title-text h4 {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #0f1923;
  margin: 0;
}

.day-title-text p {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 10.5px;
  color: #9ca3af;
  margin-top: 1px;
}

.meal-simple {
  margin-bottom: 14px;
  padding-left: 36px;
  break-inside: avoid;
  page-break-inside: avoid;
}

.meal-simple:last-child { margin-bottom: 0; }

.meal-simple-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 5px;
  min-width: 0;
}

.meal-simple-head strong {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 12.5px;
  font-weight: 700;
  color: #1f7068;
  position: relative;
  padding-left: 14px;
}
.meal-simple-head strong::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #3E9B92;
}

.meal-simple-head span {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 10.5px;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}

.meal-simple-list {
  margin: 0;
  padding-left: 14px;
  list-style: none;
}

.meal-simple-list > li {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 12px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 4px;
  position: relative;
  padding-left: 14px;
}
.meal-simple-list > li::before {
  content: '–';
  position: absolute;
  left: 0;
  color: #b9c7c4;
}

.meal-simple-list > li:last-child { margin-bottom: 0; }

.ingredient-simple-list {
  margin: 5px 0 3px;
  padding-left: 16px;
  list-style: none;
}

.ingredient-simple-list li {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 11px;
  color: #5b6472;
  line-height: 1.5;
  margin-bottom: 2px;
  position: relative;
  padding-left: 12px;
}
.ingredient-simple-list li::before {
  content: '·';
  position: absolute;
  left: 0;
  color: #cbd5e1;
  font-weight: 700;
}

.empty-meal {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 11px;
  color: #b0b8cc;
  font-style: italic;
  margin: 0;
  padding-left: 14px;
}

/* ══════════════════════════════════════════════════════════
   RECOMENDACIONES
══════════════════════════════════════════════════════════ */
.notes-section {
  padding: 28px 42px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #ffffff 100%);
}

.notes-section h3 {
  font-size: 16px;
  font-weight: 800;
  color: #0f1923;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 9px;
}
.notes-section h3::before {
  content: '';
  width: 4px;
  height: 17px;
  background: #3E9B92;
  border-radius: 4px;
  display: inline-block;
}

.notes-section ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.notes-section li {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 12px;
  color: #374151;
  line-height: 1.55;
  margin-bottom: 9px;
  padding-left: 22px;
  position: relative;
}
.notes-section li::before {
  content: '✓';
  position: absolute;
  left: 0; top: 0;
  width: 15px; height: 15px;
  font-size: 9px;
  font-weight: 800;
  color: #fff;
  background: #3E9B92;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notes-section li:last-child { margin-bottom: 0; }

/* ══════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════ */
.doc-footer {
  padding: 20px 42px 26px;
  text-align: center;
}

.doc-footer p {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 10px;
  color: #9ca3af;
  border-top: 1px solid #e2e8f0;
  padding-top: 14px;
  letter-spacing: .01em;
}

/* ══════════════════════════════════════════════════════════
   RESPONSIVE PREVIEW
══════════════════════════════════════════════════════════ */
@media (max-width: 980px) {
  .pdf-document {
    width: 100%;
    min-height: auto;
  }

  .doc-header {
    flex-direction: column;
  }

  .doc-title-block {
    text-align: left;
    align-items: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .doc-header,
  .info-section,
  .plan-section,
  .notes-section,
  .doc-footer {
    padding-left: 22px;
    padding-right: 22px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .meal-simple {
    padding-left: 0;
  }

  .meal-simple-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }
}
</style>