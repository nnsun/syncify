<template>
  <div>
    <p>{{ song }}</p>
    <p>{{ artist }}</p>
    <p>{{ album }}</p>
  </div>
</template>

<script>
const axios = require('axios')

export default {
  name: 'Syncify',
  data() {
    return {
      song: '',
      artist: '',
      album: ''
    }
  },
  created: function() {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = process.env.VUE_APP_TOKEN
      const player = new window.Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); }
      })

      player.addListener('ready', ({ device_id }) => {
        console.log('Connected with Device ID', device_id);

        const config = {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }
        const data = {
          'device_ids': [
            device_id
          ]
        }

        axios.put('https://api.spotify.com/v1/me/player', config, data).then(res => console.log(res)).catch(err => console.error(err))
      })

      player.addListener('player_state_changed', state => {
        console.log(state)
        this.song = state.track_window.current_track.name
        this.artist = state.track_window.current_track.artists[0].name
        this.album = state.track_window.current_track.album.name
      })

      player.connect()
    }
  }
}
</script>

<style scoped>
</style>