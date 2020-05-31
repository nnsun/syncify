import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    room: null,
    accessToken: ''
  },
  mutations: {
    setRoom: (state, room) => state.room = room,
    setAccessToken: (state, accessToken) => state.accessToken = accessToken
  }
})