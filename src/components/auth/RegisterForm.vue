<template>
  <div class="q-pa-md" style="max-width: 400px">
    <h3>Register</h3>
    <q-form @submit.prevent="register" class="q-gutter-md">
      <q-input
        v-model="firstName"
        filled
        label="First name *"
        :rules="[(value) => !!value || 'First name is required']"
      />
      <q-input
        v-model="lastName"
        filled
        label="Last name *"
        :rules="[(value) => !!value || 'Last name is required']"
      />
      <q-input
        v-model="email"
        filled
        type="email"
        label="Email *"
        :rules="[(value) => !!value || 'Email is required']"
      />
      <q-input
        v-model="password"
        filled
        type="password"
        label="Password *"
        :rules="[(value) => !!value || 'Password is required']"
      />

      <q-banner v-if="errorMessage" class="bg-red-1 text-negative">
        {{ errorMessage }}
      </q-banner>

      <q-btn label="Create account" type="submit" color="primary" :loading="loading" />
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function register() {
  loading.value = true
  errorMessage.value = ''

  try {
    await axios.post('http://localhost:5166/api/user/signup', {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
    })
    await router.push('/login')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
