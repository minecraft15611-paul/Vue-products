<script setup>
    import { ref } from 'vue';
    import { useCartStore } from '../stores/cart';
    import { RouterLink } from 'vue-router';
    import CartIcon from '../components/cartIcon.vue';

    const cartStore = useCartStore();

// ---- Hamburger Menu ----
    const mobileMenuOpen = ref(false);

// ---- All category/search state lives in the store ----
// cartStore.categories       → computed list of categories
// cartStore.selectedCategory → currently active category
// cartStore.searchQuery      → search input (v-model)
// cartStore.setCategory(cat) → updates selectedCategory

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

        <!-- LEFT: Hamburger (mobile only) -->
        <div class="lg:hidden flex items-center w-1/4">
          <button
            class="text-2xl focus:outline-none transition duration-300 hover:scale-110"
            @click="mobileMenuOpen = !mobileMenuOpen"
            aria-label="Toggle menu"
          >
            <i :class="mobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
          </button>
        </div>

        <!-- CENTER: Logo -->
        <div class="flex justify-center w-1/2 lg:w-1/4">
          <h1 @click="cartStore.goHome()" class="font-bold text-3xl lg:text-4xl tracking-tight cursor-pointer">LemonTree</h1>
        </div>

        <!-- CENTER: Search Bar (desktop only) -->
        <div class="hidden lg:flex justify-center w-1/2 px-6">
          <input
            type="text"
            v-model="cartStore.searchQuery"
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
            <router-link to="/ShoppingCart">
              <CartIcon :cartCount="cartStore.cartCount"  class="cursor-pointer transition duration-300 hover:scale-125"/>
            </router-link>
          </div>

          <!-- Mobile: Cart icon only -->
          <router-link to="/ShoppingCart" class="block lg:hidden">
            <CartIcon :cartCount="cartStore.cartCount" />
          </router-link>
        </div>

      </div>

      <!-- ── Mobile Dropdown Menu ── -->
      <transition name="slide-down">
        <div v-if="mobileMenuOpen" class="lg:hidden absolute left-0 right-0 bg-white border-b border-gray-200 px-5 py-4 space-y-4 z-50">

          <!-- Mobile Search -->
          <input
            type="text"
            v-model="cartStore.searchQuery"
            placeholder="Search products..."
            class="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-400 transition"
          />

          <!-- Mobile Category Buttons -->
          <div class="flex flex-col gap-1">

            <!-- Home button -->
            <button
              @click="cartStore.goHome(); mobileMenuOpen = false"
              :class="[
                'text-left font-semibold px-3 py-2 rounded-lg tracking-wide transition duration-200 hover:bg-gray-100',
                cartStore.selectedCategory === 'Home' ? 'text-pink-500 bg-pink-50' : ''
              ]"
            >
              Home
            </button>

            <button
              @click="cartStore.setCategory('All') ; mobileMenuOpen = false"
              :class="[
                'text-left font-semibold px-3 py-2 rounded-lg tracking-wide transition duration-200 hover:bg-gray-100',
                '...classes...', cartStore.selectedCategory === 'All' ? 'text-pink-500 bg-pink-50' : ''
              ]"
            >
              All
            </button>

            <button
              v-for="cat in cartStore.categories"
              :key="cat"
              @click="cartStore.setCategory(cat); mobileMenuOpen = false"
              :class="[
                'text-left font-semibold px-3 py-2 rounded-lg tracking-wide transition duration-200 hover:bg-gray-100',
                cartStore.selectedCategory === cat ? 'text-pink-500 bg-pink-50' : ''
              ]"
            >
              {{ cat }}
            </button>
          </div>

          <!-- Mobile Social Icons -->
          <div class="flex justify-between items-center space-x-4 pt-2 border-t border-gray-300">
            <div class="flex items-center space-x-4">
              <a href="#"><i class="fa-brands fa-facebook text-lg transition hover:text-blue-600"></i></a>
              <a href="#"><i class="fa-brands fa-instagram text-lg transition hover:text-pink-500"></i></a>
            </div>
            <div class="flex items-center space-x-4">
              <i class="fa-regular fa-user text-lg cursor-pointer"></i>
              <i class="fa-regular fa-heart text-lg cursor-pointer"></i>
            </div>
          </div>

        </div>
      </transition>

    </header>

    <!-- ── Desktop Category Nav ── -->
    <div class="hidden lg:flex justify-center gap-2 my-4">

      <!-- Home button -->
      <button
        @click="cartStore.goHome()"
        class="font-semibold px-4 py-1 rounded-full text-sm tracking-wide transition duration-300 hover:scale-105 hover:bg-gray-100"
      >
        Home
      </button>

      <button
        @click="cartStore.setCategory('All') ; mobileMenuOpen = false"
        :class="[
          'text-left font-semibold px-3 py-2 rounded-lg tracking-wide transition duration-200 hover:bg-gray-100',
          '...classes...', cartStore.selectedCategory === 'All' ? 'text-pink-500 bg-pink-50' : ''
        ]"
      >
        All
      </button>

      <button
        v-for="cat in cartStore.categories"
        :key="cat"
        @click="cartStore.setCategory(cat)"
        :class="[
          'font-semibold px-4 py-1 rounded-full text-sm tracking-wide transition duration-300 hover:scale-105 hover:bg-gray-100',
          cartStore.selectedCategory === cat ? 'text-pink-500 bg-pink-50' : '' 
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