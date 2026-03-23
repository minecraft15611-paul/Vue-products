<script setup>
import { ref, computed, onMounted, watch } from 'vue';

import Cart from './components/Cart.vue';
import ProductList from './components/ProductList.vue';

// ---- Ensure Products List is Empty-----

const products = ref([]);

// ---- Fetching Products From API ----

const fetchProducts = async () => {
  try{
    const response = await fetch('https://fakestoreapi.com/products');
    const data = await response.json();

    products.value = data.map(item => ({
      ...item,
      stock: 5
    }));

    console.log('API data fetching succeed', products.value);
  }catch (error) {
    console.log('data fetching failed', error);
  }
};

// ---- Execute the Fetch on Component Mount ----

onMounted(() => {
  fetchProducts();
})

//  ---- Shopping Cart ----

const savedCart = localStorage.getItem('my_cart');
const cart =ref(savedCart ? JSON.parse(savedCart) : []);

watch(cart, (newCart) => {
  localStorage.setItem('my_cart', JSON.stringify(newCart));
}, { deep: true});

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
  if (!item) return; // ensure the index has corresponding data
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




</script>

<template>
  <div>
    <div>
      <ProductList
        :products="products"
        @add-to-cart="addToCart"
      />
    </div>

    <hr>

    <div>
      <Cart 
      :cartItems="cart" 
      :totalPrice="totalPrice"
      @remove-item="removeFromCart"
      @clear-all="clearCart" 
      />
    </div>
  </div>
</template>

<style scoped></style>