<script setup>
import { computed, ref } from 'vue'
import { useToast } from 'vue-toast-notification'

import { useRoute } from '@/router'
import { Playlist } from '@/classes/Playlist.js'
import { PlaylistItem } from '@/classes/PlaylistItem.js'
import { headers } from '@/helpers'
import { usePlaylistsStore, functA } from '@/stores/playlists'
import { useTokenStore } from '@/stores/token'
import ReplaceVideoModal from '@/components/ReplaceVideoModal.vue'

const $toast = useToast()
const blocker = ref(false)
const playlistItems = ref([])
const playlistItemToReplace = ref(null)
const playlists = ref([])
const playlistsStore = usePlaylistsStore()
const tokenStore = useTokenStore()
const route = useRoute()

tokenStore.$subscribe((mutation, state) => {
  if (!!state.token) {
    fetchPlaylistItemsPage(state.token)
  } else {
    playlistItems.value = []
  }
})

if (!playlistsStore?.playlists) {
  getPlaylistsForStore(tokenStore.token)
}

functA().functB()
console.log(functA().gamma)

const currentPlaylist = computed(() => {
  return playlistsStore.playlists?.find(
    (item) => item.id == route.params.id
  )
})

function getPlaylistsForStore(authToken, nextPageToken = null) {
  const url = Playlist.fetchURL(nextPageToken)

  fetch(url, {
    headers: headers(authToken),
  })
    .then((response) => response.json())
    .then((data) => {
      let mappedItems = data.items.map((item) => {
        return new Playlist(item)
      })
      playlists.value = [...playlists.value, ...mappedItems]
      if (data.nextPageToken) {
        fetchPlaylistsPage(authToken, data.nextPageToken)
      } else {
        savePlaylistInStore(playlists.value)
      }
    })
}

function savePlaylistInStore(playlists) {
  playlistsStore.setPlaylists(playlists)
}

function fetchPlaylistItemsPage(authToken, nextPageToken = null) {
  blocker.value = true
  const url = PlaylistItem.fetchURL(
    nextPageToken,
    route.params.id
  )

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
        return new PlaylistItem(item)
      })

      playlistItems.value = [...playlistItems.value, ...mappedItems]

      if (data.nextPageToken)
        fetchPlaylistItemsPage(authToken, data.nextPageToken)
    })
    .catch((e) => {
      $toast.error(e.message)
    })
    .finally(() => {
      blocker.value = false
    })
}

function confirmationDeletion(playlistItemId) {
  if (confirm('Delete?') == true) {
    deleteVideo(playlistItemId, () => $toast.success('Video deleted'))
  }
}

function deleteVideo(playlistItemId, callback = null) {
  const url = PlaylistItem.deletetURL(playlistItemId)
  blocker.value = true

  fetch(url, {
    headers: headers(tokenStore.token),
    method: 'DELETE',
  })
    .then(() => {
      if (callback) callback()
      closeModal()
      refetch()
    })
    .catch(() => {
      $toast.error('Video deletion fail')
    })
    .finally(() => {
      blocker.value = false
    })
}

function initialFetch() {
  if (tokenStore?.token) {
    fetchPlaylistItemsPage(tokenStore.token)
  }
}

function openReplaceVideoModal(playlistItem) {
  playlistItemToReplace.value = playlistItem
}

function refetch() {
  playlistItems.value = []
  initialFetch()
}

function closeModal() {
  playlistItemToReplace.value = null
}

initialFetch()
</script>

<template lang="pug">
.playlist-title.my-4.flex.justify-between.items-end.leading-normal(v-if="currentPlaylist")
  h2.font-bold.block.mb-0 {{ currentPlaylist.title }}
  h3.font-bold.block.text-secondary.mb-0.ml-3.text-right {{ currentPlaylist.itemCount }} ITEMS

.overflow-x-auto.w-full
  transition(name="fade")
    replace-video-modal(
      :playlistItemToReplace="playlistItemToReplace" v-if="playlistItemToReplace" @close="closeModal" @deleteVideo="deleteVideo($event)"
    )

  table.table
    thead
      tr
        th.w-12 Position
        th Title
        th Actions
    tbody
      tr(v-for="playlistItem in playlistItems" :class="{ 'bg-deleted': playlistItem.isNotAvailable}")
        td
          .text-zinc-500.h-8.w-8.radius.rounded-full.font-semibold.bg-base-300.flex.justify-center.items-center.text-xs {{ playlistItem.position + 1 }}
        td
          .flex.items-center.space-x-3
            .avatar
              .mask.mask-squircle.w-12.h-12
                img(:src="playlistItem.thumbnail" alt='Avatar Tailwind CSS Component' v-if="!playlistItem.isNotAvailable")
                .bg-secondary.w-12.h-12.flex.items-center.justify-center(v-else)
                  v-icon(name="gi-tombstone" scale="1.5")
            div.w-full
              template(v-if="!playlistItem.isNotAvailable")
                .font-bold.table-title {{ playlistItem.title }}

              .rounded-lg.ml-6(v-else style="margin-top: -6px;")
                .font-semibold.text-xs.text-zinc-500.inline-block FIND VIDEO:
                div
                  a.btn-circle.btn-sm.btn-active.btn-ghost.inline-flex.items-center.justify-center(:href='`https://www.google.com/search?q="${playlistItem.videoId}"`' target="_blank")
                    v-icon(name="fa-google" scale="1")

                  a.btn-circle.btn-sm.btn-active.btn-ghost.inline-flex.items-center.justify-center.ml-2(:href="`https://web.archive.org/web/*/https://www.youtube.com/watch?v=${playlistItem.videoId}`" target="_blank")
                    v-icon(name="ai-archive" scale="1")

        td
          .flex.items-center
            button.btn.btn-secondary.btn-sm.mr-3.pl-2.block(type="button" @click="openReplaceVideoModal(playlistItem)")
              v-icon.mr-1(name="bi-bandaid" scale="0.8")
              span PATCH

            button.btn.btn-outline.btn-secondary.btn-sm.pl-2.block(type="button" @click="confirmationDeletion(playlistItem.id)")
              v-icon.mr-1(name="io-close" scale="1")
              span DELETE

blocker-cmp(v-if="blocker")
</template>

<style>
.playlist-title {
  margin-left: 1.5rem;
  margin-right: 1.5rem;
}

@media screen and (max-width: 900px) {
  .playlist-title {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .playlist-title h2,
  .playlist-title h3 {
    font-size: 1rem;
    font-size: 1rem;
    line-height: 1;
  }
}

/* https://daisyui.com/docs/colors/ */
.table tr.bg-deleted td {
  background: hsl(var(--b2));
  border-color: hsl(var(--b3));
}

.table {
  width: calc(100% - 3rem);
  margin: auto;
}

@media screen and (max-width: 900px) {
  .table {
    width: 100%;
    margin: 0;
  }
}

/* wierd tailwind/daisy behavior */
.table th:first-child {
  z-index: 0;
}

.table .table-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 60vw;
}

.table td,
.table th {
  position: sticky;
  position: -webkit-sticky;
  left: 0px;
}
</style>
