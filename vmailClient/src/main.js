// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import routes from './router'
import $ from "jquery"
import store from './store'
import { sync } from 'vuex-router-sync'

Vue.use(require('vue-moment'))

import tinymce from 'vue-tinymce-editor'
Vue.component('tinymce', tinymce) 

import FullCalendar from 'vue-full-calendar'
Vue.use(FullCalendar)

import Vuetify from 'vuetify'
import('../node_modules/vuetify/dist/vuetify.min.css')
Vue.use(Vuetify)

import vueRouter from 'vue-router'
Vue.use(vueRouter)

var VueCookie = require('vue-cookie')
Vue.use(VueCookie)


Vue.config.productionTip = false

var router = new vueRouter({
  routes: routes,
  mode: 'history',
  scrollBehavior: function (to, from, savedPosition) {
    return savedPosition || { x: 0, y: 0 }
  }
})

import psl from 'psl'
router.beforeEach((to, from, next) => {
  const token = router.app.$cookie.get('auth_token')
  if (to.matched.some(record => record.meta.requiresAuth) && (!token || token === 'null')) {
    next({
      path: '/login'
    })
  } else {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      store.dispatch('authenticate', token).then(response => {
      	store.commit('SET_USER', response)
        next()
      }).catch(error => {
        next({
          path: '/login'
        })
      })
    } else {
      store.dispatch('authenticate', token).then(response => {
        store.commit('SET_USER', response)
        next({
          path: '/user/maildashboard'
        })
      }).catch(error => {
        next()
      })
    }
  }
})

sync(store, router)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store: store,
  template: '<App/>',
  components: { App }
})
