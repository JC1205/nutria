<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">

    <!-- ── Logo / Branding ─────────────────────────────── -->
    <div class="sidebar-brand" :class="{ collapsed: isCollapsed }">
  <div class="brand-logo-box">
    <Transition name="logo-switch" mode="out-in">
      <img
        v-if="!isCollapsed"
        key="full-logo"
        src="/src/assets/logo-nutria2.png"
        alt="Nutría"
        class="brand-logo full"
      />

      <img
        v-else
        key="small-logo"
        src="/src/assets/m-logo-nutria.png"
        alt="Nutría"
        class="brand-logo small"
      />
    </Transition>
  </div>

  <button
    class="collapse-btn"
    @click="isCollapsed = !isCollapsed"
    :title="isCollapsed ? 'Expandir' : 'Colapsar'"
  >
    <ChevronLeft :size="16" :class="{ rotated: isCollapsed }" />
  </button>
</div>

    <!-- ── Navegación principal ────────────────────────── -->
    <nav class="sidebar-nav">
      <p class="nav-section-label" v-if="!isCollapsed">MENÚ PRINCIPAL</p>

      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
        :title="isCollapsed ? item.label : ''"
        @click="handleNavClick"
      >
        <span class="nav-icon">
          <component :is="item.icon" :size="20" :stroke-width="isActive(item.to) ? 2.2 : 1.8" />
        </span>
        <Transition name="fade-text">
          <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
        </Transition>
        <!-- Indicador activo -->
        <span v-if="isActive(item.to)" class="active-dot" />
      </RouterLink>
    </nav>

    <!-- ── Spacer ──────────────────────────────────────── -->
    <div class="sidebar-spacer" />

    <!-- ── Perfil / Sign out ───────────────────────────── -->
    <div class="sidebar-footer">
      <div class="user-card" :class="{ collapsed: isCollapsed }">
        <div class="user-avatar">
          <span>{{ userInitials }}</span>
          <span class="avatar-status" />
        </div>
        <Transition name="fade-text">
          <div v-if="!isCollapsed" class="user-info">
            <p class="user-name">{{ userName }}</p>
            <p class="user-role">{{ userRole }}</p>
          </div>
        </Transition>
      </div>

      <button class="signout-btn" :class="{ collapsed: isCollapsed }" @click="handleSignOut" title="Cerrar sesión">
        <LogOut :size="18" :stroke-width="1.8" />
        <Transition name="fade-text">
          <span v-if="!isCollapsed">Cerrar sesión</span>
        </Transition>
      </button>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Utensils,
  BookOpen,
  ClipboardList,
  FileText,
  Settings,
  ChevronLeft,
  LogOut,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isCollapsed = ref(false)

const userName = computed(() => {
  const firstName = auth.profile?.first_name ?? ''
  const lastName = auth.profile?.last_name ?? ''

  const fullName = `${firstName} ${lastName}`.trim()

  return fullName || 'Nutriólogo'
})

const userRole = computed(() => {
  return auth.profile?.specialization || 'Nutriólogo'
})

const userInitials = computed(() => {
  return userName.value
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Pacientes', icon: Users },
  { to: '/appointments', label: 'Citas', icon: CalendarDays },
  { to: '/food-equivalents', label: 'Equiv. Alimentarios', icon: Utensils },
  { to: '/recipes', label: 'Recetas', icon: BookOpen },
  { to: '/meal-plans', label: 'Planes de comida', icon: ClipboardList },
  { to: '/documents', label: 'Documentos', icon: FileText },
  { to: '/settings', label: 'Configuración', icon: Settings },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function handleNavClick() {
  if (window.innerWidth < 768) {
    isCollapsed.value = true
  }
}

async function handleSignOut() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   SIDEBAR BASE
══════════════════════════════════════════════════════════ */
.sidebar {
  width: 260px;
  min-height: 100vh;
  background: #ffffff;
  border-right: 1px solid #f0f0f5;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  height: 100vh;
  overflow: hidden;
  transition: width .35s cubic-bezier(.4, 0, .2, 1);
  box-shadow: 2px 0 20px rgba(142, 115, 168, .06);
  z-index: 100;
  flex-shrink: 0;
}

.sidebar.collapsed { width: 72px; }

/* ── Branding ───────────────────────────────────────────── */
.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 17px;
  padding: 0.5rem 2rem;
  border-bottom: 1px solid #f3f3f8;
  min-height: 78px;
  position: relative;
  overflow: hidden;
}

.sidebar-brand.collapsed {
  justify-content: center;
  padding: 1.2rem .7rem;
}

.brand-logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}

