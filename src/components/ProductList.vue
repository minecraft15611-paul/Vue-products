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
    <header>
        <nav class="w-full border-b-3 border-gray-300 py-2">
            <div class="container mx-auto flex justity-between ">
                <div class="flex items-center space-x-3 w-1/3">
                    <a href="#"><i class="fa-brands fa-facebook duration-300 transition hover:scale-110"></i></a>
                    <a href="#"><i class="fa-brands fa-instagram duration-300 transition hover:scale-110"></i></a>
                    <a href="#"><i class="fa-solid fa-magnifying-glass duration-300 transition hover:scale-110"></i></a>
                </div>
                <div class="w-1/3 text-center">
                    <span class="flex justify-center text-sm text-gray-400 uppercase tracking-wide">Free Shipping This Week Order Over - $55</span>
                </div>
                <div class="flex justify-end w-1/3">
                    <select name="language" id="language-select" class="flex justify-end">
                        <option value="eng">ENGLISH</option>
                        <option value="zh-Tw">繁體中文</option>
                    </select>
                </div>
            </div>
        </nav>
        <div class="flex justify-between p-5 items-center border-b-3 border-gray-300">
            <div class="flex  items-center w-1/4">
                <h1 class="font-bold px-8 text-4xl">Lemon Tree</h1>
            </div>
            <div class="flex justify-center w-1/2">
                <input type="text" v-model="searchQuery" placeholder="Enter your products name..." class="w-full border border-gray-300 rounded-lg px-3 py-2 self-center focus:outline-none focus:border-pink-400">
                
            </div>
            <div class="flex justify-end w-1/4">
                <div class="px-8 space-x-3 ">
                    <i class="fa-regular fa-user text-2xl duration-300 transition hover:scale-110"></i>
                    <i class="fa-regular fa-heart text-2xl duration-300 transition hover:scale-110"></i>
                    <i class="fa-solid fa-bag-shopping text-2xl duration-300 transition hover:scale-110"></i>
                </div>
            </div>
        </div>
    </header>

    <div class="product-list-container ">
        <div class="flex justify-center gap-3 my-5 ">
            <button 
                v-for="cat in categories" :key="cat" 
                @click="setCategory(cat)"
                :style="{ backgroundColor: selectedCategory === cat ? '#42b983' : '#eee', color: selectedCategory === cat ? 'white' : 'black' }"
                class="font-semibold border-none px-3 rounded-md tracking-wide duration-300 transition hover:scale-110"
            >
                {{ cat }}
            </button>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label>Max Price: ${{ maxPrice }}</label><br>
            <input type="range" v-model.number="maxPrice" min="0" max="1000" step="50">
            <br>
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