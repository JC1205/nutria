<template>
  <!-- ── Sidebar desktop ─────────────────────────────────── -->
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">

    <div class="sidebar-brand" :class="{ collapsed: isCollapsed }">
      <div class="brand-logo-box">
        <Transition name="logo-switch" mode="out-in">
          <img v-if="!isCollapsed" key="full" src="/src/assets/logo-nutria-06.png" alt="Nutría" class="brand-logo full" />
          <img v-else               key="small" src="/src/assets/logo-nutria-07.png" alt="Nutría" class="brand-logo small" />
        </Transition>
      </div>
      <button class="collapse-btn" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? 'Expandir' : 'Colapsar'">
        <ChevronLeft :size="16" :class="{ rotated: isCollapsed }" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <p v-if="!isCollapsed" class="nav-section-label">MENÚ PRINCIPAL</p>
      <RouterLink
        v-for="item in navItems" :key="item.to" :to="item.to"
        class="nav-item" :class="{ active: isActive(item.to) }"
        :title="isCollapsed ? item.label : ''"
        @click="handleNavClick"
      >
        <span class="nav-icon">
          <component :is="item.icon" :size="20" :stroke-width="isActive(item.to) ? 2.2 : 1.8" />
        </span>
        <Transition name="fade-text">
          <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
        </Transition>
        <span v-if="isActive(item.to)" class="active-dot" />
      </RouterLink>
    </nav>

    <div class="sidebar-spacer" />

    <div class="sidebar-footer">
      <div class="user-card" :class="{ collapsed: isCollapsed }">
        <div class="user-avatar">
          <img v-if="sidebarAvatarUrl" :src="sidebarAvatarUrl" alt="Foto de perfil" class="user-avatar-img" />
          <span v-else>{{ userInitials }}</span>
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

  <!-- ── Botón hamburguesa — solo móvil ──────────────────── -->
  <button class="hamburger-btn" @click="mobileOpen = !mobileOpen" :class="{ open: mobileOpen }" aria-label="Menú">
    <span /><span /><span />
  </button>

  <!-- ── Overlay ─────────────────────────────────────────── -->
  <Transition name="overlay-fade">
    <div v-if="mobileOpen" class="sidebar-overlay" @click="mobileOpen = false" />
  </Transition>

  <!-- ── Drawer móvil ────────────────────────────────────── -->
  <Transition name="drawer-slide">
    <aside v-if="mobileOpen" class="sidebar sidebar-mobile">
      <div class="sidebar-brand">
        <div class="brand-logo-box">
          <img src="/src/assets/logo-nutria-06.png" alt="Nutría" class="brand-logo full" />
        </div>
        <button class="collapse-btn" @click="mobileOpen = false" title="Cerrar">
          <X :size="16" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <p class="nav-section-label">MENÚ PRINCIPAL</p>
        <RouterLink
          v-for="item in navItems" :key="item.to" :to="item.to"
          class="nav-item" :class="{ active: isActive(item.to) }"
          @click="mobileOpen = false"
        >
          <span class="nav-icon">
            <component :is="item.icon" :size="20" :stroke-width="isActive(item.to) ? 2.2 : 1.8" />
          </span>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="isActive(item.to)" class="active-dot" />
        </RouterLink>
      </nav>

      <div class="sidebar-spacer" />

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">
            <img v-if="sidebarAvatarUrl" :src="sidebarAvatarUrl" alt="Foto de perfil" class="user-avatar-img" />
            <span v-else>{{ userInitials }}</span>
          </div>
          <div class="user-info">
            <p class="user-name">{{ userName }}</p>
            <p class="user-role">{{ userRole }}</p>
          </div>
        </div>
        <button class="signout-btn" @click="handleSignOut">
          <LogOut :size="18" :stroke-width="1.8" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, Users, CalendarDays, Utensils,
  BookOpen, ClipboardList, FileText, Settings,
  ChevronLeft, LogOut, X,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const isCollapsed   = ref(false)
const mobileOpen    = ref(false)
const sidebarAvatarUrl = ref('')

