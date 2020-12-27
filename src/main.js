import Vue from 'vue'
import ElementUI from 'element-ui'
import App from './App.vue'
import router from './router'
import store from './store'
// import '@/custom-component' // 注册自定义组件

import '@/styles/reset.css'
import '@/styles/animate.css'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI, { size: 'small' })
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
