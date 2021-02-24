<template>
  <div class="validate-input-container pb-3 row">
    <validate-form @form-submit="onFormSubmit" class="col-lg-4 col-md-8 mx-auto">
      <div class="mb-3">
        <label class="form-label">邮箱地址</label>
        <validate-input
          :rules="emailRules"
          v-model="emailVal"
          placeholder="请输入邮箱地址"
          type="text"
        >
        </validate-input>
      </div>
      <div class="mb-3">
        <label class="form-label">密码</label>
        <validate-input
          :rules="pwdRules"
          v-model="pwdlVal"
          type="password"
          placeholder="请输入密码"
        >
        </validate-input>
      </div>
      <template v-slot:submit>
        <span class="btn btn-primary">登录</span>
      </template>
    </validate-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import ValidateInput, { RulesProp } from '../components/ValidateInput.vue'
import ValidateForm from '../components/ValidateForm.vue'
// 导入 message提示函数
import createMessage from '../components/createMessage'
export default defineComponent({
  name: 'Login',
  components: {
    ValidateInput,
    ValidateForm
  },
  setup () {
    const emailVal = ref('')
    const pwdlVal = ref('')
    const router = useRouter()
    const store = useStore()
    // 邮箱
    const emailRules: RulesProp = [
      { type: 'required', message: '电子邮箱地址不能为空' },
      { type: 'email', message: '请输入正确的电子邮箱格式' }
    ]
    // 密码
    const pwdRules: RulesProp = [
      { type: 'required', message: '密码不能为空' },
      { type: 'range', message: '密码长度至少为6个字符' }
    ]
    // 提交表单
    const onFormSubmit = (result: boolean) => {
      if (result) {
        const payload = {
          email: emailVal.value,
          password: pwdlVal.value
        }
        store.dispatch('loginAndFetch', payload).then(res => {
          console.log(res)
          createMessage('登录成功 2秒后跳转首页', 'success')
          setTimeout(() => {
            // 跳转首页
            router.push('/')
          }, 2000)
        }).catch(e => {
          console.log(e)
        })
      }
    }
    return {
      emailRules,
      pwdRules,
      emailVal,
      pwdlVal,
      onFormSubmit
    }
  }
})
</script>

<style scoped>
  .validate-input-container{
    margin-bottom: 20px;
  }
</style>
