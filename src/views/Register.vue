<template>
  <div class="validate-input-container pb-3 row">
    <validate-form @form-submit="onFormSubmit" class="col-lg-4 col-md-8 mx-auto">
      <div class="mb-3">
        <label class="form-label">邮箱地址</label>
        <validate-input
          :rules="emailRules"
          v-model="formData.email"
          placeholder="请输入邮箱地址"
          type="text"
        >
        </validate-input>
      </div>
      <div class="mb-3">
        <label class="form-label">昵称</label>
        <validate-input
          :rules="nickNameRules"
          v-model="formData.nickName"
          placeholder="请输入昵称"
          type="text"
        >
        </validate-input>
      </div>
      <div class="mb-3">
        <label class="form-label">密码</label>
        <validate-input
          :rules="pwdRules"
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
        >
        </validate-input>
      </div>
      <div class="mb-3">
        <label class="form-label">重复密码</label>
        <validate-input
          :rules="repeatpwdRules"
          v-model="formData.repeatPassword"
          type="password"
          placeholder="请输入重复密码"
        >
        </validate-input>
      </div>
      <template v-slot:submit>
        <span class="btn btn-primary">注册</span>
      </template>
    </validate-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { useRouter } from 'vue-router'
import ValidateInput, { RulesProp } from '../components/ValidateInput.vue'
import ValidateForm from '../components/ValidateForm.vue'
// 导入 message提示函数
import createMessage from '../components/createMessage'
import axios from 'axios'
export default defineComponent({
  name: 'Register',
  components: {
    ValidateInput,
    ValidateForm
  },
  setup () {
    const formData = reactive({
      email: '',
      nickName: '',
      password: '',
      repeatPassword: ''
    })
    const router = useRouter()
    // 邮箱
    const emailRules: RulesProp = [
      { type: 'required', message: '电子邮箱地址不能为空' },
      { type: 'email', message: '请输入正确的电子邮箱格式' }
    ]
    // 昵称
    const nickNameRules: RulesProp = [
      { type: 'required', message: '昵称不能为空' },
      { type: 'range', message: '昵称长度至少为6个字符' }
    ]
    // 密码
    const pwdRules: RulesProp = [
      { type: 'required', message: '密码不能为空' },
      { type: 'range', message: '密码长度至少为6个字符' }
    ]
    // 重复密码
    const repeatpwdRules: RulesProp = [
      { type: 'required', message: '密码不能为空' },
      {
        type: 'custom',
        validator: () => {
          return formData.password === formData.repeatPassword
        },
        message: '密码不相同'
      }
    ]
    // 注册
    const onFormSubmit = async (result: boolean) => {
      if (result) {
        // 注册数据
        const payload = {
          email: formData.email,
          nickName: formData.nickName,
          password: formData.password
        }
        axios.post('/users/', payload).then(data => {
          createMessage('注册成功 正在跳转登录页面', 'success')
          console.log(data)
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }).catch(e => {
          console.log(e)
        })
      }
    }
    return {
      emailRules,
      nickNameRules,
      pwdRules,
      repeatpwdRules,
      onFormSubmit,
      formData
    }
  }
})
</script>

<style>

</style>
