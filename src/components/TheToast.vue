<script setup lang="ts">
import { useCartStore } from '../stores/cart'
const cartStore = useCartStore()
</script>

<template>
  <transition
    enter-active-class="transition duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
    enter-from-class="opacity-0 -translate-y-8"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="cartStore.toast.show" 
      class="fixed top-4 z-[100] px-10 py-3 whitespace-nowrap overflow-hidden"
      style="left: 50%; transform: translateX(-50%);"
    >
      <div class="bg-black/90 backdrop-blur-md border border-white/10 text-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center gap-2 px-4 py-2 lg:gap-3 lg:px-8 lg:py-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 lg:h-5 lg:w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-[10px] lg:text-[13px] tracking-[0.15em] lg:tracking-[0.2em] font-medium uppercase">
          {{ cartStore.toast.message }}
        </span>
      </div>``
    </div>
  </transition>
</template>