<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast"
          :class="toast.type"
        >
          <!-- Ícono según tipo -->
          <div class="toast-icon-wrap">
            <CheckCircle v-if="toast.type === 'success'" :size="17" class="toast-icon" />
            <XCircle     v-else-if="toast.type === 'error'"   :size="17" class="toast-icon" />
            <Info        v-else                                :size="17" class="toast-icon" />
          </div>

          <p>{{ toast.message }}</p>

          <button class="toast-close" @click="toastStore.remove(toast.id)" aria-label="Cerrar">
            <X :size="14" />
          </button>

          <!-- Barra de progreso -->
          <div class="toast-progress" />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, XCircle, Info, X } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast.store'

const toastStore = useToastStore()
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   CONTENEDOR
══════════════════════════════════════════════════════════ */
.toast-container {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

/* ══════════════════════════════════════════════════════════
   TOAST — liquid glass base
══════════════════════════════════════════════════════════ */
.toast {
  min-width: 290px;
  max-width: 370px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 13px 14px 13px 13px;
  display: flex;
  align-items: center;
  gap: 11px;
  pointer-events: auto;
  cursor: default;

  /* Liquid glass: capas de vidrio esmerilado */
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow:
    0 8px 32px rgba(15, 25, 35, .14),
    0 1px 0 rgba(255,255,255,.85) inset,
    0 -1px 0 rgba(0,0,0,.06) inset;
}

/* Reflejo superior (efecto vidrio) */
.toast::before {
  content: '';
  position: absolute;
  inset: 0 0 50% 0;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,.45) 0%,
    rgba(255,255,255,.0) 100%
  );
  border-radius: 20px 20px 0 0;
  pointer-events: none;
  z-index: 0;
}

/* Capa de color de tono suave por tipo */
.toast.success { background: rgba(231, 245, 243, 0.72); border-color: rgba(62,155,146,.35); }
.toast.error   { background: rgba(255, 241, 241, 0.72); border-color: rgba(239,68,68,.3); }
.toast.info    { background: rgba(255, 255, 255, 0.62); border-color: rgba(255,255,255,.72); }

/* ── Ícono ──────────────────────────────────────────────── */
.toast-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.toast.success .toast-icon-wrap {
  background: rgba(62,155,146,.15);
  border: 1px solid rgba(62,155,146,.25);
}
.toast.success .toast-icon { color: #2d8078; }

.toast.error .toast-icon-wrap {
  background: rgba(239,68,68,.12);
  border: 1px solid rgba(239,68,68,.22);
}
.toast.error .toast-icon { color: #dc2626; }

.toast.info .toast-icon-wrap {
  background: rgba(62,155,146,.1);
  border: 1px solid rgba(62,155,146,.18);
}
.toast.info .toast-icon { color: #3E9B92; }

/* ── Texto ──────────────────────────────────────────────── */
.toast p {
  flex: 1;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: .85rem;
  color: #0f1923;
  font-weight: 600;
  line-height: 1.4;
  position: relative;
  z-index: 1;
}

/* ── Botón cerrar ───────────────────────────────────────── */
.toast-close {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 9px;
  background: rgba(0,0,0,.06);
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background .15s, color .15s;
  position: relative;
  z-index: 1;
}
.toast-close:hover {
  background: rgba(0,0,0,.12);
  color: #0f1923;
}

/* ── Barra de progreso ──────────────────────────────────── */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  border-radius: 0 0 20px 20px;
  animation: toastProgress 4s linear forwards;
  z-index: 2;
}

.toast.success .toast-progress { background: linear-gradient(90deg, #3E9B92, #5fb6ab); }
.toast.error   .toast-progress { background: linear-gradient(90deg, #ef4444, #f87171); }
.toast.info    .toast-progress { background: linear-gradient(90deg, #3E9B92, #5fb6ab); }

/* ══════════════════════════════════════════════════════════
   TRANSICIONES
══════════════════════════════════════════════════════════ */
.toast-enter-active {
  transition: all .35s cubic-bezier(.34, 1.56, .64, 1);
}
.toast-leave-active {
  transition: all .25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(24px) scale(.92);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px) scale(.96);
}
.toast-move {
  transition: transform .3s ease;
}

/* ══════════════════════════════════════════════════════════
   ANIMACIONES
══════════════════════════════════════════════════════════ */
@keyframes toastProgress {
  from { width: 100%; }
  to   { width: 0%;   }
}

/* ══════════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════════ */
@media (max-width: 560px) {
  .toast-container {
    left: 14px;
    right: 14px;
    bottom: 14px;
  }

  .toast {
    min-width: unset;
    max-width: none;
    width: 100%;
  }
}
</style>