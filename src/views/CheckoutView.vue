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

            <div class="flex items-baseline justify-between mt-6">
                <div class="text-2xl">
                    Contact
                </div>
                <div class="underline text-[13px]">
                    <a href="#">
                        Sign in
                    </a>
                </div>
            </div>

                        <!-- ================= NOT FINISHED YET ===================== -->
                         <!-- ================= NOT FINISHED YET ===================== -->
                         <!-- ================= NOT FINISHED YET ===================== -->
                           <!-- ================= NOT FINISHED YET ===================== -->
                             <!-- ================= NOT FINISHED YET ===================== -->
            <div class="relative mt-3 focus-within:ring-1 focus-within:ring-black transition-all">
                <input 
                    type="email" 
                    id="email"
                    autocomplete="email" 
                    name="email" 
                    placeholder=" " 
                    class="peer w-full h-full border text-[13px] border-gray-300 pt-5 pb-1 px-3 text-black outline-none bg-transparent"
                />
                <label 
                    for="email" 
                    class="absolute left-3 top-2 text-gray-400 transition-all duration-200 pointer-events-none
                        peer-focus:top-1 
                        peer-focus:text-xs 
                        peer-focus:text-gray-800 
                        peer-[:not(:placeholder-shown)]:top-1 
                        peer-[:not(:placeholder-shown)]:text-xs 
                        peer-[:not(:placeholder-shown)]:text-gray-500"
                >
                    Email
                </label>
                <p class="mt-1 hidden text-xs text-red-600 
                        peer-invalid:[&:not(:placeholder-shown):not(:focus)]:block"
                >
                    Enter a valid email
                </p>
            </div>

 <!-- ================= NOT FINISHED YET ===================== -->
   <!-- ================= NOT FINISHED YET ===================== -->
     <!-- ================= NOT FINISHED YET ===================== -->

                <!-- =============== Delivery =============== -->
                 
            <div class="mt-10">
                <p class="text-2xl">
                    Delivery
                </p>

                <div class="relative  w-full">
                    <div>
                        <select name="country" id="country"
                        class="peer block w-full appearance-none border-[1.5px] border-black bg-white mt-3 px-3 pb-1 pt-4 text-base focus:outline-none focus:ring-0"
                        >
                            <option value="AR">Argentina</option>
                            <option value="AU">Australia</option>
                            <option value="AT">Austria</option>
                            <option value="BS">Bahamas</option>
                            <option value="BD">Bangladesh</option>
                            <option value="BE">Belgium</option>
                            <option value="BM">Bermuda</option>
                            <option value="BR">Brazil</option>
                            <option value="CA">Canada</option>
                            <option value="CL">Chile</option>
                            <option value="CN">China</option>
                            <option value="CO">Colombia</option>
                            <option value="CZ">Czech Republic</option>
                            <option value="DK">Denmark</option>
                            <option value="EG">Egypt</option>
                            <option value="FI">Finland</option>
                            <option value="FR">France</option>
                            <option value="DE">Germany</option>
                            <option value="GR">Greece</option>
                            <option value="HK">Hong Kong</option>
                            <option value="HU">Hungary</option>
                            <option value="IS">Iceland</option>
                            <option value="IN">India</option>
                            <option value="ID">Indonesia</option>
                            <option value="IE">Ireland</option>
                            <option value="IL">Israel</option>
                            <option value="IT">Italy</option>
                            <option value="JP">Japan</option>
                            <option value="LU">Luxembourg</option>
                            <option value="MY">Malaysia</option>
                            <option value="MX">Mexico</option>
                            <option value="NL">Netherlands</option>
                            <option value="NZ">New Zealand</option>
                            <option value="NO">Norway</option>
                            <option value="PH">Philippines</option>
                            <option value="PL">Poland</option>
                            <option value="PT">Portugal</option>
                            <option value="SA">Saudi Arabia</option>
                            <option value="SG">Singapore</option>
                            <option value="ZA">South Africa</option>
                            <option value="KR">South Korea</option>
                            <option value="ES">Spain</option>
                            <option value="SE">Sweden</option>
                            <option value="CH">Switzerland</option>
                            <option value="TW">Taiwan</option>
                            <option value="TH">Thailand</option>
                            <option value="TR">Turkey</option>
                            <option value="GB">United Kingdom</option>
                            <option value="US">United States</option>
                            <option value="VN">Vietnam</option>
                        </select>
                    </div>
                    <div>
                        <label
                            for="country"
                            class="text-[13px] pointer-events-none absolute left-3 top-1 origin-[0%] scale-90 transform text-sm text-gray-500 duration-200 peer-focus:scale-90 peer-focus:text-gray-500"
                        >
                            Country/Region
                        </label>
                    </div>
                    <div>
                        <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center pt-3">
                            <svg 
                                class="h-4 w-4 text-gray-600" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 10 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>


                <div class="relative mt-3 focus-within:ring-1 focus-within:ring-black transition-all">
                    <input type="text" id="firstname" name="firstname" placeholder=" " autocomplete="given-name"
                        class="peer w-full h-full border text-[13px] border-gray-300 pt-5 pb-1 px-3 text-black outline-none bg-transparent"
                    >
                    <label 
                        for="firstname" 
                        class="absolute left-3 top-2 text-gray-400 transition-all duration-200 pointer-events-none
                        peer-focus:top-1 
                        peer-focus:text-xs 
                        peer-focus:text-gray-800 
                        peer-[:not(:placeholder-shown)]:top-1 
                        peer-[:not(:placeholder-shown)]:text-xs 
                        peer-[:not(:placeholder-shown)]:text-gray-500"
                    >
                        First name
                    </label>
                </div>
                
                <div class="relative mt-3 focus-within:ring-1 focus-within:ring-black transition-all">
                    <input type="text" id="lastname" name="lasttname" placeholder=" " 
                        class="peer w-full h-full border text-[13px] border-gray-300 pt-5 pb-1 px-3 text-black outline-none bg-transparent"
                    >
                    <label 
                        for="lastname" 
                        class="absolute left-3 top-2 text-gray-400 transition-all duration-200 pointer-events-none
                        peer-focus:top-1 
                        peer-focus:text-xs 
                        peer-focus:text-gray-800 
                        peer-[:not(:placeholder-shown)]:top-1 
                        peer-[:not(:placeholder-shown)]:text-xs 
                        peer-[:not(:placeholder-shown)]:text-gray-500"
                    >
                        Last name
                    </label>
                </div>


                
                <p class="my-5 text-xl text-[15px] font-normal text-gray-900">
                    Shipping method
                </p>

                <div class="bg-gray-100 p-5 my-5">
                    <p class="text-[13px] text-gray-500 text-base leading-relaxed">
                        Enter your shipping address to view available shipping methods.
                    </p>
                </div>
                
                
            </div>


            <div>

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