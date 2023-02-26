import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Playlists",
      component: () => import("../views/Playlists.vue"),
    },
  ],
});

export default router;
