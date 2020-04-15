<template>
  <div>
    <p>{{ song }}</p>
    <p>{{ artists }}</p>
    <p>{{ album }}</p>

    <div v-if="ready">
      <button @click="previousTrack">Previous</button>
      <button v-if="paused" @click="resume">{{ 'Play' }}</button>
      <button v-else @click="pause">{{ 'Pause' }}</button>
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
      paused: true,
      socket: null,
      display_name: ''
    }
  },

  methods: {
    resume: function() {
      this.player.resume()
      this.socket.emit('resume')
      this.paused = false
    },
    pause: function() {
      this.player.pause()
      this.socket.emit('pause')
      this.paused = true
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
    this.socket = io.connect(serverAddr)

    this.socket.on('connect', () => {
      axios.get('https://api.spotify.com/v1/me', config).then(res => {
        this.display_name = res.data.display_name
        this.socket.emit('info', this.display_name)
      }).catch(err => console.log(err.response))

    })

    this.socket.on('pause', () => {
      console.log('pause message received')
      this.player.pause()
    })

    this.socket.on('resume', () => {
      console.log('resume message received')
      this.player.resume()
    })

    this.socket.on('seek', position => {
      console.log('seek message received')
      this.player.seek(position)
    })

    this.socket.on('song', uri=> {
      console.log('song message received')
      const data = {
        uris: [uri],
      }
      axios.put('https://api.spotify.com/v1/me/player/play', data, config).catch(err => console.error(err.response))
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
        axios.put('https://api.spotify.com/v1/me/player', data, config).catch(err => console.error(err.response))
      })

      this.player.addListener('player_state_changed', state => {

        // account for Spotify bug where sometimes position is in seconds
        if (state.position % 1 !== 0) {
          state.position *= 1000
        }

        this.paused = state.paused
        console.log(state, state.track_window.current_track.name)

        let uri = state.track_window.current_track.uri
        let context = state.context.uri
        if (uri !== this.uri) {
          this.uri = uri
          this.song = state.track_window.current_track.name
          this.artists = state.track_window.current_track.artists.map(obj => obj.name).join(', ')
          this.album = state.track_window.current_track.album.name
          this.socket.emit('song', uri, context)
        }
      })

      this.player.connect()
    }
  }
}
</script>

<style scoped>
</style>
