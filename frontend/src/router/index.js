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
import { useCartStore } from '../stores/cart'; 


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
        component: SuccessView,
        meta: { fromCheckout: true }
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
        return { top: 0, behavior: 'smooth' }; // scroll to top on every new navigation
    }
});

//
router.beforeEach((to, from, next) => {
    // 檢查是否前往結帳頁面
    if (to.meta.fromCheckout) {
        const flag = localStorage.getItem('fromCheckout');
        if (flag === 'true') {
            localStorage.removeItem('fromCheckout'); // one-time use
            next();
        } else {
            alert("無效的存取：請由正常結帳流程進入。");
            next({ name: 'Home' });
        }
}

     else if (to.meta.requiresCart) {
        // 1. 檢查來源：如果是手動輸入網址 (from.name 為空)，則踢回首頁
        if (!from.name) {
            alert("請透過購物車進入結帳頁面");
            return next({ name: 'Home' });
        }

        const cartStore = useCartStore();  // ✅ consistent with CheckoutView
        if (cartStore.cart.length === 0) {
            alert("購物車內尚無商品，請先選購");
            return next({ name: 'ProductsList' });
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