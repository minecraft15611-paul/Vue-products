<script setup>
import { ref } from 'vue'

const title = ref('今日精選商品')

// 建立商品陣列
const products = ref([
  { id: 1, name: '質感筆記本', price: 250, image: 'https://via.placeholder.com/150' },
  { id: 2, name: '無線滑鼠', price: 890, image: 'https://via.placeholder.com/150' },
  { id: 3, name: '人體工學椅', price: 4500, image: 'https://via.placeholder.com/150' }
])
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    
    <div class="product-list">
      <div v-for="item in products" :key="item.id" class="product-card">
        <img :src="item.image" alt="商品圖片">
        <h3>{{ item.name }}</h3>
        <p>價格：${{ item.price }}</p>
        <button>加入購物車</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 這裡可以放你的 CSS */
h1 {
  color: #42b983;
}
</style>