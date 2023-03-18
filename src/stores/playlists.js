import { ref, computed } from "vue";
import { defineStore } from "pinia";

const usePlaylistsStore = defineStore("playlists", () => {

  const playlistsFetchedFormLocalStorage = JSON.parse(window.localStorage.getItem('playlists') || null)
  const playlists = ref(null);

  if (playlistsFetchedFormLocalStorage) {
    playlists.value = playlistsFetchedFormLocalStorage
  }

  const arePlaylists = computed(() => !!playlists.value);

  function setPlaylists(payload) {
    console.log('payload', payload)
    window.localStorage.setItem('playlists', JSON.stringify(payload))
    playlists.value = payload;
  }

  return { playlists, arePlaylists, setPlaylists };
});

export { usePlaylistsStore }