/* ── Datos del usuario ─────────────────────────────────── */
const userName = computed(() => {
  const f = auth.profile?.first_name ?? ''
  const l = auth.profile?.last_name  ?? ''
  return `${f} ${l}`.trim() || 'Nutriólogo'
})

const userRole = computed(() => auth.profile?.specialization || 'Nutriólogo')

const userInitials = computed(() =>
  userName.value.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
)

async function loadSidebarAvatar() {
  const path = auth.profile?.profile_photo_url
  if (!path) { sidebarAvatarUrl.value = ''; return }
  if (path.startsWith('http')) { sidebarAvatarUrl.value = path; return }
  const { data, error } = await supabase.storage.from('nutria-files').createSignedUrl(path, 3600)
  sidebarAvatarUrl.value = error ? '' : data.signedUrl
}

onMounted(async () => {
  if (!auth.profile) await auth.loadUser()
  await loadSidebarAvatar()

  /* Cerrar drawer si se redimensiona a desktop */
  const onResize = () => { if (window.innerWidth >= 768) mobileOpen.value = false }
  window.addEventListener('resize', onResize)
  onUnmounted(() => window.removeEventListener('resize', onResize))
})

watch(() => auth.profile?.profile_photo_url, loadSidebarAvatar)

/* ── Navegación ────────────────────────────────────────── */
const navItems = [
  { to: '/dashboard',        label: 'Dashboard',           icon: LayoutDashboard },
  { to: '/patients',         label: 'Pacientes',            icon: Users           },
  { to: '/appointments',     label: 'Citas',                icon: CalendarDays    },
  { to: '/food-equivalents', label: 'Equiv. Alimentarios',  icon: Utensils        },
  { to: '/recipes',          label: 'Recetas',              icon: BookOpen        },
  { to: '/meal-plans',       label: 'Planes de comida',     icon: ClipboardList   },
  { to: '/documents',        label: 'Documentos',           icon: FileText        },
  { to: '/settings',         label: 'Configuración',        icon: Settings        },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function handleNavClick() {
  if (window.innerWidth < 768) mobileOpen.value = false
}

async function handleSignOut() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   SIDEBAR DESKTOP
══════════════════════════════════════════════════════════ */
.sidebar {
  width: 260px;
  min-height: 100vh;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #f0f0f5;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  overflow: hidden;
  transition: width .35s cubic-bezier(.4, 0, .2, 1);
  box-shadow: 2px 0 20px rgba(62, 155, 146, .07);
  z-index: 100;
  flex-shrink: 0;
}

.sidebar.collapsed { width: 72px; }

/* Ocultar sidebar desktop en móvil */
@media (max-width: 767px) {
  .sidebar:not(.sidebar-mobile) { display: none; }
}

/* ── Branding ─────────────────────────────────────────── */
.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 17px;
  padding: .5rem 2rem;
  border-bottom: 1px solid #f3f3f8;
  min-height: 78px;
  position: relative;
  overflow: hidden;
}
.sidebar-brand.collapsed { justify-content: center; padding: 1.2rem .7rem; }

.brand-logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}
.brand-logo       { object-fit: contain; display: block; }
.brand-logo.full  { width: 145px; height: auto; }
.brand-logo.small { width: 42px;  height: 42px; }

.sidebar.collapsed .brand-logo { width: 42px; }

.collapse-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: 1px solid #d9f7ee;
  border-radius: 8px;
  background: #f1fbf8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3E9B92;
  transition: background .2s, border-color .2s;
}
.sidebar.collapsed .collapse-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
}
.collapse-btn:hover { background: #d7f0e8; border-color: #9ed4cf; }
.collapse-btn svg { transition: transform .35s cubic-bezier(.4, 0, .2, 1); }
.collapse-btn svg.rotated { transform: rotate(180deg); }

/* ── Navegación ───────────────────────────────────────── */
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
.nav-item:hover:not(.active) { background: #e5f9f3; color: #3E9B92; transform: translateX(2px); }
.nav-item.active { background: linear-gradient(135deg, #e5f9f3, #d4f9ef); color: #3E9B92; font-weight: 600; }

.nav-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 22px; }
.nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

.active-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #3E9B92;
  flex-shrink: 0;
  margin-left: auto;
}

/* ── Footer ───────────────────────────────────────────── */
.sidebar-spacer { flex: 0 0 0; }

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
  background: #ecfaf6;
  border: 1px solid #e4faf4;
  overflow: hidden;
  transition: padding .35s;
}
.user-card.collapsed { padding: 8px; justify-content: center; }

.user-avatar {
  width: 38px; height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3E9B92, #2d7a72);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: .82rem; font-weight: 800;
  overflow: hidden; flex-shrink: 0;
}
.user-avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }

