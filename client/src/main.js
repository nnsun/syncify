import Vue from 'vue'
import VueRouter from 'vue-router'

import store from "./store"

import App from './App.vue'

import './assets/styles.css'

Vue.config.productionTip = false
Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      name: 'App',
      path: '/',
      component: App
    },
  ],
  base: process.env.NODE_ENV === 'production' ? '/syncify/' : '/'
})

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
