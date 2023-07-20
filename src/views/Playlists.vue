<script setup>
import { computed, ref } from 'vue'
import { useToast } from 'vue-toast-notification'

import { Playlist } from '@/classes/Playlist.js'
import { headers, sortByTitle } from '@/helpers'
import { usePlaylistsStore } from '@/stores/playlists'
import { useTokenStore } from '@/stores/token'
import PlaylistTile from '@/components/PlaylistTile.vue'

const $toast = useToast()
const playlists = ref([])
const tempPlaylists = ref([])
const search = ref('')
const tokenStore = useTokenStore()
const playlistsStore = usePlaylistsStore()
const blocker = ref(false)

tokenStore.$subscribe((mutation, state) => {
  if (!!state.token) {
    fetchPlaylistsPage(state.token)
  } else {
    playlists.value = []
  }
})

const playlistsComputed = computed(() => {
  const filteredPlaylists = playlists.value.filter((item) => {
    return item.title.toLowerCase().includes(search.value.toLowerCase())
  })
  return filteredPlaylists
})

function fetchPlaylistsPage(authToken, nextPageToken = null) {
  blocker.value = true
  const url = Playlist.fetchURL(nextPageToken)

  fetch(url, {
    headers: headers(authToken),
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else if (response.status == 401) {
        tokenStore.signOff()
        throw new Error('Unauthenticated, signing off')
      } else {
        throw new Error('Something went wrong')
      }
    })
    .then((data) => {
      let mappedItems = data.items.map((item) => {
        return new Playlist(item)
      })

      tempPlaylists.value = [...tempPlaylists.value, ...mappedItems]

      if (data.nextPageToken) {
        fetchPlaylistsPage(authToken, data.nextPageToken)
      } else {
        playlists.value = tempPlaylists.value.sort(sortByTitle)
        savePlaylistInStore(playlists.value)
      }
    })
    .catch((e) => {
      $toast.error(e.message)
    })
    .finally(() => {
      blocker.value = false
    })
}

function savePlaylistInStore(playlists) {
  playlistsStore.setPlaylists(playlists)
}

function initialFetch() {
  if (tokenStore?.token) {
    fetchPlaylistsPage(tokenStore.token)
  }
}

initialFetch()
</script>

<template lang="pug">
.playlists(v-if="playlists.length")
  input.playlists-search(type='text' placeholder='Search playlist' v-model="search")

  .flex.flex-wrap.w-full
    template(v-for="playlist in playlistsComputed")
      playlist-tile(:playlist="playlist")

blocker-cmp(v-if="blocker")
</template>
