<script setup>
import { ref, onMounted } from 'vue'
import anime from 'animejs/lib/anime.es.js';
const square = ref(null)

onMounted(() => {
  anime({
    targets: square.value,
    rotate: [-20,20],
    duration: 1800,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine',
    delay: 250
  });
})
</script>

<template lang="pug">
.home
  .square(ref='square')
</template>

<style>
.square {
  width: 100px;
  height: 100px;
  background: black;
  transform: rotate(20deg);
}

</style>
