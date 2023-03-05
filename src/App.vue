<script setup>
import { RouterView } from "vue-router";
import { useTokenStore } from '@/stores/token'
import WelcomeLogin from "./components/WelcomeLogin.vue";
import NavigationBar from "./components/NavigationBar.vue";

const tokenStore = useTokenStore()
</script>

<template>
  <WelcomeLogin v-if="!tokenStore.isToken" />
  <NavigationBar />
  <RouterView />
</template>
