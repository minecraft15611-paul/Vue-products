<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from '../stores/cart';
import buyButton from '../components/buyButton.vue';
import cartIcon from '../components/cartIcon.vue';
import MyFooter from '../components/MyFooter.vue';

const route = useRoute();
const cartStore = useCartStore();

const productId = Number(route.params.id);

const product = computed(() => {
    return cartStore.products.find(item => item.id === productId);
});

const selectedColor = ref(product.value?.colors?.[0]?.name ?? '');

const selectedSize = ref<string | null>(null);

const errorMessage = ref<string>('');

const items = ref([
    {
        title: 'DESCRIPTION',
        content: product.value?.description ?? 'No description available.'    },
    {
        title: 'MATERIALS & CARE',
        content: product.value?.material ?? 'No materials info available.'    }
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

</script>

<template>

    <div class="sticky top-0 z-50 ">
        <div class="bg-black text-white text-center py-2 text-xs tracking-widest uppercase">
            Free Shipping on orders over $1
        </div>

        <nav class="bg-white border-b relative border-gray-100 px-6 py-2 flex justify-between items-center">
            
            <div>

            </div>

            <div class="absolute left-1/2 transform -translate-x-1/2 text-4xl font-bold tracking-tighter z-10">
                <h1 @click="cartStore.goHome()" class="cursor-pointer">LemonTree</h1>
            </div>

            <div class="hidden lg:flex items-center space-x-4">
                <i class="fa-regular fa-user text-xl cursor-pointer transition duration-300 hover:scale-125"></i>
                <router-link to="/ShoppingCart">
                <cartIcon :cartCount="cartStore.cartCount"  class="cursor-pointer transition duration-300 hover:scale-125"/>
                </router-link>
            </div>

        </nav>
    </div>
    <div>
        <div v-if="product" class=" mx-auto  py-8 grid grid-cols-12 gap-12">
            
            <div class="col-span-7">
                <img :src="product.img" :alt="product.title" class="w-full h-full object-contain">
            </div>

            <div class="col-span-4 flex flex-col">
                <div class="flex mb-20 gap-20">
                    <div class="text-lg tracking-wider text-gray-900 uppercase">
                        {{ product.name }}
                    </div>
                    <div class="text-xl tracking-wide text-gray-900">
                        ${{ product.price }}
                    </div>
                </div>
                
                <div class="mb-10">
                    <div class="mb-5">
                        <p class="text-xs font-bold tracking-widest uppercase mb-4">
                            Color <span class="ml-2 font-normal text-gray-500">{{ selectedColor }}</span>
                        </p>
                    </div>
                    <div class="flex items-center space-x-4">
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
                            ></span>
                        </button>
                    </div>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <p class="text-xs font-bold tracking-widest uppercase">
                        Size <span class="ml-2 font-normal text-gray-500">{{ selectedSize }}</span>
                    </p>
                    <a href="#" class="text-xs font-bold tracking-widest uppercase underline decoration-1 underline-offset-4">
                        Size Guide
                    </a>
                </div>
                <div class="flex items-center space-x-2 mb-4">
                    <button 
                        v-for="size in product.sizes" 
                        :key="size"
                        @click="selectedSize = size; errorMessage= ''"
                        :class="[selectedSize === size ? 'border-black border-2' : 'border-gray-300']"
                        class="w-18 h-8 border text-xs tracking-widest uppercase">
                        {{ size }}
                    </button>
                </div>
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

        <div v-else class="text-center py-20">
            <p>Product not found.</p>
            <router-link to="/" class="text-blue-500 underline">Back to Home</router-link>
        </div>
    </div>

    <div>
        
    </div>
    <MyFooter />

</template>