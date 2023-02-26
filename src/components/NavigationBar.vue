<script setup>
import { useTokenStore } from '@/stores/token'
const tokenStore = useTokenStore()

function singOff() {
  tokenStore.deleteToken()
}
</script>

<template lang="pug">
.navigation.p-2.mb-10.flex.justify-between
  v-icon(name="fa-kiwi-bird" scale="2")

  .rounded-full.bg-blue-500.text-white(v-if="tokenStore.isToken" @click="singOff")
    v-icon(name="la-user-circle-solid" scale="2")
</template>

<style scoped lang="scss">

</style>
