import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router.js'
import VueSocialSharing from 'vue-social-sharing'

Vue.use(VueSocialSharing);
Vue.config.productionTip = false

var eventHub = new Vue();
export default eventHub; 



new Vue({
	router,vuetify, 
  render: h => h(App)
}).$mount('#app')
