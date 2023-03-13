import App from "./App.vue";
import router from "./router";
import { createApp } from "vue";
import { createPinia } from "pinia";

import { firebaseApp, db } from "@/database/firebase.js";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { FaKiwiBird, LaUserCircleSolid, BiGoogle, GiTombstone } from "oh-vue-icons/icons";

import "./assets/main.css";

addIcons(FaKiwiBird, LaUserCircleSolid, BiGoogle, GiTombstone);

const app = createApp(App);
// app.config.globalProperties.$firebaseApp = firebaseApp;
// app.config.globalProperties.$db = db;

window.firebaseApp = firebaseApp;
window.db = db;

app.component("v-icon", OhVueIcon);
app.use(createPinia());
app.use(router);
app.mount("#app");

