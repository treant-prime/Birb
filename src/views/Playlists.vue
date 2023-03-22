<script setup>
import { headers, sortByTitle } from '@/helpers'
import router from '@/router'
import { usePlaylistsStore } from '@/stores/playlists'
import { useTokenStore } from '@/stores/token'
import { Playlist } from '@/classes/Playlist.js'
import { computed, ref } from 'vue'

const playlists = ref([])
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
  const url = Playlist.prototype.fetchURL(nextPageToken)

  fetch(url, {
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
      } else {
        savePlaylistInStore(playlists.value)
      }
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

function goToPlaylist(id) {
  router.push({ name: 'PlaylistItems', params: { id } })
}

initialFetch()
</script>

<template lang="pug">
.playlists.flex.flex-wrap(v-if="playlists.length")
  input.search.input.input-bordered.mt-10.mb-10.text-center(type='text' placeholder='Search playlist' v-model="search")

  .flex.flex-wrap.w-full
    .card.playlist-card.bg-base-100.shadow-xl.image-full.mb-3.cursor-pointer.bg-black(v-for="playlist in playlistsComputed" @click="goToPlaylist(playlist.id)")
      figure
        img(:src='playlist.thumbnail' alt='Playlist thumbnail')
      .card-body.h-64
        h2.card-title {{playlist.title}}
        .playlist-items.mask.mask-squircle.font-semibold.text-secondary-content.bg-primary.text-xs.m-4.p-3 {{playlist.itemCount}}

blocker-cmp(v-if="blocker")
</template>
