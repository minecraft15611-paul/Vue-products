<script setup lang="ts">
    import { watch, ref, computed } from 'vue';
    import { useCartStore } from '../stores/cart';
    import  addToCartButton  from '../components/addToCartButton.vue'


    const cartStore = useCartStore();

// ---- Define Products Per Page ----
    const pageSize = ref<number>(4);

// ---- Define Current Page ----
    const currentPage = ref<number>(1);

// ---- Reset to page 1 whenever the filtered list changes ----
    const filteredProducts = computed(() => {
        return cartStore.filteredProducts;
    });

    watch(() => cartStore.filteredProducts, () => {
    currentPage.value = 1;
    }, { deep: true });

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

        <Transition name="page-fade" mode="out-in">
            <ul :key="currentPage + '_' + cartStore.selectedCategory + '_' + cartStore.searchQuery" class="grid grid-cols-2 content-start gap-3 px-4" style="min-height: 520px;">
                <!-- ================   mobile version   ==================== -->
                
                <li
                    v-for="item in paginatedProducts"
                    :key="item.id"
                    class="flex lg:hidden flex-col bg-white mb-8 rounded-xl overflow-hidden shadow-sm "
                >
                    <div class="grid grid-cols-1 p-3 h-55 rounded hover:bg-[#F9F9F7] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border-[0.5px] border-gray-100">
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
                        <addToCartButton :item="item"/>
                    </div>
                </li>
    
                <!-- ================   desktop version   =================== -->
                
                <li 
                    v-for="item in paginatedProducts"
                    :key="item.id"
                    class="
                        hidden lg:grid grid-cols-2 bg-white mb-8 rounded-xl overflow-hidden shadow-sm 
                        hover:scale-102 transition-all duration-300
                        "            
                >
                    <div class="flex justify-center items-center p-3 h-55 rounded hover:bg-[#F9F9F7] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border-[0.5px] border-gray-100">
                        <img :src="item.img" class="w-100  h-70 object-contain">
                    </div>
                    <div class="flex flex-col items-center justify-center  px-8">
                        <p class="h-8 mb-5 text-[10px] uppercase">
                            {{ item.title }}
                        </p>
                        <div class="font-semibold mb-10">
                            {{ item.name }}
                        </div>
                        <div class="flex justify-center font-medium text-blue-600">
                            ${{ item.price }}
                        </div>
                        <addToCartButton :item="item" 
                            class="w-full border-[0.5px] border-gray-300 
                                 text-gray-500 py-4 px-10 rounded-full text-[10px] 
                                   tracking-[0.2em] uppercase font-light transition-all 
                                   duration-500 ease-out hover:bg-gray-50 hover:border-gray-500 
                                   hover:text-gray-800 hover:tracking-[0.25em] active:scale-[0.98]" 
                        />
                    </div>
                </li>
            </ul>

        </Transition>

        <!-- Empty State -->
        <div v-if="filteredProducts.length === 0" class="flex justify-center items-center py-16 text-gray-400 text-sm tracking-wide">
            No products found.
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between gap-2 px-2 pb-4">

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

<style scoped>

@media (min-width: 1024px) {
    
    .page-fade-enter-active,
    .page-fade-leave-active {
        transition: opacity 0.3s ease;
    }

    .page-fade-enter-from,
    .page-fade-leave-to {
        opacity: 0;
    }
}
</style>