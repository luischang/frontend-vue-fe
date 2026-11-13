<template>
  <q-page class="q-pa-md q-pa-lg-xl">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4">Productos</div>
        <div class="text-subtitle1 text-grey-7">Encuentra tu próximo producto favorito</div>
      </div>
      <q-btn
        color="primary"
        icon="shopping_cart"
        :label="`Carrito (${store.cartCount})`"
        @click="cartOpen = true"
      />
    </div>

    <div v-if="store.categoryErrorMessage" class="q-mb-md">
      <q-banner class="bg-red-1 text-negative" rounded>
        {{ store.categoryErrorMessage }}
      </q-banner>
      <q-btn
        class="q-mt-sm"
        flat
        color="primary"
        label="Reintentar categorías"
        @click="store.fetchCategories"
      />
    </div>

    <ProductFilter
      v-model="filters"
      :categories="categories"
      :min-price="priceBounds.min"
      :max-price="priceBounds.max"
      class="q-mb-lg"
    />

    <div v-if="store.errorMessage" class="q-mb-md">
      <q-banner class="bg-red-1 text-negative" rounded>{{ store.errorMessage }}</q-banner>
      <q-btn class="q-mt-sm" flat color="primary" label="Reintentar" @click="store.fetchProducts" />
    </div>
    <div v-else-if="store.loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="42px" />
    </div>
    <ProductList v-else :products="filteredProducts" @add-to-cart="store.addToCart" />

    <q-dialog v-model="cartOpen">
      <q-card class="cart-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6">Carrito de compras</div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" aria-label="Cerrar carrito" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="store.cart.length" class="cart-items">
          <div
            v-for="item in store.cart"
            :key="item.id ?? item.productId"
            class="row items-center q-py-sm"
          >
            <div class="col">
              <div>{{ item.description || item.name || 'Producto' }}</div>
              <div class="text-caption text-grey-7">{{ formatPrice(item.price) }} c/u</div>
            </div>
            <div class="row items-center q-mr-sm">
              <q-btn
                flat
                round
                dense
                icon="remove"
                aria-label="Disminuir cantidad"
                @click="store.decrementCartItem(item.id ?? item.productId)"
              />
              <span class="q-px-sm" aria-live="polite">{{ item.quantity }}</span>
              <q-btn
                flat
                round
                dense
                icon="add"
                aria-label="Aumentar cantidad"
                @click="store.incrementCartItem(item.id ?? item.productId)"
              />
            </div>
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              aria-label="Eliminar producto"
              @click="store.removeFromCart(item.id ?? item.productId)"
            />
          </div>
        </q-card-section>
        <q-card-section v-else class="text-grey-7">El carrito está vacío.</q-card-section>

        <q-separator />

        <q-card-section v-if="store.orderErrorMessage">
          <q-banner class="bg-red-1 text-negative" rounded>
            {{ store.orderErrorMessage }}
          </q-banner>
        </q-card-section>
        <q-card-section v-if="store.orderSuccessMessage">
          <q-banner class="bg-green-1 text-positive" rounded>
            {{ store.orderSuccessMessage }}
          </q-banner>
        </q-card-section>

        <q-card-section v-if="store.cart.length" class="q-pb-none">
          <div class="row justify-between">
            <span>Subtotal:</span>
            <span>{{ formatPrice(store.cartSubtotal) }}</span>
          </div>
          <div class="row justify-between">
            <span>IGV (18%):</span>
            <span>{{ formatPrice(store.cartTax) }}</span>
          </div>
          <div class="row justify-between text-subtitle1 text-weight-medium q-mt-sm">
            <span>Total:</span>
            <span>{{ formatPrice(store.cartTotal) }}</span>
          </div>
        </q-card-section>

        <q-card-actions align="between">
          <q-btn v-close-popup flat label="Seguir comprando" />
          <q-btn
            color="primary"
            label="Crear orden"
            :loading="store.orderLoading"
            :disable="!store.cart.length || store.orderLoading"
            @click="store.createOrder"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useProductsStore } from '@/stores/products-store'
import ProductFilter from '@/components/products/ProductFilter.vue'
import ProductList from '@/components/products/ProductList.vue'

const store = useProductsStore()
const cartOpen = ref(false)
const filters = ref({ categoryId: null, minPrice: null, maxPrice: null })

const categories = computed(() => {
  return store.categories
    .filter((category) => category.description)
    .map((category) => ({ label: category.description, value: category.id }))
})

const priceBounds = computed(() => {
  const prices = store.products.map((product) => Number(product.price)).filter(Number.isFinite)
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 }
})

const filteredProducts = computed(() =>
  store.products.filter((product) => {
    const price = Number(product.price || 0)

    return (
      (filters.value.categoryId === null || product.category?.id === filters.value.categoryId) &&
      (filters.value.minPrice === null || price >= filters.value.minPrice) &&
      (filters.value.maxPrice === null || price <= filters.value.maxPrice)
    )
  }),
)

function formatPrice(value) {
  return new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' }).format(
    Number(value || 0),
  )
}

onMounted(() => {
  store.fetchCategories()
  store.fetchProducts()
})
</script>

<style scoped>
.cart-dialog {
  width: 100%;
  max-width: 480px;
}

.cart-items {
  max-height: 55vh;
  overflow: auto;
}
</style>
