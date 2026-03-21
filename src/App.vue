<script setup>
import { ref, computed } from 'vue';

// ----  Products Lists -----

const products = ref([
  {id: 1, name: 'notebook', price: 200, stock: 10},
  {id: 2, name: 'mouse', price: 500, stock: 5},
  {id: 3, name: 'monitor', price: 650, stock: 7}
])

//  ---- Shopping Cart ----

const cart =ref([]);

// ---- Add to Cart Function ----

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

// ---- Compute Total Price ----

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
})
 
// ---- Single Item Remove From Cart ----

const removeFromCart = (index) => {
  const item = cart.value[index];
  const product = products.value.find(p => p.id === item.id);
  if(product){
    product.stock += item.quantity;
  }
  cart.value.splice(index, 1);
}

// ---- Clear All Items In Cart ----

const clearCart = () => {
  cart.value.forEach(item => {
    const product = products.value.find(p => p.id === item.id)
    if (product){
      product.stock += item.quantity;
    }
  })
  cart.value = [];
}

// ---- User Input Bindings ----

const searchQuery = ref('');

// ---- Define Max Price ----

const maxPrice = ref(1000);

// ---- Filtered Results ----

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchName = p.name.toLowerCase().includes(searchQuery.value.toLocaleLowerCase());
    const matchPrice = p.price <= maxPrice.value;

    return matchName && matchPrice;
  });
});


</script>

<template>
  <div>
    <h2>products list</h2>
    <div style="margin-bottom: 20px;">
      <label>Max Price: ${{ maxPrice }}</label>
      <br>
      <input type="range" v-model.number="maxPrice" min="0" max="1000" step="50">
      <input type="text" v-model="searchQuery" placeholder="Search products...">
      <p v-if="searchQuery">Searching for: {{ searchQuery }}</p>
    </div>


    <ul>
      <li v-for="item in filteredProducts" :key="item.id">
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