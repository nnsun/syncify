<template>
  <div id="app">
    <div v-if="$store.state.accessToken" class="fixed w-full h-full top-0 text-gray-700 overflow-auto bg-white">
      <h1 class="text-5xl font-bold mb-4 mt-16">Syncify</h1>
      <RoomMenu v-if="!$store.state.room"></RoomMenu>
      <Player v-else></Player>
    </div>
    
  </div>
</template>

<script>

import RoomMenu from '@/components/RoomMenu'
import Player from '@/components/Player'

export default {
  name: 'App',
  components: {
    RoomMenu,
    Player
  },

  beforeCreate: function() {
    let fullPath = this.$route.fullPath
    if (fullPath !== '/') {
      let paramsList = fullPath.substring(2).split(/=|&/)
      let params = {}
      for (let i = 0; i < paramsList.length - 1; i += 2) {
        params[paramsList[i]] = paramsList[i + 1]
      }
      this.$store.commit('setAccessToken', params.access_token)
      this.$router.replace({name: 'App'})
    }
    else {
      if (this.$store.state.accessToken === '') {
        const callback = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_CALLBACK_ADDR : 'http://localhost:8080'
        const data = {
          client_id: process.env.VUE_APP_CLIENT_ID,
          response_type: 'token',
          redirect_uri: callback,
          scope: 'user-read-playback-state streaming user-read-email user-read-private user-modify-playback-state'
        }

        window.open('https://accounts.spotify.com/authorize?' + new URLSearchParams(data).toString(), '_self')
      }
    }
  }

}
</script>

<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
