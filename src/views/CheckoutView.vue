<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { useCartStore } from '../stores/cart';

    const cartStore = useCartStore();

    const subtotal = computed<number>(() =>
    cartStore.totalPrice
    )

    const shipping = computed<number>(() => (subtotal.value > 1 ? 0 : 9.99))

    const total = computed<number>(() => subtotal.value + shipping.value)
    
    const isOpen = ref<boolean>(false)
    const toggle = () => {
    isOpen.value = !isOpen.value
    }
    
</script>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet"></link>


<template>

        <!-- =============== Mobile Version =============== -->

    <div class="flex-col">

        <div class="flex justify-center items-center bg-white px-8 h-16 my-4 ">
            <h1 class="text-3xl tracking-[0.2em] text-gray-800 font-light">LemonTree</h1>
        </div>

        <div>
            <div class="w-full max-w-md border-y border-gray-300 rounded-lg overflow-hidden">
                
                <div class="flex justify-between items-center bg-gray-100">
                    <button 
                    @click="toggle"
                    class="w-full flex  items-center p-4  hover:bg-gray-50 transition-colors"
                    >
                        <span class="text-[14px] text-[#1a1a1a] font-normal tracking-tight mr-2">
                            Order summary
                        </span>
    
                        <svg 
                            :class="{'rotate-180': isOpen}"
                            class="w-4 h-4 transition-transform duration-300 ease-in-out text-gray-700 group-hover:text-gray-950" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            stroke-width="2"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                    <div class="font-sans text-[16px] font-bold tracking-tight text-gray-900 me-4">
                        ${{ total.toFixed(2) }}
                    </div>    
                </div>

                <!-- ========== Accordion Contents ========== -->

                <div 
                    class="transition-all duration-300 ease-in-out overflow-hidden"
                    :class="isOpen ? 'max-h-[100-vh] opacity-100' : 'max-h-0 opacity-0'"
                >
                    <div class=" text-gray-600 border-t p-2 border-gray-300">

                        <div class="
                            flex-1 bg-white overflow-hidden  
                            shadow-sm overflow-y-auto max-h-[70vh] hide-scrollbar scrollbar-gutter:stable 
                            scroll-smooth 
                        ">
                            <div
                                v-for="item in cartStore.cart"
                                :key="item.id"
                                class="flex items-start group gap-2 p-2"
                            >
                                <!-- Thumbnail -->
                                <div class="inline-block border border-gray-200 p-0.5 bg-white relative ">
                                    <img
                                    :src="item.img || '/placeholder.jpg'"
                                    :alt="item.title"
                                    class="w-15 h-15  object-cover bg-gray-100 flex-shrink:0"
                                    />
                                    <div class="absolute top-0 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-md">
                                        {{ item.quantity }}
                                    </div>
                                </div>

                                <!-- Info -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex w-45">
                                        <p class="font-light leading-relaxed text-[13px] text-gray-900">
                                            {{ item.title }} | Navy
                                        </p>
                                    </div>

                                </div>

                                <div class="">
                                    <p class="flex items-end font-sans text-[13px] font-medium text-gray-900 tracking-tight tabular-nums">
                                        ${{ (item.price*item.quantity).toFixed(2) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

                <!-- =============== ShippingForm =============== -->

        <div class="flex flex-col p-5">

            <div class="flex justify-center">
                <p class="font-['Montserrat'] font-light text-sm text-gray-700 uppercase tracking-widest text-center">
                    Express checkout
                </p>
            </div>

            <div>
                <button class="bg-[#5a31f4] w-full mt-4 py-2 rounded flex justify-center items-center">
                    <span class="font-['Poppins'] font-bold text-white text-2xl tracking-tighter lowercase">
                        shop
                    </span>
                </button>
            </div>

            <div class="flex items-center mt-6">
                <div class="flex-grow border-t border-gray-300"></div>
                <div class="flex-shrink mx-4 text-gray-500 text-sm uppercase">OR</div>
                <div class="flex-grow border-t border-gray-300"></div>
            </div>


        </div>

        <div>
            <!-- Payment -->
        </div>

    </div>


        <!-- =============== Desktop Version =============== -->

    <div>
        
    </div>
    
</template>