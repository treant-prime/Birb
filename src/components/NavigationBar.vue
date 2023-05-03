<script setup>
import { useTokenStore } from '@/stores/token'
import GoogleSignInButton from './GoogleSignInButton.vue'

const tokenStore = useTokenStore()

function singOff() {
  tokenStore.deleteToken()
}
</script>

<template lang="pug">
.navigation
  .flex.items-center.justify-center.cursor-pointer(@click="$router.push({ name: 'Playlists' })")
    v-icon(name="fa-kiwi-bird" scale="2")
    h2.font-bold.ml-2.mb-0 Birb

  .flex.gap-2
    router-link.btn.btn-outline.btn-sm(to="/" active-class="text-white bg-neutral")
      span Home

    router-link.btn.btn-outline.btn-sm.mr-10(to="/playlists" active-class="text-white bg-neutral")
      span Playlists

    .w-24.flex.justify-end
      button.btn.btn-sm.btn-primary.gap-2.pl-2(v-if="tokenStore.isToken" @click="singOff" type="button")
        v-icon(name="la-user-circle-solid" scale="1")
        span SIGN OFF

      google-sign-in-button(v-if="!tokenStore.isToken")
</template>
