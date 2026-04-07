<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router';

const cartStore = useCartStore()

const router = useRouter();

const goBack = (): void => {
  router.back(); 
};

const subtotal = computed<number>(() =>
  cartStore.totalPrice
)

const shipping = computed<number>(() => (subtotal.value > 1 ? 0 : 9.99))

const total = computed<number>(() => subtotal.value + shipping.value)
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
              <span class="text-sm font-medium text-gray-900">${{ item.price.toFixed(2) }}</span>
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
        <div class="
          flex-1 bg-white rounded-xl overflow-hidden divide-y divide-gray-100 
          shadow-sm overflow-y-auto max-h-[70vh] hide-scrollbar scrollbar-gutter:stable 
          scroll-smooth 
          ">
          <div
            v-for="item in cartStore.cart"
            :key="item.id"
            class="flex items-center group gap-4 p-5 hover:bg-[#F9F9F7] hover:scale-101 transition-all duration-300"
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
                  class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 
                          group-hover:translate-x-0 transition-all ml-4 flex-shrink-0 text-xl leading-none
                          "
                >×</button>
              </div>
 
              <!-- Price + Qty -->
              <div class="flex items-center justify-between mt-3">
                <span class="font-semibold text-gray-900">
                  ${{ item.price.toFixed(2) }}
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
        <div class="w-80 flex-shrink-0 bg-white rounded-xl p-8 shadow-sm sticky top-10 border border-gray-50">
          <h2 class="text-lg font-semibold mb-6 tracking-tight text-gray-800">Order Summary</h2>

          <div class="space-y-4 text-sm">
            <div class="flex justify-between text-gray-500 tracking-wide">
              <span>Subtotal</span>
              <span class="text-gray-900 font-medium">${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-gray-500 tracking-wide">
              <span>Shipping</span>
              <span class="text-green-600 font-medium tracking-wider">{{ shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}` }}</span>
            </div>
          </div>

          <div class="border-t border-gray-100 mt-6 pt-6 flex justify-between font-bold text-lg text-gray-900">
            <span class="tracking-tight">Total</span>
            <span class="tracking-tighter">${{ total.toFixed(2) }}</span>
          </div>

          <button class="mt-8 w-full bg-gray-900 text-white text-[11px] uppercase tracking-[0.2em] font-semibold rounded-md py-4 hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group">
            Proceed to Checkout
            <svg class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          <div class="mt-12 flex flex-col items-center border-t border-gray-50 pt-9">
            <p class="text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-5 font-semibold">
              Secure Payment
            </p>
            
            <div class="flex items-center space-x-6 opacity-80 hover:opacity-100 transition-opacity cursor-default">
              <svg class="h-3 w-auto" viewBox="0 0 100 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M38.8.5l-6.2 27.2h-7.9l6.2-27.2h7.9z" fill="#0E4595"/><path d="M55.7.5l-6 27.2h-7.3l-1.3-6.6c-.6-3.3-2.3-5.2-4.9-5.2-.2 0-.4 0-.6 0l.5-2.6c1.2-.3 3.1-.5 5-.5 5.5 0 8.3 3 9.2 7.7l1.1 5.4h4.4l2.7-12.1h7.9l-2.7 12.1h7.8l6.1-27.2h-7.9l-2.7 12.1h-4.4l2.7-12.1h-7.9z" fill="#0E4595"/><path d="M18.8.5c-3.5 0-6.8 2-8.3 5.3l-.3.7c-.1-.4-.4-.7-.7-1h-7.9l.4 1.8c4.3.9 7.3 3.9 8.2 8l3.6-14.8h5.2l-6.2 27.2h7.9l6.2-27.2h-6.4z" fill="#F0A620"/>
              </svg>
              
              <svg class="h-6 w-auto" viewBox="0 0 100 62" xmlns="http://www.w3.org/2000/svg">
                <circle cx="35" cy="31" r="31" fill="#EB001B"/><circle cx="65" cy="31" r="31" fill="#F79E1B" fill-opacity=".8"/>
              </svg>
              
              <svg class="h-5 w-auto" viewBox="0 0 100 28" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.1 27.9l1.6-9.1c.1-.4.4-.7.8-.7h3.8c4.3 0 7.2-1.9 8.1-5.7.4-1.6.2-2.9-.5-3.8-.7-1-1.9-1.5-3.8-1.5H35.2c-.5 0-.9.4-.9.9l-2.7 15.1c-.1.4.1.9.6.9h3c.4 0 .8-.3.9-.8z" fill="#253B80"/><path d="M57.9 7c-1.3 0-2.6.4-3.6 1.1-1.1-.7-2.3-1.1-3.6-1.1-3 0-5.3 2.1-5.3 5.1v10.9c0 .5.4.9.9.9h3.3c.5 0 .9-.4.9-.9v-10.4c0-1.7 1.1-2.9 2.7-2.9s2.7 1.1 2.7 2.9v10.4c0 .5.4.9.9.9h3.3c.5 0 .9-.4.9-.9v-10.4c0-1.7 1.1-2.9 2.7-2.9 1.5 0 2.7 1.2 2.7 2.9v10.4c0 .5.4.9.9.9H71c.5 0 .9-.4.9-.9v-10.4c0-4.3-2.5-7.5-6.4-7.5zm-33.1.2c-4.1 0-7.2 3.1-7.2 7.2S20.7 21.6 24.8 21.6c4.1 0 7.2-3.1 7.2-7.2S28.9 7.2 24.8 7.2zm0 11.2c-2.3 0-4-1.7-4-4s1.7-4 4-4 4 1.7 4 4c0 2.3-1.7 4-4 4z" fill="#179BD7"/><path d="M84.7 7c-4.1 0-7.2 3.1-7.2 7.2s3.1 7.2 7.2 7.2S91.9 18.3 91.9 14.2 88.8 7 84.7 7zm0 11.2c-2.3 0-4-1.7-4-4s1.7-4 4-4 4 1.7 4 4c0 2.3-1.7 4-4 4z" fill="#179BD7"/><path d="M96.7 18.6l3.3-13.3c0-.1-.1-.2-.2-.2h-3.3c-.3 0-.6.2-.7.6l-1.9 7.7-1.9-7.7c-.1-.4-.4-.6-.7-.6h-3.3c-.1 0-.2.1-.2.2l3.3 13.3-1.6 6.3c-.1.4.1.9.6.9h3.3c.3 0 .6-.2.7-.6l1.6-6.3z" fill="#253B80"/>
              </svg>
              
              <svg class="h-4 w-auto" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.4 15.6c-1.4 0-2.6 1.1-2.6 2.5 0 1.4 1.1 2.5 2.6 2.5s2.6-1.1 2.6-2.5c0-1.4-1.1-2.5-2.6-2.5zm19.8-3.1c-1.7 0-3.3.9-4 2.3h-.1v-2h-3.3v13.5h3.5v-5.2c0-2.5 1.5-4 3.5-4s3.3 1.4 3.3 3.8v5.4h3.5v-6.3c0-4.3-2.5-7.5-6.4-7.5zm-11.2 0c-4.1 0-7.2 3.1-7.2 7.2s3.1 7.2 7.2 7.2 7.2-3.1 7.2-7.2-3.1-7.2-7.2-7.2zm0 11.2c-2.3 0-4-1.7-4-4s1.7-4 4-4 4 1.7 4 4c0 2.3-1.7 4-4 4z" fill="#000"/>
              </svg>
            </div>
          </div>
          <div class="mt-10 pt-6 border-t border-gray-50 text-center">
            <button
              @click="cartStore.clearCart()"
              class="text-[10px] uppercase tracking-[0.25em] text-gray-400 hover:text-red-400 hover:underline underline-offset-8 transition-all"
            >
              Clear All items
            </button>
          </div>
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
          "Your cart is empty. Fill it with things that make life more beautiful."
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