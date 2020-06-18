<template>
  <div v-if="state !== null">
    <h2 class="text-4xl mt-48">{{ track.name }}</h2>
    <h3 class="text-2xl m-4 text-gray-500">{{ track.artists.map(obj => obj.name).join(', ') }}</h3>
    <h3 class="text-2xl m-4 text-gray-500">{{ track.album.name }}</h3>

    <button @click="previousTrack" class="media-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M12 12h4v24h-4zm7 12l17 12V12z"/></svg>
    </button>
    
    <button v-if="state.paused" @click="resume" class="media-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M16 10v28l22-14z"/></svg>
    </button>
    
    <button v-else @click="pause" class="media-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" class="appearance-none"><path d="M12 38h8V10h-8v28zm16-28v28h8V10h-8z"/></svg>
    </button>
    
    <button @click="nextTrack" class="media-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M12 36l17-12-17-12v24zm20-24v24h4V12h-4z"/></svg>
    </button>

    <div class="w-full">
      <span class="mr-2">{{ songProgress }}</span>
      <input type="range" min="0" :max="track.duration_ms / 100" v-model="progress" class="slider" @change=seek>
      <span class="ml-2">{{ songLength }}</span>
    </div>

    <div>
      <h4 class="text-xl mt-24">Users</h4>
      <p v-for="user in users" :key="user" class="text-base m-2">{{ user }}</p>
    </div>

    <div>
      <button @click="exit" class="btn">Leave room</button>
    </div>

  </div>
</template>

<script>
const axios = require('axios')
const io = require('socket.io-client')

export default {
  name: 'Player',
  data() {
    return {
      player: null,
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
      this.state.position = this.progress * 100
      this.state.timestamp = Date.now()
    },

    exit: function() {
      this.$store.commit('setRoom', null)
      this.socket.disconnect()
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
        this.socket.emit('info', [res.data.display_name, this.$store.state.room])
      }).catch(err => console.error(err.response))
    })

    this.socket.on('users', users => {
      this.users = users
    })

    this.socket.on('pause', () => {
      this.player.pause()
    })

    this.socket.on('resume', () => {
      this.player.resume()
    })

    this.socket.on('seek', position => {
      this.progress = position / 100
      this.player.seek(position)
    })

    this.socket.on('song', uri => {
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
    }, 100)

    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: 'Syncify Player',
        getOAuthToken: cb => { cb(token) }
      })

      this.player.addListener('initialization_error', ({ message }) => { console.error(message) })

      this.player.addListener('ready', ({ device_id }) => {
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
  },

  mounted: function() {
    const sdk = document.createElement('script');
    sdk.setAttribute(
      'src',
      'https://sdk.scdn.co/spotify-player.js'
    );
    sdk.async = true;
    document.head.appendChild(sdk);
  }
}

</script>
