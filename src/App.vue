<script setup>
import { onMounted } from 'vue';
import { useCartStore } from './stores/cart';
import Cart from './components/Cart.vue';
import ProductList from './components/ProductList.vue';
import Myheader from './components/Myheader.vue';
import MyFooter from './components/MyFooter.vue'

const cartStore = useCartStore();

/* ----- Fetch API Data First to Show Initial Page of Products -----*/

onMounted( () => cartStore.fetchProducts());

</script>

<template>
  <div class="flex flex-col min-h-screen">
      <Myheader />

      <main class="grow">
        <router-view></router-view>
      </main>

      <hr class="border-t border-gray-200">
      <MyFooter />
  </div>
</template>

<style scoped></style>