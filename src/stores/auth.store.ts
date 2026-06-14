// src/stores/auth.store.ts
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  specialization: string | null
  profile_photo_url: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    profile: null as Profile | null,
    loading: false,
  }),

  actions: {
    async loadUser() {
      this.loading = true

      const {
        data: { user },
      } = await supabase.auth.getUser()

      this.user = user

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!error) {
          this.profile = data
        }
      }

      this.loading = false
    },

    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.profile = null
    },
  },
})