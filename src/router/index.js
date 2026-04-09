import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import ShoppingCart from '../views/ShoppingCart.vue';
import ProductDetail from '../views/ProductDetail.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/ShoppingCart',
        name: 'ShoppingCart',
        component: ShoppingCart
    },
    {
        path: '/ProductDetail/:id',
        name: 'ProductDetail',
        component: ProductDetail
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;