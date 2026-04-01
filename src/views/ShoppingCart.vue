<script setup>
    import { useCartStore } from '../stores/cart'

    const cartStore = useCartStore();

</script>

<template>
    <div class="flex flex-col gap-6 p-6 rounded-3xl">
        <div class="font-bold ">ShoppingCart</div>

        <div>
            <ul v-if="cartStore.cart.length > 0">
                <li v-for="(item, index) in cartStore.cart" :key="index" class="flex items-center gap-4">
                    <img src="..." class="w-16 h-16 rounded-xl object-cover" :alt="item.title">
                    <div class="flex-1">
                        <p class="text-blue-400 italic text-sm">{{ item.category }}</p>
                        <h3 class="font-bold">{{ item.title }}</h3>
                        <p class="font-semibold">${{ item.price }}</p>
                    </div>
                </li>
            </ul>
            <p v-else>Your cart is empty.</p>
        </div>

        <div class="flex justify-between">
            <div class="text-gray-600">Subtotal</div>
            <div class="text-blue-500">Price Here</div>
        </div>

        <div class="flex justify-between">
            <div class="text-gray-600">Shipping</div>
            <div class="text-blue-500">Price Here</div>
        </div>

        <hr class="text-gray-300 ">

        <div class="flex justify-between">
            <div class="font-bold">Total</div>
            <div class="text-blue-500">Price Here</div>
        </div>
                <button
        v-if="cartStore.cart.length > 0"
        @click="cartStore.clearCart()"
        style="background-color: #35495e; color: white;"
        >Clear All
        </button>
    </div>
</template>