import { createApp } from 'vue'
import axios from 'axios'
import router from './router'
import store from './store'
import App from './App.vue'

// 配置基础请求网址路径
axios.defaults.baseURL = 'http://apis.imooc.com/api/'
// 配置公共请求参数 （项目接口码）

axios.interceptors.request.use(config => {
  config.params = { ...config.params, icode: '459206B8136665CC' }
  if (config.data instanceof FormData) {
    config.data.append('icode', '459206B8136665CC')
  } else {
    config.data = { ...config.data, icode: '459206B8136665CC' }
  }
  // 显示加载中
  store.commit('setLoading', true)
  store.commit('setError', { status: false, message: '' })
  return config
})
axios.interceptors.response.use(config => {
  // 关闭加载中
  store.commit('setLoading', false)
  return config
}, e => {
  const { error } = e.response.data
  store.commit('setError', { status: true, message: error })
  store.commit('setLoading', false)
  return Promise.reject(error)
})
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
