import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

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
    user: null as User | null,
    profile: null as Profile | null,
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

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
      } else {
        this.profile = null
      }

      this.loading = false
      this.initialized = true
    },

    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.profile = null
      this.initialized = true
    },
  },
})