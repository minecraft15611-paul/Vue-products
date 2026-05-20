<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

const router    = useRouter();
const route     = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();

// ── Detect which flow we're in ─────────────────────────────────────────────
// Situation A: normal Pay Now → no session_id in URL, data in localStorage
// Situation B: Stripe express checkout → session_id in URL, fetch order from backend
const sessionId   = route.query.session_id as string | undefined;
const isStripeFlow = !!sessionId;

// ── Read order snapshot from localStorage ─────────────────────────────────
const snapshot      = ref<Record<string, any> | null>(null);
const stripeOrder   = ref<Record<string, any> | null>(null);
const stripeLoading = ref<boolean>(isStripeFlow); // start true if we need to fetch
const stripeError   = ref<string>('');

// ── On mount: handle both flows ───────────────────────────────────────────
onMounted(async () => {
    if (isStripeFlow) {
        // Situation B — poll backend for the order Webhook just created
        // Webhook may fire slightly after redirect, so retry up to 5 times
        let attempts = 0;
        const maxAttempts = 5;
        const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

        while (attempts < maxAttempts) {
            try {
                const res = await axios.get(
                    `https://lemontree-api.onrender.com/api/orders/stripe/${sessionId}`
                );
                stripeOrder.value   = res.data;
                stripeLoading.value = false;
                break;
            } catch (err: any) {
                attempts++;
                if (attempts < maxAttempts) {
                    await delay(1500); // wait 1.5s before retrying
                } else {
                    stripeError.value   = '訂單資料載入失敗，請聯繫客服並提供您的付款確認信。';
                    stripeLoading.value = false;
                }
            }
        }
    } else {
        // Situation A — read from localStorage as before
        try {
            const raw = localStorage.getItem('last_order_snapshot');
            if (raw) {
                snapshot.value = JSON.parse(raw);
                console.log('📦 Order placed:', JSON.stringify(snapshot.value, null, 2));
            }
            localStorage.setItem('fromCheckout', 'true');
        } catch (e) {
            console.warn('Could not read order snapshot', e);
        }
    }

    cartStore.clearCart();
});

// ---- Order Number ----
const today = new Date();
const _fallbackOrderNumber = (() => {
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 90 + 10);
    return `ORD-${datePart}-${randomSuffix}`;
})();
const orderNumber = computed(() =>
    isStripeFlow
        ? (stripeOrder.value?.orderId ?? _fallbackOrderNumber)
        : (snapshot.value?.orderNumber ?? _fallbackOrderNumber)
);

// ---- Order Date (timeline) ----
const orderDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// ---- Estimated Delivery (today + 8 to +11 days) ----
const deliveryStart = new Date(today);
deliveryStart.setDate(today.getDate() + 8);
const deliveryEnd = new Date(today);
deliveryEnd.setDate(today.getDate() + 11);

const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const estimatedDelivery = `${formatDate(deliveryStart)} - ${formatDate(deliveryEnd)}`;

// ---- Copy Order Number ----
const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber.value);
    cartStore.showToast('Order number copied!');
};

// ---- Continue Shopping ----
const continueShopping = () => {
    localStorage.removeItem('last_order_snapshot');
    localStorage.removeItem('last_order_discount');
    cartStore.goHome();
    router.push('/');
};

// ---- Accordion Toggle (Order Summary) ----
const isOpen = ref<boolean>(true);
const toggle = () => { isOpen.value = !isOpen.value; };

// ---- Accordion slide transition hooks ----
function onEnter(el: Element) {
    const h = el as HTMLElement;
    h.style.height   = '0';
    h.style.overflow = 'hidden';
    h.style.opacity  = '0';
    requestAnimationFrame(() => {
        h.style.transition = 'height 0.4s ease, opacity 0.35s ease';
        h.style.height     = h.scrollHeight + 'px';
        h.style.opacity    = '1';
    });
}
function onAfterEnter(el: Element) {
    const h = el as HTMLElement;
    h.style.height = 'auto';
    h.style.overflow = '';
    h.style.transition = '';
}
function onLeave(el: Element) {
    const h = el as HTMLElement;
    h.style.height   = h.scrollHeight + 'px';
    h.style.overflow = 'hidden';
    requestAnimationFrame(() => {
        h.style.transition = 'height 0.4s ease, opacity 0.35s ease';
        h.style.height     = '0';
        h.style.opacity    = '0';
    });
}
function onAfterLeave(el: Element) {
    const h = el as HTMLElement;
    h.style.height = '';
    h.style.opacity = '';
    h.style.overflow = '';
    h.style.transition = '';
}

