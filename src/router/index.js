import { createRouter, createWebHistory, useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

import { useTokenStore } from '@/stores/token'
import Home from '@/views/Home.vue'

const toast = useToast()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/playlists',
      name: 'Playlists',
      component: () => import('@/views/Playlists.vue'),
    },
    {
      path: '/playlists/:id',
      name: 'Playlist',
      component: () => import('@/views/Playlist.vue'),
    },
  ],
})

router.beforeEach((to) => {
  // ✅ This will work because the router starts its navigation after
  // https://pinia.vuejs.org/core-concepts/outside-component-usage.html
  const tokenStore = useTokenStore()

  if(!tokenStore.isToken && to.name != 'Home') {
    toast.error('No go buddy')
    return { name: 'Home' }
  }
})

export default router

export {
  useRoute,
  useRouter
}
