<template>
  <q-page class="flex flex-center">
    <div class="column items-center">
      <q-btn class="q-mt-md" color="primary" to="/second" label="Go to Second Page" no-caps />
      <TestComponent />
      <LoginForm />
    </div>
  </q-page>
</template>

<script setup>
import TestComponent from '../test.vue'
import LoginForm from '../../components/auth/LoginForm.vue'
//
</script>
