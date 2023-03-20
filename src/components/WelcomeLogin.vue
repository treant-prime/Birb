<script setup>
import { getAuth, setPersistence, signInWithPopup, GoogleAuthProvider, browserLocalPersistence } from "firebase/auth";

import { useTokenStore } from '@/stores/token'

const tokenStore = useTokenStore()

function setToken(payload) {
  tokenStore.setToken(payload)
}

function signIn() {
  const auth = getAuth(window.firebaseApp);
  auth.useDeviceLanguage();

  const persistenceSetter = () => {
    return setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const provider = new GoogleAuthProvider();
        // provider.addScope("https://www.googleapis.com/auth/youtube");
        // provider.addScope("https://www.googleapis.com/auth/youtube.readonly");
        provider.addScope("https://www.googleapis.com/auth/youtube.force-ssl");
        return signInWithPopup(auth, provider)
      })
      .catch(() => {
        console.log("SetPersistence failed");
      });
  }

  persistenceSetter()
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
.fixed-overlay
  .card.m-auto
    .card-body
      b.block Welcome to Birb
      .mb-2 Sign in to archive your playlists in easy 600 steps.
      button.btn.w-full(@click="signIn" type="button") Sign in with Google
</template>
