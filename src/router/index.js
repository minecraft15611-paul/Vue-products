import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import ShoppingCart from '../views/ShoppingCart.vue';
import ProductDetail from '../views/ProductDetail.vue';
import ProductsList from '../views/ProductsList.vue';
import CheckoutView from '../views/CheckoutView.vue';
import LoginView from '../views/LoginView.vue';
import LoginCallbackView from '../views/LoginCallbackView.vue';

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
        path: '/ProductsList',
        name: 'ProductsList',
        component: ProductsList
    },
    {
        path: '/ProductDetail/:id',
        name: 'ProductDetail',
        component: ProductDetail
    },
    {
        path: '/CheckoutView',
        name: 'CheckoutView',
        component: CheckoutView
    },
    {
        path: '/LoginView',
        name: 'LoginView',
        component: LoginView
    },
    {
    path: '/login-callback',
    name: 'LoginCallback',
    component: LoginCallbackView
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition; // restore position on back/forward
        }
        return { top: 0 }; // scroll to top on every new navigation
    }
});

export default router;