import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

import LoginPage from '@/pages/LoginPage.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import PatientsPage from '@/pages/PatientsPage.vue'
import PatientDetailPage from '@/pages/PatientDetailPage.vue'

const PlaceholderPage = {
  template: '<main style="padding: 32px;"><h1 style="font-size: 28px; font-weight: 700;">Página en construcción</h1></main>',
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/',
      component: AppLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardPage,
        },
        {
          path: 'patients',
          name: 'patients',
          component: PatientsPage,
        },
        {
  path: 'patients/:id',
  name: 'patient-detail',
  component: PatientDetailPage,
},
        {
          path: 'appointments',
          name: 'appointments',
          component: PlaceholderPage,
        },
        {
          path: 'food-equivalents',
          name: 'food-equivalents',
          component: PlaceholderPage,
        },
        {
          path: 'recipes',
          name: 'recipes',
          component: PlaceholderPage,
        },
        {
          path: 'meal-plans',
          name: 'meal-plans',
          component: PlaceholderPage,
        },
        {
          path: 'documents',
          name: 'documents',
          component: PlaceholderPage,
        },
        {
          path: 'settings',
          name: 'settings',
          component: PlaceholderPage,
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.loadUser()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return '/dashboard'
  }

  return true
})

export default router