import { ref, computed } from "vue";
import { defineStore } from "pinia";

const useTokenStore = defineStore("token", () => {

  const tokenFetchedFormLocalStorage = window.localStorage.getItem('token')
  const token = ref(null);
  if (tokenFetchedFormLocalStorage) {
    token.value = tokenFetchedFormLocalStorage
  }

  const isToken = computed(() => !!token.value);
  function setToken(payload) {
    window.localStorage.setItem('token', payload)
    token.value = payload;
  }

  function deleteToken(payload) {
    window.localStorage.removeItem('token')
    token.value = null;
  }

  return { token, isToken, setToken, deleteToken };
});

export { useTokenStore }
