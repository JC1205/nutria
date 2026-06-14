<template>
  <main style="padding: 40px">
    <h1 style="font-size: 32px; font-weight: 700">
      Bienvenido a NutriPro
    </h1>

    <p v-if="auth.profile" style="margin-top: 12px">
      Hola, {{ auth.profile.first_name }} {{ auth.profile.last_name }}
    </p>

    <button
      style="margin-top: 24px"
      @click="handleLogout"
    >
      Cerrar sesión
    </button>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>