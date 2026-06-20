import { defineStore } from 'pinia'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
  }),

  actions: {
    show(message: string, type: ToastType = 'success') {
      const id = Date.now()

      this.toasts.push({
        id,
        type,
        message,
      })

      setTimeout(() => {
        this.remove(id)
      }, 3200)
    },

    success(message: string) {
      this.show(message, 'success')
    },

    error(message: string) {
      this.show(message, 'error')
    },

    info(message: string) {
      this.show(message, 'info')
    },

    remove(id: number) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
  },
})