<script setup>
import { onMounted, shallowRef } from 'vue';
import { useCartStore } from '../stores/cart';
import Cart from '../components/Cart.vue';
import ProductList from '../components/ProductList.vue';
import Myheader from '../components/MyHeader.vue';
import MyFooter from '../components/MyFooter.vue'
import HomePage from '../components/HomePage.vue';

const currentComponent = shallowRef(HomePage);
const toggleView = () => {
  currentComponent.value = currentComponent.value === HomePage ? ProductList : HomePage;
};

const cartStore = useCartStore();

/* ----- Fetch API Data First to Show Initial Page of Products -----*/

onMounted( () => cartStore.fetchProducts());


</script>

<template>
  <div class="flex flex-col min-h-screen">
      <Myheader />
          <button @click="toggleView" class="mt-4 p-2 bg-blue-500 text-white">
            切換至產品列表(測試用會刪除)
          </button>
        <main class="grow">

          <component :is="currentComponent" />

        </main>

      <hr class="border-t border-gray-200">
      <MyFooter />
  </div>
</template>
