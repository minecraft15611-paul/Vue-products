<script setup>
import { onMounted } from 'vue';
import { useCartStore } from './stores/cart';
import Cart from './components/Cart.vue';
import ProductList from './components/ProductList.vue';

const cartStore = useCartStore();

/* ----- Fetch API Data First to Show Initial Page of Products -----*/

onMounted( () => cartStore.fetchProducts());

</script>

<template>
  <div>
      <router-view></router-view>

      <hr>
      <Cart  />
  </div>
</template>

<style scoped></style>