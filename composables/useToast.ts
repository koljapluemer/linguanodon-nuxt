import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'
export interface Toast { id: number; type: ToastType; message: string }

const toasts = ref<Toast[]>([])

export const useAppToast = () => {
  function addToast(type: ToastType, message: string) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, type, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 5000)
  }
  return { toasts, addToast }
}

export const useToast = useAppToast 