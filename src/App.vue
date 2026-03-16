<script setup>
import { ref, computed } from 'vue';
const products = ref([
  {id: 1, name: 'notebook', price: 200, stock: 10},
  {id: 2, name: 'mouse', price: 500, stock: 5},
  {id: 3, name: 'monitor', price: 650, stock: 7}
])

const cart =ref([]);

const addToCart = (item) => {
  if(item.stock > 0){
    cart.value.push(item);
    item.stock -= 1;
  }else{
    alert('out of stock!!');
  }
}

const totalPrice = computed(() =>{
  return cart.value.reduce((sum, item) =>{
    return sum + item.price;
  }, 0);
});

const removeFromCart = (index) => {
  const item = cart.value[index];

  if(item){
    item.stock += 1;
  }
  cart.value.splice(index, 1);
}

</script>

<template>
  <div>
    <h2>products list</h2>
    <ul>
      <li v-for="item in products" :key="item.id">
        {{ item.name }} -- 數量: {{ item.stock }} -- ${{ item.price }}
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