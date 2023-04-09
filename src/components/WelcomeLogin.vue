<script setup>
import {
  getAuth,
  setPersistence,
  signInWithPopup,
  GoogleAuthProvider,
  browserLocalPersistence,
} from 'firebase/auth'
import { useTokenStore } from '@/stores/token'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

const $toast = useToast()
const tokenStore = useTokenStore()

function setToken(payload) {
  tokenStore.setToken(payload)
}

function signIn() {
  const auth = getAuth(window.firebaseApp)
  auth.useDeviceLanguage()

  const persistenceSetter = () => {
    return setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const provider = new GoogleAuthProvider()
        // provider.addScope("https://www.googleapis.com/auth/youtube");
        // provider.addScope("https://www.googleapis.com/auth/youtube.readonly");
        provider.addScope('https://www.googleapis.com/auth/youtube.force-ssl')
        return signInWithPopup(auth, provider)
      })
      .catch(() => {
        $toast.error('SetPersistence failed')
      })
  }

  persistenceSetter()
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential.accessToken
      const user = result.user
      console.log('user', user)
      console.log('token', token)
      setToken(token)
      $toast.success('Login success')
    })
    .catch(() => {
      $toast.error('Login failed')
    })
}
</script>

<template lang="pug">
.fixed-overlay
  transition(name="pop" appear)
    .card
      .card-body
        b.block Welcome to Birb
        .mb-2 Sign in to archive your playlists in easy 600 steps.
        button.btn.w-full(@click="signIn" type="button") Sign in with Google
</template>
