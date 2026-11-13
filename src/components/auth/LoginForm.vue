<template>
  <div class="q-pa-md" style="max-width: 400px">
    <h3>Login</h3>
    <q-form @submit.prevent="signin" @reset="onReset" class="q-gutter-md">
      <q-input
        filled
        v-model="email"
        label="Your email *"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />

      <q-input filled type="password" v-model="password" label="Your password *" />

      <q-banner v-if="errorMessage" class="bg-red-1 text-negative">
        {{ errorMessage }}
      </q-banner>

      <div>
        <q-btn label="Send" type="submit" color="primary" :loading="loading" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5166'
const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function signin() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post(`${apiBaseUrl}/api/user/signin`, {
      email: email.value,
      password: password.value,
    })
    const token = response.data?.token || response.data?.accessToken || response.data?.jwt

    if (!token) {
      throw new Error('The sign-in response did not contain a JWT.')
    }

    window.localStorage.setItem('token', token)
    const userId = response.data?.userId ?? response.data?.user?.id ?? response.data?.id
    if (userId !== undefined && userId !== null) {
      window.localStorage.setItem('userId', String(userId))
    } else {
      window.localStorage.removeItem('userId')
    }
    await router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/')
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || error.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

function onReset() {
  email.value = ''
  password.value = ''
  errorMessage.value = ''
}
</script>
