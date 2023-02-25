<script>
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const API_KEY = "";
const YT_CHANNEL_ID = "UCuQZ-VMez8stUmNvNDfpV7A";
const TEST_API_PLAYLIST_ID = "UC_x5XG1OV2P6uZZ5FSM9Ttw";
const ITEMS_PER_APGE = 50;

export default {
  name: "LoginView",
  data() {
    return {
      playlists: [],
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
      const url = this.constructFetchPlaylistUrl(nextPageToken)

      fetch(url, {
        headers: this.headers(token),
      })
        .then((response) => response.json())
        .then((data) => {
          let mappedItems = data.items.map((item) => ({title:item.snippet.title, thumbnail: item.snippet.thumbnails.high.url}));
          this.playlists = [...this.playlists, ...mappedItems];

          if (data.nextPageToken || forceRun)
            this.fetchPlaylistsPage(token, false, data.nextPageToken);
        });
    },
    constructFetchPlaylistUrl(nextPageToken) {
      // url = `https://youtube.googleapis.com/youtube/v3/playlists?part=${part}&key=${API_KEY}&mine=true&maxResults=${ITEMS_PER_APGE}&pageToken=${nextPageToken}`;
      // Important: Po autoryzacji API_KEY nie jest juz potrzebny
      const part = "id,snippet,status";
      let url = `https://youtube.googleapis.com/youtube/v3/playlists?part=${part}&mine=true&maxResults=${ITEMS_PER_APGE}`;
      if(nextPageToken) url = url + `&pageToken=${nextPageToken}`;
      return url
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
.flex.flex-wrap
  button.btn.btn-primary(@click="signIn" type="button") Login
  .card.block.mb-2.mr-2(v-for="playlist in playlists")
    h3.block {{playlist.title}}
    img.w-40.block(:src="playlist.thumbnail")
</template>

<style scoped lang="scss"></style>
