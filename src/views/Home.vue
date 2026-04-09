<script setup lang="ts">
import { type Component, onMounted, shallowRef, watch } from 'vue';
import { useCartStore } from '../stores/cart';
import ProductList from '../components/ProductList.vue';
import Myheader from '../components/MyHeader.vue';
import MyFooter from '../components/MyFooter.vue';
import HomePage from '../components/HomePage.vue';
import TheToast from '../components/TheToast.vue';


const cartStore = useCartStore();

/* ----- Fetch API Data on Mount -----*/
onMounted(() => cartStore.fetchProducts());

</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Myheader />
    
    <TheToast />

    <main class="grow">
        <!-- <div v-if="cartStore.isLoading" class="flex justify-center items-center h-64">
            <p class="text-gray-500 animate-pulse">Loading, please wait...</p>
        </div>
        
        <div v-else-if="cartStore.apiError" class="flex flex-col items-center justify-center min-h-[400px] p-8 m-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
            <p>⚠️ {{ cartStore.apiError }}</p>
            <button @click="cartStore.fetchProducts" class="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all active:scale-95 shadow-md">Please try again</button>
        </div> -->
        <HomePage />      <!-- v-else -->
    </main>

    <hr class="border-t border-gray-200">
    <MyFooter />
  </div>
</template>