.brand-logo {
  object-fit: contain;
  display: block;
}

.brand-logo.full {
  width: 145px;
  height: auto;
}

.brand-logo.small {
  width: 42px;
  height: 42px;
}

.logo-switch-enter-active,
.logo-switch-leave-active {
  transition: opacity .22s ease, transform .22s ease;
}

.logo-switch-enter-from,
.logo-switch-leave-to {
  opacity: 0;
  transform: scale(.92);
}

.sidebar.collapsed .brand-logo {
  width: 42px;
}


.collapse-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: 1px solid #ebebf5;
  border-radius: 8px;
  background: #fafafe;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8E73A8;
  transition: background .2s, border-color .2s, transform .2s;
}

.sidebar.collapsed .collapse-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
}
.collapse-btn:hover { background: #f3eeff; border-color: #cbb8e8; }

.collapse-btn svg {
  transition: transform .35s cubic-bezier(.4, 0, .2, 1);
}
.collapse-btn svg.rotated { transform: rotate(180deg); }

/* ── Navegación ─────────────────────────────────────────── */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 1rem .75rem;
  gap: 2px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
}

.nav-section-label {
  font-size: .65rem;
  font-weight: 700;
  color: #b0b8cc;
  letter-spacing: .1em;
  padding: 0 .5rem .5rem;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  text-decoration: none;
  color: #5a6070;
  font-size: .875rem;
  font-weight: 400;
  transition: background .2s, color .2s, transform .15s;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
}

.nav-item:hover:not(.active) {
  background: #f7f4ff;
  color: #8E73A8;
  transform: translateX(2px);
}

.nav-item.active {
  background: linear-gradient(135deg, #f3eeff 0%, #ede6ff 100%);
  color: #8E73A8;
  font-weight: 600;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
}

.nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8E73A8;
  flex-shrink: 0;
  margin-left: auto;
}

/* ── Spacer ─────────────────────────────────────────────── */
.sidebar-spacer { flex: 0 0 0; }

/* ── Footer / Usuario ───────────────────────────────────── */
.sidebar-footer {
  padding: .75rem;
  border-top: 1px solid #f3f3f8;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #faf9ff;
  border: 1px solid #f0ebff;
  overflow: hidden;
  transition: padding .35s;
}
.user-card.collapsed { padding: 8px; justify-content: center; }

.user-avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8E73A8 0%, #6b50a0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .8rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.avatar-status {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 9px;
  height: 9px;
  background: #22c55e;
  border: 2px solid #fff;
  border-radius: 50%;
}

.user-info {
  overflow: hidden;
  flex: 1;
}

.user-name {
  font-size: .85rem;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0;
}

.user-role {
  font-size: .72rem;
  color: #9ca3af;
  margin-top: 1px;
}

.signout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  border: none;
  background: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: .85rem;
  font-weight: 500;
  font-family: inherit;
  transition: background .2s, color .2s;
  white-space: nowrap;
  overflow: hidden;
}
.signout-btn:hover { background: #fff1f1; color: #ef4444; }
.signout-btn.collapsed { justify-content: center; padding: 9px; }

/* ── Transiciones de texto ──────────────────────────────── */
.fade-text-enter-active { transition: opacity .2s ease .1s, transform .2s ease .1s; }
.fade-text-leave-active { transition: opacity .15s ease, transform .15s ease; }
.fade-text-enter-from   { opacity: 0; transform: translateX(-8px); }
.fade-text-leave-to     { opacity: 0; transform: translateX(-8px); }

/* ── Responsive móvil ───────────────────────────────────── */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 200;
  }
  .sidebar.collapsed { width: 0; border: none; }
}
</style>