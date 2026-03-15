<script setup>
import { ref } from 'vue'

const title = ref('今日精選商品')

// 建立商品陣列
const products = ref([
  { id: 1, name: '質感筆記本', price: 250, image: 'https://via.placeholder.com/150' },
  { id: 2, name: '無線滑鼠', price: 890, image: 'https://via.placeholder.com/150' },
  { id: 3, name: '人體工學椅', price: 4500, image: 'https://via.placeholder.com/150' }
])

const cart = ref([])

// 3. 加入購物車的邏輯函式
const addToCart = (item) => {
  cart.value.push(item)
  console.log('目前購物車內容：', cart.value)
  alert(`已將 ${item.name} 加入購物車！`)
}
</script>

<template>
  <div>
    <h1>{{ title }}</h1>

    <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 20px;">
      <h2>商品列表</h2>
      <div v-for="item in products" :key="item.id" style="margin-bottom: 10px;">
        <span>{{ item.name }} - ${{ item.price }} </span>
        <button @click="addToCart(item)">加入購物車</button>
      </div>
    </div>

    <div style="background-color: #f9f9f9; padding: 10px;">
      <h2>購物車預覽</h2>
      <p>目前購物車內共有： {{ cart.length }} 件商品</p>
      
      <ul>
        <li v-for="(cartItem, index) in cart" :key="index">
          {{ cartItem.name }} - ${{ cartItem.price }}
        </li>
      </ul>
    </div>
  </div>
</template>
<style scoped>
/* 這裡可以放你的 CSS */
h1 {
  color: #42b983;
}
</style>