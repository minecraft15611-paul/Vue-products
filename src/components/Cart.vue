<script setup>
    defineProps({
        cartItems: Array,
        totalPrice: Number
    });

    const emit  = defineEmits(['remove-item', 'clear-all']);

</script>



<template>
    <section style="margin-top: 40px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2>Shopping Cart ({{ cartItems.length }})</h2>

        <ul v-if="cartItems.length > 0">
            <li v-for="(item, index) in cartItems" :key="index" style="margin-bottom: 10px;">
                <strong>{{ item.title }}</strong> --- ${{ item.price }}
                <span> x {{ item.quantity }}</span>

                <button @click="emit('remove-item', index)">Remove</button>
            </li>
        </ul>
        <p v-else>Your cart is empty.</p>

        <hr>
        <h3>Total Amount: ${{ totalPrice }}</h3>

        <button
        v-if="cartItems.length > 0"
        @click="emit('clear-all')"
        style="background-color: #35495e; color: white;"
        >Clear All
        </button>
    </section>
</template>