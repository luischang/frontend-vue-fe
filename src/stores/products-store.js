import { defineStore } from 'pinia'
import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5166'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [],
    cart: [],
    loading: false,
    errorMessage: '',
    categoryErrorMessage: '',
    orderLoading: false,
    orderErrorMessage: '',
    orderSuccessMessage: '',
  }),
  getters: {
    cartCount: (state) => state.cart.reduce((count, item) => count + item.quantity, 0),
    cartSubtotal: (state) =>
      Math.round(
        (state.cart.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0) +
          Number.EPSILON) *
          100,
      ) / 100,
    cartTax() {
      return Math.round((this.cartSubtotal * 0.18 + Number.EPSILON) * 100) / 100
    },
    cartTotal() {
      return Math.round((this.cartSubtotal + this.cartTax + Number.EPSILON) * 100) / 100
    },
  },
  actions: {
    async fetchProducts() {
      this.loading = true
      this.errorMessage = ''

      try {
        const response = await axios.get(`${apiBaseUrl}/api/Product`, {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('token')}`,
          },
        })
        const data = response.data
        const products = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.$values)
                ? data.$values
                : null
        if (!Array.isArray(products)) {
          throw new Error('La respuesta del servidor no contiene una lista de productos.')
        }
        this.products = products
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || error.message || 'No se pudieron cargar los productos.'
      } finally {
        this.loading = false
      }
    },
    async fetchCategories() {
      this.categoryErrorMessage = ''

      try {
        const response = await axios.get(`${apiBaseUrl}/api/Category`)
        if (!Array.isArray(response.data)) {
          throw new Error('La respuesta del servidor no contiene una lista de categorías.')
        }
        this.categories = response.data
      } catch (error) {
        this.categoryErrorMessage =
          error.response?.data?.message || error.message || 'No se pudieron cargar las categorías.'
      }
    },
    addToCart(product) {
      const productId = product.id ?? product.productId
      const existingItem = this.cart.find((item) => (item.id ?? item.productId) === productId)

      this.orderErrorMessage = ''
      this.orderSuccessMessage = ''

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        this.cart.push({ ...product, quantity: 1 })
      }
    },
    incrementCartItem(productId) {
      const item = this.cart.find((cartItem) => (cartItem.id ?? cartItem.productId) === productId)
      if (item) item.quantity += 1
    },
    decrementCartItem(productId) {
      const item = this.cart.find((cartItem) => (cartItem.id ?? cartItem.productId) === productId)
      if (item) item.quantity = Math.max(1, item.quantity - 1)
    },
    removeFromCart(productId) {
      this.cart = this.cart.filter((item) => (item.id ?? item.productId) !== productId)
    },
    async createOrder() {
      this.orderLoading = true
      this.orderErrorMessage = ''
      this.orderSuccessMessage = ''

      try {
        const token = window.localStorage.getItem('token')
        const storedUserId =
          window.localStorage.getItem('userId') ?? window.localStorage.getItem('UserId')
        const userId = getUserId(storedUserId, token)
        if (!Number.isInteger(userId)) {
          throw new Error('No se pudo identificar al usuario para crear la orden.')
        }

        const details = this.cart.map((item) => {
          const productId = Number(item.id ?? item.productId)
          const price = Number(item.price)
          if (!Number.isInteger(productId) || !Number.isFinite(price)) {
            throw new Error('Hay un producto con datos inválidos en el carrito.')
          }

          return { productId, quantity: item.quantity, price }
        })

        if (!details.length) {
          throw new Error('Agrega productos al carrito antes de crear la orden.')
        }

        await axios.post(
          `${apiBaseUrl}/api/order`,
          {
            userId,
            totalAmount: this.cartTotal,
            details,
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        )

        this.cart = []
        this.orderSuccessMessage = 'La orden se creó correctamente.'
      } catch (error) {
        this.orderErrorMessage =
          error.response?.data?.message || error.message || 'No se pudo crear la orden.'
      } finally {
        this.orderLoading = false
      }
    },
  },
})

function getUserId(storedUserId, token) {
  const parsedUserId = Number(storedUserId)
  if (storedUserId && Number.isInteger(parsedUserId)) return parsedUserId
  if (!token) return null

  try {
    const encodedPayload = token.split('.')[1]
    if (!encodedPayload) return null

    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')), (char) =>
          char.charCodeAt(0),
        ),
      ),
    )
    const userIdClaims = [
      payload.userId,
      payload.UserId,
      payload.userID,
      payload.UserID,
      payload.user_id,
      payload.id,
      payload.Id,
      payload.ID,
      payload.nameIdentifier,
      payload.NameIdentifier,
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      payload.nameid,
      payload.NameId,
      payload.sub,
    ]

    return (
      userIdClaims
        .filter((userId) => userId !== undefined && userId !== null && userId !== '')
        .map(Number)
        .find(Number.isInteger) ?? null
    )
  } catch {
    return null
  }
}
