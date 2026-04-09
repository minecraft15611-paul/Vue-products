<script setup lang="ts">
import { useCartStore } from '../stores/cart';
import type { Product } from '../stores/cart';

const cartStore = useCartStore();

const props = defineProps<{
    item: Product
}>();

const emit = defineEmits(['click-buy']);

</script>


<template>
    <button
        @click="emit('click-buy')"
        :disabled="props.item.stock === 0"
        class="flex cursor-pointer justify-center w-full bg-black text-white py-3 px-6 text-sm font-medium tracking-widest uppercase hover:scale-101 transition-all duration-300"
    >
    {{ props.item.stock > 0 ? 'ADD TO BAG' : 'OUT OF STOCK' }}
    </button>
</template>