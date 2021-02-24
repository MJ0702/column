<template>
  <div class="file-upload">
    <div class="file-upload-container" @click.prevent="triggerUpload" v-bind="$attrs">
      <slot v-if="fileStatus === 'loading'" name="loading">
        <button class="btn btn-primary" disabled>正在上传</button>
      </slot>
      <slot v-else-if="fileStatus === 'uploaded'" name="uploaded" :uploadedData="uploadedData">
        <button class="btn btn-primary" disabled>上传成功</button>
      </slot>
      <slot v-else name="default">
        <button class="btn btn-primary">上传图片</button>
      </slot>
    </div>
    <input
      type="file"
      class="file-input d-none"
      ref="fileInput"
      @change="handleFileChange"
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'
import axios from 'axios'
// 上传状态类型
type UploadStatus = 'default' | 'loading' | 'uploaded' | 'error'
// 检查文件方法类型
type CheckFunction = (file: File) => boolean;
export default defineComponent({
  props: {
    // 上传地址
    action: {
      type: String,
      required: true
    },
    // 检查文件类型方法
    beforeUpload: {
      type: Function as PropType<CheckFunction>
    },
    // 编辑时图片获取
    uploaded: {
      type: Object
    }
  },
  inheritAttrs: false,
  emits: ['file-uploaded', 'file-uploaded-error'],
  setup (props, context) {
    console.log(props.uploaded)
    const fileInput = ref<null | HTMLInputElement>(null)
    const fileStatus = ref<UploadStatus>(props.uploaded ? 'uploaded' : 'default')
    const uploadedData = ref(props.uploaded)
    // 监听编辑时父组件传过来的图片数据
    /** 注意: watch 第一个参数应为响应式对象，
     *  props.uploaded为普通的object
     *  故使用() => {} 返回值
     * */
    watch(() => props.uploaded, (newValue) => {
      if (newValue) {
        // 更新状态
        fileStatus.value = 'uploaded'
        uploadedData.value = newValue
      }
    })
    // 将 input 的点击事件绑定在 button 上
    const triggerUpload = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }
    // change 时触发的事件
    const handleFileChange = (e: Event) => {
      // 获取选中文件
      const currentTarget = e.target as HTMLInputElement
      // 改变上传状态
      if (currentTarget.files) {
        // 将 currentTarget.files 转换为数组
        const files = Array.from(currentTarget.files)
        console.log('file', files)
        // 检查文件类型
        if (props.beforeUpload) {
          const result = props.beforeUpload(files[0])
          if (!result) {
            return
          }
        }
        fileStatus.value = 'loading'
        // 创建 formData
        const formData = new FormData()
        // 像formData 中添加上传文件数据 (上传一个文件)
        formData.append('files', files[0])
        // 发送异步请求
        axios.post(props.action, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(res => {
          fileStatus.value = 'uploaded'
          uploadedData.value = res.data
          context.emit('file-uploaded', res.data)
        }).catch(error => {
          fileStatus.value = 'error'
          context.emit('file-uploaded-error', { error })
        }).finally(() => {
          // 将 input 框清空
          if (fileInput.value) {
            fileInput.value.value = ''
          }
        })
      }
    }
    return {
      fileInput,
      triggerUpload,
      fileStatus,
      handleFileChange,
      uploadedData
    }
  }
})
</script>

<style>

</style>
