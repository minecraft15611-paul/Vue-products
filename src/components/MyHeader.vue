<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useCartStore } from '../stores/cart';
    import { RouterLink } from 'vue-router';
    import cartIcon from '../components/cartIcon.vue';
    import { useRouter } from 'vue-router';

    const cartStore = useCartStore();

    const router = useRouter();

    const isVisible = ref(true);
    const lastScrollY = ref(0);

    const goToProducts = (cat: string) => {
    cartStore.setCategory(cat);
    router.push('/ProductsList');
    };

    const goHome = () => {
        cartStore.goHome();
        router.push('/');
    };

// ---- Hamburger Menu ----
    const mobileMenuOpen = ref<boolean>(false);

// ---- All category/search state lives in the store ----
// cartStore.categories       → computed list of categories
// cartStore.selectedCategory → currently active category
// cartStore.searchQuery      → search input (v-model)
// cartStore.setCategory(cat) → updates selectedCategory

    const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY.value && currentScrollY > 150) {
        isVisible.value = false;
    } else {
        isVisible.value = true;
    }
    lastScrollY.value = currentScrollY;
    };

    onMounted(() => {
        window.addEventListener('scroll', handleScroll);
    });

</script>


<template>

    <header class="sticky top-0 z-50 shadow-md bg-white w-full relative">

      <!-- =============== Top Bar =============== -->
      
      <nav class="hidden lg:flex w-full border-b border-gray-200 py-2 px-4">
        <div class="container mx-auto flex items-center justify-between">

          <!-- =============== Social Icons (desktop only) =============== -->
          
          <div class="hidden lg:flex items-center space-x-3 w-1/3">
            <a href="#"><i class="fa-brands fa-facebook transition duration-300 hover:scale-125 hover:text-blue-600"></i></a>
            <a href="#"><i class="fa-brands fa-instagram transition duration-300 hover:scale-125 hover:text-pink-500"></i></a>
          </div>

          <!-- =============== Promo Text (desktop only) =============== -->
          
          <div class="hidden lg:flex justify-center w-1/3">
            <span class="text-xs text-gray-400 uppercase tracking-widest">Free Shipping This Week — Orders Over $1</span>
          </div>

          <!-- =============== Language Selector (always visible) =============== -->
          
          <div class="hidden lg:flex  justify-end w-full lg:w-1/3">
            <select name="language" id="language-select"
              class="text-xs text-gray-500 border-none bg-transparent focus:outline-none cursor-pointer">
              <option value="eng">ENGLISH</option>
              <option value="zh-Tw">繁體中文</option>
            </select>
          </div>

        </div>
      </nav>

      <div class="block lg:hidden sticky top-0 z-50">
        <div class="bg-black text-white text-center py-2 text-xs tracking-widest uppercase">
            Free Shipping on orders over $1
        </div>
      </div>

      <!-- =============== Main Header Row =============== -->

      <div class="flex items-center justify-between px-5 py-2 border-b border-gray-200">



        <!-- =============== LEFT: Hamburger (mobile only) =============== -->

        <div class="lg:hidden flex items-center w-1/4">
          <button
            class="text-2xl focus:outline-none transition duration-300 hover:scale-110"
            @click="mobileMenuOpen = !mobileMenuOpen"
            aria-label="Toggle menu"
          >
            <i :class="mobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
          </button>
        </div>

        <!-- =============== CENTER: Logo =============== -->
        
        <div class="flex justify-center w-1/2 lg:w-1/4">
          <h1 @click="goHome()" class="font-bold text-3xl lg:text-4xl tracking-tight cursor-pointer">LemonTree</h1>
        </div>

        <!-- =============== CENTER: Search Bar (desktop only) =============== -->

        <div class="hidden lg:flex justify-center w-1/2 px-6">
          <div class="relative w-full max-w-lg"> 
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>

            <input
              type="text"
              v-model="cartStore.tempInput"
              placeholder="Search products..."
              class="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm 
         transition-all duration-300 
         focus:outline-none 
         focus:border-black/70 focus:ring-4 focus:ring-black/10"
            />
          </div>
        </div>

        <!-- =============== RIGHT: Icons =============== -->

        <div class="flex justify-end items-center w-1/4 space-x-4 px-2">

          <!-- =============== Desktop icons =============== -->

          <div class="hidden lg:flex items-center space-x-4">
            <i class="fa-regular fa-user text-xl cursor-pointer transition duration-300 hover:scale-125"></i>
            <i class="fa-regular fa-heart text-xl cursor-pointer transition duration-300 hover:scale-125"></i>
            <router-link to="/ShoppingCart">
              <cartIcon :cartCount="cartStore.cartCount"  class="cursor-pointer transition duration-300 hover:scale-125"/>
            </router-link>
          </div>

          <!-- =============== Mobile: Cart icon only =============== -->

          <router-link to="/ShoppingCart" class="block lg:hidden">
            <cartIcon :cartCount="cartStore.cartCount" />
          </router-link>
        </div>

      </div>

      <!-- =============== Mobile Dropdown Menu =============== -->

      <transition name="slide-down">
        <div v-if="mobileMenuOpen" class="lg:hidden absolute left-0 right-0 bg-white border-b border-gray-200 px-5 py-4 space-y-4 z-50">

          <!-- =============== Mobile Search =============== -->

          <input
            type="text"
            v-model="cartStore.tempInput"
            placeholder="Search products..."
            class="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm 
            transition-all duration-300 
            focus:outline-none 
          focus:border-black/70 focus:ring-4 focus:ring-black/10"
          />

          <!-- =============== Mobile Category Buttons =============== -->

          <div class="flex items-center flex-col gap-1">


            <button
              @click="goHome(); mobileMenuOpen = false"
              :class="[
                'relative mx-4 py-2 w-fit text-xs font-medium tracking-[0.2em] uppercase group',
              cartStore.selectedCategory === 'Home' ? 'text-black border-b border-black' : 'text-black/60'
              ]"
            >
              Home
            </button>

            <button
              @click="goToProducts('All') ; mobileMenuOpen = false"
              :class="[
                'relative mx-4 py-2 w-fit text-xs font-medium tracking-[0.2em] uppercase group',
                cartStore.selectedCategory === 'All' ? 'text-black border-b border-black' : 'text-black/60'
              ]"
            >
              All
            </button>

            <button
              v-for="cat in cartStore.categories"
              :key="cat"
              @click="goToProducts(cat); mobileMenuOpen = false"
              :class="[
              'relative mx-4 py-2 w-fit text-xs font-medium tracking-[0.2em] uppercase group',
              cartStore.selectedCategory === cat ? 'text-black border-b border-black' : 'text-black/60'  
              ]"
            >
              {{ cat }}
            </button>
          </div>

          <!-- =============== Mobile Social Icons =============== -->

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

    <!-- =============== Desktop Category Nav =============== -->

    <div class="sticky z-49 bg-white border-b border-gray-50 transition-transform duration-500 ease-in-out hidden lg:flex justify-center gap-2 py-4"
        :class="isVisible ? 'translate-y-0' : '-translate-y-full'"
        style="top: 97px;"
    >


      <button
        @click="goHome()"
        :class="[
          'relative px-4 py-2 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 group',
          cartStore.selectedCategory === 'Home' ? 'text-black border-b border-black' : 'text-black/60 hover:text-black'
        ]"
      >
        Home
            <span 
              v-show="cartStore.selectedCategory !== 'Home'"
              class="absolute left-0 bottom-0 w-0 h-px bg-black transition-all duration-500 group-hover:w-full"
            ></span>
      </button>

      <button
        @click="goToProducts('All')"
        :class="[
          'relative px-4 py-2 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 group',
           cartStore.selectedCategory === 'All' ? 'text-black border-b border-black' : 'text-black/60 hover:text-black'
        ]"
      >
        All
        <span 
          v-show="cartStore.selectedCategory !== 'All'"
          class="absolute left-0 bottom-0 w-0 h-px bg-black transition-all duration-500 group-hover:w-full"
        ></span>
      </button>

      <button
        v-for="cat in cartStore.categories"
        :key="cat"
        @click="goToProducts(cat)"
        :class="[
          'relative px-4 py-2 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 group',
          cartStore.selectedCategory === cat ? 'text-black border-b border-black' : 'text-black/60 hover:text-black'
        ]"
      >
        {{ cat }}
        <span 
          v-show="cartStore.selectedCategory !== cat"
          class="absolute left-0 bottom-0 w-0 h-px bg-black transition-all duration-500 group-hover:w-full"
        ></span>
      </button>
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