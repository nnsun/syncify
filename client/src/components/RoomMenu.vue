<template>
  <div>
    <button @click="mode = mode == 'create' ? null : 'create'">Create a room</button>
    <button @click="mode = mode == 'join' ? null : 'join'">Join a room</button>

    <div>
      <form v-if="mode">
        <div>
          <label>Name
            <input type="text" v-model="room" required autocomplete="off">
          </label>
        </div>
        <div>
          <label>Password
            <input type="password" v-model="password" required autocomplete="off">
          </label>
        </div>
        <input type="submit" @click.prevent="submit" value="Submit">
      </form>
    </div>
  </div>
</template>

<script>
const axios = require('axios')

export default {
  name: 'RoomMenu',
  data() {
    return {
      mode: null,
      room: null,
      password: null,
    }
  },

  methods: {
    submit: function() {
      if (this.room && this.password) {
        const serverAddr = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_SERVER_ADDR : 'http://localhost:3000'

        let data = {
          room: this.room,
          password: this.password
        }
        if (this.mode === 'create') {
          let endpoint = serverAddr + '/create'
          axios.post(endpoint, data).then(() => {
            this.$store.commit('setRoom', this.room)
          }).catch(err => console.error(err))
        }
        else {
          let endpoint = serverAddr + '/join'
          axios.post(endpoint, data).then(() => {
            this.$store.commit('setRoom', this.room)
          }).catch()
        }
      }
    }
  }
}

</script>