<script setup lang="ts">
import {
  Bell,
  Bot,
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  CheckSquare,
  ClipboardCheck,
  Clock3,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
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
  { label: 'Kampanyalar', to: '/campaigns', icon: Target },
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
const showNotifications = ref(false)
const searchQuery = ref('')
const auth = useAuthStore()
const theme = useThemeStore()
const workspace = useWorkspaceStore()
const router = useRouter()

const customerMap = computed(
  () => new Map(workspace.customers.map((customer) => [customer.id, customer.companyName])),
)

const notifications = computed(() => {
  const now = new Date()
  const inSevenDays = 1000 * 60 * 60 * 24 * 7

  const contentAlerts = workspace.contents
    .filter((content) => {
      const publishDate = new Date(content.publishDate)
      return (
        (content.status === 'Waiting Approval' || content.status === 'Draft') &&
        !Number.isNaN(publishDate.getTime()) &&
        publishDate.getTime() - now.getTime() <= inSevenDays
      )
    })
    .map((content) => ({
      id: `content-${content.id}`,
      title: content.title,
      message: `${content.platform} • ${content.status}`,
      type: 'İçerik',
      path: '/content',
      when: content.publishDate,
    }))

  const taskAlerts = workspace.tasks
    .filter((task) => task.status !== 'Done')
    .map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      message: `${task.assignedTo} • ${task.priority} öncelik`,
      type: 'Görev',
      path: '/tasks',
      when: task.dueDate,
    }))

  const projectAlerts = workspace.projects
    .filter((project) => project.status === 'Active')
    .map((project) => ({
      id: `project-${project.id}`,
      title: project.projectName,
      message: `${customerMap.value.get(project.customerId) ?? 'Müşteri'} • aktif proje`,
      type: 'Proje',
      path: '/projects',
      when: project.endDate,
    }))

  return [...contentAlerts, ...taskAlerts, ...projectAlerts]
    .sort((first, second) => new Date(first.when).getTime() - new Date(second.when).getTime())
    .slice(0, 5)
})

const notificationCount = computed(() => notifications.value.length)

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

const openNotification = async (path: string) => {
  showNotifications.value = false
  await router.push(path)
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
          <div class="relative">
            <button class="btn-muted relative h-10 w-10 p-0" type="button" @click="showNotifications = !showNotifications">
              <Bell class="h-4 w-4" />
              <span
                v-if="notificationCount"
                class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
              >
                {{ notificationCount }}
              </span>
            </button>

            <div
              v-if="showNotifications"
              class="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-line bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div class="mb-3 flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold">Bildirimler</p>
                  <p class="text-[11px] text-slate-500">Öncelikli aksiyonlar</p>
                </div>
                <span class="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-brand dark:bg-blue-950">
                  {{ notificationCount }} aktif
                </span>
              </div>

              <div v-if="notifications.length" class="space-y-2">
                <button
                  v-for="item in notifications"
                  :key="item.id"
                  type="button"
                  class="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                  @click="openNotification(item.path)"
                >
                  <span class="mt-0.5 rounded-lg bg-blue-100 p-1.5 text-brand dark:bg-blue-950">
                    <Sparkles v-if="item.type === 'İçerik'" class="h-3.5 w-3.5" />
                    <Clock3 v-else-if="item.type === 'Görev'" class="h-3.5 w-3.5" />
                    <CalendarCheck v-else class="h-3.5 w-3.5" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-sm font-medium text-slate-800 dark:text-slate-100">
                      {{ item.title }}
                    </span>
                    <span class="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                      {{ item.message }}
                    </span>
                    <span class="mt-1 block text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      {{ item.type }}
                    </span>
                  </span>
                </button>
              </div>

              <div
                v-else
                class="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
              >
                Şu anda yapılacak aksiyon bulunmuyor.
              </div>
            </div>
          </div>

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
