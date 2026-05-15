import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import ShoppingCart from '../views/ShoppingCart.vue';
import ProductDetail from '../views/ProductDetail.vue';
import ProductsList from '../views/ProductsList.vue';
import CheckoutView from '../views/CheckoutView.vue';
import LoginView from '../views/LoginView.vue';
import LoginCallbackView from '../views/LoginCallbackView.vue';
import SuccessView from '../views/SuccessView.vue';
import Admin from '../views/Admin.vue';
import NotFoundView from '../views/NotFoundView.vue';


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
        component: CheckoutView,
        meta: { requiresCart: true }
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
    },
    {
        path: '/SuccessView',
        name: 'SuccessView',
        component: SuccessView
    },
    {
        path: '/Admin',
        name: 'Admin',
        component: Admin,
        meta: { requiresAdmin: true }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundView
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

//
router.beforeEach((to, from, next) => {
    // 檢查是否前往結帳頁面
    if (to.meta.requiresCart) {
        // 1. 檢查來源：如果是手動輸入網址 (from.name 為空)，則踢回首頁
        if (!from.name) {
            alert("請透過購物車進入結帳頁面");
            return next({ name: 'Home' });
        }

        // 2. 檢查狀態：檢查 localStorage 裡的購物車是否有商品
        const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cartData.length === 0) {
            alert("購物車內尚無商品，請先選購");
            return next({ name: 'ProductsList' }); // 導向商品列表
        }

        next(); // 檢查通過，放行
    } 
    // 針對 Admin 的原有守衛
    else if (to.meta.requiresAdmin) {
        next();
    } else {
        next(); 
    }
});

export default router;