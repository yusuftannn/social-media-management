import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        { path: 'login', name: 'login', component: () => import('@/features/auth/LoginView.vue') },
        { path: 'register', name: 'register', component: () => import('@/features/auth/RegisterView.vue') },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/features/auth/ForgotPasswordView.vue'),
        },
      ],
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: () => import('@/features/dashboard/DashboardView.vue') },
        { path: 'customers', name: 'customers', component: () => import('@/features/customers/CustomersView.vue') },
        { path: 'projects', name: 'projects', component: () => import('@/features/projects/ProjectsView.vue') },
        { path: 'content', name: 'content', component: () => import('@/features/content/ContentView.vue') },
        { path: 'tasks', name: 'tasks', component: () => import('@/features/tasks/TasksView.vue') },
        { path: 'team', name: 'team', component: () => import('@/features/team/TeamView.vue') },
        { path: 'ai', name: 'ai', component: () => import('@/features/ai/AiAssistantView.vue') },
        { path: 'reports', name: 'reports', component: () => import('@/features/reports/ReportsView.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/features/settings/SettingsView.vue') },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  await auth.init()

  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/auth/login'
  if ((to.name === 'login' || to.name === 'register') && auth.isAuthenticated) return '/dashboard'
  if (to.path === '/auth') return '/auth/login'
})

export default router
