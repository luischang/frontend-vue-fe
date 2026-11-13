<template>
  <q-card class="product-card full-height">
    <q-img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="product.description || product.name || 'Producto'"
      height="190px"
    />
    <div v-else class="product-placeholder flex flex-center">
      <q-icon name="inventory_2" size="56px" color="grey-6" />
    </div>

    <q-card-section>
      <div class="text-h6">{{ product.description || product.name || 'Producto' }}</div>
      <div class="text-caption text-grey-7">{{ categoryName }}</div>
      <div class="text-caption text-grey-7 q-mt-sm">Stock: {{ product.stock ?? 0 }}</div>
      <div class="text-h6 text-primary q-mt-md">{{ formattedPrice }}</div>
    </q-card-section>

    <q-card-actions>
      <q-btn
        color="primary"
        icon="add_shopping_cart"
        label="Agregar al carrito"
        class="full-width"
        @click="emit('add-to-cart', product)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: { type: Object, required: true },
})

const emit = defineEmits(['add-to-cart'])
const imageUrl = computed(
  () => props.product.imageUrl || props.product.image || props.product.photo,
)
const categoryName = computed(() => {
  const category = props.product.category
  return typeof category === 'object'
    ? category?.description || category?.name || 'Sin categoría'
    : category || props.product.categoryName || 'Sin categoría'
})
const formattedPrice = computed(() =>
  new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' }).format(
    Number(props.product.price || 0),
  ),
)
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
}

.product-card :deep(.q-card__section) {
  flex: 1;
}

.product-placeholder {
  height: 190px;
  background: #f3f4f6;
}
</style>
