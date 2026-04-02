<script setup>
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router';

const cartStore = useCartStore()

const router = useRouter();

const goBack = () => {
  router.back(); 
};

const subtotal = computed(() =>
  cartStore.cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
)

const shipping = computed(() => (subtotal.value > 1 ? 0 : 9.99))

const total = computed(() => subtotal.value + shipping.value)
</script>

<template>
  <div class="flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white font-sans">

    <!-- Header -->
    <div class="flex items-baseline justify-between px-6 py-5 border-b border-gray-100">
      <div class="flex items-center gap-3">
        <button 
          @click="goBack" 
          class="group flex items-center justify-center transition-colors hover:text-gray-900 text-gray-400"
          aria-label="Go back"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="1.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <span class="text-xs uppercase tracking-widest text-gray-400 font-medium">
          Shopping Cart
        </span>
      </div>
      <span class="text-xs text-gray-300">{{ cartStore.cart.length }} {{ cartStore.cart.length === 1 ? 'item' : 'items' }}</span>
    </div>

    <!-- Cart Items -->
    <div class="overflow-y-auto" style="max-height: 360px;">

      <!-- Populated State -->
      <ul v-if="cartStore.cart.length > 0">
        <li
          v-for="(item, index) in cartStore.cart"
          :key="item.id"
          class="flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0"
        >
          <!-- Thumbnail -->
          <img
            :src="item.image || '/placeholder.jpg'"
            :alt="item.title"
            class="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
          />

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-xs uppercase tracking-widest text-gray-300 mb-0.5">{{ item.category }}</p>
            <h3 class="text-sm font-medium text-gray-900 truncate mb-2">{{ item.title }}</h3>

            <div class="flex items-center justify-between">
              <!-- Quantity Controls -->
              <div class="flex items-center border border-gray-200 rounded-md overflow-hidden">
                <button
                  @click="cartStore.decreaseQty(item)"
                  class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors text-base leading-none"
                >−</button>
                <span class="text-xs font-medium text-gray-800 w-5 text-center">{{ item.quantity || 1 }}</span>
                <button
                  @click="cartStore.increaseQty(item)"
                  class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors text-base leading-none"
                >+</button>
              </div>

              <!-- Item Price -->
              <span class="text-sm font-medium text-gray-900">${{ (item.price * (item.quantity || 1)).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Remove Button -->
          <button
            @click="cartStore.removeItem(item)"
            class="self-start mt-0.5 text-gray-300 hover:text-gray-600 transition-colors text-lg leading-none"
          >×</button>
        </li>
      </ul>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-16 px-6 text-center">
        <p class="text-xs uppercase tracking-widest text-gray-300 mb-3">Your cart is empty</p>
        <p class="text-sm text-gray-400">Explore our collections to find something you love.</p>
      </div>

    </div>

    <!-- Summary & Actions -->
    <div v-if="cartStore.cart.length > 0" class="px-6 py-5 border-t border-gray-100">

      <div class="flex justify-between mb-2">
        <span class="text-sm text-gray-400">Subtotal</span>
        <span class="text-sm text-gray-800">${{ subtotal.toFixed(2) }}</span>
      </div>

      <div class="flex justify-between mb-4">
        <span class="text-sm text-gray-400">Shipping</span>
        <span class="text-sm text-gray-800">{{ shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}` }}</span>
      </div>

      <div class="flex justify-between pt-4 mb-5 border-t border-gray-100">
        <span class="text-sm font-medium text-gray-900">Total</span>
        <span class="text-sm font-medium text-gray-900">${{ total.toFixed(2) }}</span>
      </div>

      <!-- Checkout Button -->
      <button
        class="w-full py-3 mb-2.5 bg-gray-900 text-white text-xs uppercase tracking-widest font-medium rounded-md hover:bg-gray-700 transition-colors"
      >
        Proceed to Checkout
      </button>

      <!-- Clear All -->
      <button
        @click="cartStore.clearCart()"
        class="w-full py-2.5 bg-transparent text-gray-400 text-xs uppercase tracking-widest border border-gray-200 rounded-md hover:text-gray-700 hover:border-gray-400 transition-colors"
      >
        Clear All
      </button>

    </div>

  </div>
</template>