import { createRouter, createWebHashHistory } from 'vue-router';
import { useCartStore } from '../stores/cart'; 

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/ShoppingCart',
        name: 'ShoppingCart',
        component: () => import('../views/ShoppingCart.vue')
    },
    {
        path: '/ProductsList',
        name: 'ProductsList',
        component: () => import('../views/ProductsList.vue')
    },
    {
        path: '/ProductDetail/:id',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetail.vue')
    },
    {
        path: '/CheckoutView',
        name: 'CheckoutView',
        component: () => import('../views/CheckoutView.vue'),
        meta: { requiresCart: true }
    },
    {
        path: '/LoginView',
        name: 'LoginView',
        component: () => import('../views/LoginView.vue')
    },
    {
        path: '/login-callback',
        name: 'LoginCallback',
        component: () => import('../views/LoginCallbackView.vue')
    },
    {
        path: '/success',
        name: 'SuccessView',
        component: () => import('../views/SuccessView.vue'),
        meta: { fromCheckout: true }
    },
    {
        path: '/Admin',
        name: 'Admin',
        component: () => import('../views/Admin.vue'),
        meta: { requiresAdmin: true }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFoundView.vue')
    }
];

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition; // restore position on back/forward
        }
        return { top: 0, behavior: 'smooth' }; // scroll to top on every new navigation
    }
});

router.beforeEach((to, from, next) => {
    // 檢查是否前往結帳頁面
    if (to.meta.fromCheckout) {
        const flag = localStorage.getItem('fromCheckout');
        const hasSessionId = !!to.query.session_id; // Stripe express checkout redirect
        if (flag === 'true' || hasSessionId) {
            localStorage.removeItem('fromCheckout');
            next();
        } else {
            alert("無效的存取：請由正常結帳流程進入。");
            next({ name: 'Home' });
        }
    } else if (to.meta.requiresCart) {
        if (!from.name && !to.query.session_id && to.query.from !== 'stripe') {
            alert("請透過購物車進入結帳頁面");
            return next({ name: 'Home' });
        }

        const cartStore = useCartStore();
        if (cartStore.cart.length === 0) {
            alert("購物車內尚無商品，請先選購");
            return next({ name: 'ProductsList' });
        }

        next();
    } else if (to.meta.requiresAdmin) {
        next();
    } else {
        next(); 
    }
});

export default router;