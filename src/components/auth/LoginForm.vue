<template>
  <div class="q-pa-md" style="max-width: 400px">
    <h3>Login</h3>
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input
        filled
        v-model="email"
        label="Your email *"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />

      <q-input filled type="password" v-model="password" label="Your password *" />

      <div>
        <q-btn @click="signin" label="Send" type="button" color="primary" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const email = ref(null)
const password = ref(null)

function signin() {
  let url = 'http://localhost:5166/api/user/signin'
  let data = {
    email: email.value,
    password: password.value,
  }
  console.log(data)
  axios
    .post(url, data)
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.log(error)
    })
}

function onReset() {
  email.value = null
  password.value = null
}
</script>