.user-info { overflow: hidden; flex: 1; }
.user-name { font-size: .85rem; font-weight: 600; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: .72rem; color: #9ca3af; margin-top: 1px; }

.signout-btn {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 9px 12px;
  border-radius: 10px; border: none; background: none;
  cursor: pointer; color: #9ca3af;
  font-size: .85rem; font-weight: 500; font-family: inherit;
  transition: background .2s, color .2s;
  white-space: nowrap; overflow: hidden;
}
.signout-btn:hover { background: #fff1f1; color: #ef4444; }
.signout-btn.collapsed { justify-content: center; padding: 9px; }

/* ══════════════════════════════════════════════════════════
   HAMBURGUESA — solo móvil
══════════════════════════════════════════════════════════ */
.hamburger-btn {
  display: none; /* oculto en desktop */
  position: fixed;
  top: 14px;
  left: 16px;
  z-index: 300;
  width: 42px; height: 42px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,.1);
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0;
  transition: background .2s;
}
.hamburger-btn:hover { background: #f6faf9; }

.hamburger-btn span {
  display: block;
  width: 20px; height: 2px;
  background: #374151;
  border-radius: 2px;
  transition: transform .3s ease, opacity .3s ease;
  transform-origin: center;
}
/* Animación X al abrir */
.hamburger-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger-btn.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

@media (max-width: 767px) {
  .hamburger-btn { display: flex; }
}

/* ══════════════════════════════════════════════════════════
   OVERLAY
══════════════════════════════════════════════════════════ */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 25, 35, .45);
  backdrop-filter: blur(2px);
  z-index: 199;
}

@media (max-width: 767px) {
  .sidebar-overlay { display: block; }
}

/* ══════════════════════════════════════════════════════════
   DRAWER MÓVIL
══════════════════════════════════════════════════════════ */
.sidebar-mobile {
  position: fixed !important;
  top: 0; left: 0;
  height: 100vh;
  width: 270px !important;
  z-index: 200;
  box-shadow: 4px 0 32px rgba(0,0,0,.15) !important;
  /* Deshabilitar el colapso en el drawer móvil */
  overflow-y: auto;
}

/* ══════════════════════════════════════════════════════════
   TRANSICIONES
══════════════════════════════════════════════════════════ */
/* Logo */
.logo-switch-enter-active,
.logo-switch-leave-active { transition: opacity .22s ease, transform .22s ease; }
.logo-switch-enter-from,
.logo-switch-leave-to     { opacity: 0; transform: scale(.92); }

/* Texto del nav */
.fade-text-enter-active { transition: opacity .2s ease .1s, transform .2s ease .1s; }
.fade-text-leave-active { transition: opacity .15s ease, transform .15s ease; }
.fade-text-enter-from   { opacity: 0; transform: translateX(-8px); }
.fade-text-leave-to     { opacity: 0; transform: translateX(-8px); }

/* Overlay */
.overlay-fade-enter-active { transition: opacity .25s ease; }
.overlay-fade-leave-active { transition: opacity .2s ease; }
.overlay-fade-enter-from,
.overlay-fade-leave-to     { opacity: 0; }

/* Drawer slide */
.drawer-slide-enter-active { transition: transform .3s cubic-bezier(.34, 1.2, .64, 1), opacity .25s ease; }
.drawer-slide-leave-active { transition: transform .25s ease, opacity .2s ease; }
.drawer-slide-enter-from   { transform: translateX(-100%); opacity: 0; }
.drawer-slide-leave-to     { transform: translateX(-100%); opacity: 0; }
</style>