<script setup>
    import { useCartStore } from '../stores/cart'

    const cartStore = useCartStore();

</script>



<template>
    <section style="margin-top: 40px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2>Shopping Cart ({{ cartStore.cartCount }})</h2>

        <ul v-if="cartStore.cart.length > 0">
            <li v-for="(item, index) in cartStore.cart" :key="index" style="margin-bottom: 10px;">
                <strong>{{ item.title }}</strong> --- ${{ item.price }}
                <span> x {{ item.quantity }}</span>
                <button @click="cartStore.removeFromCart(index)">Remove</button>
            </li>
        </ul>
        <p v-else>Your cart is empty.</p>

        <hr>
        <h3>Total Amount: ${{ cartStore.totalPrice }}</h3>

        <button
        v-if="cartStore.cart.length > 0"
        @click="cartStore.clearCart()"
        style="background-color: #35495e; color: white;"
        >Clear All
        </button>
    </section>
</template>