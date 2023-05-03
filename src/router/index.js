import { createRouter, createWebHistory } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useTokenStore } from '@/stores/token'

import Playlists from '@/views/Playlists.vue'
import PlaylistItems from '@/views/PlaylistItems.vue'
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
      component: Playlists,
    },
    {
      path: '/:id',
      name: 'PlaylistItems',
      component: PlaylistItems,
    },
  ],
})

router.beforeEach((to) => {
  // ✅ This will work because the router starts its navigation after
  // https://pinia.vuejs.org/core-concepts/outside-component-usage.html
  const tokenStore = useTokenStore()

  if(to.path == '/playlists' && !tokenStore.isToken) {
    toast.error('No go buddy')
    return false
  } else {
    return true
  }
})

export default router
