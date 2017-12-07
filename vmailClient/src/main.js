import Vue from 'vue'
import App from './App'
import router from './router'
import {store} from './store'
import VModal from 'vue-js-modal'
import iView from 'iview'
// import enLocale from 'iview/src/locale/lang/en-US'
import locale from 'iview/dist/locale/en-US'
import 'iview/dist/styles/iview.css'
var VueCookie = require('vue-cookie')

Vue.use(VModal, { dialog: true })
Vue.use(iView,{locale})
Vue.config.productionTip = false
Vue.use(VueCookie)


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  store
})
