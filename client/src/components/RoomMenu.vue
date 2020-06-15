<template>
  <div>
    <div class="inline-block">
      <button @click="mode='create'" 
          class="btn btn-green" :class="{'btn-active': mode == 'create', 'btn-green-active': mode == 'create'}"
      >Create a room</button>
      <button @click="mode='join'" 
          class="btn btn-blue" :class="{'btn-active': mode == 'join', 'btn-blue-active': mode == 'join'}"
      >Join a room</button>
    </div>
    

    <div v-if="mode">
      <form class="">
        <div>
          <input type="text" v-model="room" placeholder="Room name" autocomplete="off"
              class="form"
          >
        </div>
        <div>
          <input type="password" v-model="password" placeholder="Password" autocomplete="off"
              class="form"
          >
        </div>
        <button @click.prevent="submit" :disabled="submitDisabled"
            class="btn bg-purple-500 text-white disabled:opacity-50"
        >Submit</button>
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

  computed: {
    submitDisabled: function() {
      return !(this.room && this.password)
    }
  },

  methods: {
    submit: function() {
      if (!this.submitDisabled) {
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