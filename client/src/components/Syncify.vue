<template>
  <div v-if="state !== null">
    <p>{{ track.name }}</p>
    <p>{{ track.artists.map(obj => obj.name).join(', ') }}</p>
    <p>{{ track.album.name }}</p>

    <div v-if="ready">
      <button @click="previousTrack">Previous</button>
      <button v-if="state.paused" @click="resume">{{ 'Play' }}</button>
      <button v-else @click="pause">{{ 'Pause' }}</button>
      <button @click="nextTrack">Next</button>
    </div>

    <div class="slider-div">
      <span>{{ songProgress }}</span>
      <input type="range" min="0" :max="track.duration_ms / 100" v-model="progress" class="slider" @change=seek>
      <span>{{ songLength }}</span>
    </div>

    <div>
      <h3>Users</h3>
      <p v-for="user in users" :key="user">{{ user }}</p>
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
      state: null,
      socket: null,
      users: [],
      progress: 0
    }
  },

  methods: {
    resume: function() {
      this.player.resume()
      this.socket.emit('resume')
    },

    pause: function() {
      this.player.pause()
      this.socket.emit('pause')
    },

    previousTrack: function() {
      if (this.progress < 25) {
        this.player.previousTrack()
      }
      else {
        this.player.seek(0)
      }
      this.progress = 0
      this.state.position = 0
      this.state.timestamp = Date.now()
    },

    nextTrack: function() {
      this.player.nextTrack()
      this.progress = 0
      this.state.position = 0
      this.state.timestamp = Date.now()
    },

    seek: function() {
      this.player.seek(this.progress * 100)
      this.socket.emit('seek', this.progress * 100)
    }
  },

  computed: {
    track: function() {
      return this.state.track_window.current_track
    },

    songLength: function() {
      const minutes = Math.floor(this.track.duration_ms / (60 * 1000))
      const seconds = Math.floor(this.track.duration_ms % (60 * 1000) / 1000)
      return minutes.toString() + ':' + (seconds < 10 ? '0' + seconds : seconds)
    },

    songProgress: function() {
      const minutes = Math.floor(this.progress / (60 * 10))
      const seconds = Math.floor(this.progress % (60 * 10) / 10)
      return minutes.toString() + ':' + (seconds < 10 ? '0' + seconds : seconds)
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
        this.socket.emit('info', res.data.display_name)
      }).catch(err => console.log(err.response))
    })

    this.socket.on('users', users => {
      this.users = users
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
      this.progress = position / 100
    })

    this.socket.on('song', uri => {
      console.log('song message received')
      if (this.track.uri == uri) {
        return
      }
      this.progress = 0
      const data = {
        uris: [uri],
      }
      axios.put('https://api.spotify.com/v1/me/player/play', data, config).catch(err => console.error(err.response))
    })

    setInterval(() => {
      if (this.state === null) {
        return
      }
      if (!this.state.paused) {
        this.progress = (this.state.position + (Date.now() - this.state.timestamp)) / 100
      }
      else {
        this.progress = this.state.position / 100
      }
    }, 100)

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
        if (state == null) {
          return
        }

        console.log(state)

        // account for Spotify bug where sometimes position is in seconds
        if (state.position % 1 !== 0) {
          state.position *= 1000
        }

        if (this.state == null) {
          this.state = state
        }

        let uri = state.track_window.current_track.uri

        if (uri !== this.track.uri) {
          this.socket.emit('song', uri)
        }

        this.state = state
      })

      this.player.connect()
    }
  }
}
</script>

<style scoped>
.slider-div {
  width: 100%;
}

.slider {
  width: 1000px;
}
</style>
