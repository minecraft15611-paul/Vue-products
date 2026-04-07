<script setup>
import { onMounted, shallowRef, watch } from 'vue';
import { useCartStore } from '../stores/cart';
import ProductList from '../components/ProductList.vue';
import Myheader from '../components/MyHeader.vue';
import MyFooter from '../components/MyFooter.vue';
import HomePage from '../components/HomePage.vue';
import theToast from '../components/theToast.vue';
import TheToast from '../components/theToast.vue';

const cartStore = useCartStore();
const currentComponent = shallowRef(HomePage);

// ---- Switch to ProductList whenever any category button is clicked ----
watch(() => cartStore.selectedCategory, (cat) => {
    if (!cartStore.goingHome && cat !== 'Home') {
        currentComponent.value = ProductList;
    }
});

// ---- Switch back to HomePage when the Home button is clicked ----
watch(() => cartStore.goingHome, (val) => {
    if (val) {
        currentComponent.value = HomePage;
        cartStore.goingHome = false;
    }
});

// ---- Also switch when the search query has content ----
watch(() => cartStore.searchQuery, (q) => {
    if (q.trim() !== '') {
        currentComponent.value = ProductList;
    } else if (cartStore.selectedCategory === 'All' || cartStore.selectedCategory === 'Home') {
        currentComponent.value = HomePage;
    }
});

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
        <component :is="currentComponent" />      <!-- v-else -->
    </main>

    <hr class="border-t border-gray-200">
    <MyFooter />
  </div>
</template>