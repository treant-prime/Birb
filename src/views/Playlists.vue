<script setup>
// const API_KEY = "";
// const YT_CHANNEL_ID = "UCuQZ-VMez8stUmNvNDfpV7A";
// const TEST_API_PLAYLIST_ID = "UC_x5XG1OV2P6uZZ5FSM9Ttw";

import { useTokenStore } from '@/stores/token'
import { ref, computed } from "vue";
import router from "@/router";

const ITEMS_PER_APGE = 50;
const playlists = ref([]);
const search = ref('')
const tokenStore = useTokenStore()

const playlistsComputed = computed(() => {
  const filteredPlaylists = playlists.value.filter(item => {
    return item.title.toLowerCase().includes(search.value.toLowerCase())
  })
  return filteredPlaylists
})

tokenStore.$subscribe((mutation, state) => {
  if(!!state.token) {
    fetchPlaylistsPage(state.token, true)
  } else {
    playlists.value = []
  }
})

function fetchPlaylistsPage(token, forceRun, nextPageToken) {
  const url = constructFetchPlaylistUrl(nextPageToken)

  fetch(url, {
    headers: headers(token),
  })
    .then((response) => response.json())
    .then((data) => {
      let mappedItems = data.items.map((item) => ({
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        itemCount: item.contentDetails.itemCount,
        id: item.id
      }));
      playlists.value = [...playlists.value, ...mappedItems];
      playlists.value = playlists.value.sort(sortByTitle)

      if (data.nextPageToken || forceRun)
        fetchPlaylistsPage(token, false, data.nextPageToken);
    });
}

function constructFetchPlaylistUrl(nextPageToken) {
  // url = `https://youtube.googleapis.com/youtube/v3/playlists?part=${part}&key=${API_KEY}&mine=true&maxResults=${ITEMS_PER_APGE}&pageToken=${nextPageToken}`;
  // Important: Po autoryzacji API_KEY nie jest juz potrzebny
  const part = "id,snippet,status,contentDetails";
  let url = `https://youtube.googleapis.com/youtube/v3/playlists?part=${part}&mine=true&maxResults=${ITEMS_PER_APGE}`;
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

function sortByTitle(a, b) {
  if( a.title > b.title) {
    return 1;
  } else {
    return -1;
  }
  return 0;
}

function initialFetch() {
  if (tokenStore?.token) {
    fetchPlaylistsPage(tokenStore.token, true)
  }
}

function goToPlaylist(id) {
  router.push({ name: 'Playlist', params: { id } })
}

initialFetch()
</script>

<template lang="pug">
.playlists.flex.flex-wrap.ml-60.mr-60()
  input.input.input-bordered.input-primary.w-96.ml-auto.mr-auto.mt-10.mb-10(type='text' placeholder='Type here' v-model="search")

  .flex.flex-wrap.w-full
    .card.playlist-card.bg-base-100.shadow-xl.image-full.mb-3.cursor-pointer(v-for="playlist in playlistsComputed" @click="goToPlaylist(playlist.id)")
      figure
        img(:src='playlist.thumbnail' alt='Shoes')
      .card-body
        h2.card-title {{playlist.title}}
        p {{playlist.itemCount}} items in this playlist.
        .card-actions.justify-end
          button.btn.btn-primary.w-full Archive
</template>
