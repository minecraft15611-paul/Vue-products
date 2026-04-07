<script setup lang="ts">
  import { useCartStore } from '../stores/cart';
  import { ref } from 'vue';

  const cartStore = useCartStore();
  const imageLoaded = ref<boolean>(false);
  const promoImageLoaded = ref<boolean>(false);

  const handleShopNow = (): void => {
  cartStore.setCategory('All');
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

</script>

<template>
  <div class="banner-wrapper w-full overflow-hidden">

    <div 
      v-if="!imageLoaded" 
      class="w-full h-[500px] bg-gray-200 animate-pulse flex items-center justify-center"
    >
      <span class="text-gray-400 tracking-widest text-sm">LOADING...</span>
    </div>

    <img 
      v-show="imageLoaded"
      class="banner-img w-full h-[500px] object-cover" 
      src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" 
      alt="Hero Banner"
      @load="imageLoaded = true"
    >
  </div>

  <section class="py-20 bg-slate-200 border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div class="flex flex-col items-center text-center p-4">
          <div class="mb-4 text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3v10h1"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
          </div>
          <h3 class="text-sm font-bold tracking-[0.3em] text-black">FREE SHIPPING</h3>
          <p class="text-xs text-gray-400 mt-2">FREE SHIPPING ON ALL ORDER</p>
        </div>

        <div class="flex flex-col items-center text-center p-4 border-y md:border-y-0 md:border-x border-gray-100">
          <div class="mb-4 text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
          </div>
          <h3 class="text-sm font-bold tracking-[0.3em] text-black">ONLINE SUPPORT</h3>
          <p class="text-xs text-gray-400 mt-2">ONLINE SUPPORT 24 HOURS A DAY</p>
        </div>

        <div class="flex flex-col items-center text-center p-4">
          <div class="mb-4 text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <h3 class="text-sm font-bold tracking-[0.3em] text-black">MONEY RETURN</h3>
          <p class="text-xs text-gray-400 mt-2">BACK GUARANTEE UNDER 7 DAYS</p>
        </div>

      </div>
    </div>
  </section>

  <section class="w-full">
    <div class="w-full">
      <div class="relative group cursor-pointer overflow-hidden rounded-sm bg-gray-100">

        <div 
          v-if="!promoImageLoaded" 
          class="w-full h-[450px] bg-gray-200 animate-pulse flex items-center justify-center"
        >
          <span class="text-gray-400 tracking-widest text-xs">PREVIEW...</span>
        </div>

        <img 
          v-show="promoImageLoaded" 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          class="w-full h-[450px] object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" 
          alt="Promotion"
          @load="promoImageLoaded = true"
        >
        
        <div v-show="promoImageLoaded" class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/20">
          <span class="text-white text-xs uppercase tracking-[0.5em] mb-4">Summer Collection</span>
          <h2 class="text-white text-3xl md:text-5xl font-light mb-8 ">GET UP TO <span class="font-extrabold">20% OFF</span></h2>
          <button 
            @click="handleShopNow"
            class=" bg-white text-black px-12 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
          >
            Shop Now
          </button>
        </div>
        
      </div>
    </div>
  </section>
</template>

<style>
    .banner-wrapper{
        width: 100%;       
        overflow: hidden;
    }

    .banner-img{
        width: 100%;
        height: 100%;
        object-fit: cover;  
        object-position: center;
    }
</style>