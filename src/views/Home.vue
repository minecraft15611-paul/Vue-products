<script setup>
import { onMounted, shallowRef, watch } from 'vue';
import { useCartStore } from '../stores/cart';
import ProductList from '../components/ProductList.vue';
import Myheader from '../components/MyHeader.vue';
import MyFooter from '../components/MyFooter.vue';
import HomePage from '../components/HomePage.vue';

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

    <main class="grow">
      <component :is="currentComponent" />
    </main>

    <hr class="border-t border-gray-200">
    <MyFooter />
  </div>
</template>