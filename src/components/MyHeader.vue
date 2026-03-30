<script setup>
    import { ref, computed } from 'vue';
    import { useCartStore } from '../stores/cart';

    const cartStore = useCartStore();

// ---- Hamburger Menu ----
    const mobileMenuOpen = ref(false);

// ---- User Input Bindings ----
    const searchQuery = ref('');

// ---- Default Category as All ----
    const selectedCategory = ref('');

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

    const setCategory = (cat) => {
        selectedCategory.value = cat;
        currentPage.value = 1;
    };
</script>

<template>
  <div>
    <header class="sticky top-0 z-50 shadow-md bg-white w-full relative">

      <!-- ── Top Bar ── -->
      <nav class="w-full border-b border-gray-200 py-2 px-4">
        <div class="container mx-auto flex items-center justify-between">

          <!-- Social Icons (desktop only) -->
          <div class="hidden lg:flex items-center space-x-3 w-1/3">
            <a href="#"><i class="fa-brands fa-facebook transition duration-300 hover:scale-125 hover:text-blue-600"></i></a>
            <a href="#"><i class="fa-brands fa-instagram transition duration-300 hover:scale-125 hover:text-pink-500"></i></a>
            <a href="#"><i class="fa-solid fa-magnifying-glass transition duration-300 hover:scale-125"></i></a>
          </div>

          <!-- Promo Text (desktop only) -->
          <div class="hidden lg:flex justify-center w-1/3">
            <span class="text-xs text-gray-400 uppercase tracking-widest">Free Shipping This Week — Orders Over $1</span>
          </div>

          <!-- Language Selector (always visible) -->
          <div class="flex justify-end w-full lg:w-1/3">
            <select name="language" id="language-select"
              class="text-xs text-gray-500 border-none bg-transparent focus:outline-none cursor-pointer">
              <option value="eng">ENGLISH</option>
              <option value="zh-Tw">繁體中文</option>
            </select>
          </div>

        </div>
      </nav>

      <!-- ── Main Header Row ── -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">

        <!-- LEFT: Hamburger (mobile) / Social icons placeholder (desktop handled in top bar) -->
        <div class="flex items-center w-1/4">
          <!-- Hamburger — mobile only -->
          <button
            class="lg:hidden text-2xl focus:outline-none transition duration-300 hover:scale-110"
            @click="mobileMenuOpen = !mobileMenuOpen"
            aria-label="Toggle menu"
          >
            <i :class="mobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
          </button>
        </div>

        <!-- CENTER: Logo -->
        <div class="flex justify-center w-1/2 lg:w-1/4">
          <h1 class="font-bold text-3xl lg:text-4xl tracking-tight">LemonTree</h1>
        </div>

        <!-- CENTER: Search Bar (desktop only) -->
        <div class="hidden lg:flex justify-center w-1/2 px-6">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search products..."
            class="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-400 transition"
          />
        </div>

        <!-- RIGHT: Icons -->
        <div class="flex justify-end items-center w-1/4 space-x-4 px-2">
          <!-- Desktop icons -->
          <div class="hidden lg:flex items-center space-x-4">
            <i class="fa-regular fa-user text-xl cursor-pointer transition duration-300 hover:scale-125"></i>
            <i class="fa-regular fa-heart text-xl cursor-pointer transition duration-300 hover:scale-125"></i>
            <i class="fa-solid fa-bag-shopping text-xl cursor-pointer transition duration-300 hover:scale-125"></i>
          </div>

          <!-- Mobile: Cart icon only -->
           <div class="block lg:hidden ">
               <i class="fa-solid fa-bag-shopping text-xl"></i>
           </div>
        </div>

      </div>

      <!-- ── Mobile Dropdown Menu ── -->
      <transition name="slide-down">
        <div v-if="mobileMenuOpen" class="lg:hidden absolute left-0 right-0 bg-white border-b border-gray-200 px-5 py-4 space-y-4">

          <!-- Mobile Search -->
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search products..."
            class="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-400 transition"
          />

          <!-- Mobile Category Buttons -->
          <div class="flex flex-col gap-1">
            <button
              class="text-left font-semibold px-3 py-2 rounded-lg tracking-wide transition duration-200 hover:bg-gray-100"
              @click="mobileMenuOpen = false"
            >
              Home
            </button>
            <button
              v-for="cat in categories"
              :key="cat"
              @click="setCategory(cat); mobileMenuOpen = false"
              :class="[
                'text-left font-semibold px-3 py-2 rounded-lg tracking-wide transition duration-200 hover:bg-gray-100',
                selectedCategory === cat ? 'text-pink-500 bg-pink-50' : ''
              ]"
            >
              {{ cat }}
            </button>
          </div>

          <!-- Mobile Social Icons -->
          <div class="flex items-center space-x-4 pt-2 border-t border-gray-100">
            <a href="#"><i class="fa-brands fa-facebook text-lg transition hover:text-blue-600"></i></a>
            <a href="#"><i class="fa-brands fa-instagram text-lg transition hover:text-pink-500"></i></a>
            <i class="fa-regular fa-user text-lg cursor-pointer"></i>
            <i class="fa-regular fa-heart text-lg cursor-pointer"></i>
          </div>

        </div>
      </transition>

    </header>

    <!-- ── Desktop Category Nav ── -->
    <div class="hidden lg:flex justify-center gap-2 my-4">
      <button
        @click=""
        class="font-semibold px-4 py-1 rounded-full text-sm tracking-wide transition duration-300 hover:scale-105 hover:bg-gray-100"
      >
        Home
      </button>
      <button
        v-for="cat in categories"
        :key="cat"
        @click="setCategory(cat)"
        :class="[
          'font-semibold px-4 py-1 rounded-full text-sm tracking-wide transition duration-300 hover:scale-105 hover:bg-gray-100',
          selectedCategory === cat ? 'text-pink-500 bg-pink-50' : ''
        ]"
      >
        {{ cat }}
      </button>
    </div>

  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>