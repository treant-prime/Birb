<script setup>
import { useTokenStore } from '@/stores/token'
import router from '@/router'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

const $toast = useToast()
const tokenStore = useTokenStore()

function singOff() {
  tokenStore.deleteToken()
  router.push({ name: 'Playlists' })
  $toast.success('Logoff success')
}
</script>

<template lang="pug">
.navigation
  .flex.items-center.justify-center.cursor-pointer(@click="$router.push({ name: 'Playlists' })")
    v-icon(name="fa-kiwi-bird" scale="2")
    h2.font-bold.ml-2.mb-0 Birb

  button.btn.btn-sm.gap-2.pl-2(v-if="tokenStore.isToken" @click="singOff" type="button")
    v-icon(name="la-user-circle-solid" scale="1")
    span SIGN OFF
</template>
