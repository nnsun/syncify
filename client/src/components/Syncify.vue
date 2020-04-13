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
      album: '',
      uri: '',
      last_timestamp: null,
      last_position: null,
      paused: true
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
    const serverAddr = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_SERVER_ADDR : 'http://localhost:3000'
    const socket = io.connect(serverAddr)

    socket.on('pause', () => {
      console.log('pause message received')
      this.player.pause()
    })

    socket.on('resume', () => {
      console.log('resume message received')
      this.player.resume()
    })

    socket.on('seek', position => {
      console.log('seek message received')
      this.player.seek(position)
    })

    socket.on('song', uri => {
      console.log('song message received')
      const data = {
        uris: [uri]
      }
      console.log(data)
      axios.put('https://api.spotify.com/v1/me/player/play', data, config).catch(err => console.error(err))
    })

    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token) }
      })

      this.player.addListener('initialization_error', ({ message }) => { console.error(message) })

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

        // account for Spotify bug where sometimes position is in seconds
        if (state.position % 1 !== 0) {
          state.position *= 1000
        }

        let uri = state.track_window.current_track.uri
        if (uri !== this.uri) {
          this.uri = uri
          this.song = state.track_window.current_track.name
          this.artists = state.track_window.current_track.artists.map(obj => obj.name).join(', ')
          this.album = state.track_window.current_track.album.name
          socket.emit('song', uri)
        }

        const diff = Math.abs((state.timestamp - this.last_timestamp) - (state.position - this.last_position))
        this.last_position = state.position
        this.last_timestamp = state.timestamp
        if (this.paused === state.paused) {
          if (diff > 1000) {
            this.position = state.position
            socket.emit('seek', state.position)
          }
        }
        else {
          this.paused = state.paused
          if (this.paused) {
            socket.emit('pause')
          }
          else {
            socket.emit('resume')
          }
          return
        }
      })

      this.player.connect()
    }
  }
}
</script>

<style scoped>
</style>
