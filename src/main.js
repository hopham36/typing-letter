import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'
import { store } from './store'
import DateFilter from './filters/date'
import * as firebase from 'firebase'
import alertCmp from './components/Shared/Alert.vue'
import dialogCmp from './components/Shared/Dialog.vue'

Vue.use(Vuetify)
Vue.config.productionTip = false
Vue.filter('f-date', DateFilter)
Vue.component('c-alert', alertCmp)
Vue.component('c-dialog', dialogCmp)
Vue.prototype.$firebase = firebase
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
  created () {
    firebase.initializeApp({
      apiKey: 'AIzaSyDIn3B4FCA-mqi--DS_jhboRQZDyiz6Cl0',
      authDomain: 'fir-meetup-d2e65.firebaseapp.com',
      databaseURL: 'https://fir-meetup-d2e65.firebaseio.com',
      projectId: 'fir-meetup-d2e65',
      storageBucket: ''
    })
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$store.dispatch('autoSignIn', user)
      }
    })
  }
})
