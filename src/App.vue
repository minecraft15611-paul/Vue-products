<script setup>
import { ref, computed } from 'vue';
const products = ref([
  {id: 1, name: 'notebook', price: 200},
  {id: 2, name: 'mouse', price: 500},
  {id: 3, name: 'monitor', price: 650}
])

const cart =ref([]);

const addToCart = (item) => {
  cart.value.push(item)
  console.log('current Cart products', cart.value)
}

const totalPrice = computed(() =>{
  return cart.value.reduce((sum, item) =>{
    return sum + item.price;
  }, 0);
});

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
  console.log('剩餘商品', cart.value);
}

</script>

<template>
  <div>
    <h2>products list</h2>
    <ul>
      <li v-for="item in products" :key="item.id">
        {{ item.name }} -- ${{ item.price }}
        <button @click="addToCart(item)">add to Cart</button>
      </li>
    </ul>

    <hr>

    <h2>Cart (number:{{ cart.length }})</h2>
    <ul>
      <li v-for="(cartItem, index) in cart" :key="index">
        {{ cartItem.name }}
      </li>
    </ul>
  </div>

  <hr>

  <h3>Total Amount Price:{{ totalPrice }}</h3>

  <ul>
    <li v-for="(cartItem, index) in cart" :key="index">
      {{ cartItem.name }} - ${{ cartItem.price }}

      <button @click="removeFromCart(index)">remove</button>
    </li>
  </ul>
</template>

<style scoped></style>