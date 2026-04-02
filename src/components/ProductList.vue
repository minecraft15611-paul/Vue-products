<script setup>
    import { ref, computed } from 'vue';
    import { useCartStore } from '../stores/cart';


    const cartStore = useCartStore();

// ---- Define Products Per Page ----
    const pageSize = ref(4);

// ---- Define Current Page ----
    const currentPage = ref(1);

// ---- Reset to page 1 whenever the filtered list changes ----
    const filteredProducts = computed(() => {
        currentPage.value = 1;
        return cartStore.filteredProducts;
    });

// ---- Calculate Total Pages ----
    const totalPages = computed(() => {
        return Math.ceil(filteredProducts.value.length / pageSize.value) || 1;
    });

// ---- Paginated Slice ----
    const paginatedProducts = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value;
        return filteredProducts.value.slice(start, start + pageSize.value);
    });
</script>

<template>
    <div class="product-list-container">

        <ul class="grid grid-cols-2 content-start gap-3 px-4" style="min-height: 520px;">
            <li
                v-for="item in paginatedProducts"
                :key="item.id"
                class="flex flex-col bg-white mb-8 rounded-xl overflow-hidden shadow-sm"
            >
                <div class="grid grid-cols-1 p-3 h-55 rounded">
                    <div class="flex justify-center">
                        <img :src="item.img" class="w-24 h-24 object-contain">
                    </div>
                    <div>
                        <p class="h-8 font-semibold">{{ item.title }}</p>
                        <br>
                        <div class="font-bold text-gray-600">
                            ${{ item.price }}
                        </div>
                    </div>
                    <button
                        @click="cartStore.addToCart(item)"
                        :disabled="item.stock === 0"
                        class="flex justify-end mt-auto underline decoration-1 underline-offset-4 text-gray-800"
                    >
                        {{ item.stock > 0 ? 'ADD TO CART' : '×' }}
                    </button>
                </div>
            </li>
        </ul>

        <!-- Empty State -->
        <div v-if="filteredProducts.length === 0" class="flex justify-center items-center py-16 text-gray-400 text-sm tracking-wide">
            No products found.
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between gap-2  px-2 pb-4">

            <!-- Prev -->
            <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-xs uppercase tracking-widest text-gray-500 transition-all active:scale-95"
                :class="currentPage === 1
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-gray-900 hover:text-white hover:border-gray-900'"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
            </button>

            <!-- Page Indicator -->
            <span class="text-xs text-gray-400 whitespace-nowrap px-2">
                {{ currentPage }} / {{ totalPages }}
            </span>

            <!-- Next -->
            <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-xs uppercase tracking-widest text-gray-500 transition-all active:scale-95"
                :class="currentPage === totalPages
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-gray-900 hover:text-white hover:border-gray-900'"
            >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>

        </div>
    </div>
</template>