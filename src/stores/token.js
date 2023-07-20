import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toast-notification'
import router from '@/router'

const toast = useToast()

const useTokenStore = defineStore('token', () => {
  const tokenFetchedFormLocalStorage = window.localStorage.getItem('token')
  const token = ref(null)
  if (tokenFetchedFormLocalStorage) {
    token.value = tokenFetchedFormLocalStorage
  }

  const isToken = computed(() => !!token.value)
  function setToken(payload) {
    window.localStorage.setItem('token', payload)
    token.value = payload
    router.push({ name: 'Playlists' })
    toast.success('Login success')
  }

  function signOff() {
    window.localStorage.removeItem('token')
    token.value = null
    router.push({ name: 'Home' })
    toast.success('Logoff success')
  }

  return { token, isToken, setToken, signOff }
})

export { useTokenStore }
