<script setup>
import { onMounted } from 'vue';
import { useCartStore } from './stores/cart';
import Cart from './components/Cart.vue';
import ProductList from './components/ProductList.vue';


const cartStore = useCartStore();
onMounted( () => cartStore.fetchProducts());

</script>

<template>
  <div>
      <ProductList />
      <hr>
      <Cart  />
  </div>
</template>

<style scoped></style>