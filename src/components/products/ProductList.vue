<template>
  <div v-if="products.length" class="row q-col-gutter-md">
    <div
      v-for="product in products"
      :key="product.id ?? product.productId"
      class="col-12 col-sm-6 col-lg-4"
    >
      <ProductItem :product="product" @add-to-cart="emit('add-to-cart', $event)" />
    </div>
  </div>
  <q-banner v-else class="bg-grey-2 text-grey-8">
    No hay productos que coincidan con los filtros seleccionados.
  </q-banner>
</template>

<script setup>
import ProductItem from './ProductItem.vue'

defineProps({
  products: { type: Array, required: true },
})

const emit = defineEmits(['add-to-cart'])
</script>
