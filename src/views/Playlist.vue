<script setup>
import { useTokenStore } from '@/stores/token'
import { ref } from "vue";
import router from '@/router'
import { headers } from "@/helpers"

const ITEMS_PER_APGE = 50;
const playlistItems = ref([]);
const tokenStore = useTokenStore();

const selectedPlaylistItem = ref(null);
const newVideoCode = ref('');

tokenStore.$subscribe((mutation, state) => {
  console.log('state', state)
  console.log('state.token', state?.token)
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

function swapVideo(playlistItem) {
  const playlistItemIdToDelete = playlistItem.id

  const videoId = newVideoCode.value
  const position = playlistItem.position
  const playlistId = router.currentRoute.value.params.id

  // const generateBody
  const body = {
    "snippet": {
      "playlistId": playlistId,
      "resourceId": {
        "kind": "youtube#video",
        "videoId": videoId
      },
      "position": position
    }
  }

  const url = constructPostUrl(playlistId)

  fetch(url, {
    headers: headers(tokenStore.token),
    method: "POST",
    body: JSON.stringify(body),
  })
    .then(() => {
      console.log('swapVideo success')
      deleteVideo(playlistItemIdToDelete)
    })
    .catch(() => {
      console.log('swapVideo fail')
    })
    .finally(() => {
      selectedPlaylistItem.value = null
    })
}

function constructPostUrl(playlistId) {
  const part = "snippet,id,contentDetails,status";
  return `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${part}&playlistId=${playlistId}`;
}

function deleteVideo(playlistItemId) {
  const url = deletetUrl(playlistItemId)
  fetch(url, {
    headers: headers(tokenStore.token),
    method: "DELETE",
  })
    .then((response) => {
      console.log('response', response);
      console.log('deleteVideo success');
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

function selectPlaylistItem(playlistItem) {
  selectedPlaylistItem.value = playlistItem
}

function refetch() {
  playlistItems.value = []
  initialFetch()
}

initialFetch()
</script>

<template lang="pug">
.overflow-x-auto.w-full
  .fixed-overlay(v-if="selectedPlaylistItem")
    .card.m-auto
      .card-body
        h2 Enter video URL
        span {{ selectedPlaylistItem.title }}
        .input-group
          input.input.input-bordered.input-sm.w-full(type='text' placeholder='Video URL' v-model="newVideoCode")
          button.btn.btn-square.btn-sm(@click="swapVideo(selectedPlaylistItem)")
            svg.h-6.w-6(xmlns='http://www.w3.org/2000/svg' fill='none' viewbox='0 0 24 24' stroke='currentColor')
              path(stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z')

  table.table.w-full
    thead
      tr
        th Position
        th
          label
            input.checkbox(type='checkbox')
        th Title
        th
        //- th Description
    tbody
      tr(v-for="playlistItem in playlistItems" :class="{ 'bg-zinc-600': playlistItem.isNotAvailable}")
        td
          div {{ playlistItem.position }}
        td
          label
            input.checkbox(type='checkbox')
        td
          .flex.items-center.space-x-3
            .avatar
              .mask.mask-squircle.w-12.h-12
                img(:src="playlistItem.thumbnail" alt='Avatar Tailwind CSS Component' v-if="!playlistItem.isNotAvailable")
                .bg-secondary.w-12.h-12.flex.items-center.justify-center(v-else)
                  v-icon(name="gi-tombstone" scale="1.5")
            div
              .font-bold {{playlistItem.title}}
              .text-sm.opacity-50(v-if="playlistItem.isNotAvailable")
                a(:href="`https://www.google.com/search?q=${playlistItem.videoId}`" target="_blank") Google for video ID

        td
          .flex.items-center
            button.btn.btn-circle.btn-sm.mr-3(type="button" @click="deleteVideo(playlistItem.id)")
              svg.h-6.w-6(xmlns='http://www.w3.org/2000/svg' fill='none' viewbox='0 0 24 24' stroke='currentColor')
                path(stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12')

            //- button.btn.btn-circle.btn-sm.mr-3(type="button" @click="selectPlaylistItem(playlistItem)" v-if="playlistItem.isNotAvailable")
            button.btn.btn-circle.btn-sm.mr-3(type="button" @click="selectPlaylistItem(playlistItem)")
              svg.h-6.w-6(xmlns='http://www.w3.org/2000/svg' fill='none' viewbox='0 0 24 24' stroke='currentColor')
                path(stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z')
        //- td
        //-   div {{playlistItem.description}}
</template>