// ---- Pricing ----
// Stripe flow: read from fetched order; Normal flow: read from localStorage snapshot
const cartItems = computed<any[]>(() =>
    isStripeFlow
        ? (stripeOrder.value?.items ?? [])
        : (snapshot.value?.cart ?? [])
);
const subtotal       = computed<number>(() =>
    isStripeFlow
        ? (stripeOrder.value?.totalAmount ?? 0)
        : (snapshot.value?.pricing.subtotal ?? cartStore.totalPrice)
);
const discountAmount    = computed(() => isStripeFlow ? 0 : (snapshot.value?.pricing.discount?.amount ?? 0));
const appliedCouponCode = computed(() => isStripeFlow ? null : (snapshot.value?.pricing.discount?.code ?? null));
const finalTotal        = computed(() =>
    isStripeFlow
        ? (stripeOrder.value?.totalAmount ?? 0)
        : (snapshot.value?.pricing.total ?? (subtotal.value - discountAmount.value))
);

// ---- Shipping address ----
const shippingAddr = computed(() =>
    isStripeFlow
        ? (stripeOrder.value?.shippingDetails ?? null)
        : (snapshot.value?.shippingAddress ?? null)
);
const customerEmail = computed(() =>
    isStripeFlow
        ? (stripeOrder.value?.email ?? '')
        : (snapshot.value?.customer?.email ?? authStore.user?.email ?? '')
);
</script>


