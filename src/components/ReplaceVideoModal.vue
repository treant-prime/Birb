<script setup>
import { ref } from 'vue'
import getVideoId from 'get-video-id'
import { useToast } from 'vue-toast-notification'

import router from '@/router'
import { useTokenStore } from '@/stores/token'
import { headers } from '@/helpers'
import { PlaylistItem } from '@/classes/PlaylistItem.js'
import PlaylistItems from '../views/PlaylistItems.vue'

const $toast = useToast()
const tokenStore = useTokenStore()
const videoUrl = ref('')

const props = defineProps({
  playlistItemToReplace: Object,
})

const emit = defineEmits(['deleteVideo', 'close'])

function replaceVideo(playlistItemToReplaceId, videoUrl, position) {
  const playlistId = router.currentRoute.value.params.id
  const id = findVideoId(videoUrl)

  const body = {
    snippet: {
      playlistId: playlistId,
      resourceId: {
        kind: 'youtube#video',
        videoId: id,
      },
      position: position,
    },
  }

  const url = PlaylistItem.postUrl(playlistId)

  fetch(url, {
    headers: headers(tokenStore.token),
    method: 'POST',
    body: JSON.stringify(body),
  })
    .then((response) => {
      if (response.ok) {
        $toast.success('Video healed')
        emit('deleteVideo', playlistItemToReplaceId)
      } else if (response.status == 404) {
        throw new Error('Video not found')
      } else {
        throw new Error('Action failed')
      }
    })
    .catch((e) => {
      $toast.error(e.message)
    })
}

function findVideoId(videoUrl) {
  const { id } = getVideoId(videoUrl)
  if (id) return id
  $toast.error('Invalid URL')
  throw new Error('Invalid URL')
}

function close() {
  emit('close')
}
</script>

<template lang="pug">
.fixed-overlay(@click="close()")
  transition(name="pop" appear)
    .card
      .card-body(@click="event => event.stopPropagation()")
        h2.text-center Patch this video
        .mb-2 Replacing video:
          b.ml-1 {{ playlistItemToReplace.title }}
        form.input-group(@submit.prevent="() => replaceVideo(playlistItemToReplace.id, videoUrl, playlistItemToReplace.position)")
          input.input.input-bordered.input-sm.w-full(type='text' placeholder='New Video URL' v-model="videoUrl")

          button.btn.btn-secondary.btn-sm.mr-3.pl-2(type="button" @click="replaceVideo(playlistItemToReplace.id, videoUrl, playlistItemToReplace.position)")
            v-icon.mr-1(name="bi-bandaid" scale="1")
            div PATCH
</template>
