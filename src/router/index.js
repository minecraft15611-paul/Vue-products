import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import ShoppingCart from '../views/ShoppingCart.vue';

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
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;