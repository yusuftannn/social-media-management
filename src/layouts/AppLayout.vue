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
  Search,
  Settings,
  Sun,
  Users,
  X,
} from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import WhatsappButton from '@/components/ui/WhatsappButton.vue'

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
const searchQuery = ref('')
const auth = useAuthStore()
const theme = useThemeStore()
const workspace = useWorkspaceStore()
const router = useRouter()

const customerMap = computed(
  () => new Map(workspace.customers.map((customer) => [customer.id, customer.companyName])),
)

const searchResults = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()

  if (!term) return []

  const items = [
    ...workspace.customers.map((customer) => ({
      type: 'Müşteri',
      label: customer.companyName,
      meta: customer.contactName,
      path: '/customers',
    })),
    ...workspace.projects.map((project) => ({
      type: 'Proje',
      label: project.projectName,
      meta: customerMap.value.get(project.customerId) ?? 'Müşteri',
      path: '/projects',
    })),
    ...workspace.contents.map((content) => ({
      type: 'İçerik',
      label: content.title,
      meta: `${content.platform} • ${content.status}`,
      path: '/content',
    })),
    ...workspace.tasks.map((task) => ({
      type: 'Görev',
      label: task.title,
      meta: `${task.assignedTo} • ${task.status}`,
      path: '/tasks',
    })),
    ...workspace.team.map((member) => ({
      type: 'Ekip',
      label: member.name,
      meta: member.role,
      path: '/team',
    })),
  ]

  return items
    .filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(term))
    .slice(0, 6)
})

onMounted(() => {
  void workspace.load()
})

const openSearchResult = async (path: string) => {
  searchQuery.value = ''
  await router.push(path)
  mobileOpen.value = false
}

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

      <div class="relative mb-5">
        <div class="flex items-center gap-2 rounded-lg border border-line bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900">
          <Search class="h-4 w-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="search"
            class="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
            placeholder="Hızlı ara..."
          />
        </div>

        <div
          v-if="searchQuery.trim() && searchResults.length"
          class="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950"
        >
          <button
            v-for="item in searchResults"
            :key="`${item.type}-${item.label}`"
            type="button"
            class="flex w-full items-center justify-between gap-3 border-b border-line px-3 py-2 text-left last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            @click="openSearchResult(item.path)"
          >
            <div>
              <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ item.label }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ item.type }} · {{ item.meta }}</p>
            </div>
            <span class="text-[10px] uppercase tracking-[0.2em] text-slate-400">{{ item.type }}</span>
          </button>
        </div>
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
    <WhatsappButton />
  </div>
</template>
