<script setup>
import { RouterView } from "vue-router";
import WelcomeLogin from "./components/WelcomeLogin.vue";
import NavigationBar from "./components/NavigationBar.vue";
import { useTokenStore } from '@/stores/token'

const tokenStore = useTokenStore()
</script>

<template>
  <WelcomeLogin v-if="!tokenStore.isToken" />
  <NavigationBar />
  <RouterView />
</template>
