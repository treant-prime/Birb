<script setup>
import { useTokenStore } from '@/stores/token'
const tokenStore = useTokenStore()

function singOff() {
  tokenStore.deleteToken()
}
</script>

<template lang="pug">
.navigation
  v-icon(name="fa-kiwi-bird" scale="2")

  button.btn.btn-sm.gap-2.pl-2(v-if="tokenStore.isToken" @click="singOff" type="button")
    v-icon(name="la-user-circle-solid" scale="1")
    .text-xs Sign off
</template>

<style scoped lang="scss">

</style>
