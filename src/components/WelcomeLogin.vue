<script setup>
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { useTokenStore } from '@/stores/token'

const tokenStore = useTokenStore()

function setToken(payload) {
  tokenStore.setToken(payload)
}

function signIn() {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/youtube.readonly");
  const auth = getAuth();
  auth.useDeviceLanguage();

  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      console.log("user", user);
      console.log("token", token);
      setToken(token);
    })
    .catch(() => {
      console.log("Login failed");
    });
}
</script>

<template lang="pug">
.modal.flex
  .card.w-64.block.text-center.m-auto.px-3
    b.block.mb-1 Welcome to Birb
    .mb-5 Sign in to archive your playlists in easy 600 steps.
    button.btn.btn-primary.w-full(@click="signIn" type="button") Sign in with Google
</template>
