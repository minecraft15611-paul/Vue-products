import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue'; 
import ProductList from '../components/ProductList.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/products',
    name: 'Products',
    component: ProductList
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;