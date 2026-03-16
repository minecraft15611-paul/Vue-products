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
    item.stock -= 1;

    const cartItem = cart.value.find(c => c.id === item.id);
    if (cartItem){
      cartItem.quantity += 1;
    }else {
      cart.value.push({...item, quantity: 1});
    }
  }
}

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
})

const removeFromCart = (index) => {
  const item = cart.value[index];
  const product = products.value.find(p => p.id === item.id);
  if(product){
    product.stock += item.quantity;
  }
  cart.value.splice(index, 1);
}

const clearCart = () => {
  cart.value.forEach(item => {
    const product = products.value.find(p => p.id === item.id)
    if (product){
      product.stock += item.quantity;
    }
  })
  cart.value = [];
}


</script>

<template>
  <div>
    <h2>products list</h2>
    <ul>
      <li v-for="item in products" :key="item.id">
        {{ item.name }} -- 數量: {{ item.stock }} -- ${{ item.price }}
        <button 
        @click="addToCart(item)"
        :disabled="item.stock === 0"
        >
        {{ item.stock > 0 ? 'Add to Cart':'Out of Stock' }}
        </button>
      </li>
    </ul>

    <hr>

    <h2>Cart (number:{{ cart.length }})</h2>
    <ul>
      <li v-for="(cartItem, index) in cart" :key="index">
        {{ cartItem.name }} -- {{ cartItem.price }}
        <strong> X {{ cartItem.quantity }} </strong>
      </li>
      <button @click="clearCart" v-if="cart.length > 0">Clear all</button>
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