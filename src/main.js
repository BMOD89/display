import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import axios from 'axios'

// Import Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBars, faBullhorn, faClock, faCloudShowersHeavy, faCube, faCubes, faDesktop, faHome, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Import components
import ComponentList from '@/components/ComponentList'
import DisplayCreateForm from '@/components/DisplayCreateForm'
import DisplayEditForm from '@/components/DisplayEditForm'
import DisplayList from '@/components/DisplayList'
import Overview from '@/components/Overview'

// Configure Font Awesome
library.add(faBars, faBullhorn, faClock, faCloudShowersHeavy, faCube, faCubes, faDesktop, faHome, faSpinner, faTimes)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(Vuex)
Vue.use(VueRouter)

Vue.config.productionTip = false

// Set up the Vuex store
const store = new Vuex.Store({
  state: {
    displays: [],
    components: []
  },
  mutations: {
    appendDisplay (state, display) {
      state.displays.push(display)
    },
    setComponents (state, components) {
      state.components = components
    },
    setDisplays (state, displays) {
      state.displays = displays
    }
  },
  actions: {
    createDisplay (context, display) {
      return axios.post('/api/v1/displays', display)
        .then(response => {
          const newDisplay = response.data
          context.commit('appendDisplay', newDisplay)
          return newDisplay
        })
    },
    deleteDisplay (context, displayId) {
      return axios.delete('/api/v1/displays/' + displayId)
        .then(() => context.dispatch('updateTheDisplays'))
    },
    updateTheComponents (context) {
      return axios.get('/api/v1/components')
        .then(response => context.commit('setComponents', response.data))
    },
    updateTheDisplays (context) {
      return axios.get('/api/v1/displays')
        .then(response => context.commit('setDisplays', response.data))
    }
  }
})

// Set up the Vue Router
const routes = [
  { path: '/', component: Overview },
  { path: '/components', component: ComponentList },
  { path: '/displays', component: DisplayList },
  { path: '/displays/new', component: DisplayCreateForm },
  { path: '/displays/:id', component: DisplayEditForm, props: true }
]

const router = new VueRouter({
  routes: routes,
  linkActiveClass: 'w3-blue'
})

// Set up the Vue root instance
new Vue({
  store,
  render: h => h(App),
  router: router
}).$mount('#app')
