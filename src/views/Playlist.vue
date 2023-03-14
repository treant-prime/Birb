<script setup>
import { useTokenStore } from '@/stores/token'
import { ref } from "vue";
import router from '@/router'
import { headers } from "@/helpers"
import ReplaceVideoModal from '@/components/ReplaceVideoModal.vue'

const ITEMS_PER_APGE = 50;
const playlistItems = ref([]);
const tokenStore = useTokenStore();
const playlistItemToReplace = ref(null);

tokenStore.$subscribe((mutation, state) => {
  if(!!state.token) {
    fetchPlaylistItemsPage(state.token)
  } else {
    playlistItems.value = []
  }
})

function fetchPlaylistItemsPage(authToken, nextPageToken=null) {
  const url = constructUrl(nextPageToken)

  fetch(url, {
    headers: headers(authToken),
  })
    .then((response) => response.json())
    .then((data) => {
      let mappedItems = data.items.map((item) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.default?.url,
        position: item.snippet.position,
        isNotAvailable: !item.snippet?.videoOwnerChannelId,
        videoId: item.snippet.resourceId.videoId
      }));
      playlistItems.value = [...playlistItems.value, ...mappedItems];

      if (data.nextPageToken)
        fetchPlaylistItemsPage(authToken, data.nextPageToken);
    });
}

function constructUrl(nextPageToken) {
  const playlistId = router.currentRoute.value.params.id
  const part = "snippet,id,contentDetails,status";
  let url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${part}&playlistId=${playlistId}&maxResults=${ITEMS_PER_APGE}`;
  if(nextPageToken) url = url + `&pageToken=${nextPageToken}`;
  return url
}

function confirmationDeletion(playlistItemId) {
  if (confirm("Delete?") == true) {
    deleteVideo(playlistItemId)
  }
}

function deleteVideo(playlistItemId) {
  const url = deletetUrl(playlistItemId)
  console.log('playlistItemId', playlistItemId)

  fetch(url, {
    headers: headers(tokenStore.token),
    method: "DELETE",
  })
    .then((response) => {
      console.log('response', response);
      console.log('deleteVideo success');
      closeModal()
      refetch()
    })
    .catch((error) => {
      console.log("deleteVideo fail", error);
    });
}

function deletetUrl(playlistItemId) {
  return`https://youtube.googleapis.com/youtube/v3/playlistItems?id=${playlistItemId}`;
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
.overflow-x-auto.w-full
  replace-video-modal(:playlistItemToReplace="playlistItemToReplace" v-if="playlistItemToReplace" @close="closeModal" @deleteVideo="deleteVideo($event)")

  table.table
    thead
      tr
        th.w-12 Position
        th Title
        th Actions
    tbody
      tr(v-for="playlistItem in playlistItems" :class="{ 'bg-deleted': playlistItem.isNotAvailable}")
        td
          .text-zinc-500.h-8.w-8.radius.rounded-full.font-semibold.bg-base-300.flex.justify-center.items-center.text-xs {{ playlistItem.position }}
        td
          .flex.items-center.space-x-3
            .avatar
              .mask.mask-squircle.w-12.h-12
                img(:src="playlistItem.thumbnail" alt='Avatar Tailwind CSS Component' v-if="!playlistItem.isNotAvailable")
                .bg-secondary.w-12.h-12.flex.items-center.justify-center(v-else)
                  v-icon(name="gi-tombstone" scale="1.5")
            div.w-full
              .font-bold.table-title {{ playlistItem.title }}
              .text-sm.opacity-50(v-if="playlistItem.isNotAvailable")
                a(:href="`https://www.google.com/search?q=${playlistItem.videoId}`" target="_blank") Google for video ID

        td
          .flex.items-center
            button.btn.btn-secondary.btn-sm.mr-3.pl-2(type="button" @click="openReplaceVideoModal(playlistItem)")
              v-icon.mr-1(name="bi-bandaid" scale="0.8")
              span PATCH

            button.btn.btn-outline.btn-secondary.btn-sm.mr-3.pl-2(type="button" @click="confirmationDeletion(playlistItem.id)")
              v-icon.mr-1(name="io-close" scale="1")
              span DELETE
</template>
