<script setup>
// const API_KEY = "";
// const YT_CHANNEL_ID = "UCuQZ-VMez8stUmNvNDfpV7A";
// const TEST_API_PLAYLIST_ID = "UC_x5XG1OV2P6uZZ5FSM9Ttw";

import { headers, sortByTitle } from '@/helpers'
import router from '@/router'
import { usePlaylistsStore } from '@/stores/playlists'
import { useTokenStore } from '@/stores/token'
import { computed, ref } from 'vue'

const ITEMS_PER_APGE = 50
const playlists = ref([])
const search = ref('')
const tokenStore = useTokenStore()
const playlistsStore = usePlaylistsStore()
const blocker = ref(false)

const playlistsComputed = computed(() => {
  const filteredPlaylists = playlists.value.filter((item) => {
    return item.title.toLowerCase().includes(search.value.toLowerCase())
  })
  return filteredPlaylists
})

tokenStore.$subscribe((mutation, state) => {
  console.log('state', state)
  console.log('state.token', state?.token)
  if (!!state.token) {
    fetchPlaylistsPage(state.token)
  } else {
    playlists.value = []
  }
})

function fetchPlaylistsPage(authToken, nextPageToken = null) {
  const url = constructFetchPlaylistUrl(nextPageToken)
  blocker.value = true

  fetch(url, {
    headers: headers(authToken),
  })
    .then((response) => response.json())
    .then((data) => {
      let mappedItems = data.items.map((item) => ({
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        itemCount: item.contentDetails.itemCount,
        id: item.id,
      }))
      playlists.value = [...playlists.value, ...mappedItems]
      playlists.value = playlists.value.sort(sortByTitle)

      if (data.nextPageToken) {
        fetchPlaylistsPage(authToken, data.nextPageToken)
      } else {
        savePlaylistInStore(data)
      }
    })
    .finally(() => {
      blocker.value = false
    })
}

function savePlaylistInStore(data) {
  playlistsStore.setPlaylists(playlists.value)
}

function constructFetchPlaylistUrl(nextPageToken) {
  // url = `https://youtube.googleapis.com/youtube/v3/playlists?part=${part}&key=${API_KEY}&mine=true&maxResults=${ITEMS_PER_APGE}&pageToken=${nextPageToken}`;
  // Important: Po autoryzacji API_KEY nie jest juz potrzebny
  // const part = "id,snippet,status,contentDetails";
  const part = 'id,snippet,contentDetails'
  let url = `https://youtube.googleapis.com/youtube/v3/playlists?part=${part}&mine=true&maxResults=${ITEMS_PER_APGE}`
  if (nextPageToken) url = url + `&pageToken=${nextPageToken}`
  return url
}

function initialFetch() {
  if (tokenStore?.token) {
    fetchPlaylistsPage(tokenStore.token)
  }
}

function goToPlaylist(id) {
  router.push({ name: 'Playlist', params: { id } })
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
