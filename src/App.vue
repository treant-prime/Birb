<script setup>
import { RouterView } from 'vue-router'
import NavigationBar from './components/NavigationBar.vue'
import 'vue-toast-notification/dist/theme-sugar.css'

// import { useTokenStore } from '@/stores/token'
// import WelcomeLogin from './components/WelcomeLogin.vue'
// const tokenStore = useTokenStore()
</script>

<template>
  <!-- <transition name="fade" appear>
    <WelcomeLogin v-if="!tokenStore.isToken" />
  </transition> -->
  <NavigationBar />
  <RouterView />
</template>
