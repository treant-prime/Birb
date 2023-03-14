<script setup>
import { useTokenStore } from '@/stores/token'
import { ref } from "vue";
import { headers } from "@/helpers"
import router from '@/router'

const tokenStore = useTokenStore();
const newVideoId = ref('');

const props = defineProps({
  playlistItemToReplace: Object
})

const emit = defineEmits(['deleteVideo', 'close'])

function replaceVideo(playlistItemToReplaceId, newVideoId, position) {
  const videoId = newVideoId
  const playlistId = router.currentRoute.value.params.id

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
    .then((data) => {
      if(data.status == 200) {
        emit('deleteVideo', playlistItemToReplaceId)
      }
    })
    .catch(() => {
      // will fail only when no network
      console.log('replaceVideo fail')
    })
}

function constructPostUrl(playlistId) {
  const part = "snippet";
  return `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${part}&playlistId=${playlistId}`;
}

function close() {
  emit('close')
}
</script>

<template lang="pug">
.fixed-overlay(@click="close()")
  .card.m-auto
    .card-body(@click="event => event.stopPropagation()")
      h2.text-center Patch this video
      .mb-2 Replacing video:
        b.ml-1 {{ playlistItemToReplace.title }}
      .input-group
        input.input.input-bordered.input-sm.w-full(type='text' placeholder='New Video URL' v-model="newVideoId")
        button.btn.btn-square.btn-sm(@click="replaceVideo(playlistItemToReplace.id, newVideoId, playlistItemToReplace.position)")
          svg.h-6.w-6(xmlns='http://www.w3.org/2000/svg' fill='none' viewbox='0 0 24 24' stroke='currentColor')
            path(stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z')
</template>
