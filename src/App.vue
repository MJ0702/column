<template>
  <div class="container">
    <global-header :user="user"></global-header>
    <loader v-if="isLoading" text="拼命加载中" background="rgba(0,0,0,0.8)"></loader>
    <router-view></router-view>
    <footer class="text-center py-4 text-secondary bg-light mt-6">
      <small>
        <ul class="list-inline mb-0">
          <li class="list-inline-item">© 2020 专栏</li>
          <li class="list-inline-item">文档</li>
          <li class="list-inline-item">联系</li>
          <li class="list-inline-item">更多</li>
        </ul>
      </small>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue'
// 导入 store
import { useStore } from 'vuex'
// 导入 bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
// 导入 navbar
import GlobalHeader from './components/GlobalHeader.vue'
// 导入 loading
import Loader from './components/Loader.vue'
// 导入 message提示函数
import createMessage from './components/createMessage'
import { GlobalDataProps } from './store'
export default defineComponent({
  name: 'App',
  components: {
    // ColumnList,
    GlobalHeader,
    Loader
  },
  setup () {
    const store = useStore<GlobalDataProps>()
    const currentUser = computed(() => store.state.user)
    // 加载中提示
    const isLoading = computed(() => store.state.loading)
    // 获取错误提示
    const error = computed(() => store.state.error)
    // 监听 error 的状态，并显示提示信息
    watch(() => error.value.status, () => {
      const { status, message } = error.value
      if (status && message) {
        createMessage(message, 'error')
      }
    })
    return {
      user: currentUser,
      isLoading,
      error
    }
  }
})
</script>

<style>
</style>
