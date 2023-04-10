<script setup>
import { PlaylistItem } from '@/classes/PlaylistItem.js'
import { headers } from '@/helpers'
import router from '@/router'
import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useTokenStore } from '@/stores/token'
import { useDeadItemsCounterStore } from '@/stores/deadItemsCounter'
import 'vue-toast-notification/dist/theme-sugar.css'

const props = defineProps({
  playlist: Object,
})
const $toast = useToast()
const blocker = ref(false)
const playlistItems = ref([])
const tokenStore = useTokenStore()
const deadItemsCounterStore = useDeadItemsCounterStore()
const animate = ref(true)
// const showCounter = ref(false)

const killedItemsCount = ref(null)
const counter = deadItemsCounterStore.getCounter(props.playlist.id)
// console.log('counter', counter)
if (counter != undefined) {
  killedItemsCount.value = counter
  animate.value = false
}

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
  animate.value = true
  const url = PlaylistItem.fetchURL(nextPageToken, props.playlist.id)

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

      // TICKS EVERY TIME
      killedItemsCount.value = playlistItems.value.filter(
        (item) => !!item.isNotAvailable
      ).length
      // if (killedItemsCount.value > 0) showCounter.value = true

      if (data.nextPageToken) {
        fetchItems(authToken, data.nextPageToken)
      } else {
        endActions()
      }
    })
    .catch((e) => {
      $toast.error(e.message)
    })
}

function endActions() {
  blocker.value = false
  animate.value = false
  deadItemsCounterStore.setCounter({
    playlistId: props.playlist.id,
    counter: killedItemsCount.value,
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

    button.btn.btn-sm.btn-accent.flex.text-xs.leading-3.gap-2.pl-2.btn-scan.relative(type="button" @click.stop="checkPlaylistForDeadItems")
      v-icon(name="ri-scan-2-line" scale="1")
      span.pl-2 SCAN

    template(v-if="killedItemsCount != null")
      .playlist-tile-items-count.bg-secondary-focus(v-if="killedItemsCount > 0" :class="{'gelatine': animate}") {{killedItemsCount}}
      .playlist-tile-items-count.bg-primary-focus.p-1(v-if="killedItemsCount == 0")
        v-icon(name="bi-check-lg" scale="1")
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

.btn-scan .ov-icon {
  position: absolute;
  left: 0.4rem;
}
</styles>
