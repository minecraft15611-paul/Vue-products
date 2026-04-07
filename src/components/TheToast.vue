<script setup>
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
      class="fixed top-36 z-[100] px-10 py-3 whitespace-nowrap overflow-hidden"
      style="left: 50%; transform: translateX(-50%);"
    >
      <div class="bg-black/90 backdrop-blur-md border border-white/10 text-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center gap-3 px-8 py-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-[13px] tracking-[0.2em] font-medium uppercase">
          {{ cartStore.toast.message }}
        </span>
      </div>
    </div>
  </transition>
</template>