<template>

    <div class="flex lg:hidden">
        <!-- Mobile version: TODO -->
    </div>

    <div class="min-h-screen bg-gray-200 py-12 px-4">
        <div class="max-w-3xl mx-auto space-y-6">

        <header class="flex flex-col items-center text-center space-y-4 py-8">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h1 class="text-3xl font-bold text-gray-900">Thank you for your order!</h1>
            <p class="text-gray-500">Your order has been received and is being processed</p>

            <div class="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
                <div class="text-left border-r border-gray-100 pr-4">
                    <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Order number</p>
                    <p class="text-sm font-semibold text-gray-900">{{ orderNumber }}</p>
                </div>
                <button @click="copyOrderNumber" class="text-gray-400 hover:text-gray-600" title="Copy order number">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                    </svg>
                </button>
            </div>

            <p class="text-sm text-gray-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Order confirmation sent to
                <span class="font-semibold text-gray-900">{{ customerEmail }}</span>
            </p>
        </header>

        <!-- Order Summary with accordion -->
        <section class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            <!-- Clickable header toggles accordion -->
            <button
                @click="toggle"
                class="w-full p-6 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
                <h2 class="text-lg font-bold text-gray-900">Order Summary</h2>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5 text-gray-400 transition-transform duration-300"
                    :class="isOpen ? 'rotate-180' : 'rotate-0'"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <!-- Accordion body -->
            <Transition
                @enter="onEnter"
                @after-enter="onAfterEnter"
                @leave="onLeave"
                @after-leave="onAfterLeave"
            >
            <div v-if="isOpen" class="p-6 space-y-6">

                <!-- Stripe flow: loading / error state -->
                <div v-if="isStripeFlow && stripeLoading" class="flex items-center gap-3 text-gray-400 text-sm py-4">
                    <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    載入訂單資料中…
                </div>
                <p v-else-if="isStripeFlow && stripeError" class="text-red-500 text-sm">{{ stripeError }}</p>

                <!-- Loop over cart items -->
                <div
                    v-else
                    v-for="item in cartItems"
                    :key="item.id"
                    class="flex gap-4"
                >
                    <div class="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        <img :src="item.img" :alt="item.name" class="w-full h-full object-cover" />
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between">
                            <h3 class="font-bold text-gray-900 text-sm">{{ item.name }}</h3>
                            <span class="font-bold text-gray-900">${{ item.subtotal.toFixed(2) }}</span>
                        </div>
                        <p v-if="item.selectedColor || item.selectedSize" class="text-xs text-gray-400 mt-1">
                            <span v-if="item.selectedColor">{{ item.selectedColor }}</span>
                            <span v-if="item.selectedColor && item.selectedSize"> | </span>
                            <span v-if="item.selectedSize">{{ item.selectedSize }}</span>
                        </p>
                        <p class="text-xs text-gray-400 font-medium">Qty: {{ item.quantity }}</p>
                    </div>
                </div>


                <!-- Totals -->
                <div class="pt-2 border-t border-gray-100 space-y-3">
                    <div class="flex justify-between text-sm text-gray-500">
                        <span>Subtotal · {{ cartItems.reduce((s, i) => s + i.quantity, 0) ?? cartStore.cartCount }} items</span>
                        <span class="text-gray-900 font-medium">${{ subtotal.toFixed(2) }}</span>
                    </div>

                    <div v-if="discountAmount > 0" class="flex justify-between text-sm text-green-600">
                        <span>Discount ({{ appliedCouponCode }})</span>
                        <span>−${{ discountAmount.toFixed(2) }}</span>
                    </div>

                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Shipping</span>
                        <span class="text-green-500 font-bold">Free</span>
                    </div>

                    <div class="flex justify-between pt-4 border-t border-gray-100 items-center">
                        <span class="text-xl font-bold text-gray-900">Total</span>
                        <span class="text-2xl font-bold text-gray-900">${{ finalTotal.toFixed(2) }}</span>
                    </div>
                </div>
            </div>
            </Transition>
        </section>

        <section class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
            <h2 class="text-lg font-bold text-gray-900">Delivery Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div class="flex gap-3">
                    <div class="text-gray-400 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                        <p class="font-bold text-gray-900 mb-1">Shipping to</p>
                        <!--
                            TODO: Replace with real checkout form data once
                            CheckoutView submits and passes it to this view.
                            Hypothesis variables: checkoutForm.fullName,
                            checkoutForm.address, checkoutForm.city,
                            checkoutForm.postalCode, checkoutForm.country
                        -->
                        <p class="text-gray-500 leading-relaxed">
                            {{ shippingAddr?.firstName }} {{ shippingAddr?.lastName }} <br>
                            {{ shippingAddr?.address }}<span v-if="shippingAddr?.apartment">, {{ shippingAddr.apartment }}</span> <br>
                            {{ shippingAddr?.city }}, {{ shippingAddr?.postcode }} <br>
                            {{ shippingAddr?.country }}
                        </p>
                    </div>
                </div>
                <div class="flex gap-3">
                    <div class="text-gray-400 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                    </div>
                    <div>
                        <p class="font-bold text-gray-900 mb-1">Shipping method</p>
                        <!--
                            TODO: Replace with real checkout form data.
                            Hypothesis variable: checkoutForm.shippingMethod
                        -->
                        <p class="text-gray-500">Standard Home Delivery</p>
                    </div>
                </div>
            </div>

            <div class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-4">
                <div class="text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                    <p class="text-indigo-900 font-bold text-sm">Estimated delivery</p>
                    <p class="text-indigo-600 font-medium text-sm mt-0.5">{{ estimatedDelivery }}</p>
                    <p class="text-indigo-400 text-[11px] mt-1">We'll send you tracking information as soon as your order ships</p>
                </div>
            </div>
        </section>

        <section class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-8">What happens next</h2>
            <div class="relative space-y-10 pl-4 border-l-2 border-gray-100 ml-3">
                <div class="relative">
                    <div class="absolute -left-[25px] top-0 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-sm ring-4 ring-green-50"></div>
                    <p class="text-sm font-bold text-gray-900">Order confirmed</p>
                    <p class="text-xs text-gray-400 mt-1">{{ orderDate }}</p>
                </div>
                <div class="relative text-gray-400">
                    <div class="absolute -left-[25px] top-0 w-4 h-4 bg-black rounded-full border-4 border-white shadow-sm"></div>
                    <p class="text-sm font-bold text-gray-900">Order processing</p>
                    <p class="text-xs text-gray-400 mt-1">We're preparing your items for shipment</p>
                </div>
                <div class="relative text-gray-300">
                    <div class="absolute -left-[25px] top-0 w-4 h-4 bg-gray-200 rounded-full border-4 border-white shadow-sm"></div>
                    <p class="text-sm font-bold">Shipped</p>
                    <p class="text-xs mt-1">You'll receive tracking information via email</p>
                </div>
            </div>
        </section>

        <button
            @click="continueShopping"
            class="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-colors"
        >
            Continue Shopping
        </button>

        </div>
    </div>
</template>