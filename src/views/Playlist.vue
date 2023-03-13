<script setup>
import { useTokenStore } from '@/stores/token'
import { ref } from "vue";
import router from '@/router'

const ITEMS_PER_APGE = 50;
const playlistItems = ref([]);
const tokenStore = useTokenStore()

tokenStore.$subscribe((mutation, state) => {
  if(!!state.token) {
    console.log('111')
    fetchPlaylistItemsPage(state.token, true)
  } else {
    playlistItems.value = []
  }
})

function fetchPlaylistItemsPage(token, forceRun, nextPageToken) {
  const url = constructUrl(nextPageToken)

  fetch(url, {
    headers: headers(token),
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

      if (data.nextPageToken || forceRun)
        fetchPlaylistItemsPage(token, false, data.nextPageToken);
    });
}

function constructUrl(nextPageToken) {
  const playlistId = router.currentRoute.value.params.id
  const part = "snippet,id,contentDetails,status";
  let url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${part}&playlistId=${playlistId}&maxResults=${ITEMS_PER_APGE}`;
  if(nextPageToken) url = url + `&pageToken=${nextPageToken}`;
  return url
}

function headers(token) {
  const bearer = "Bearer " + token;
  return {
    Authorization: bearer,
    Accept: "application/json",
  };
}

function initialFetch() {
  if (tokenStore?.token) {
    fetchPlaylistItemsPage(tokenStore.token, true)
  }
}

function insertHardcoded(videoId) {
  const body = {
    "snippet": {
      "playlistId": router.currentRoute.value.params.id,
      "resourceId": {
        "kind": "youtube#video",
        "videoId": videoId
      },
      "position": 1
    }
  }

  const url = constructPostUrl()
  console.log('body', body)

  fetch(url, {
    headers: headers(tokenStore.token),
    method: "POST",
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {

    });
}

function constructPostUrl() {
  const playlistId = router.currentRoute.value.params.id
  const part = "snippet,id,contentDetails,status";
  let url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${part}&playlistId=${playlistId}`;
  return url
}

function constructDeletUrl(id) {
  const playlistId = router.currentRoute.value.params.id
  const part = "snippet,id,contentDetails,status";
  let url = `https://youtube.googleapis.com/youtube/v3/playlistItems?id=${id}`;
  return url
}

function deleteVideo(id) {
  const url = constructDeletUrl(id)

  fetch(url, {
    headers: headers(tokenStore.token),
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {

    });
}

initialFetch()
</script>

<template lang="pug">
.overflow-x-auto.w-full
  table.table.w-full
    // head
    thead
      tr
        th Position
        th
          label
            input.checkbox(type='checkbox')
        th Title
        th
        th Description
    tbody
      // row 1
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

            .form-control(v-if="playlistItem.isNotAvailable")
              .input-group
                input.input.input-bordered.input-sm(type='text' placeholder='Search…')
                button.btn.btn-square.btn-sm(@click="insertHardcoded('WmRtNpl-M9I')")
                  svg.h-6.w-6(xmlns='http://www.w3.org/2000/svg' fill='none' viewbox='0 0 24 24' stroke='currentColor')
                    path(stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z')

        td
          div {{playlistItem.description}}
</template>
