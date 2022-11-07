import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import { firebaseApp, db } from "@/database/firebase.js";

import "./assets/main.css";

const app = createApp(App);
app.config.globalProperties.$firebaseApp = firebaseApp;
app.config.globalProperties.$db = db;

app.use(createPinia());
app.use(router);

app.mount("#app");
