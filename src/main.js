import Vue from 'vue'
import App from './App'
// import vuetify from './plugins/vuetify';
import { firestorePlugin } from 'vuefire'
import VCalendar from 'v-calendar';
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'
import { PulseLoader } from 'vue-spinner/dist/vue-spinner.min.js'

Vue.use(firestorePlugin)
Vue.component('pulse-loader', require('vue-spinner/src/PulseLoader.vue'));
Vue.use(VCalendar, {
  componentPrefix: 'v',  // Use <vc-calendar /> instead of <v-calendar />
  // ...other defaults
});

new Vue({
  el: '#app',
  render: h => h(App)
})
