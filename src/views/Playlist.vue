<script setup>
import { useTokenStore } from '@/stores/token'
import { ref } from "vue";
import { useRoute } from 'vue-router'

const ITEMS_PER_APGE = 50;
const playlistItems = ref([]);
const tokenStore = useTokenStore()

tokenStore.$subscribe((mutation, state) => {
  if(!!state.token) {
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
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.default?.url,
      }));
      playlistItems.value = [...playlistItems.value, ...mappedItems];

      if (data.nextPageToken || forceRun)
        fetchPlaylistItemsPage(token, false, data.nextPageToken);
    });
}

function constructUrl(nextPageToken) {
  const playlistId = useRoute().params.id
  const part = "snippet,id,contentDetails";
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

initialFetch()
</script>

<template lang="pug">
.overflow-x-auto.w-full
  table.table.w-full
    // head
    thead
      tr
        th
          label
            input.checkbox(type='checkbox')
        th Title
        th Description
    tbody
      // row 1
      tr(v-for="playlistItem in playlistItems")
        td
          label
            input.checkbox(type='checkbox')
        td
          .flex.items-center.space-x-3
            .avatar
              .mask.mask-squircle.w-12.h-12
                img(:src="playlistItem.thumbnail" alt='Avatar Tailwind CSS Component')
            div
              .font-bold {{playlistItem.title}}
              .text-sm.opacity-50 United States
        td
          div {{playlistItem.description}}
</template>
