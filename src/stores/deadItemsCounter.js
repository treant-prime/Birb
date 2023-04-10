import { ref } from 'vue'
import { defineStore } from 'pinia'

const useDeadItemsCounterStore = defineStore('dead-item-counter', () => {
  const collectionOfDeadItemsCounters = ref([]) // null, 0, 777
  const storageItem = JSON.parse(
    window.localStorage.getItem('dead-item-counter-collection') || null
  )
  if (storageItem) collectionOfDeadItemsCounters.value = storageItem

  function setCounter(payload = {}) {
    const newCollection = deleteItemFromCollection(
      collectionOfDeadItemsCounters.value,
      payload.playlistId
    )

    collectionOfDeadItemsCounters.value = [...newCollection, payload]

    window.localStorage.setItem(
      'dead-item-counter-collection',
      JSON.stringify(collectionOfDeadItemsCounters.value)
    )
  }

  function getCounter(playlistId) {
    const counter = collectionOfDeadItemsCounters.value.find(
      (item) => item.playlistId == playlistId
    )?.counter

    if (counter == undefined) return null
    return counter
  }

  function deleteItemFromCollection(collection, playlistId) {
    const index = collection.findIndex((item) => item.playlistId == playlistId)
    if (index != -1) collection.splice(index, 1)
    return collection
  }

  return {
    collectionOfDeadItemsCounters,
    setCounter,
    getCounter,
  }
})

export { useDeadItemsCounterStore }
