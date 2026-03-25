<script setup>
    import { ref, computed } from 'vue';
    import { useCartStore } from '../stores/cart';

    const cartStore = useCartStore();

// ---- User Input Bindings ----
    const searchQuery = ref('');

// ---- Define Max Price ----
    const maxPrice = ref(1000);

// ---- Default Catagory as All ----
    const selectedCategory = ref('All');

// ---- Define Products Stocks in Single Page ----
    const pageSize = ref(3);

// ---- Define Current Page as Page 1 ----
    const currentPage = ref(1);

// ---- Classify Each Item as Their Own Catagories ----
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
    <div class="product-list-container">
        <h2>Products List</h2>
        <div style="margin-bottom: 20px;">
            <label>Max Price: ${{ maxPrice }}</label><br>
            <input type="range" v-model.number="maxPrice" min="0" max="1000" step="50">
            <br>
            <input type="text" v-model="searchQuery" placeholder="Search products...">
        </div>

        <div style="margin: 20px 0; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button 
                v-for="cat in categories" :key="cat" 
                @click="setCategory(cat)"
                :style="{ backgroundColor: selectedCategory === cat ? '#42b983' : '#eee', color: selectedCategory === cat ? 'white' : 'black' }"
            >
                {{ cat }}
            </button>
        </div>

        <ul>
            <li v-for="item in paginatedProducts" :key="item.id">
                <img :src="item.image" style="width: 50px; height: 50px; object-fit: contain;">
                <div>
                    <strong>{{ item.title }}</strong> -- ${{ item.price }}
                    <span> (Stock: {{ item.stock }})</span>
                </div>
                <button @click="cartStore.addToCart(item)" :disabled="item.stock === 0">
                    {{ item.stock > 0 ? 'Add to Cart' : 'Out of Stock' }}
                </button>
            </li>
        </ul>

        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; align-items: center;">
            <button @click="currentPage--" :disabled="currentPage === 1">Prev</button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
        </div>
    </div>
</template>