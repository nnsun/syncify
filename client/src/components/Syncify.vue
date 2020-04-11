<template>
  <div>
    <p>{{ song }}</p>
    <p>{{ artists }}</p>
    <p>{{ album }}</p>

    <div v-if="ready">
      <button @click="previousTrack">Previous</button>
      <button @click="togglePlay">Play</button>
      <button @click="nextTrack">Next</button>
    </div>

  </div>
</template>

<script>
const axios = require('axios')
const io = require('socket.io-client')

export default {
  name: 'Syncify',
  data() {
    return {
      player: null,
      ready: false,
      song: '',
      artists: '',
      album: ''
    }
  },

  methods: {
    togglePlay: function() {
      this.player.togglePlay()
    },
    previousTrack: function() {
      this.player.previousTrack()
    },
    nextTrack: function() {
      this.player.nextTrack()
    }
  },

  created: function() {
    const token = this.$store.state.accessToken
    const config = {
      headers: {
        Authorization: 'Bearer ' + token
      }
    }

    const socket = io.connect('http://localhost:3000')

    socket.on('update', function(state) {

      const data = {
        uri: state.track_window.current_track.uri,
        position: state.position
      }

      axios.put('https://api.spotify.com/v1/me/player/play', data, config).catch(err => console.error(err))
    })

    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token) }
      })

      this.player.addListener('ready', ({ device_id }) => {
        this.ready = true

        const data = {
          device_ids: [
            device_id
          ]
        }
        axios.put('https://api.spotify.com/v1/me/player', data, config).catch(err => console.error(err))
      })

      this.player.addListener('player_state_changed', state => {
        this.song = state.track_window.current_track.name
        this.artists = state.track_window.current_track.artists.map(obj => obj.name).join(', ')
        this.album = state.track_window.current_track.album.name

        socket.emit('update', state)
      })

      this.player.connect()
    }
  }
}
</script>

<style scoped>
</style>