import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '/src/pages/LoginPage.vue'

const DashboardPage = {
  template: '<h1 style="padding: 40px; font-size: 32px;">Dashboard NutriPro</h1>',
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
    },
  ],
})

export default router