<script setup>
import { onMounted } from 'vue';
import { useCartStore } from './stores/cart';
import Cart from './components/Cart.vue';
import ProductList from './components/ProductList.vue';
import Myheader from './components/Myheader.vue';

const cartStore = useCartStore();

/* ----- Fetch API Data First to Show Initial Page of Products -----*/

onMounted( () => cartStore.fetchProducts());

</script>

<template>
  <div>
      <Myheader />

      <main>
        <router-view></router-view>
      </main>

      <hr>
      <Cart  />
  </div>
</template>

<style scoped></style>