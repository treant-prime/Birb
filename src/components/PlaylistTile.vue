<script setup>
import router from '@/router'

const props = defineProps({
  playlist: Object,
})

function goToPlaylist(id) {
  router.push({ name: 'PlaylistItems', params: { id } })
}
</script>

<template lang="pug">
.card.playlist-tile(@click="goToPlaylist(playlist.id)")
  figure
    img(:src='playlist.thumbnail' alt='Playlist thumbnail')
  .card-body.h-64
    h2.card-title {{playlist.title}}
    .playlist-tile-items-count {{playlist.itemCount}}
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

.card.playlist-tile:hover {
  transform: scale(1.2);
  opacity: 1;
  box-shadow: 0px 0px 0px 6px white;
  z-index: 999;
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
</styles>
