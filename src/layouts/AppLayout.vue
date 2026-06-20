<template>
  <div class="app-layout">
    <Sidebar />

    <main class="app-main">
      <RouterView />
    </main>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  background: #f8fafb;
}

.app-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}
</style>