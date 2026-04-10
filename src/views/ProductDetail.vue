<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import buyButton from '../components/buyButton.vue';
import cartIcon from '../components/cartIcon.vue';
import MyFooter from '../components/MyFooter.vue';
import TheToast from '../components/TheToast.vue';
import MyHeader from '../components/MyHeader.vue';

    const route = useRoute();
    const router = useRouter();
    const cartStore = useCartStore();
    const imageLoaded = ref<boolean>(false);
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

    // ---- Fetch products on refresh/direct URL if store is empty ----
    onMounted(() => {
        if (cartStore.products.length === 0) {
            cartStore.fetchProducts();
        }
    });

    const productId = Number(route.params.id);

    const product = computed(() => {
        return cartStore.products.find(item => item.id === productId);
    });

    // ---- Use watch so selectedColor updates after async fetch ----
    const selectedColor = ref('');
    watch(product, (p) => {
        if (p && !selectedColor.value) {
            selectedColor.value = p.colors?.[0]?.name ?? '';
        }
    }, { immediate: true });

    const selectedSize = ref<string | null>(null);

    const errorMessage = ref<string>('');

    // ---- computed so description/material populate after fetch ----
    const items = computed(() => [
        {
            title: 'DESCRIPTION',
            content: product.value?.description ?? 'No description available.'
        },
        {
            title: 'MATERIALS & CARE',
            content: product.value?.material ?? 'No materials info available.'
        }
    ]);

    const activeIndexes = ref<Set<number>>(new Set());

    const toggle = (index: number) => {
        if (activeIndexes.value.has(index)) {
            activeIndexes.value.delete(index);
        } else {
            activeIndexes.value.add(index);
        }
        // Trigger reactivity
        activeIndexes.value = new Set(activeIndexes.value);
    };

    const handleAddToCart = () => {
        if (!selectedSize.value) {
            errorMessage.value = 'required';
            return;
        }
        errorMessage.value = '';
        cartStore.addToCart(product.value!);
    };

    const randomProducts = computed(() => {
    return [...cartStore.products] 
        .sort(() => 0.5 - Math.random()) 
        .slice(0, 4); 
    });

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
    <TheToast />

    <MyHeader />


    <div>
        <div v-if="product" class="mx-auto py-8 flex flex-col lg:grid lg:grid-cols-12 lg:gap-12">

            <!-- Product Image -->
            <div class="lg:col-span-7 w-full px-6 lg:px-0">
                <img :src="product.img" :alt="product.title" class="w-full max-h-[420px] lg:max-h-none lg:h-full object-contain">
            </div>
 
            <!-- Product Info -->
            <div class="lg:col-span-4 flex flex-col px-6 lg:px-0 mt-6 lg:mt-0">
 
                <!-- Name + Price -->
                <div class="flex justify-between items-start mb-8 lg:mb-20 lg:gap-20">
                    <div class="text-base lg:text-lg tracking-wider text-gray-900 uppercase">
                        {{ product.name }}
                    </div>
                    <div class="text-lg lg:text-xl tracking-wide text-gray-900">
                        ${{ product.price }}
                    </div>
                </div>
 
                <!-- Color Selector -->
                <div class="mb-8 lg:mb-10">
                    <div class="mb-5">
                        <p class="text-xs font-bold tracking-widest uppercase mb-4">
                            Color <span class="ml-2 font-normal text-gray-500">{{ selectedColor }}</span>
                        </p>
                    </div>
                    <div   div class="flex items-center space-x-4">
                    <button 
                        v-for="color in product.colors" 
                        :key="color.name"
                        @click="selectedColor = color.name"
                        class="relative flex items-center justify-center w-8 h-8 rounded-full transition-all"
                        :class="[selectedColor === color.name ? 'ring-1 ring-black ring-offset-2' : '']"
                    >
                        <span 
                            class="w-6 h-6 rounded-full border border-gray-100" 
                            :style="{ backgroundColor: color.hex }"
                        >
                        </span>
                    </button>
                    </div>
                </div>
    
                <!-- Size Selector -->
                <div class="flex items-center justify-between mb-4">
                    <p class="text-xs font-bold tracking-widest uppercase">
                        Size <span class="ml-2 font-normal text-gray-500">{{ selectedSize }}</span>
                    </p>
                    <a href="#" class="text-xs font-bold tracking-widest uppercase underline decoration-1 underline-offset-4">
                        Size Guide
                    </a>
                </div>
                <div class="flex flex-wrap items-center gap-2 mb-4">
                    <button 
                        v-for="size in product.sizes" 
                        :key="size"
                        @click="selectedSize = size; errorMessage= ''"
                        :class="[selectedSize === size ? 'border-black border-2' : 'border-gray-300']"
                        class="w-16 h-8 border text-xs tracking-widest uppercase">
                        {{ size }}
                    </button>
                </div>
 
                <!-- Buy Button + Error -->
                <div class="flex flex-col w-full">
                    <Transition
                        enter-active-class="transition-all duration-200 ease-out"
                        enter-from-class="opacity-0 max-h-0 mb-0"
                        enter-to-class="opacity-100 max-h-10 mb-4"
                        leave-active-class="transition-all duration-150 ease-in"
                        leave-from-class="opacity-100 max-h-10 mb-4"
                        leave-to-class="opacity-0 max-h-0 mb-0"
                    >
                    <div v-if="errorMessage" class="mb-3 text-[#c00] text-center text-[15px] overflow-hidden">
                        Please Select Size
                    </div>
                    </Transition>
                    <buyButton :item="product" @click-buy="handleAddToCart" />
                </div>
 
                <!-- Accordion -->
                <div class="mt-2">   
                    <div v-for="(item, index) in items" :key="index" class="border-b border-gray-200">
                            <button 
                                @click="toggle(index)"
                                :aria-expanded="activeIndexes.has(index)"
                                class="flex items-center justify-between w-full py-6 text-left group transition-colors hover:bg-gray-50/50 focus:outline-none"
                            >
                                <span class="text-[13px] font-medium tracking-widest uppercase text-black">
                                    {{ item.title }}
                                </span>
                                
                                <svg 
                                    class="w-4 h-4 transition-transform duration-300"
                                    :class="{ 'rotate-180': activeIndexes.has(index) }"
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
    
                            <div 
                                class="grid transition-all duration-500 ease-in-out" 
                                :class="activeIndexes.has(index) ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0'"
                            >
                                <div class="overflow-hidden">
                                    <div class="pb-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                        {{ item.content }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="border-t border-gray-200"></div>
                    </div>
    
                </div>
            </div>
    
            <div v-else-if="cartStore.isLoading" class="text-center py-20">
                <p class="text-gray-400 animate-pulse tracking-widest text-sm">
                    Loading...
                </p>
            </div>
    
            <div v-else class="text-center py-20">
                <p>
                    Product not found.
                </p>
                <router-link to="/" class="text-blue-500 underline">
                    Back to Home
                </router-link>
            </div>
    </div>


            <!-- ==============  4 random products exhibit ================= -->


    <section class="max-w-[1200px] mx-auto px-6 py-16">
        <h2 class="text-xl font-light tracking-wide mb-8 text-gray-900">SELECTED FOR YOU</h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-x-1 gap-y-10">
            <div 
                v-for="item in randomProducts" 
                :key="item.id" 
                class="group cursor-pointer"
            >
                <div class="aspect-[3/4] overflow-hidden bg-[#f9f9f9] mb-4">
                    <img 
                    :src="item.img" 
                    :alt="item.name"
                    class="w-full h-full object-cover transition-all duration-500 group-hover:scale-102 group-hover:opacity-80"
                    />
                </div>

                <div class="flex flex-col space-y-1">
                    <h3 class="text-[11px] tracking-[0.12em] uppercase font-normal text-gray-900 leading-tight">
                        {{ item.name }} | {{ item.color }}
                    </h3>
                    <p class="text-[11px] font-medium tracking-widest text-gray-900">
                        ${{ item.price.toLocaleString() }} TWD
                    </p>
                </div>
            </div>
        </div>
    </section>

            <!-- ============== footer banner exhibit ================= -->
    <div class="footerbanner-wrapper w-full  overflow-hidden relative" style="min-height: 70vh">

        <div
            v-if="!imageLoaded"
            class="w-full h-[500px] bg-gray-200 animate-pulse flex items-center justify-center"
            >
            <span class="text-gray-400 tracking-widest text-sm">LOADING...</span>
        </div>
