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

        button.btn.btn-secondary.btn-sm.mr-3.pl-2(type="button" @click="replaceVideo(playlistItemToReplace.id, newVideoId, playlistItemToReplace.position)")
          v-icon.mr-1(name="bi-bandaid" scale="1")
          div PATCH
</template>
