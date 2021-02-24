<template>
  <div class="create-post-page">
    <uploader
      action="/upload"
      :beforeUpload="uploadCheck"
      class="d-flex justify-content-center align-items-center bg-light text-secondary w-100 my-4"
      @file-uploaded="handleFileUploaded"
      :uploaded="uploadedData"
    >
      <h2>点击上传头图</h2>
      <template #loading>
        <div class="d-flex">
          <div class="spinner-border text-secondary" role="status">
            <span class="sr-only"></span>
          </div>
          <h2>正在上传</h2>
        </div>
      </template>
      <template #uploaded="dataProps">
        <img :src="dataProps.uploadedData.data.url" />
      </template>
    </uploader>
    <validate-form @form-submit="onFormSubmit">
      <div class="mb-3">
        <label class="form-label">文章标题</label>
        <validate-input
          type="text"
          :rules="titleRules"
          v-model="titleVal"
          placeholder="请输入文章标题"
        >
        </validate-input>
      </div>
      <div class="mb-3">
        <label class="form-label">文章详情</label>
        <validate-input
          rows="10"
          type="text"
          tag="textarea"
          :rules="contentRules"
          v-model="contentVal"
          placeholder="请输入文章详情"
        >
        </validate-input>
      </div>
      <template v-slot:submit>
        <span class="btn btn-primary">{{isEditMode ? '更新文章' : '创建文章'}}</span>
      </template>
    </validate-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { GlobalDataProps, PostProps, ResponseType, ImageProps } from '../store'
import Uploader from '../components/Uploader.vue'
import ValidateInput, { RulesProp } from '../components/ValidateInput.vue'
import ValidateForm from '../components/ValidateForm.vue'
import createMessage from '../components/createMessage'
import { beforeUploadCheck } from '../helper'
export default defineComponent({
  name: 'Creat',
  components: {
    Uploader,
    ValidateForm,
    ValidateInput
  },
  setup () {
    const uploadedData = ref()
    const titleVal = ref('')
    const contentVal = ref('')
    const router = useRouter()
    const route = useRoute()
    // 判断是否是编辑模式
    const isEditMode = !!route.query.id
    let imageId = ''
    const store = useStore<GlobalDataProps>()
    // 文章标题验证规则
    const titleRules: RulesProp = [
      { type: 'required', message: '文章标题不能为空' }
    ]
    // 文章内容验证规则
    const contentRules: RulesProp = [
      { type: 'required', message: '文章内容不能为空' },
      { type: 'min', message: '文章内容至少为10个字符' },
      { type: 'max', message: '文章内容最多为150个字符' }
    ]
    onMounted(() => {
      // 编辑模式获取文章内容
      if (isEditMode) {
        store.dispatch('fetchPost', route.query.id).then((rawData: ResponseType<PostProps>) => {
          const currentPost = rawData.data
          console.log(currentPost)
          if (currentPost.image) {
            uploadedData.value = { data: currentPost.image }
          }
          titleVal.value = currentPost.title
          contentVal.value = currentPost.content || ''
        })
      }
    })
    // 上传成功后提示并获取图片id
    const handleFileUploaded = (rawData: ResponseType<ImageProps>) => {
      if (rawData.data._id) {
        imageId = rawData.data._id
      }
      createMessage(`上传图片ID ${rawData.data._id}`, 'success')
    }
    // 提交表单
    const onFormSubmit = (result: boolean) => {
      if (result) {
        const { column, _id } = store.state.user
        if (column) {
          // 获取创建文章内容
          const newPost: PostProps = {
            title: titleVal.value,
            content: contentVal.value,
            column,
            author: _id
          }
          if (imageId) {
            newPost.image = imageId
          }
          const actionName = isEditMode ? 'updatePost' : 'createPost'
          const sendData = isEditMode ? {
            id: route.query.id,
            payload: newPost
          } : newPost
          const messageTips = isEditMode ? '更新成功，2秒后跳转到文章' : '发表成功，2秒后跳转到文章'
          store.dispatch(actionName, sendData).then(() => {
            createMessage(messageTips, 'success', 2000)
            setTimeout(() => {
              router.push({ name: 'column', params: { id: column } })
            }, 2000)
          })
        }
      }
    }
    // 检查上传文件类型大小
    const uploadCheck = (file: File) => {
      const result = beforeUploadCheck(file, { format: ['image/jpeg', 'image/png'], size: 1 })
      const { passed, error } = result
      if (error === 'format') {
        createMessage('上传图片只能是JPG/PNG格式!', 'error')
      }
      if (error === 'size') {
        createMessage('上传图片大小不能超过 1Mb', 'error')
      }
      return passed
    }
    return {
      titleVal,
      contentVal,
      titleRules,
      contentRules,
      onFormSubmit,
      uploadCheck,
      imageId,
      handleFileUploaded,
      uploadedData,
      isEditMode
    }
  }
})
</script>

<style>
  .create-post-page{
    margin-bottom: 20px;
  }
  .create-post-page .file-upload-container{
    height: 200px;
    cursor: pointer;
  }
  .create-post-page .file-upload-container img{
    width: 100%;
    height: 100%;
    /* object-fit 属性指定可替换元素的内容应该如何适应到其使用的高度和宽度确定的框 */
    object-fit: cover;
  }
</style>
