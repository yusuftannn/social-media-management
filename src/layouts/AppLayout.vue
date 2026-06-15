<script setup lang="ts">
import {
  Bot,
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  CheckSquare,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
  X,
} from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const nav = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Müşteriler', to: '/customers', icon: Users },
  { label: 'Projeler', to: '/projects', icon: CheckSquare },
  { label: 'Onaylar', to: '/approvals', icon: ClipboardCheck },
  { label: 'İçerik', to: '/content', icon: CalendarDays },
  { label: 'Planlayıcı', to: '/planner', icon: CalendarCheck },
  { label: 'Görevler', to: '/tasks', icon: CheckSquare },
  { label: 'Ekip', to: '/team', icon: Users },
  { label: 'AI', to: '/ai', icon: Bot },
  { label: 'Raporlar', to: '/reports', icon: ChartColumn },
  { label: 'Ayarlar', to: '/settings', icon: Settings },
]

const mobileOpen = ref(false)
const auth = useAuthStore()
const theme = useThemeStore()
const workspace = useWorkspaceStore()
const router = useRouter()

onMounted(() => {
  void workspace.load()
})

const logout = async () => {
  await auth.logout()
  await router.push('/auth/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-ink dark:bg-slate-900 dark:text-slate-100">
    <aside
      class="fixed inset-y-0 left-0 z-40 w-68 border-r border-line bg-white px-3 py-4 transition dark:border-slate-800 dark:bg-slate-950 lg:w-64"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="mb-6 flex items-center justify-between px-2">
        <div>
          <p class="text-lg font-semibold">AgencyFlow</p>
          <p class="text-xs text-slate-500">Social SaaS</p>
        </div>
        <button class="btn-muted h-9 w-9 p-0 lg:hidden" @click="mobileOpen = false">
          <X class="h-4 w-4" />
        </button>
      </div>

      <nav class="space-y-1">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          active-class="bg-blue-50 text-brand dark:bg-blue-950 dark:text-blue-300"
          @click="mobileOpen = false"
        >
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <div class="lg:pl-64">
      <header
        class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6"
      >
        <button class="btn-muted h-10 w-10 p-0 lg:hidden" @click="mobileOpen = true">
          <Menu class="h-5 w-5" />
        </button>
        <div class="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
          {{ auth.user?.role }} paneli
        </div>
        <div class="ml-auto flex items-center gap-3">
          <button class="btn-muted h-10 w-10 p-0" @click="theme.toggleDark()">
            <Moon v-if="!theme.isDark" class="h-4 w-4" />
            <Sun v-else class="h-4 w-4" />
          </button>
          <div class="text-right">
            <p class="text-sm font-medium">{{ auth.user?.name }}</p>
            <p class="text-xs text-slate-500">{{ auth.user?.email }}</p>
          </div>
          <button class="btn-muted" type="button" @click="logout">Çıkış</button>
        </div>
      </header>

      <main class="mx-auto w-full max-w-8xl px-4 py-6 sm:px-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
