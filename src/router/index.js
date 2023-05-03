import { createRouter, createWebHistory } from 'vue-router'

import Playlists from '@/views/Playlists.vue'
import PlaylistItems from '@/views/PlaylistItems.vue'
import Home from '@/views/Home.vue'

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

export default router