<!-- h-[60-vh] max-h-[600px]  -->
        <img
            v-show="imageLoaded"
            class="banner-img w-full lg:h-[50vh] h-[70vh] lg:max-h-[500px]  object-cover"
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
            alt="Hero Banner"
            @load="imageLoaded = true"
        >

        <div v-show="imageLoaded" class="absolute inset-0 bg-black/40"></div>

        <div
            v-show="imageLoaded"
            class="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-white"
            >
            <h1 class="hidden lg:flex text-3xl md:text-2xl tracking-[0.2em] uppercase font-light mb-6 text-center">
                Pure Essentials.
            </h1>

            <h1 class="flex lg:hidden text-white text-xl md:text-2xl font-medium uppercase tracking-[0.2em] leading-tight text-center">
                Pure Essentials.
            </h1>
            
            <p class="hidden lg:flex max-w-xl text-center text-sm md:text-base leading-relaxed tracking-wide font-light opacity-90">
                Crafted for your everyday. We focus on the beauty of simplicity. By blending timeless design with ethically sourced materials, we create pieces that aren't just worn, but lived in. Your story starts with what you choose to keep close.
            </p>

            <p class="flex lg:hidden text-white/90 text-sm font-light leading-relaxed tracking-wide text-center max-w-xs mx-auto">
                Crafted for your everyday. We focus on the beauty of simplicity. By blending timeless design with ethically sourced materials, we create pieces that aren't just worn, but lived in. Your story starts with what you choose to keep close.
            </p>
        </div>
    </div>

    
    <MyFooter />

</template>