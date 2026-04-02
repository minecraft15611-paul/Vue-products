<template>
  <div class="relative inline-block p-2">
    <i 
      class="fa-solid fa-bag-shopping text-xl transition-transform duration-300"
      :class="{ 'scale-125': isAnimating }"
    ></i>

    <span 
      v-if="cartCount > 0"
      class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white border border-white"
    >
      {{ cartCount }}
    </span>

    <transition name="fade-up">
      <p 
        v-show="isAnimating" 
        class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium tracking-tighter text-zinc-500"
      >
        Added !
      </p>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  cartCount: {
    type: Number,
    default: 0
  }
});

const isAnimating = ref(false);


watch(() => props.cartCount, (newVal, oldVal) => {
  if (newVal > oldVal) {
    isAnimating.value = true;
    setTimeout(() => {
      isAnimating.value = false;
    }, 1000);
  }
});
</script>

<style scoped>
.fade-up-enter-active, .fade-up-leave-active {
  transition: all 0.4s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translate(-50%, 10px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -5px);
}
</style>