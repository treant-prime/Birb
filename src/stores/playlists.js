import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
// import { computedAsync } from '@vueuse/core'
// import { useAsyncState } from '@vueuse/core' does not work?

import { useTokenStore } from '@/stores/token'
import { Playlist } from '@/classes/Playlist.js'
import { headers, sortByTitle } from '@/helpers'
import router, { useRoute } from '@/router'

const usePlaylistsStore = defineStore('playlists', () => {

  const playlists = ref([])
  const tokenStore = useTokenStore()
  const route = useRoute()

  const currentPlaylist = computed(() => {
    return playlists.value?.find(
      (item) => item.id == router.currentRoute.value.params.id
    )
  })

  async function fetchPlaylistsPage(authToken, nextPageToken = null) {
    const url = Playlist.fetchURL(nextPageToken)

    return await fetch(url, {
      headers: headers(authToken),
    })
      .then((response) => response.json())
      .then((data) => {
        let mappedItems = data.items.map((item) => {
          return new Playlist(item)
        })

        playlists.value = [...playlists.value, ...mappedItems]
        playlists.value = playlists.value.sort(sortByTitle)

        if (data.nextPageToken) {
          fetchPlaylistsPage(authToken, data.nextPageToken)
        }
      })
  }

  function setPlaylists(payload) {
    playlists.value = payload
  }

  if (!playlists.length && route.name == 'Playlist') {
    fetchPlaylistsPage(tokenStore.token)
  }

  return { playlists, currentPlaylist, setPlaylists }
})

export { usePlaylistsStore }
