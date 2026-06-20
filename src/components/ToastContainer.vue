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
          <span class="toast-dot"></span>

          <p>{{ toast.message }}</p>

          <button @click="toastStore.remove(toast.id)">
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'

const toastStore = useToastStore()
</script>

<style scoped>
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

.toast {
  min-width: 280px;
  max-width: 360px;
  background: #fff;
  border: 1.5px solid #eef0f4;
  border-radius: 16px;
  padding: 12px 13px;
  box-shadow: 0 18px 45px rgba(15, 25, 35, .16);
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}

.toast-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.toast.success .toast-dot {
  background: #10b981;
}

.toast.error .toast-dot {
  background: #ef4444;
}

.toast.info .toast-dot {
  background: #3E9B92;
}

.toast p {
  flex: 1;
  font-size: .86rem;
  color: #0f1923;
  font-weight: 700;
  line-height: 1.35;
}

.toast button {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: .2s ease;
}

.toast button:hover {
  background: #e5e7eb;
  color: #0f1923;
}

.toast-enter-active,
.toast-leave-active {
  transition: .25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

.toast-move {
  transition: transform .25s ease;
}

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