<template>
  <h1>Bienvenido al Curso</h1>
  <button @click="increment">Cantidad de clicks: {{ count }}</button>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<style></style>
