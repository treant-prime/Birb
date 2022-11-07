<script>
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const API_KEY = "";
const YT_CHANNEL_ID = "UCuQZ-VMez8stUmNvNDfpV7A";
const TEST_API_PLAYLIST_ID = "UC_x5XG1OV2P6uZZ5FSM9Ttw";

export default {
  name: "LoginView",
  data() {
    return {
      playlists: [],
      counter: 0,
    };
  },
  methods: {
    signIn() {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/youtube.readonly");
      const auth = getAuth();
      // https://cloud.google.com/identity-platform/docs/web/google#web-version-9
      // To apply the default browser preference instead of explicitly setting it.
      auth.useDeviceLanguage();

      signInWithPopup(auth, provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          const user = result.user;
          console.log("user", user);
          console.log("token", token);

          this.fetchPlaylistsPage(token, true);
        })
        .catch(() => {
          console.log("Login failed");
        });
    },
    fetchPlaylistsPage(token, forceRun, nextPageToken) {
      // const part = "contentDetails,id,localizations,player,snippet,status";
      const part = "id,snippet,status";
      const itemsPerPage = 50;
      let url;
      if (nextPageToken) {
        url = `https://youtube.googleapis.com/youtube/v3/playlists?part=${part}&key=${API_KEY}&mine=true&maxResults=${itemsPerPage}&pageToken=${nextPageToken}`;
      } else {
        url = `https://youtube.googleapis.com/youtube/v3/playlists?part=${part}&key=${API_KEY}&mine=true&maxResults=${itemsPerPage}`;
      }

      fetch(url, {
        headers: this.headers(token),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          let mappedItems = data.items.map((item) => item.snippet.title);
          this.playlists = [...this.playlists, ...mappedItems];

          if (data.nextPageToken || forceRun)
            this.fetchPlaylistsPage(token, false, data.nextPageToken);
        });
    },
    headers(token) {
      const bearer = "Bearer " + token;
      return {
        Authorization: bearer,
        Accept: "application/json",
      };
    },
  },
};
</script>

<template lang="pug">
.col-2.offset-5.h-100vh.d-flex.align-items-center
  button.btn.btn-primary.btn-block(@click="signIn" type="button") Login
  h3(v-for="playlist in playlists") {{playlist}}
</template>

<style scoped lang="scss"></style>
