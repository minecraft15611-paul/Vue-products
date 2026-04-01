<script setup>
    import { ref, computed } from 'vue';
    import { useCartStore } from '../stores/cart';

    const cartStore = useCartStore();

// ---- User Input Bindings ----
    const searchQuery = ref('');

// ---- Define Max Price ----
    const maxPrice = ref(1000);

// ---- Default Category as All ----
    const selectedCategory = ref('All');

// ---- Define Products Stocks in Single Page ----
    const pageSize = ref(4);

// ---- Define Current Page as Page 1 ----
    const currentPage = ref(1);

// ---- Classify Each Item as Their Own Categories ----
    const categories = computed(() => {
        const list = cartStore.products.map(p => p.category);
        return ['All', ...new Set(list)];
    });

// ---- Filtered Results ----

    const filteredProducts = computed(() => {
        return cartStore.products.filter(p => {
            const title = p.title || '';
            const matchName = title.toLowerCase().includes(searchQuery.value.toLowerCase());
            const matchPrice = p.price <= maxPrice.value;
            const matchCategory = selectedCategory.value === 'All' || p.category === selectedCategory.value;
            return matchName && matchPrice && matchCategory;
        })
    })

    

// ---- Cauculate How Many Pages From Products ---- 

    const totalPages = computed(() => {
        return Math.ceil(filteredProducts.value.length / pageSize.value);
    });

// ---- Slice for Show Products in Single Page ----

    const paginatedProducts = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value;
        return filteredProducts.value.slice(start, start + pageSize.value);
    });

    const setCategory = (cat) => {
        selectedCategory.value = cat;
        currentPage.value = 1;
    };
</script>

<template>

    <div class="product-list-container ">
        
        <ul class="grid grid-cols-2 gap-3 px-4">
            <li v-for="item in paginatedProducts" :key="item.id" class="flex flex-col bg-white mb-8 rounded-xl overflow-hidden shadow-sm">
                <div class="grid grid-cols-1 p-3 h-55  rounded ">
                    <div class="flex justify-center ">
                        <img :src="item.img" class=" w-24 h-24 object-contain">
                    </div>
                    <div>
                        <p class="h-8 font-semibold ">{{ item.title }}</p>
                        <br> 
                        <div class="font-bold text-gray-600">
                            ${{ item.price }}
                        </div>

                    </div>
                    <button @click="cartStore.addToCart(item)" :disabled="item.stock === 0" class="flex justify-end mt-auto underline decoration-1 underline-offset-4 text-gray-800">
                        {{ item.stock > 0 ? 'ADD TO CART' : '×' }}
                    </button>
                </div>
            </li>
        </ul>

        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; align-items: center;">
            <button @click="currentPage--" :disabled="currentPage === 1">Prev</button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
        </div>
    </div>
</template>