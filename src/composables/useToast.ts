import { useToastStore } from '@/stores/toastStore'
import type { ToastType } from '@/stores/toastStore'

export const useToast = () => {
  const toastStore = useToastStore()

  return {
    success: (message: string, duration?: number) => toastStore.success(message, duration),
    error: (message: string, duration?: number) => toastStore.error(message, duration),
    info: (message: string, duration?: number) => toastStore.info(message, duration),
    warning: (message: string, duration?: number) => toastStore.warning(message, duration),
    show: (message: string, type: ToastType = 'info', duration?: number) =>
      toastStore.addToast(message, type, duration),
  }
}
