import { createStore, Commit } from 'vuex'
import axios, { AxiosRequestConfig } from 'axios'
import { arrToObj, objToArr } from './helper'

export interface ResponseType<P = {}> {
  code: number;
  msg: string;
  data: P;
}
export interface UserProps {
  isLogin: boolean;
  nickName?: string;
  _id?: string;
  column?: string;
  email?: string;
  avatar?: ImageProps;
  description?: string;
}
export interface ImageProps {
  _id?: string;
  url?: string;
  fitUrl?: string;
  createdAt?: string;
}
export interface ColumnProps {
  _id?: string;
  title: string;
  avatar?: ImageProps;
  description: string;
}
export interface PostProps {
  _id?: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: ImageProps | string;
  createdAt?: string;
  column: string;
  author?: string | UserProps;
  isHTML?: boolean;
}
interface ListProps<P>{
  [id: string]: P;
}
export interface GlobalErrorProps {
  status: boolean;
  message?: string;
}
export interface GlobalDataProps {
  error: GlobalErrorProps;
  token: string;
  loading: boolean;
  columns: { data: ListProps<ColumnProps>; currentPage: number; total: number };
  posts: { data: ListProps<PostProps>; loadedColumns: string[] };
  user: UserProps;
}
// 定义公共请求数据方法
const asyncAndCommit = async (url: string, mutationName: string,
  commit: Commit, config: AxiosRequestConfig = { method: 'get' }, extraData?: any) => {
  const { data } = await axios(url, config)
  if (extraData) {
    commit(mutationName, { data, extraData })
  } else {
    commit(mutationName, data)
  }
  return data
}
const store = createStore<GlobalDataProps>({
  state: {
    error: { status: false },
    token: localStorage.getItem('token') || '',
    loading: false,
    columns: { data: {}, currentPage: 0, total: 0 },
    posts: { data: {}, loadedColumns: [] },
    user: { isLogin: false }
  },
  /** 优化-1
   *  将array 转换为对象 可以避免循环取得数据
   *  可以直接通过对象属性为 id 所对应的值取得
   *  数据
   */
  mutations: {
    // 创建文章后加入到 posts 文章列表
    createPost (state, newPost) {
      state.posts.data[newPost._id] = newPost
    },
    // 拿到获得的专栏列表数据并与state关联
    fetchColumns (state, rawData) {
      const { data } = state.columns
      const { list, count, currentPage } = rawData.data
      state.columns = {
        data: { ...data, ...arrToObj(list) },
        total: count,
        currentPage: currentPage * 1
      }
    },
    // 拿到详情页所展示专栏的数据与state关联
    fetchColumn (state, rawData) {
      state.columns.data[rawData.data._id] = rawData.data
    },
    // 拿到详情页所展示对应专栏下的文章列表数据与state关联
    fetchPosts (state, { data: rawData, extraData: columnId }) {
      state.posts.data = { ...state.posts.data, ...arrToObj(rawData.data.list) }
      state.posts.loadedColumns.push(columnId)
    },
    // 拿到文章详情数据与state关联
    fetchPost (state, rawData) {
      state.posts.data[rawData.data._id] = rawData.data
    },
    // 删除文章与state关联
    deletePost (state, { data }) {
      delete state.posts.data[data._id]
    },
    // 编辑文章与state关联
    updatePost (state, { data }) {
      state.posts.data[data._id] = data
    },
    // 加载效果
    setLoading (state, status) {
      state.loading = status
    },
    // 错误信息提示
    setError (state, e: GlobalErrorProps) {
      state.error = e
    },
    // 获取当前登录信息与state关联 改变 GlobalHeader 状态
    fetchCurrentUser (state, rawData) {
      state.user = { isLogin: true, ...rawData.data }
    },
    // 登录
    login (state, rawData) {
      const { token } = rawData.data
      state.token = token
      // 缓存 token
      localStorage.setItem('token', token)
      // 公共请求头中添加token来判断权限
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    },
    // 退出登录
    logout (state) {
      state.token = ''
      state.user.isLogin = false
      localStorage.removeItem('token')
      delete axios.defaults.headers.common.Authorization
    }
  },
  /** 优化2
   *  根据isLoaded判断首页专栏列表是否加载过
   *  如已加载，下次跳转首页则直接取缓存数据
   *  根据 loadedColumns[] 判断该专栏下文章
   *  是否加载过,已加载保存专栏id到 loadedColumns
   *  再次加载就直接读取缓存数据
   */
  actions: {
    // 异步获取专栏列表数据
    fetchColumns ({ state, commit }, params = {}) {
      const { currentPage = 1, pageSize = 6 } = params
      // 判断首页是否加载过专栏列表数据，加载过则不发送请求
      if (state.columns.currentPage < currentPage) {
        return asyncAndCommit(`/columns?currentPage=${currentPage}&pageSize=${pageSize}`, 'fetchColumns', commit)
      }
    },
    // 异步获取详情页所展示专栏的数据
    fetchColumn ({ state, commit }, cid) {
      // 判断详情页是否加载过专栏信息，加载过则不发送请求
      if (!state.columns.data[cid]) {
        return asyncAndCommit(`/columns/${cid}`, 'fetchColumn', commit)
      }
    },
    // 异步获取详情页所展示对应专栏下的文章列表数据
    fetchPosts ({ state, commit }, cid) {
      // 判断是否已经加载过该专栏，加载过则不发送请求
      if (!state.posts.loadedColumns.includes(cid)) {
        return asyncAndCommit(`/columns/${cid}/posts`, 'fetchPosts', commit, { method: 'get' }, cid)
      }
    },
    // 获取文章详情
    fetchPost ({ state, commit }, id) {
      // 判断是否已经加载过该专栏下的所有文章，加载过则不发送请求
      /** 由于 columnDetail 下请求所有的文章数据返回结构(精简)和
       *  postDetail 下请求的单个文章数据结构返回数据不一致(详尽)
       *  所以根据判断结果发送请求
       */
      const currentPost = state.posts.data[id]
      if (!currentPost || !currentPost.content) {
        return asyncAndCommit(`/posts/${id}`, 'fetchPost', commit)
      } else {
        return Promise.resolve({ data: currentPost })
      }
    },
    // 编辑文章详情
    updatePost ({ commit }, { id, payload }) {
      return asyncAndCommit(`/posts/${id}`, 'updatePost', commit, {
        method: 'patch',
        data: payload
      })
    },
    // 获取当前登录信息
    fetchCurrentUser ({ commit }) {
      return asyncAndCommit('/user/current', 'fetchCurrentUser', commit)
    },
    // 登录
    login ({ commit }, payload) {
      return asyncAndCommit('/user/login', 'login', commit, { method: 'post', data: payload })
    },
    // 创建文章
    createPost ({ commit }, payload) {
      return asyncAndCommit('/posts', 'createPost', commit, { method: 'post', data: payload })
    },
    // 删除文章
    deletePost ({ commit }, id) {
      return asyncAndCommit(`/posts/${id}`, 'deletePost', commit, { method: 'delete' })
    },
    // 组合登录和获取登录信息
    loginAndFetch ({ dispatch }, loginData) {
      return dispatch('login', loginData).then(() => {
        return dispatch('fetchCurrentUser')
      })
    }
  },
  getters: {
    // 首页专栏数据
    getColumns: (state) => {
      return objToArr(state.columns.data)
    },
    getColumnById: (state) => (id: string) => {
      console.log(state.columns.data[id])
      return state.columns.data[id]
    },
    // 根据当前专栏 id 获取当前专栏下所有文章数据
    getPostsByCid: (state) => (cid: string) => {
      return objToArr(state.posts.data).filter(post => post.column === cid)
    },
    // 根据当前文章 id 获取当前文章详情数据
    getCurrentPost: (state) => (id: string) => {
      return state.posts.data[id]
    }
  }
})

export default store
