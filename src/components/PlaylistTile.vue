<script setup>
import { PlaylistItem } from '@/classes/PlaylistItem.js'
import { headers } from '@/helpers'
import router from '@/router'
import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useTokenStore } from '@/stores/token'
import 'vue-toast-notification/dist/theme-sugar.css'

const props = defineProps({
  playlist: Object,
})
const $toast = useToast()
const blocker = ref(false)
const playlistItems = ref([])
const killedItemsCount = ref(0)
const tokenStore = useTokenStore()
const animate = ref(true)

function goToPlaylist(id) {
  router.push({ name: 'PlaylistItems', params: { id } })
}

function checkPlaylistForDeadItems() {
  const authToken = window.localStorage.getItem('token')
  killedItemsCount.value = []
  playlistItems.value = []
  fetchItems(authToken)
}

function fetchItems(authToken, nextPageToken = null) {
  blocker.value = true
  const url = PlaylistItem.fetchURL(nextPageToken, props.playlist.id)
  animate.value = true

  fetch(url, {
    headers: headers(authToken),
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else if (response.status == 401) {
        signOff()
        throw new Error('Unauthenticated, signing off')
      } else {
        throw new Error('Something went wrong')
      }
    })
    .then((data) => {
      let mappedItems = data.items.map((item) => {
        return new PlaylistItem(item)
      })

      playlistItems.value = [...playlistItems.value, ...mappedItems]

      // TICKS
      killedItemsCount.value = playlistItems.value.filter(
        (item) => !!item.isNotAvailable
      ).length

      if (data.nextPageToken) {
        fetchItems(authToken, data.nextPageToken)
      } else {
        animate.value = false
      }
    })
    .catch((e) => {
      $toast.error(e.message)
    })
    .finally(() => {
      blocker.value = false
    })
}

function signOff() {
  tokenStore.deleteToken()
  router.push({ name: 'Playlists' })
}
</script>

<template lang="pug">
.card.playlist-tile(@click="goToPlaylist(playlist.id)")
  figure
    img(:src='playlist.thumbnail' alt='Playlist thumbnail')
  .card-body.h-64.justify-between
    h2.card-title {{playlist.title}}
    //- .playlist-tile-items-count {{playlist.itemCount}}
    .playlist-tile-items-count.bg-secondary-focus(v-if="playlistItems.length && killedItemsCount > 0" :class="{'gelatine': animate}") {{killedItemsCount}}
    .playlist-tile-items-count.bg-primary-focus.p-1(v-if="playlistItems.length && killedItemsCount == 0")
      v-icon(name="bi-check-lg" scale="1")
    button.btn.btn-sm.btn-primary.flex.text-xs.leading-3.pt-2.pb-2(type="button" @click.stop="checkPlaylistForDeadItems") SCAN
</template>

<styles lang="css">
.card.playlist-tile {
  margin-left: 7px;
  margin-right: 7px;
  word-break: break-word;
  max-width: calc((100%) / 7 - 14px);
  width: calc((100%) / 7 - 14px);
  scale: 1;
  transition: all 0.2s ease-in-out;
  opacity: 0.9;
}

.card.playlist-tile button {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.card.playlist-tile:hover {
  transform: scale(1.2);
  opacity: 1;
  box-shadow: 0px 0px 0px 6px white;
  z-index: 999;
}

.card.playlist-tile:hover button {
  opacity: 1;
}

@media (max-width: 1650px) {
  .card.playlist-tile {
    max-width: calc((100%) / 6 - 14px);
    width: calc((100%) / 6 - 14px);
  }
}

@media (max-width: 1440px) {
  .card.playlist-tile {
    max-width: calc((100%) / 5 - 14px);
    width: calc((100%) / 5 - 14px);
  }
}

@media screen and (max-width: 900px) {
  .card.playlist-tile {
    margin-left: 1rem;
    margin-right: 1rem;
    max-width: calc((100%) - 1rem);
    width: calc((100%) - 1rem);
  }
}

.gelatine {
  animation: gelatine 0.5s infinite;
}

@keyframes gelatine {
  from,
  to {
    transform: scale(1, 1);
  }
  25% {
    transform: scale(0.9, 1.1);
  }
  50% {
    transform: scale(1.1, 0.9);
  }
  75% {
    transform: scale(0.95, 1.05);
  }
}
</styles>
