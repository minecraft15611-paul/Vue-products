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
  <div class="lg:hidden flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white font-sans">

    <!-- Header -->
    <div class="flex items-baseline justify-between px-6 py-5 border-b border-gray-100 ">
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
          Continue Shopping
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
            :src="item.img || '/placeholder.jpg'"
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

  
   <div class="hidden lg:block min-h-screen bg-[#f0ede4] font-sans">
 
    <!-- ───────────── NAVBAR ───────────── -->
    <nav class="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
      <!-- Left: search + count -->
<div class="hidden lg:flex items-center px-8 text-[10px] tracking-widest text-gray-400 uppercase ">
  <router-link title="Back to home" to="/" class=" hover:scale-125 transition-all duration-300 text-black ">
    ← Continue Shopping
  </router-link>
</div>
 
      <!-- Center: logo -->
      <span class="text-3xl tracking-[0.2em] text-gray-800 font-light  absolute left-1/2 -translate-x-1/2">LemonTree</span>
 
      <!-- Right: links + icons -->
      <div class="flex items-center gap-6 px-8 text-sm text-gray-700 space-x-3">
        
        <i class="fa-solid fa-magnifying-glass text-xl cursor-pointer transition duration-300 hover:scale-125"></i>
        <i class="fa-regular fa-user text-xl cursor-pointer transition duration-300 hover:scale-125"></i>
        <i class="fa-regular fa-heart text-xl cursor-pointer transition duration-300 hover:scale-125"></i>

      </div>
    </nav>
 
    <!-- ───────────── PAGE BODY ───────────── -->
    <div class="max-w-6xl mx-auto px-6 py-10">
 

 
      <h1 class="text-xl font-light tracking-widest mb-8">CART</h1>
      
 
      <!-- ── Populated State ── -->
      <div v-if="cartStore.cart.length > 0" class="flex gap-6 items-start">
 
        <!-- Cart Items List -->
        <div class="flex-1 bg-white rounded-xl overflow-hidden divide-y divide-gray-100 shadow-sm overflow-y-auto max-h-[70vh] hide-scrollbar scrollbar-gutter: stable scroll-smooth">
          <div
            v-for="item in cartStore.cart"
            :key="item.id"
            class="flex items-center gap-4 p-5"
          >
            <!-- Thumbnail -->
            <img
              :src="item.img || '/placeholder.jpg'"
              :alt="item.title"
              class="w-20 h-20 rounded-lg object-cover bg-gray-100 flex-shrink-0"
            />
 
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs uppercase tracking-widest text-gray-400 mb-0.5">{{ item.category }}</p>
                  <p class="font-medium text-gray-900 truncate">{{ item.title }}</p>
                </div>
 
                <!-- Remove button -->
                <button
                  @click="cartStore.removeItem(item)"
                  class="text-gray-300 hover:text-red-500 transition ml-4 flex-shrink-0 text-xl leading-none"
                >×</button>
              </div>
 
              <!-- Price + Qty -->
              <div class="flex items-center justify-between mt-3">
                <span class="font-semibold text-gray-900">
                  ${{ (item.price * (item.quantity || 1)).toFixed(2) }}
                </span>
 
                <div class="flex items-center gap-3 border border-gray-200 rounded-full px-3 py-1">
                  <button
                    @click="cartStore.decreaseQty(item)"
                    class="text-gray-500 hover:text-black transition text-lg leading-none"
                  >−</button>
                  <span class="text-sm w-4 text-center">{{ item.quantity || 1 }}</span>
                  <button
                    @click="cartStore.increaseQty(item)"
                    class="text-gray-500 hover:text-black transition text-lg leading-none"
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        <!-- Order Summary Sidebar -->
        <div class="w-80 flex-shrink-0 bg-white rounded-xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold mb-5">Order Summary</h2>
 
          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span class="text-gray-900 font-medium">${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span class="text-gray-900 font-medium">{{ shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}` }}</span>
            </div>
          </div>
 
          <div class="border-t border-gray-100 mt-4 pt-4 flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>${{ total.toFixed(2) }}</span>
          </div>
 
          <!-- Checkout -->
          <button class="mt-4 w-full bg-gray-900 text-white text-xs uppercase tracking-widest font-medium rounded-md py-3 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
            Proceed to Checkout
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
 
          <!-- Clear All -->
          <button
            @click="cartStore.clearCart()"
            class="mt-2.5 w-full py-2.5 bg-transparent text-gray-400 text-xs uppercase tracking-widest border border-gray-200 rounded-md hover:text-gray-700 hover:border-gray-400 transition-colors"
          >
            Clear All
          </button>
        </div>
 
      </div>
 
      <div v-else class="flex flex-col items-center justify-center py-8 bg-[#F9F8F6]">
        
        <div class="w-56 h-80 mb-8 overflow-hidden shadow-sm opacity-95 ">
          <img 
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop" 
            alt="Empty Cart" 
            class="w-full h-full object-cover border border-gray-50 grayscale-[20%] hover:scale-105  transition-transform duration-1000 "
          />
        </div>

        <h2 class="text-[10px] uppercase tracking-[0.6em] text-gray-900 font-light mb-4">
          Your cart is empty
        </h2>
        
        <p class="text-[13px] text-gray-400 font-light italic max-w-[240px] leading-relaxed mb-8">
          It looks like you haven't added anything to your cart yet.
        </p>
        
        <button
          @click="goBack"
          class="px-12 py-3 border border-gray-900 text-gray-900 text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-gray-900 hover:text-white transition-all duration-500"
        >
          Continue Shopping
        </button>
      </div> 
    </div>
  </div>
</template>

<style>

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>