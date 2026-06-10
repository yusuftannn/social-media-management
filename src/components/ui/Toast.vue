<script setup lang="ts">
import type { Component } from 'vue'
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from '@lucide/vue'
import { useToastStore } from '@/stores/toastStore'

const toastStore = useToastStore()

const getIcon = (type: string) => {
  const icons: Record<string, Component> = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }
  return icons[type] || Info
}

interface ToastStyle {
  container: string
  icon: string
  text: string
  button: string
}

const getStyles = (type: string) => {
  const styles: Record<string, ToastStyle> = {
    success: {
      container: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-800 dark:text-green-200',
      button: 'hover:bg-green-100 dark:hover:bg-green-900',
    },
    error: {
      container: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-800 dark:text-red-200',
      button: 'hover:bg-red-100 dark:hover:bg-red-900',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-800 dark:text-yellow-200',
      button: 'hover:bg-yellow-100 dark:hover:bg-yellow-900',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-800 dark:text-blue-200',
      button: 'hover:bg-blue-100 dark:hover:bg-blue-900',
    },
  }
  return styles[type] || styles.info
}
</script>

<template>
  <div
    class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
    style="max-width: 400px"
  >
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in fade-in slide-in-from-right-full"
        :class="getStyles(toast.type).container"
      >
        <component
          :is="getIcon(toast.type)"
          :class="['h-5 w-5 flex-shrink-0 mt-0.5', getStyles(toast.type).icon]"
        />

        <p :class="['flex-1 text-sm font-medium', getStyles(toast.type).text]">
          {{ toast.message }}
        </p>

        <button
          type="button"
          :class="[
            'flex-shrink-0 rounded p-1 transition-colors',
            getStyles(toast.type).button,
            getStyles(toast.type).text,
          ]"
          @click="toastStore.removeToast(toast.id)"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
