<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';
    import { useCartStore } from '../stores/cart';
    import intlTelInput from 'intl-tel-input';
    import 'intl-tel-input/styles';


    const cartStore = useCartStore();

    const subtotal = computed<number>(() =>
    cartStore.totalPrice
    )

    const discountcode = ref<string>('');
    const isApplyDisabled = computed (() => {
        return discountcode.value.length === 0
    })

    

    const shipping = computed<number>(() => (subtotal.value > 1 ? 0 : 9.99))

    const total = computed<number>(() => subtotal.value + shipping.value)
    
    const isOpen = ref<boolean>(false)
    const toggle = () => {
        isOpen.value = !isOpen.value
    }

    const isBottomOpen = ref<boolean>(false)
    const bottomToggle = () => {
        isBottomOpen.value = !isBottomOpen.value;
    }

    const isTextMeChecked = ref<boolean>(false);

    const paymentMethod = ref<string>('Klarna');

    const billingOptions = ref<string>('same');
    
    const payment = ref<string>('credit');
    const useShippingAsBilling = ref<boolean>(true);

    const phone = ref<string>('');
    const phoneInputRef = ref<HTMLInputElement | null>(null);
    let iti: any = null;

    function onEnter(el: Element) {
    const htmlEl = el as HTMLElement
    htmlEl.style.height = '0'
    htmlEl.style.overflow = 'hidden'
    htmlEl.style.opacity = '0'
    htmlEl.style.transition = 'height 0.4s ease, opacity 0.4s ease'
    requestAnimationFrame(() => {
        htmlEl.style.height = htmlEl.scrollHeight + 'px'
        htmlEl.style.opacity = '1'
    })
    }
    function onAfterEnter(el: Element) {
    const htmlEl = el as HTMLElement
    htmlEl.style.height = 'auto'
    htmlEl.style.overflow = ''
    }
    function onLeave(el: Element) {
    const htmlEl = el as HTMLElement
    htmlEl.style.height = htmlEl.scrollHeight + 'px'
    htmlEl.style.overflow = 'hidden'
    htmlEl.style.transition = 'height 0.3s ease, opacity 0.3s ease'
    requestAnimationFrame(() => {
        htmlEl.style.height = '0'
        htmlEl.style.opacity = '0'
    })
    }
    function onAfterLeave(el: Element) {
    const htmlEl = el as HTMLElement
    htmlEl.style.height = ''
    htmlEl.style.opacity = ''
    htmlEl.style.overflow = ''
    }

    onMounted(() => {
        if (phoneInputRef.value) {
            iti = intlTelInput(phoneInputRef.value, {
                nationalMode: false,        // forces international format
                separateDialCode: false,
                allowDropdown: false,     // shows flag + dial code separately
               
            });
        }
    });

    
    
    
</script>



