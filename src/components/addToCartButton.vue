<script setup lang="ts">
import { useCartStore } from '../stores/cart';
import type { Product } from '../stores/cart';

const cartStore = useCartStore();

const props = defineProps<{
    item: Product
}>();

</script>


<template>
    <button
        @click="cartStore.addToCart(props.item)"
        :disabled="props.item.stock === 0"
        class="
            flex justify-end mt-auto px-2 py-1 rounded text-gray-800 
            transition-all ease-out duration-300 active:scale-90 active:text-white 
            active:bg-blue-950 active:shadow-inner
            "
    >
    {{ props.item.stock > 0 ? 'ADD TO CART' : '×' }}
    </button>
</template>