<template>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet"></link>

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
                        <span class="text-[13px] text-[#1a1a1a] font-normal tracking-tight mr-2">
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


                <Transition
                    @enter="onEnter"
                    @after-enter="onAfterEnter"
                    @leave="onLeave"
                    @after-leave="onAfterLeave"
                >
            
                <div v-if="isOpen">
                    <div class=" text-gray-600 border-t p-2 border-gray-300" >

                        <div class="
                            flex-1 bg-white overflow-hidden  
                            overflow-y-auto max-h-[70vh] hide-scrollbar scrollbar-gutter:stable 
                            scroll-smooth 
                        ">
                            <div
                                v-for="item in cartStore.cart"
                                :key="item.id"
                                class="flex items-start group gap-2 p-2 pb-1"
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

                    <div class="flex justify-between px-3 mb-1 gap-2">
                        <div class="relative border border-gray-300 focus-within:ring-2 focus-within:ring-black">
                            <input type="text" id="discountcode" name="discountcode" 
                                    placeholder=" " autocomplete="given-name"
                                    v-model="discountcode"
                                class="peer w-65 h-11 border text-[13px] border-gray-100 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                            >
                            <label 
                                for="discountcode" 
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 
                                peer-focus:text-xs 
                                peer-focus:text-gray-800 
                                peer-[:not(:placeholder-shown)]:top-1 
                                peer-[:not(:placeholder-shown)]:text-xs 
                                peer-[:not(:placeholder-shown)]:text-gray-500"
                            >
                                Discount code or gift card
                            </label>
                        </div>
                        <button class="border text-[13px] transition-color duration-300 border-gray-300 text-gray-500 px-2"
                                :disabled="isApplyDisabled"
                                :class="isApplyDisabled ? 'bg-gray-50 ' : 'bg-black text-white'"
                        >
                            APPLY
                        </button>
                    </div>

                    <div class="flex justify-between mt-5 mb-2">
                        <div class="text-[13px] pl-3">
                            Subtotal - {{ cartStore.cart.reduce((acc, item) => acc + item.quantity, 0) }} items
                        </div>
                        <div class="pr-3 text-[15px]">
                            ${{ subtotal.toFixed(2) }}
                        </div>
                    </div>

                    <div class="flex justify-between">
                        <div class="text-[13px] pl-3">
                            Shipping 
                        </div>
                        <div class="pr-3">
                            Free
                        </div>
                    </div>

                    <div class="flex justify-between my-5">
                        <div class="pl-3 text-[20px]">
                            Total
                        </div>
                        <div class="pr-3 text-[20px]">
                            ${{ total.toFixed(2) }}
                        </div>
                    </div>



                </div>
                </Transition>
            </div>
        </div>

                <!-- =============== ShippingForm =============== -->

        <div class="flex flex-col p-5">

            <div class="flex justify-center">
                <p class="font-['Montserrat'] font-light text-[10px] text-gray-700 uppercase tracking-widest text-center">
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
                <div class="text-[18px]">
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
            <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                <input 
                    type="email" 
                    id="email"
                    autocomplete="email" 
                    name="email" 
                    placeholder=" " 
                    class="peer w-full h-full border text-[13px] border-gray-100 pt-5 pb-1 px-3 focus-within:ring-2 focus-within:ring-black bg-transparent"
                />
                <label 
                    for="email" 
                    class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
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
                <p class="text-[19px]">
                    Delivery
                </p>

                <div class="relative  w-full">
                    <div>
                        <select name="country" id="country"
                        class="peer block w-full appearance-none border-[1.5px] border-black bg-white mt-3 px-3 pb-1 pt-4 text-[13px] focus:outline-none focus:ring-0"
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


                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="firstname" name="firstname" placeholder=" " autocomplete="given-name"
                        class="peer w-full h-full border text-[13px] border-gray-100 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                    >
                    <label 
                        for="firstname" 
                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
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
                
                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="lastname" name="lastname" placeholder=" " 
                        class="peer w-full h-full border text-[13px] border-gray-100 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                    >
                    <label 
                        for="lastname" 
                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
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

                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="address" name="address" placeholder=" " 
                        class="peer w-full h-full border text-[13px] border-gray-100 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                    >
                    <label 
                        for="address" 
                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                        peer-focus:top-1 
                        peer-focus:text-xs 
                        peer-focus:text-gray-800 
                        peer-[:not(:placeholder-shown)]:top-1 
                        peer-[:not(:placeholder-shown)]:text-xs 
                        peer-[:not(:placeholder-shown)]:text-gray-500"
                    >
                        Address
                    </label>
                </div>

                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="apartment" name="apartment" autocomplete="address-line2" placeholder=" " 
                        class="peer w-full h-full border text-[13px] border-gray-100 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                    >
                    <label 
                        for="apartment" 
                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                        peer-focus:top-1 
                        peer-focus:text-xs 
                        peer-focus:text-gray-800 
                        peer-[:not(:placeholder-shown)]:top-1 
                        peer-[:not(:placeholder-shown)]:text-xs 
                        peer-[:not(:placeholder-shown)]:text-gray-500"
                    >
                        Apartment, suite, etc. (optional)
                    </label>
                </div>

                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="city" name="city" placeholder=" " 
                        class="peer w-full h-full border text-[13px] border-gray-100 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                    >
                    <label 
                        for="city" 
                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                        peer-focus:top-1 
                        peer-focus:text-xs 
                        peer-focus:text-gray-800 
                        peer-[:not(:placeholder-shown)]:top-1 
                        peer-[:not(:placeholder-shown)]:text-xs 
                        peer-[:not(:placeholder-shown)]:text-gray-500"
                    >
                        City
                    </label>
                </div>

                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="state" name="state" placeholder=" " autocomplete="address-level1"
                        class="peer w-full h-full border text-[13px] border-gray-100 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                    >
                    <label 
                        for="state" 
                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                        peer-focus:top-1 
                        peer-focus:text-xs 
                        peer-focus:text-gray-800 
                        peer-[:not(:placeholder-shown)]:top-1 
                        peer-[:not(:placeholder-shown)]:text-xs 
                        peer-[:not(:placeholder-shown)]:text-gray-500"
                    >
                        State / Province
                    </label>
                </div>

                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="postcode" name="postcode" autocomplete="postal-code" placeholder=" " 
                        class="peer w-full h-full border text-[13px] border-gray-100 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                    >
                    <label 
                        for="postcode" 
                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                        peer-focus:top-1 
                        peer-focus:text-xs 
                        peer-focus:text-gray-800 
                        peer-[:not(:placeholder-shown)]:top-1 
                        peer-[:not(:placeholder-shown)]:text-xs 
                        peer-[:not(:placeholder-shown)]:text-gray-500"
                    >
                        Postcode / ZIP code
                    </label>
                </div>

                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="phone" name="phone" placeholder=" " 
                        class="peer w-full h-full border text-[13px] border-gray-100 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                    >
                    <label 
                        for="phone" 
                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                        peer-focus:top-1 
                        peer-focus:text-xs 
                        peer-focus:text-gray-800 
                        peer-[:not(:placeholder-shown)]:top-1 
                        peer-[:not(:placeholder-shown)]:text-xs 
                        peer-[:not(:placeholder-shown)]:text-gray-500"
                    >
                        Phone
                    </label>
                </div>

                <div class="flex my-3 items-center">
                    <input type="checkbox" class="mx-2" v-model="isTextMeChecked">
                    <p class="text-[13px]">
                        Text me with news and offers
                    </p>
                </div>


                <Transition
                    @enter="onEnter"
                    @after-enter="onAfterEnter"
                    @leave="onLeave"
                    @after-leave="onAfterLeave"
                >
                    <div class="" v-if="isTextMeChecked === true">
                        <div class="flex items-stretch border border-black  p-2 max-w-sm">
                            
                            <div class="px-2 flex items-center">
                                <svg class="w-5 h-5 text-gray-400">...</svg>
                            </div>

                            <input
                                ref="phoneInputRef"
                                type="tel"
                                v-model="phone"
                                placeholder="Mobile phone(optional)"
                                class="py-2 px-3 w-full border-none outline-none ring-0"
                            />
                        </div>

                        <div class="text-[11px] text-gray-500 mt-2">
                            By signing up via text, you agree to receive recurring automated marketing messages, 
                            including cart reminders, at the phone number provided. Consent is not a condition 
                            of purchase. Reply STOP to unsubscribe. Reply HELP for help. Message frequency 
                            varies. Msg & data rates may apply. View our 
                            <a href="#" class="underline hover:text-gray-700">Privacy policy</a> 
                            and 
                            <a href="#" class="underline hover:text-gray-700">Terms of service</a>.
                        </div>
                    </div>
                </Transition>


                
                <p class="my-5 text-xl text-[15px] font-normal text-gray-900">
                    Shipping method
                </p>

                <div class="bg-gray-100 p-5 my-5">
                    <p class="text-[13px] text-gray-600 text-base leading-relaxed">
                        Enter your shipping address to view available shipping methods.
                    </p>
                </div>
                
                
            </div>

                                <!-- ==================== Payment ===================== -->

                        <!-- ========== Credit or Debit card ========== -->
            <div>
                <div>
                    <h2 class="text-[18px] font-semibold text-gray-900 leading-tight">Payment</h2>
                </div>

                <div>
                    <p class="mt-2 text-[13px] text-gray-500 mb-3">All transactions are secure and encrypted.</p>
                </div>

                <!-- ========== Payment Method Selector ========== -->

                <div class="flex relative    p-3 pb-1 items-baseline"
                    :class="payment === 'credit'? 'border border-black bg-gray-100' : 'border border-gray-300 bg-white'"
                >
                    <div class="flex justify-between ml-3 ">
                        <div class="p-1">
                            <input type="radio" v-model="payment" value="credit" class="absolute bottom-8 left-3">
                            <p class="text-[13px] font-medium pl-2">Credit or Debit Card</p>
                        </div>
                        
                    </div>

                    <div class="flex h-11 gap-2 ml-3 pl-2">
                            <span class="text-[#1a1f71] font-bold italic text-xs">VISA</span>
                            <div class="flex">
                                <div class="w-3 h-3 rounded-full bg-red-500 opacity-80"></div>
                                <div class="w-3 h-3 rounded-full bg-yellow-500 opacity-80 -ml-1.5"></div>
                            </div>
                            <span class="flex items-center h-5 w-10 p-1 text-white bg-blue-600 rounded font-bold text-[10px]">AMEX</span>
                            <span class="flex justify-center bg-white border border-gray-200 w-6 h-4 text-slate-900 text-[10px]">+3</span>
                    </div>
                </div>

                <!-- ========== Accordion part of Credit or Debit card ========== -->

                <Transition
                    @enter="onEnter"
                    @after-enter="onAfterEnter"
                    @leave="onLeave"
                    @after-leave="onAfterLeave"
                >
                    <div class="flex-grid bg-gray-100 p-2" v-if="payment === 'credit'">
                        
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="cardnumber" name="cardnumber" placeholder=" " 
                                class="peer w-full h-full border border-gray-100 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus-within:ring-2 focus-within:ring-black"
                            >
                            <label 
                                for="cardnumber" 
                                class="absolute left-3 bottom-3 text-[13px] text-gray-600 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 
                                peer-focus:text-xs 
                                peer-focus:text-gray-800 
                                peer-[:not(:placeholder-shown)]:top-1 
                                peer-[:not(:placeholder-shown)]:text-xs 
                                peer-[:not(:placeholder-shown)]:text-gray-500"
                            >
                                Card number
                            </label>
                        </div>

                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="expirationdate" name="expirationdate" placeholder=" " 
                                class="peer w-full h-full border border-gray-100 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus-within:ring-2 focus-within:ring-black"
                            >
                            <label 
                                for="expirationdate" 
                                class="absolute left-3 bottom-3 text-[13px] text-gray-600 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 
                                peer-focus:text-xs 
                                peer-focus:text-gray-800 
                                peer-[:not(:placeholder-shown)]:top-1 
                                peer-[:not(:placeholder-shown)]:text-xs 
                                peer-[:not(:placeholder-shown)]:text-gray-500"
                            >
                                Expiration date (MM / YY)
                            </label>
                        </div>

                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="securitycode" name="securitycode" placeholder=" " 
                                class="peer w-full h-full border border-gray-100 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus-within:ring-2 focus-within:ring-black"
                            >
                            <label 
                                for="securitycode" 
                                class="absolute left-3 bottom-3 text-[13px] text-gray-600 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 
                                peer-focus:text-xs 
                                peer-focus:text-gray-800 
                                peer-[:not(:placeholder-shown)]:top-1 
                                peer-[:not(:placeholder-shown)]:text-xs 
                                peer-[:not(:placeholder-shown)]:text-gray-500"
                            >
                                Security code
                            </label>
                        </div>

                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="nameoncard" name="nameoncard" placeholder=" " 
                                class="peer w-full h-full border border-gray-100 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus-within:ring-2 focus-within:ring-black"
                            >
                            <label 
                                for="nameoncard" 
                                class="absolute left-3 bottom-3 text-[13px] text-gray-600 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 
                                peer-focus:text-xs 
                                peer-focus:text-gray-800 
                                peer-[:not(:placeholder-shown)]:top-1 
                                peer-[:not(:placeholder-shown)]:text-xs 
                                peer-[:not(:placeholder-shown)]:text-gray-500"
                            >
                                Name on card
                            </label>
                        </div>

                        <label class="flex items-center space-x-3 mt-3 cursor-pointer">
                            <input 
                                type="checkbox" v-model="useShippingAsBilling"
                                class="w-5 h-5 cursor-pointer appearance-none
                                    border-2 border-black bg-white rounded-none
                                    relative
                                    checked:bg-black transition-colors duration-200
                                    after:content-['✓'] after:absolute after:inset-0
                                    after:flex after:items-center after:justify-center
                                    after:text-white after:font-bold after:text-sm
                                    after:scale-0 after:opacity-0
                                    after:transition-all after:duration-300 after:ease-out
                                    checked:after:scale-100 checked:after:opacity-100"
                            >
                            <span class="text-[13px] text-black">
                                Use shipping address as billing address
                            </span>
                        </label>

                        <div class="mt-5">
                            <p class="text-[16px] font-normal">
                                Billing address
                            </p>
                        </div>

                                    <!-- ========== Use Shipping As Billing ========== -->

                        <Transition
                            @enter="onEnter"
                            @after-enter="onAfterEnter"
                            @leave="onLeave"
                            @after-leave="onAfterLeave"
                        >
                            <div v-if="useShippingAsBilling === false ">
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="firstnameship" name="firstnameship" placeholder=" " autocomplete="given-name"
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="firstnameship" 
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
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
                                
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="lastnameship" name="lastnameship" placeholder=" " 
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="lastnameship" 
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
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
            
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="address" name="address" placeholder=" " 
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="address" 
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 
                                        peer-focus:text-xs 
                                        peer-focus:text-gray-800 
                                        peer-[:not(:placeholder-shown)]:top-1 
                                        peer-[:not(:placeholder-shown)]:text-xs 
                                        peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >
                                        Address
                                    </label>
                                </div>
            
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="apartment" name="apartment" autocomplete="address-line2" placeholder=" " 
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="apartment" 
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 
                                        peer-focus:text-xs 
                                        peer-focus:text-gray-800 
                                        peer-[:not(:placeholder-shown)]:top-1 
                                        peer-[:not(:placeholder-shown)]:text-xs 
                                        peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >
                                        Apartment, suite, etc. (optional)
                                    </label>
                                </div>
            
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="city" name="city" placeholder=" " 
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="city" 
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 
                                        peer-focus:text-xs 
                                        peer-focus:text-gray-800 
                                        peer-[:not(:placeholder-shown)]:top-1 
                                        peer-[:not(:placeholder-shown)]:text-xs 
                                        peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >
                                        City
                                    </label>
                                </div>
            
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="stateship" name="stateship" placeholder=" " autocomplete="address-level1"
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="stateship" 
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 
                                        peer-focus:text-xs 
                                        peer-focus:text-gray-800 
                                        peer-[:not(:placeholder-shown)]:top-1 
                                        peer-[:not(:placeholder-shown)]:text-xs 
                                        peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >
                                        State / Province
                                    </label>
                                </div>
            
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="postcodeship" name="postcodeship" autocomplete="postal-code" placeholder=" " 
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="postcodeship" 
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 
                                        peer-focus:text-xs 
                                        peer-focus:text-gray-800 
                                        peer-[:not(:placeholder-shown)]:top-1 
                                        peer-[:not(:placeholder-shown)]:text-xs 
                                        peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >
                                        Postcode / ZIP code
                                    </label>
                                </div>
            
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="phoneship" name="phoneship" placeholder=" " 
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="phoneship" 
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 
                                        peer-focus:text-xs 
                                        peer-focus:text-gray-800 
                                        peer-[:not(:placeholder-shown)]:top-1 
                                        peer-[:not(:placeholder-shown)]:text-xs 
                                        peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >
                                        Phone (optional)
                                    </label>
                                </div>
                            </div>
                        </Transition>
                        
                    </div>
            
                </Transition>

                            
                            <!-- ========== More Payment Options ========== -->
                <div class="flex relative   p-1  items-center justify-between"
                    :class="payment === 'more'? 'border border-black bg-gray-100': 'border border-gray-300 bg-white'"
                >
                    <div class="flex justify-between ml-3 ">
                        <div class="p-1">
                            <input type="radio" v-model="payment" value="more" class="flex ml-1 absolute bottom-4 left-2">
                            <p class="text-[13px] font-medium pl-4">More Payment Options</p>
                        </div>
                        
                    </div>

                    <div class="flex justify-center items-center h-11 pr-4">
                        <button class="flex justify-center bg-white border border-gray-200 h-5 w-8 ">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" class="text-blue-500">
                                <circle cx="5" cy="12" r="3"></circle>
                                <circle cx="13" cy="12" r="3"></circle>
                                <circle cx="21" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- ========== This is where Klarna or PayPal choose options ========== -->

                <div v-if="payment === 'more'">
                    <div class="flex-grid mt-4 border-t border-gray-200">
                        
                        <label class="flex justify-between items-center border-b border-x border-gray-200 active:bg-gray-100 transition-colors">
                            <div class="flex items-center py-4"> <input type="radio" v-model="paymentMethod" value="Klarna" name="moreOptions" class="ml-3 mr-3 w-4 h-4">
                                <p class="text-[13px] font-medium">Klarna</p>
                            </div>
                            <div class="mr-4">
                                <span class="text-[18px] font-[1000] tracking-tighter text-black font-sans">Klarna</span>
                            </div>
                        </label>

                        <label class="flex justify-between items-center border-b border-x border-gray-200 active:bg-gray-100 transition-colors">
                            <div class="flex items-center py-4">
                                <input type="radio" v-model="paymentMethod" value="PayPal" name="moreOptions" class="ml-3 mr-3 w-4 h-4">
                                <p class="text-[13px] font-medium">PayPal</p>
                            </div>
                            <div class="flex mr-4">
                                <span class="text-[18px] font-[1000] italic tracking-tight text-[#003087]">Pay</span>
                                <span class="text-[18px] font-[1000] italic tracking-tight text-[#009cde]">Pal</span>
                            </div>
                        </label>

                    </div>

                    <div class="mt-3 px-1 min-h-[40px]">
                        <p v-if="paymentMethod === 'Klarna'" class="text-[13px] leading-relaxed text-gray-600 font-normal">
                            After clicking <span class="whitespace-nowrap font-semibold">“Pay now”</span>, you will be redirected to Klarna to complete your purchase.
                        </p>
                        <p v-if="paymentMethod === 'PayPal'" class="text-[13px] leading-relaxed text-gray-600 font-normal">
                            After clicking <span class="whitespace-nowrap font-semibold">“Pay now”</span>, you will be redirected to PayPal.com to complete your purchase.
                        </p>
                    </div>
                </div>



                <div class="flex justify-between my-10">
                    <h3>
                        Payment Options
                    </h3>
                    <div class="flex gap-1 items-baseline">
                        <div class="border border-gray-300 p-1 flex items-center justify-center">
                            <svg width="40" height="13" viewBox="-15 0 100 30" xmlns="http://www.w3.org/2000/svg">
                                <text x="0" y="22" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="black">Klarna</text>
                            </svg>
                        </div>

                        <div class="border border-gray-300 p-1 flex items-center justify-center">
                            <svg width="35" height="13" viewBox="-10 0 100 30" xmlns="http://www.w3.org/2000/svg">
                                <text x="0" y="22" font-family="Verdana, sans-serif" font-weight="bold" font-style="italic" font-size="22">
                                    <tspan fill="#003087">Pay</tspan><tspan fill="#009cde">Pal</tspan>
                                </text>
                            </svg>
                        </div>
                    </div>
                </div>


                <div v-if="payment === 'credit'">
                    <p class="text-[13px] mb-3">
                        save my information for a faster checkout
                    </p>
                    <div class="flex items-stretch border border-black mt-4 p-2 max-w-sm">
                        
                        <div class="px-2 flex items-center">
                            <svg class="w-5 h-5 text-gray-400">...</svg>
                        </div>

                        <input
                            ref="phoneInputRef"
                            type="tel"
                            v-model="phone"
                            placeholder="Mobile phone(optional)"
                            class="py-2 px-3 w-full border-none outline-none ring-0"
                        />
                    </div>
                    <p class="text-gray-600 text-[11px] mt-5">
                        By providing you phone number, you agree to create a Shop acccount subject to <u> Shop's Terms</u> and <u>Privacy Policy</u>.
                    </p>
                </div>

                <div class="flex-grid">
                    <h2 class="my-2 text-[17px]  text-gray-900 mb-3 tracking-tight">
                        Billing address
                    </h2>
                    <div class="flex items-center p-4"
                        :class="billingOptions === 'same'? 'border border-black bg-gray-200':'border border-gray-300 bg-white'"
                    >
                        <input type="radio" v-model="billingOptions" value="same" name="billing">
                        <p class="ml-3 text-[13px] font-normal text-gray-800 tracking-tight">
                            Same as shipping address
                        </p>
                    </div>
                    <div class="flex items-center  p-4 "
                        :class="billingOptions === 'different'? 'border border-black bg-gray-200':'border border-gray-300 bg-white'"
                    >
                        <input type="radio" v-model="billingOptions" value="different" name="billing">
                        <p class="ml-3 text-[13px] font-normal text-gray-800 tracking-tight">
                            Use a different billing address
                        </p>
                    </div>
                </div>

                <Transition
                    @enter="onEnter"
                    @after-enter="onAfterEnter"
                    @leave="onLeave"
                    @after-leave="onAfterLeave"
                >
                    
                    <div class="p-2 bg-gray-100" v-if="billingOptions === 'different'">

                        <div class="relative  w-full focus-within:ring-2 focus-within:ring-black transition-border duration-300">
                            <div>
                                <select name="country" id="country"
                                class="peer block w-full appearance-none border-[1.5px] border-gray-300 bg-white mt-3 px-3 pb-1 pt-4 text-[13px] focus:outline-none focus:ring-0"
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

                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="firstnameship" name="firstnameship" placeholder=" " autocomplete="given-name"
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="firstnameship" 
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
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
                        
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="lastnameship" name="lastnameship" placeholder=" " 
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="lastnameship" 
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
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
    
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="address" name="address" placeholder=" " 
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="address" 
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 
                                peer-focus:text-xs 
                                peer-focus:text-gray-800 
                                peer-[:not(:placeholder-shown)]:top-1 
                                peer-[:not(:placeholder-shown)]:text-xs 
                                peer-[:not(:placeholder-shown)]:text-gray-500"
                            >
                                Address
                            </label>
                        </div>
    
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="apartment" name="apartment" autocomplete="address-line2" placeholder=" " 
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="apartment" 
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 
                                peer-focus:text-xs 
                                peer-focus:text-gray-800 
                                peer-[:not(:placeholder-shown)]:top-1 
                                peer-[:not(:placeholder-shown)]:text-xs 
                                peer-[:not(:placeholder-shown)]:text-gray-500"
                            >
                                Apartment, suite, etc. (optional)
                            </label>
                        </div>
    
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="city" name="city" placeholder=" " 
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="city" 
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 
                                peer-focus:text-xs 
                                peer-focus:text-gray-800 
                                peer-[:not(:placeholder-shown)]:top-1 
                                peer-[:not(:placeholder-shown)]:text-xs 
                                peer-[:not(:placeholder-shown)]:text-gray-500"
                            >
                                City
                            </label>
                        </div>
    
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="stateship" name="stateship" placeholder=" " autocomplete="address-level1"
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="stateship" 
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 
                                peer-focus:text-xs 
                                peer-focus:text-gray-800 
                                peer-[:not(:placeholder-shown)]:top-1 
                                peer-[:not(:placeholder-shown)]:text-xs 
                                peer-[:not(:placeholder-shown)]:text-gray-500"
                            >
                                State / Province
                            </label>
                        </div>
    
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="postcodeship" name="postcodeship" autocomplete="postal-code" placeholder=" " 
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="postcodeship" 
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 
                                peer-focus:text-xs 
                                peer-focus:text-gray-800 
                                peer-[:not(:placeholder-shown)]:top-1 
                                peer-[:not(:placeholder-shown)]:text-xs 
                                peer-[:not(:placeholder-shown)]:text-gray-500"
                            >
                                Postcode / ZIP code
                            </label>
                        </div>
    
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="phoneship" name="phoneship" placeholder=" " 
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="phoneship" 
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 
                                peer-focus:text-xs 
                                peer-focus:text-gray-800 
                                peer-[:not(:placeholder-shown)]:top-1 
                                peer-[:not(:placeholder-shown)]:text-xs 
                                peer-[:not(:placeholder-shown)]:text-gray-500"
                            >
                                Phone (optional)
                            </label>
                        </div>
                    </div>
                </Transition>


                <div>
                    <p class="text-[13px] mt-10">
                        By clicking below and placing your order, you agree (i) to make your purchase
                        from Global-e as merchant of record for this transaction, subject to Global-e's
                        <u>Terms &amp; Conditions</u>; (ii) that your information will be handled by Global-e in
                        accordance with the Global-e <u>Privacy Policy</u>; and (iii) that your information
                        (excluding the payment details) will be shared between Global-e and LemonTree.
                    </p>
                </div>

                <div>
                    <div class="mt-10">
                        <h3 class="text-[15px]">
                            Carbon Offset
                        </h3>
                        <div class="flex">
                            <p class="mt-2 text-gray-500 text-[13px]">
                                Learn more about how we do this.
                            </p>
                            <div>
                                
                            </div>
                        </div>
                    </div>
    
                    <div class="flex border border-gray-300 p-2 mt-3">
                        <input type="checkbox" name="" id="">
                        <p class="text-[13px] pl-2">
                            Offset CO2 emissions from shipping for $0.15
                        </p>
                    </div>
                </div>

                <Transition
                    @enter="onEnter"
                    @after-enter="onAfterEnter"
                    @leave="onLeave"
                    @after-leave="onAfterLeave"
                >
                    <div class="mb-3" v-if="!isBottomOpen">
                        <div  >
                            <button class="p-2 text-[13px] border border-gray-200 mt-10 mb-3">
                                Add discount
                            </button>
                        </div>

                        
                        <button 
                            @click="bottomToggle"
                            class="block w-full text-left appearance-none bg-transparent p-0 m-0 border-none outline-none group"
                        >
                            <div class="flex justify-between items-center gap-1"  >
                                <div class="flex justify-start gap-3">
                                    <div>
                                        <div class="inline-block border border-gray-200 p-0.5 bg-white">
                                            <img :src="cartStore.cart[0]?.img || '/placeholder.jpg'" class="w-10 h-10 object-cover bg-gray-100 flex-shrink:0" />
                                        </div>
                                    </div>
                                    <div>
                                        Total <br> 
                                        <span class="text-[11px]">{{ cartStore.cart.reduce((acc, item) => acc + item.quantity, 0) }} items</span> 
                                    </div>
                                </div>
                                <div class="flex justify-end gap-2 items-baseline">
                                    <div class="flex justify-end text-[18px] font-bold">
                                        ${{ subtotal.toFixed(2) }}
                                    </div>
                                    <div>
                                        <svg 
                                            :class="{'rotate-180': isBottomOpen}"
                                            class="w-4 h-4 transition-transform duration-300 ease-in-out text-gray-700 group-hover:text-gray-950" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor" 
                                            stroke-width="2"
                                        >
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                </Transition>



                <!-- =============== Bottom Total Products List Accordion =============== -->

                <Transition
                    @enter="onEnter"
                    @after-enter="onAfterEnter"
                    @leave="onLeave"
                    @after-leave="onAfterLeave"
                >

                    <div class="w-full max-w-md mt-10 rounded-lg overflow-hidden" v-if="isBottomOpen">
                        
                        <div class="flex justify-between items-center mb-2">
                            <button 
                            @click="bottomToggle"
                            class="w-full flex justify-between items-center  hover:bg-gray-50 transition-colors"
                            >
                                <span class="text-[20px] text-[#1a1a1a]  tracking-tight mr-2">
                                    Order summary
                                </span>
            
                                <svg 
                                    :class="{'rotate-180': isBottomOpen}"
                                    class="w-4 h-4 transition-transform duration-300 ease-in-out text-gray-700 group-hover:text-gray-950" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor" 
                                    stroke-width="2"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                        </div>

                        <!-- ========== Accordion Contents ========== -->


                    
                    
                        <div >
                            <div class=" text-gray-600 " >

                                <div class="
                                    flex-1 bg-white overflow-hidden  
                                    overflow-y-auto max-h-[70vh] hide-scrollbar scrollbar-gutter:stable 
                                    scroll-smooth 
                                ">
                                    <div
                                        v-for="item in cartStore.cart"
                                        :key="item.id"
                                        class="flex items-start group gap-2 mb-2"
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

                            <div class="flex justify-between mt-2 mb-1 gap-2">
                                <div class="relative border border-gray-300 focus-within:ring-2 focus-within:ring-black">
                                    <input type="text" id="firstname" name="firstname" 
                                            placeholder=" " autocomplete="given-name"
                                            v-model="discountcode"
                                        class="peer w-62 h-11 border text-[13px] border-gray-100 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="firstname" 
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 
                                        peer-focus:text-xs 
                                        peer-focus:text-gray-800 
                                        peer-[:not(:placeholder-shown)]:top-1 
                                        peer-[:not(:placeholder-shown)]:text-xs 
                                        peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >
                                        Discount code or gift card
                                    </label>
                                </div>
                                <button class="border text-[13px] transition-color duration-300 border-gray-300 text-gray-500 px-2"
                                        :disabled="isApplyDisabled"
                                        :class="isApplyDisabled ? 'bg-gray-50 ' : 'bg-black text-white'"
                                >
                                    APPLY
                                </button>
                            </div>

                            <div class="flex justify-between mt-5 mb-2">
                                <div class="text-[13px] ">
                                    Subtotal - {{ cartStore.cart.reduce((acc, item) => acc + item.quantity, 0) }} items
                                </div>
                                <div class="">
                                    ${{ subtotal.toFixed(2) }}
                                </div>
                            </div>

                            <div class="flex justify-between">
                                <div class="text-[13px] ">
                                    Shipping 
                                </div>
                                <div class="">
                                    Free
                                </div>
                            </div>

                            <div class="flex justify-between my-5">
                                <div class=" text-[20px]">
                                    Total
                                </div>
                                <div class="">
                                    ${{ total.toFixed(2) }}
                                </div>
                            </div>

                        </div>
                    </div>
                </Transition>

                                    <!-- ========== PAY NOW BUTTON ========== -->

                <div class="flex-grid ">
                    <div class="w-full">
                        <button class="flex w-full justify-center items-center bg-black text-white text-[15px] py-3 ">
                            PAY NOW
                        </button>
                    </div>
                    <div class="flex p-5 gap-3 bg-gray-100 border border-gray-200 mt-4">
                        <div class="flex">
                            <div class="mr-3">
                               <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke-width="1.5" 
                                    stroke="currentColor" 
                                    class="w-5 h-5 text-gray-400"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[13px] text-gray-700 leading-normal">
                                    The total amount you pay includes all applicable customs duties & taxes. 
                                    We guarantee no additional charges on delivery.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>

        <div class="border border-gray-300 "></div>

        <div class="flex-grid justify-between my-5">
            <div class="flex gap-5 justify-center text-[13px] underline">
                <div>Refund Policy.</div>
                <div>Privacy Policy.</div>
            </div>
            <div class="flex gap-5 justify-center text-[13px] underline">
                <div>Terms of Service</div>
                <div>Contact</div>
            </div>
        </div>


    </div>


        <!-- =============== Desktop Version =============== -->

    <div>
        
    </div>
    
</template>

<style>
.iti {
    width: 100%;
    direction: rtl;
}

.iti__tel-input {
    direction: ltr;
    text-align: left;
}
</style>