<script setup lang="ts">
    import { ref, reactive, computed, onMounted, onUnmounted, watchEffect } from 'vue';
    import { useCartStore } from '../stores/cart';
    import type { ZodIssue } from 'zod';
    import intlTelInput from 'intl-tel-input';
    import 'intl-tel-input/styles';
    import { checkoutSchema } from '../schemas/checkoutSchema';

    const formErrors = ref<Record<string, string>>({});

    // ── Store ──────────────────────────────────────────────────────────────────
    const cartStore = useCartStore();

    // ── Cart / Pricing ─────────────────────────────────────────────────────────
    const subtotal = computed<number>(() => cartStore.totalPrice);
    const shipping = computed<number>(() => (subtotal.value > 1 ? 0 : 9.99));
    const total    = computed<number>(() => subtotal.value + shipping.value);

    // ── Discount Code ──────────────────────────────────────────────────────────
    const discountcode      = ref<string>('');
    const isApplyDisabled   = computed(() => discountcode.value.length === 0);

    // ── Accordion Toggles ──────────────────────────────────────────────────────
    const isOpen       = ref<boolean>(false);
    const toggle       = () => { isOpen.value = !isOpen.value; };

    const isBottomOpen = ref<boolean>(false);
    const bottomToggle = () => { isBottomOpen.value = !isBottomOpen.value; };

    // ── Tooltip ────────────────────────────────────────────────────────────────
    const showTooltip = ref<boolean>(false);

    // ── Shipping Form Fields ───────────────────────────────────────────────────
    // ── Contact ──────────────────────────────────────────────────────────────────


    // ── Checkout Form ──────────────────────────────────────────────────────────
    const checkoutForm = reactive({

        email: '',
        useShippingAsBilling: true,
        billingOptions: 'same',

        // Shipping address (Delivery section)
        shipping: {
            firstName: '',
            lastName:  '',
            address:   '',
            apartment: '',
            city:      '',
            state:     '',
            postcode:  '',
            country:   '',
            phone:     '',
        },

        // Block B — billing inside credit card accordion (useShippingAsBilling === false)
        billingSameFlow: {
            firstName: '',
            lastName:  '',
            address:   '',
            apartment: '',
            city:      '',
            state:     '',
            postcode:  '',
            country:   '',
            phone:     '',
        },

        // Block C — standalone billing section (billingOptions === 'different')
        billingDifferent: {
            firstName: '',
            lastName:  '',
            address:   '',
            apartment: '',
            city:      '',
            state:     '',
            postcode:  '',
            country:   '',
            phone:     '',
        },

        // Payment
        payment: {
            method:  'credit' as 'credit' | 'Klarna' | 'PayPal',
            cardNumber:     '',
            expirationDate: '',
            securityCode:   '',
            nameOnCard:     '',
        },

    });

    function handlePayNow() {
        formErrors.value = {};

        const result = checkoutSchema.safeParse(checkoutForm);

        if (!result.success) {
            result.error.issues.forEach((issue: ZodIssue) => {
                const key =issue.path.join('.');
                formErrors.value[key] = issue.message;
            });
            return;
        }

        console.log('Valid payload:', result.data);
    }

    function validateField(path: string) {
        // Get the value at this path from checkoutForm
        const keys = path.split('.');
        let value: any = checkoutForm;
        for (const key of keys) {
            value = value?.[key];
        }

        // Don't validate empty fields on blur — let submit handle that
        if (value === '' || value === null || value === undefined) {
            delete formErrors.value[path];
            return;
        }
        
        const result = checkoutSchema.safeParse(checkoutForm);
        if (!result.success) {
            const issue = result.error.issues.find(i => i.path.join('.') === path);
            if (issue) {
                formErrors.value[path] = issue.message;
            } else {
                delete formErrors.value[path];
            }
        } else {
            delete formErrors.value[path];
        }
    }

    // ── SMS / Text Me ──────────────────────────────────────────────────────────
    const isTextMeChecked = ref<boolean>(false);
    const smsPhone        = ref<string>('');



    const shippingPhoneInputRef  = ref<HTMLInputElement | null>(null);  // for input #1
    const textMePhoneInputRef    = ref<HTMLInputElement | null>(null);  // for input #2
    const smsPhoneInputRef       = ref<HTMLInputElement | null>(null);  // for input #3 (already exists)

    let itiShipping: any = null;
    let itiTextMe:   any = null;
    let itiSms:      any = null;

    watchEffect(() => {
    if (shippingPhoneInputRef.value && !itiShipping) {
        itiShipping = intlTelInput(shippingPhoneInputRef.value, { nationalMode: false, separateDialCode: false, allowDropdown: false });
    }
    });
    watchEffect(() => {
        if (textMePhoneInputRef.value && !itiTextMe) {
            itiTextMe = intlTelInput(textMePhoneInputRef.value, { nationalMode: false, separateDialCode: false, allowDropdown: false });
        }
    });
    watchEffect(() => {
        if (smsPhoneInputRef.value && !itiSms) {
            itiSms = intlTelInput(smsPhoneInputRef.value, { nationalMode: false, separateDialCode: false, allowDropdown: false });
        }
    });

    // ── Shipping Phone (intl-tel-input) ────────────────────────────────────────
    const textMePhone = ref<string>('');

    const phoneContainer = ref(null);

    const saveInfoPhoneContainer = ref(null)

    const co2offset = ref<boolean>(false);

    // ── Tooltip – click-outside handler ───────────────────────────────────────
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        if (phoneContainer.value && !(phoneContainer.value as HTMLElement).contains(event.target as Node)) {
            showTooltip.value = false;
        }
    };

    onMounted(() => {
        window.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('touchstart', handleClickOutside);
    });

    onUnmounted(() => {
        window.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('touchstart', handleClickOutside);
    });

    // ── Accordion CSS-transition hooks ────────────────────────────────────────
    function onEnter(el: Element) {
        const htmlEl = el as HTMLElement;
        htmlEl.style.height    = '0';
        htmlEl.style.overflow  = 'hidden';
        htmlEl.style.opacity   = '0';
        htmlEl.style.transition = 'height 0.4s ease, opacity 0.4s ease';
        requestAnimationFrame(() => {
            htmlEl.style.height  = htmlEl.scrollHeight + 'px';
            htmlEl.style.opacity = '1';
        });
    }

    function onAfterEnter(el: Element) {
        const htmlEl = el as HTMLElement;
        htmlEl.style.height   = 'auto';
        htmlEl.style.overflow = '';
    }

    function onLeave(el: Element) {
        const htmlEl = el as HTMLElement;
        htmlEl.style.height    = htmlEl.scrollHeight + 'px';
        htmlEl.style.overflow  = 'hidden';
        htmlEl.style.transition = 'height 0.3s ease, opacity 0.3s ease';
        requestAnimationFrame(() => {
            htmlEl.style.height  = '0';
            htmlEl.style.opacity = '0';
        });
    }

    function onAfterLeave(el: Element) {
        const htmlEl = el as HTMLElement;
        htmlEl.style.height   = '';
        htmlEl.style.opacity  = '';
        htmlEl.style.overflow = '';
    }

    const showMoreOptions = computed(() =>
        checkoutForm.payment.method === 'Klarna' || checkoutForm.payment.method === 'PayPal'
    );
</script>

<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet"></link>


<template>

        <!-- =============== Mobile Version =============== -->

    <form @submit.prevent="handlePayNow" novalidate >

    

    <div class="flex-col lg:hidden">

        <div class="flex justify-center items-center bg-white px-8 h-16 my-4 ">
            <h1 class="text-3xl tracking-[0.2em] text-gray-800 font-light">LemonTree</h1>
        </div>

        <div>
            <div class="w-full max-w-md border-y border-gray-300 overflow-hidden">
                
                <div class="flex justify-between items-center bg-gray-100">
                    <button type="button"
                    @click="toggle"
                    class="w-full flex justify-between  items-center p-4  hover:bg-gray-50 transition-colors"
                    >
                        <span class="text-[13px] text-[#1a1a1a] font-normal tracking-tight mr-2">
                            Order summary
                        </span>
                        
                        <div class="flex items-end">
                            <div v-if="isOpen === false" class="font-sans text-[16px] font-bold tracking-tight text-gray-900 me-4">
                                ${{ total.toFixed(2) }}
                            </div>    
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
                        </div>
                    </button>
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
                                    placeholder=" " autocomplete="off"
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
                        <button type="button"
                                class="border text-[13px] transition-color duration-300 border-gray-300 text-gray-500 px-2"
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
                <button type="button" class="bg-[#5a31f4] w-full mt-4 py-2 rounded flex justify-center items-center">
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
                    v-model="checkoutForm.email"
                    id="email"
                    autocomplete="email" 
                    name="email" 
                    placeholder=" "
                    @blur="validateField('email')"
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
            <p v-if="formErrors['email']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['email'] }}</p>

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
                        <select name="country" id="country" v-model="checkoutForm.shipping.country"
                        @blur="validateField('shipping.country')"
                        class="peer block w-full appearance-none border-[1.5px] border-black bg-white mt-3 px-3 pb-1 pt-4 text-[13px] focus:outline-none focus:ring-0"
                        >
                            <option value="" disabled>Select country</option> 
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
                <p v-if="formErrors['shipping.country']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.country'] }}</p>

                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="firstname" name="firstname" 
                        placeholder=" " autocomplete="given-name"
                        v-model="checkoutForm.shipping.firstName"
                        @blur="validateField('shipping.firstName')"
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
                <p v-if="formErrors['shipping.firstName']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.firstName'] }}</p>
                
                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="lastname" name="lastname" autocomplete="family-name"
                        placeholder=" " 
                        v-model="checkoutForm.shipping.lastName"
                        @blur="validateField('shipping.lastName')"
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
                <p v-if="formErrors['shipping.lastName']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.lastName'] }}</p>

                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="address" name="address" autocomplete="street-address"
                        placeholder=" " 
                        v-model="checkoutForm.shipping.address"
                        @blur="validateField('shipping.address')"
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
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg 
                        class="w-4 h-4 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                        </svg>
                    </div>
                </div>
                <p v-if="formErrors['shipping.address']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.address'] }}</p>

                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="apartment" name="apartment" 
                        autocomplete="address-line2" placeholder=" " 
                        v-model="checkoutForm.shipping.apartment"
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
                    <input type="text" id="city" name="city" autocomplete="address-level2"
                        placeholder=" " 
                        v-model="checkoutForm.shipping.city"
                        @blur="validateField('shipping.city')"
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
                <p v-if="formErrors['shipping.city']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.city'] }}</p>

                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                    <input type="text" id="state" name="state" 
                        placeholder=" " autocomplete="address-level1"
                        v-model="checkoutForm.shipping.state"
                        @blur="validateField('shipping.state')"
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
                <p v-if="formErrors['shipping.state']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.state'] }}</p>

                <div class="relative mt-3 focus-within:border-black transition-all">
                    <input type="text" id="postcode" name="postcode" 
                        autocomplete="postal-code" placeholder=" " 
                        v-model="checkoutForm.shipping.postcode"
                        @blur="validateField('shipping.postcode')"
                        class="peer w-full h-full border border-gray-300 text-[13px] pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
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
                <p v-if="formErrors['shipping.postcode']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.postcode'] }}</p>

                <div class="relative mt-3 focus-within:border-black transition-all">
                    <input  ref="shippingPhoneInputRef" type="tel" id="phone" name="phone" 
                        placeholder=" " 
                        v-model="checkoutForm.shipping.phone"
                        @blur="validateField('shipping.phone')"
                        @focus="showTooltip = false"
                        class="peer pr-10 w-full h-full border text-[13px] border-gray-300 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                    >
                    <label 
                        for="phone" 
                        class="absolute left-10 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                        peer-focus:top-1 
                        peer-focus:text-xs 
                        peer-focus:text-gray-800 
                        peer-[:not(:placeholder-shown)]:top-1 
                        peer-[:not(:placeholder-shown)]:text-xs 
                        peer-[:not(:placeholder-shown)]:text-gray-500"
                    >
                        Phone
                    </label>
                    <button type="button"
                            @click="showTooltip = !showTooltip" 
                            class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center p-1 cursor-help"
                    >
                        <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="w-4 h-4 text-gray-500" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        stroke-width="1.5" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"
                        >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </button>
                    <transition name="fade">
                    <div 
                        v-if="showTooltip"
                        class="absolute bottom-full right-0 translate-x-2 z-10 w-40 bg-[#1a1a1a] text-white text-[12px] p-2 shadow-xl"
                    >
                        <p class="leading-relaxed text-center">
                        In case we need to contact you about your order
                        </p>
                        <div class="absolute top-full right-5 -mt-1 border-8 border-transparent border-t-[#1a1a1a]"></div>
                    </div>
                    </transition>
                </div>
                <p v-if="formErrors['shipping.phone']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.phone'] }}</p>

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
                        <div class="relative flex items-center border">
                            
                            <div class="px-2 flex items-center">
                                <svg class="w-5 h-5 text-gray-400">...</svg>
                            </div>

                            <input
                                ref="textMePhoneInputRef"
                                id="textme-phone"
                                name="textme-phone"
                                type="tel"
                                v-model="textMePhone"
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
                    :class="checkoutForm.payment.method === 'credit'? 'border border-black bg-gray-100' : 'border border-gray-300 bg-white'"
                >
                    <div class="flex justify-between ml-3 ">
                        <div class="p-1">
                            <input type="radio" v-model="checkoutForm.payment.method" value="credit" class="absolute bottom-8 left-3">
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
                    <div class="flex-grid bg-gray-100 p-2" v-if="checkoutForm.payment.method === 'credit'">
                        
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="tel" id="cardnumber" name="cardnumber" 
                                placeholder=" " 
                                v-model="checkoutForm.payment.cardNumber"
                                @blur="validateField('payment.cardNumber')"
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
                        <p v-if="formErrors['payment.cardNumber']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['payment.cardNumber'] }}</p>

                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="expirationdate" name="expirationdate" 
                                placeholder=" " 
                                v-model="checkoutForm.payment.expirationDate"
                                @blur="validateField('payment.expirationDate')"
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
                        <p v-if="formErrors['payment.expirationDate']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['payment.expirationDate'] }}</p>

                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="securitycode" name="securitycode" 
                                placeholder=" " 
                                v-model="checkoutForm.payment.securityCode"
                                @blur="validateField('payment.securityCode')"
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
                        <p v-if="formErrors['payment.securityCode']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['payment.securityCode'] }}</p>

                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" id="nameoncard" name="nameoncard" 
                                placeholder=" " 
                                v-model="checkoutForm.payment.nameOnCard"
                                @blur="validateField('payment.nameOnCard')"
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
                        <p v-if="formErrors['payment.nameOnCard']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['payment.nameOnCard'] }}</p>

                        <label class="flex items-center space-x-3 mt-3 cursor-pointer">
                            <input 
                                type="checkbox" v-model="checkoutForm.useShippingAsBilling"
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

                        

                                    <!-- ========== Use Shipping As Billing ========== -->

                        <Transition
                            @enter="onEnter"
                            @after-enter="onAfterEnter"
                            @leave="onLeave"
                            @after-leave="onAfterLeave"
                        >
                            <div v-if="checkoutForm.useShippingAsBilling === false">
                                <div class="mt-5">
                                    <p class="text-[16px] font-normal">
                                        Billing address
                                    </p>
                                </div>
                                <div class="relative  w-full">
                                    <div>
                                        <select name="country" id="country" v-model="checkoutForm.billingSameFlow.country"
                                        @blur="validateField('billingSameFlow.country')"
                                        class="peer block w-full appearance-none border-[1.5px] border-black bg-white mt-3 px-3 pb-1 pt-4 text-[13px] focus:outline-none focus:ring-0"
                                        >
                                            <option value="" disabled>Select country</option> 
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
                                <p v-if="formErrors['billingSameFlow.country']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingSameFlow.country'] }}</p>
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="billing-firstname" name="billing-firstname" 
                                        placeholder=" " autocomplete="given-name"
                                        v-model="checkoutForm.billingSameFlow.firstName"
                                        @blur="validateField('billingSameFlow.firstName')"
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="billing-firstname" 
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
                                <p v-if="formErrors['billingSameFlow.firstName']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingSameFlow.firstName'] }}</p>
                                
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="billing-lastname" name="billing-lastname" autocomplete="family-name"
                                        placeholder=" " 
                                        v-model="checkoutForm.billingSameFlow.lastName"
                                        @blur="validateField('billingSameFlow.lastName')"
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="billing-lastname" 
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
                                <p v-if="formErrors['billingSameFlow.lastName']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingSameFlow.lastName'] }}</p>
            
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="billing-address" name="billing-address" autocomplete="street-address"
                                        placeholder=" " 
                                        v-model="checkoutForm.billingSameFlow.address"
                                        @blur="validateField('billingSameFlow.address')"
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="billing-address" 
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
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg 
                                        class="w-4 h-4 text-gray-400" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24" 
                                        xmlns="http://www.w3.org/2000/svg"
                                        >
                                        <path 
                                            stroke-linecap="round" 
                                            stroke-linejoin="round" 
                                            stroke-width="2" 
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        ></path>
                                        </svg>
                                    </div>
                                </div>
                                <p v-if="formErrors['billingSameFlow.address']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingSameFlow.address'] }}</p>
            
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="billing-apartment" name="billing-apartment" 
                                        autocomplete="address-line2" placeholder=" " 
                                        v-model="checkoutForm.billingSameFlow.apartment"
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="billing-apartment" 
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
                                    <input type="text" id="billing-city" name="billing-city" autocomplete="address-level2"
                                        placeholder=" " 
                                        v-model="checkoutForm.billingSameFlow.city"
                                        @blur="validateField('billingSameFlow.city')"
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="billing-city" 
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
                                <p v-if="formErrors['billingSameFlow.city']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingSameFlow.city'] }}</p>
            
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="billing-state" name="billing-state" 
                                        placeholder=" " autocomplete="address-level1"
                                        v-model="checkoutForm.billingSameFlow.state"
                                        @blur="validateField('billingSameFlow.state')"
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="billing-state" 
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
                                <p v-if="formErrors['billingSameFlow.state']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingSameFlow.state'] }}</p>
            
                                <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="billing-postcode" name="billing-postcode" 
                                        autocomplete="postal-code" placeholder=" " 
                                        v-model="checkoutForm.billingSameFlow.postcode"
                                        @blur="validateField('billingSameFlow.postcode')"
                                        class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="billing-postcode" 
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
                                <p v-if="formErrors['billingSameFlow.postcode']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingSameFlow.postcode'] }}</p>
            
                                <div ref="phoneContainer" class="relative mt-3 focus-within:border-black transition-all">
                                    <input type="tel" id="billing-phone" name="billing-phone" 
                                        placeholder=" " 
                                        v-model="checkoutForm.billingSameFlow.phone"
                                        @blur="validateField('billingSameFlow.phone')"
                                        @focus="showTooltip = false"
                                        class="peer pr-10 w-full h-full border text-[13px] bg-white border-gray-300 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black"
                                    >
                                    <label 
                                        for="billing-phone" 
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
                                    <button type="button"
                                            @click="showTooltip = !showTooltip" 
                                            class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center p-1 cursor-help"
                                    >
                                        <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        class="w-4 h-4 text-gray-500" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        stroke-width="1.5" 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round"
                                        >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                        </svg>
                                    </button>
                                    <transition name="fade">
                                    <div 
                                        v-if="showTooltip"
                                        class="absolute bottom-full right-0 translate-x-2 z-10 w-40 bg-[#1a1a1a] text-white text-[12px] p-2 shadow-xl"
                                    >
                                        <p class="leading-relaxed text-center">
                                        In case we need to contact you about your order
                                        </p>
                                        <div class="absolute top-full right-5 -mt-1 border-8 border-transparent border-t-[#1a1a1a]"></div>
                                    </div>
                                    </transition>
                                </div>
                                <p v-if="formErrors['billingSameFlow.phone']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingSameFlow.phone'] }}</p>


                            </div>
                        </Transition>
                        
                    </div>
            
                </Transition>

                            
                            <!-- ========== More Payment Options ========== -->
                <div class="flex relative   p-1  items-center justify-between"
                    :class="showMoreOptions ? 'border border-black bg-gray-100': 'border border-gray-300 bg-white'"
                >
                    <div class="flex justify-between ml-3 ">
                        <div class="p-1">
                            <input type="radio" :checked="showMoreOptions" @change="checkoutForm.payment.method = 'Klarna'" class="flex ml-1 absolute bottom-4 left-2">
                            <p class="text-[13px] font-medium pl-4">More Payment Options</p>
                        </div>
                        
                    </div>

                    <div class="flex justify-center items-center h-11 pr-4">
                        <button type="button" class="flex justify-center bg-white border border-gray-200 h-5 w-8 ">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" class="text-blue-500">
                                <circle cx="5" cy="12" r="3"></circle>
                                <circle cx="13" cy="12" r="3"></circle>
                                <circle cx="21" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- ========== This is where Klarna or PayPal choose options ========== -->

                <div v-if="showMoreOptions">
                    <div class="flex-grid mt-4 border-t border-gray-200">
                        
                        <label class="flex justify-between items-center border-b border-x border-gray-200 active:bg-gray-100 transition-colors">
                            <div class="flex items-center py-4"> 
                                <input type="radio" v-model="checkoutForm.payment.method" value="Klarna" name="moreOptions" class="ml-3 mr-3 w-4 h-4">
                                <p class="text-[13px] font-medium">Klarna</p>
                            </div>
                            <div class="mr-4">
                                <span class="text-[18px] font-[1000] tracking-tighter text-black font-sans">Klarna</span>
                            </div>
                        </label>

                        <label class="flex justify-between items-center border-b border-x border-gray-200 active:bg-gray-100 transition-colors">
                            <div class="flex items-center py-4">
                                <input type="radio" v-model="checkoutForm.payment.method" value="PayPal" name="moreOptions" class="ml-3 mr-3 w-4 h-4">
                                <p class="text-[13px] font-medium">PayPal</p>
                            </div>
                            <div class="flex mr-4">
                                <span class="text-[18px] font-[1000] italic tracking-tight text-[#003087]">Pay</span>
                                <span class="text-[18px] font-[1000] italic tracking-tight text-[#009cde]">Pal</span>
                            </div>
                        </label>

                    </div>

                    <div class="mt-3 px-1 min-h-[40px]">
                        <p v-if="checkoutForm.payment.method === 'Klarna'" class="text-[13px] leading-relaxed text-gray-600 font-normal">
                            After clicking <span class="whitespace-nowrap font-semibold">“Pay now”</span>, you will be redirected to Klarna to complete your purchase.
                        </p>
                        <p v-else-if="checkoutForm.payment.method === 'PayPal'" class="text-[13px] leading-relaxed text-gray-600 font-normal">
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


                <div v-if="showMoreOptions" class="flex-grid">
                    <p class="text-[13px] mb-3">
                        save my information for a faster checkout
                    </p>
                    <div class="flex items-stretch border border-gray-300 mt-4 p-2 max-w-sm">
                        
                        <div class="flex items-center justify-center pl-2 pr-1 text-gray-500 pointer-events-none">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                class="w-5 h-5" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                stroke-width="1.5" 
                                stroke-linecap="round" 
                                stroke-linejoin="round"
                            >
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                            </svg>
                        </div>

                        <input
                            ref="smsPhoneInputRef"
                            id="phone-sms"
                            name="phone-sms"
                            type="tel"
                            v-model="smsPhone"
                            placeholder="Mobile phone (optional)"
                            class="placeholder:text-[13px] py-2 px-3 w-full border-none outline-none ring-0"
                        />
                    </div>
                    <p class="text-gray-600 text-[11px] mt-5">
                        By providing you phone number, you agree to create a Shop account subject to <u> Shop's Terms</u> and <u>Privacy Policy</u>.
                    </p>
                </div>

                <div v-if="showMoreOptions" class="flex-grid">
                    <h2 class="my-2 text-[17px]  text-gray-900 mb-3 tracking-tight">
                        Billing address
                    </h2>
                    <div class="flex items-center p-4"
                        :class="checkoutForm.billingOptions === 'same'? 'border border-black bg-gray-200':'border border-gray-300 bg-white'"
                    >
                        <input type="radio" v-model="checkoutForm.billingOptions" value="same" name="billing">
                        <p class="ml-3 text-[13px] font-normal text-gray-800 tracking-tight">
                            Same as shipping address
                        </p>
                    </div>
                    <div class="flex items-center  p-4 "
                        :class="checkoutForm.billingOptions === 'different'? 'border border-black bg-gray-200':'border border-gray-300 bg-white'"
                    >
                        <input type="radio" v-model="checkoutForm.billingOptions" value="different" name="billing">
                        <p class="ml-3 text-[13px] font-normal text-gray-800 tracking-tight">
                            Use a different billing address
                        </p>
                    </div>

                <Transition
                    @enter="onEnter"
                    @after-enter="onAfterEnter"
                    @leave="onLeave"
                    @after-leave="onAfterLeave"
                >
                    
                    <div class="p-2 bg-gray-100" v-if="checkoutForm.billingOptions === 'different'">

                        <div class="relative  w-full focus-within:ring-2 focus-within:ring-black transition-border duration-300">
                            <div>
                                <select name="billing-country" id="billing-country" v-model="checkoutForm.billingDifferent.country"
                                class="peer block w-full appearance-none border-[1.5px] border-gray-300 bg-white mt-3 px-3 pb-1 pt-4 text-[13px] focus:outline-none focus:ring-0"
                                >
                                    <option value="" disabled>Select country</option> 
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
                                    for="billing-country"
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
                            <input type="text" v-model="checkoutForm.billingDifferent.firstName" id="billing2-firstname" name="billing2-firstname" placeholder=" " autocomplete="given-name"
                                @blur="validateField('billingDifferent.firstName')"
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="billing2-firstname" 
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
                        <p v-if="formErrors['billingDifferent.firstName']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.firstName'] }}</p>
                        
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" v-model="checkoutForm.billingDifferent.lastName" autocomplete="family-name"
                                id="billing2-lastname" name="billing2-lastname" placeholder=" "
                                @blur="validateField('billingDifferent.lastName')"
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="billing2-lastname" 
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
                        <p v-if="formErrors['billingDifferent.lastName']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.lastName'] }}</p>
    
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" v-model="checkoutForm.billingDifferent.address" autocomplete="street-address"
                                id="billing2-address" name="billing2-address" placeholder=" "
                                @blur="validateField('billingDifferent.address')"
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="billing2-address" 
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
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg 
                                class="w-4 h-4 text-gray-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg"
                                >
                                <path 
                                    stroke-linecap="round" 
                                    stroke-linejoin="round" 
                                    stroke-width="2" 
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                ></path>
                                </svg>
                            </div>
                        </div>
                        <p v-if="formErrors['billingDifferent.address']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.address'] }}</p>
    
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" v-model="checkoutForm.billingDifferent.apartment" id="billing2-apartment" name="billing2-apartment" autocomplete="address-line2" placeholder=" " 
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="billing2-apartment" 
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
                            <input type="text" v-model="checkoutForm.billingDifferent.city" autocomplete="address-level2"
                                id="billing2-city" name="billing2-city" placeholder=" "
                                @blur="validateField('billingDifferent.city')"
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="billing2-city" 
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
                        <p v-if="formErrors['billingDifferent.city']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.city'] }}</p>
    
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" v-model="checkoutForm.billingDifferent.state" id="billing2-state" name="billing2-state" placeholder=" " autocomplete="address-level1"
                                @blur="validateField('billingDifferent.state')"
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="billing2-state" 
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
                        <p v-if="formErrors['billingDifferent.state']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.state'] }}</p>
    
                        <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                            <input type="text" v-model="checkoutForm.billingDifferent.postcode" id="billing2-postcode" name="billing2-postcode" autocomplete="postal-code" placeholder=" "
                                @blur="validateField('billingDifferent.postcode')"
                                class="peer w-full h-full border text-[13px] bg-white border-gray-200 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black transition-border duration-500 bg-transparent"
                            >
                            <label 
                                for="billing2-postcode" 
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
                        <p v-if="formErrors['billingDifferent.postcode']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.postcode'] }}</p>
    
                        <div ref="saveInfoPhoneContainer" class="relative mt-3 focus-within:border-black transition-all">
                            <input type="tel" v-model="checkoutForm.billingDifferent.phone" id="billing2-phone" name="billing2-phone" placeholder=" " 
                                @blur="validateField('billingDifferent.phone')"
                                @focus="showTooltip = false"
                                class="peer pr-10 w-full h-full border text-[13px] bg-white border-gray-300 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black"
                            >
                            <label 
                                for="billing2-phone" 
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
                            <button type="button"
                                    @click="showTooltip = !showTooltip" 
                                    class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center p-1 cursor-help"
                            >
                                <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                class="w-4 h-4 text-gray-500" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                stroke-width="1.5" 
                                stroke-linecap="round" 
                                stroke-linejoin="round"
                                >
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </button>
                            <transition name="fade">
                            <div 
                                v-if="showTooltip"
                                class="absolute bottom-full right-0 translate-x-2 z-10 w-40 bg-[#1a1a1a] text-white text-[12px] p-2 shadow-xl"
                            >
                                <p class="leading-relaxed text-center">
                                In case we need to contact you about your order
                                </p>
                                <div class="absolute top-full right-5 -mt-1 border-8 border-transparent border-t-[#1a1a1a]"></div>
                            </div>
                            </transition>
                        </div>
                        <p v-if="formErrors['billingDifferent.phone']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.phone'] }}</p>
                    </div>
                </Transition>
                </div><!-- end v-if="checkoutForm.payment.method === 'more'" -->


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
                        <input type="checkbox" name="co2-offset" id="co2-offset" v-model="co2offset">
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
                            <button type="button" class="p-2 text-[13px] border border-gray-200 mt-10 mb-3">
                                Add discount
                            </button>
                        </div>

                        
                        <button type="button"
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
                            <button type="button"
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
                                    <input type="text" id="discountcode-bottom" name="discountcode-bottom" 
                                            placeholder=" " autocomplete="off"
                                            v-model="discountcode"
                                        class="peer w-62 h-11 border text-[13px] border-gray-100 pt-5 pb-1 px-3 text-black focus-within:ring-2 focus-within:ring-black bg-transparent"
                                    >
                                    <label 
                                        for="discountcode-bottom" 
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
                                <button type="button"
                                        class="border text-[13px] transition-color duration-300 border-gray-300 text-gray-500 px-2"
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
                        <button type="submit"
                            class="flex w-full justify-center items-center bg-black text-white text-[15px] py-3 ">
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

 <!-- Hidden on mobile (below lg), shown on lg+ -->
    <div class="hidden lg:flex flex-col min-h-screen bg-white">
 
        <!-- ── Full-width brand header ── -->
        <div class="w-full flex justify-center items-center h-24 border-b border-gray-200 flex-shrink-0 ">
            <h1 class="text-3xl tracking-[0.2em] text-gray-800 font-light">LemonTree</h1>
        </div>
 
        <form @submit.prevent="handlePayNow" novalidate class="flex flex-1 justify-center">
 
            <!-- Centered wrapper with max-width -->
            <div class="flex w-full max-w-4xl xl:max-w-5xl">
 
            <!-- ══════════════════════════════════════════
                 LEFT COLUMN — Contact, Delivery, Payment
            ══════════════════════════════════════════ -->
            <div class="flex-1 flex flex-col overflow-y-auto border-r border-gray-200">
 
                <!-- Scrollable form body -->
                <div class="flex-1 px-12 xl:px-20 xl:pr-10 py-8 w-full">
 
                    <!-- Express Checkout -->
                    <div class="mb-8">
                        <p class="text-center text-[12px] text-gray-400 tracking-wide mb-3">Express checkout</p>
                        <button type="button"
                            class="block w-72 mx-auto bg-[#5a31f4] text-white font-bold text-[15px] py-3 tracking-wide hover:bg-[#4925d0] transition-colors duration-200"
                        >
                            shop
                        </button>
                        <div class="flex items-center gap-3 mt-5">
                            <div class="flex-1 h-px bg-gray-200"></div>
                            <span class="text-[12px] text-gray-400">OR</span>
                            <div class="flex-1 h-px bg-gray-200"></div>
                        </div>
                    </div>
 
                    <!-- ── Contact ── -->
                    <div class="mb-8">
                        <div class="flex justify-between items-baseline mb-3">
                            <h2 class="text-[15px] font-medium text-gray-900">Contact</h2>
                            <a href="#" class="text-[13px] text-gray-600 underline underline-offset-2">Sign in</a>
                        </div>
 
                        <div class="relative border border-gray-300 focus-within:border-black transition-all">
                            <input
                                type="email" id="email-desktop" name="email"
                                placeholder=" "
                                v-model="checkoutForm.email"
                                @blur="validateField('email')"
                                class="peer w-full h-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                            />
                            <label
                                for="email-desktop"
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                            >Email</label>
                        </div>
                        <p v-if="formErrors['email']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['email'] }}</p>
 
                        <div class="flex items-center mt-3">
                            <input type="checkbox" id="news-desktop" class="mr-2">
                            <label for="news-desktop" class="text-[13px] text-gray-700">Email me with news and offers</label>
                        </div>
                    </div>
 
                    <!-- ── Delivery ── -->
                    <div class="mb-8">
                        <h2 class="text-[15px] font-medium text-gray-900 mb-3">Delivery</h2>
 
                        <!-- Country -->
                        <div class="relative w-full mb-3">
                            <select name="country" id="country-desktop" v-model="checkoutForm.shipping.country"
                                @blur="validateField('shipping.country')"
                                class="peer block w-full appearance-none border border-gray-300 focus:border-black bg-white px-3 pb-1 pt-5 text-[13px] focus:outline-none transition-all"
                            >
                                <option value="" disabled>Select country</option>
                                <option value="AR">Argentina</option>
                                <option value="AU">Australia</option>
                                <option value="AT">Austria</option>
                                <option value="BS">Bahamas</option>
                                <option value="BD">Bangladesh</option>
                                <option value="BE">Belgium</option>
                                <option value="BR">Brazil</option>
                                <option value="CA">Canada</option>
                                <option value="CN">China</option>
                                <option value="DK">Denmark</option>
                                <option value="FI">Finland</option>
                                <option value="FR">France</option>
                                <option value="DE">Germany</option>
                                <option value="GR">Greece</option>
                                <option value="HK">Hong Kong</option>
                                <option value="IN">India</option>
                                <option value="IE">Ireland</option>
                                <option value="IL">Israel</option>
                                <option value="IT">Italy</option>
                                <option value="JP">Japan</option>
                                <option value="MX">Mexico</option>
                                <option value="NL">Netherlands</option>
                                <option value="NZ">New Zealand</option>
                                <option value="NO">Norway</option>
                                <option value="PH">Philippines</option>
                                <option value="PL">Poland</option>
                                <option value="PT">Portugal</option>
                                <option value="SG">Singapore</option>
                                <option value="ZA">South Africa</option>
                                <option value="KR">South Korea</option>
                                <option value="ES">Spain</option>
                                <option value="SE">Sweden</option>
                                <option value="CH">Switzerland</option>
                                <option value="TW">Taiwan</option>
                                <option value="TH">Thailand</option>
                                <option value="TR">Turkey</option>
                                <option value="AE">United Arab Emirates</option>
                                <option value="GB">United Kingdom</option>
                                <option value="US">United States</option>
                                <option value="VN">Vietnam</option>
                            </select>
                            <label
                                for="country-desktop"
                                class="absolute left-3 top-1.5 text-[11px] text-gray-400 pointer-events-none"
                            >Country/Region</label>
                            <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>
                        </div>
                        <p v-if="formErrors['shipping.country']" class="text-red-500 text-xs mt-1 px-1 mb-2">{{ formErrors['shipping.country'] }}</p>
 
                        <!-- First / Last name -->
                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="firstname-desktop" placeholder=" "
                                        v-model="checkoutForm.shipping.firstName"
                                        @blur="validateField('shipping.firstName')"
                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                                    />
                                    <label for="firstname-desktop"
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                        peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >First name</label>
                                </div>
                                <p v-if="formErrors['shipping.firstName']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.firstName'] }}</p>
                            </div>
                            <div>
                                <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="lastname-desktop" placeholder=" "
                                        v-model="checkoutForm.shipping.lastName"
                                        @blur="validateField('shipping.lastName')"
                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                                    />
                                    <label for="lastname-desktop"
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                        peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >Last name</label>
                                </div>
                                <p v-if="formErrors['shipping.lastName']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.lastName'] }}</p>
                            </div>
                        </div>
 
                        <!-- Address -->
                        <div class="relative border border-gray-300 focus-within:border-black transition-all mb-3">
                            <input type="text" id="address-desktop" placeholder=" "
                                v-model="checkoutForm.shipping.address"
                                @blur="validateField('shipping.address')"
                                class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                            />
                            <label for="address-desktop"
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                            >Address</label>
                            <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                </svg>
                            </div>
                        </div>
                        <p v-if="formErrors['shipping.address']" class="text-red-500 text-xs mt-1 px-1 mb-2">{{ formErrors['shipping.address'] }}</p>
 
                        <!-- Apartment -->
                        <div class="relative border border-gray-300 focus-within:border-black transition-all mb-3">
                            <input type="text" id="apartment-desktop" placeholder=" "
                                v-model="checkoutForm.shipping.apartment"
                                class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                            />
                            <label for="apartment-desktop"
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                            >Apartment, suite, etc. (optional)</label>
                        </div>
 
                        <!-- City / State / Postcode -->
                        <div class="grid grid-cols-3 gap-3 mb-3">
                            <div>
                                <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="city-desktop" placeholder=" "
                                        v-model="checkoutForm.shipping.city"
                                        @blur="validateField('shipping.city')"
                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                                    />
                                    <label for="city-desktop"
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                        peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >City</label>
                                </div>
                                <p v-if="formErrors['shipping.city']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.city'] }}</p>
                            </div>
                            <div>
                                <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="state-desktop" placeholder=" "
                                        v-model="checkoutForm.shipping.state"
                                        @blur="validateField('shipping.state')"
                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                                    />
                                    <label for="state-desktop"
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                        peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >State</label>
                                </div>
                                <p v-if="formErrors['shipping.state']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.state'] }}</p>
                            </div>
                            <div>
                                <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                    <input type="text" id="postcode-desktop" placeholder=" "
                                        v-model="checkoutForm.shipping.postcode"
                                        @blur="validateField('shipping.postcode')"
                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                                    />
                                    <label for="postcode-desktop"
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                        peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >Postcode</label>
                                </div>
                                <p v-if="formErrors['shipping.postcode']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.postcode'] }}</p>
                            </div>
                        </div>
 
                        <!-- Phone -->
                        <div class="relative border border-gray-300 focus-within:border-black transition-all" ref="phoneContainer">
                            <input
                                ref="shippingPhoneInputRef"
                                type="tel" id="phone-desktop" name="phone" placeholder=" "
                                v-model="checkoutForm.shipping.phone"
                                @blur="validateField('shipping.phone')"
                                class="peer w-full border-0 text-[13px] pt-5 pb-1 pl-10 pr-10 text-black bg-transparent focus:outline-none"
                            />
                            <label for="phone-desktop"
                                class="absolute left-10 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                            >Phone</label>
                            <button type="button"
                                @click="showTooltip = !showTooltip"
                                class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center p-1 cursor-help"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </button>
                            <transition name="fade">
                                <div v-if="showTooltip"
                                    class="absolute bottom-full right-0 translate-x-2 z-10 w-40 bg-[#1a1a1a] text-white text-[12px] p-2 shadow-xl"
                                >
                                    <p class="leading-relaxed text-center">In case we need to contact you about your order</p>
                                    <div class="absolute top-full right-5 -mt-1 border-8 border-transparent border-t-[#1a1a1a]"></div>
                                </div>
                            </transition>
                        </div>
                        <p v-if="formErrors['shipping.phone']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['shipping.phone'] }}</p>
 
                        <div class="flex items-center mt-3">
                            <input type="checkbox" id="textme-desktop" class="mr-2" v-model="isTextMeChecked">
                            <label for="textme-desktop" class="text-[13px]">Text me with news and offers</label>
                        </div>
 
                        <Transition @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave" @after-leave="onAfterLeave">
                            <div v-if="isTextMeChecked" class="mt-3">
                                <div class="relative flex items-center border border-gray-300">
                                    <input
                                        ref="textMePhoneInputRef"
                                        id="textme-phone-desktop" name="textme-phone" type="tel"
                                        v-model="textMePhone"
                                        placeholder="Mobile phone (optional)"
                                        class="py-3 px-3 w-full border-none outline-none ring-0 text-[13px]"
                                    />
                                </div>
                                <p class="text-[11px] text-gray-500 mt-2 leading-relaxed">
                                    By signing up via text, you agree to receive recurring automated marketing messages,
                                    including cart reminders, at the phone number provided. Consent is not a condition of purchase.
                                    Reply STOP to unsubscribe. View our
                                    <a href="#" class="underline hover:text-gray-700">Privacy policy</a> and
                                    <a href="#" class="underline hover:text-gray-700">Terms of service</a>.
                                </p>
                            </div>
                        </Transition>
                    </div>
 
                    <!-- ── Shipping Method ── -->
                    <div class="mb-8">
                        <h2 class="text-[15px] font-medium text-gray-900 mb-3">Shipping method</h2>
                        <div class="bg-gray-100 p-5">
                            <p class="text-[13px] text-gray-600 leading-relaxed">
                                Enter your shipping address to view available shipping methods.
                            </p>
                        </div>
                    </div>
 
                    <!-- ── Payment ── -->
                    <div class="mb-10">
                        <h2 class="text-[15px] font-medium text-gray-900">Payment</h2>
                        <p class="mt-1 text-[13px] text-gray-500 mb-3">All transactions are secure and encrypted.</p>
 
                        <!-- Credit / Debit card -->
                        <div class="relative p-3 pb-1 items-baseline"
                            :class="checkoutForm.payment.method === 'credit' ? 'border border-black bg-gray-100' : 'border border-gray-300 bg-white'"
                        >
                            <div class="flex justify-between ml-3">
                                <div class="p-1 flex items-center">
                                    <input type="radio" v-model="checkoutForm.payment.method" value="credit" class="mr-2">
                                    <p class="text-[13px] font-medium">Credit or Debit Card</p>
                                </div>
                                <div class="flex h-11 gap-2 items-center pr-2">
                                    <span class="text-[#1a1f71] font-bold italic text-xs">VISA</span>
                                    <div class="flex">
                                        <div class="w-3 h-3 rounded-full bg-red-500 opacity-80"></div>
                                        <div class="w-3 h-3 rounded-full bg-yellow-500 opacity-80 -ml-1.5"></div>
                                    </div>
                                    <span class="flex items-center h-5 w-10 p-1 text-white bg-blue-600 rounded font-bold text-[10px]">AMEX</span>
                                    <span class="flex justify-center bg-white border border-gray-200 w-6 h-4 text-slate-900 text-[10px] items-center">+3</span>
                                </div>
                            </div>
 
                            <Transition @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave" @after-leave="onAfterLeave">
                                <div class="bg-gray-100 p-2 mt-1" v-if="checkoutForm.payment.method === 'credit'">
                                    <!-- Card number -->
                                    <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                        <input type="tel" id="cardnumber-desktop" placeholder=" "
                                            v-model="checkoutForm.payment.cardNumber"
                                            @blur="validateField('payment.cardNumber')"
                                            class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus:outline-none"
                                        />
                                        <label for="cardnumber-desktop"
                                            class="absolute left-3 bottom-3 text-[13px] text-gray-600 transition-all duration-200 pointer-events-none
                                            peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                            peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                        >Card number</label>
                                    </div>
                                    <p v-if="formErrors['payment.cardNumber']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['payment.cardNumber'] }}</p>
 
                                    <!-- Expiry + Security side by side -->
                                    <div class="grid grid-cols-2 gap-3 mt-3">
                                        <div>
                                            <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                                <input type="text" id="expiry-desktop" placeholder=" "
                                                    v-model="checkoutForm.payment.expirationDate"
                                                    @blur="validateField('payment.expirationDate')"
                                                    class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus:outline-none"
                                                />
                                                <label for="expiry-desktop"
                                                    class="absolute left-3 bottom-3 text-[13px] text-gray-600 transition-all duration-200 pointer-events-none
                                                    peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                                    peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                                >Expiration (MM / YY)</label>
                                            </div>
                                            <p v-if="formErrors['payment.expirationDate']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['payment.expirationDate'] }}</p>
                                        </div>
                                        <div>
                                            <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                                <input type="text" id="cvv-desktop" placeholder=" "
                                                    v-model="checkoutForm.payment.securityCode"
                                                    @blur="validateField('payment.securityCode')"
                                                    class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus:outline-none"
                                                />
                                                <label for="cvv-desktop"
                                                    class="absolute left-3 bottom-3 text-[13px] text-gray-600 transition-all duration-200 pointer-events-none
                                                    peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                                    peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                                >Security code</label>
                                            </div>
                                            <p v-if="formErrors['payment.securityCode']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['payment.securityCode'] }}</p>
                                        </div>
                                    </div>
 
                                    <!-- Name on card -->
                                    <div class="relative mt-3 border border-gray-300 focus-within:border-black transition-all">
                                        <input type="text" id="nameoncard-desktop" placeholder=" "
                                            v-model="checkoutForm.payment.nameOnCard"
                                            @blur="validateField('payment.nameOnCard')"
                                            class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus:outline-none"
                                        />
                                        <label for="nameoncard-desktop"
                                            class="absolute left-3 bottom-3 text-[13px] text-gray-600 transition-all duration-200 pointer-events-none
                                            peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                            peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                        >Name on card</label>
                                    </div>
                                    <p v-if="formErrors['payment.nameOnCard']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['payment.nameOnCard'] }}</p>
 
                                    <!-- Use shipping as billing -->
                                    <label class="flex items-center space-x-3 mt-3 cursor-pointer">
                                        <input type="checkbox" v-model="checkoutForm.useShippingAsBilling"
                                            class="w-5 h-5 cursor-pointer appearance-none border-2 border-black bg-white rounded-none relative
                                            checked:bg-black transition-colors duration-200
                                            after:content-['✓'] after:absolute after:inset-0
                                            after:flex after:items-center after:justify-center
                                            after:text-white after:font-bold after:text-sm
                                            after:scale-0 after:opacity-0
                                            after:transition-all after:duration-300 after:ease-out
                                            checked:after:scale-100 checked:after:opacity-100"
                                        />
                                        <span class="text-[13px] text-black">Use shipping address as billing address</span>
                                    </label>
 
                                    <!-- Billing address (if different) -->
                                    <Transition @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave" @after-leave="onAfterLeave">
                                        <div v-if="checkoutForm.useShippingAsBilling === false" class="mt-4">
                                            <p class="text-[14px] font-normal mb-3">Billing address</p>
                                            <div class="relative w-full mb-3">
                                                <select v-model="checkoutForm.billingSameFlow.country"
                                                    @blur="validateField('billingSameFlow.country')"
                                                    class="peer block w-full appearance-none border border-gray-300 focus:border-black bg-white px-3 pb-1 pt-5 text-[13px] focus:outline-none"
                                                >
                                                    <option value="" disabled>Select country</option>
                                                    <option value="GB">United Kingdom</option>
                                                    <option value="US">United States</option>
                                                    <option value="TW">Taiwan</option>
                                                </select>
                                                <label class="absolute left-3 top-1.5 text-[11px] text-gray-400 pointer-events-none">Country/Region</label>
                                            </div>
                                            <div class="grid grid-cols-2 gap-3 mb-3">
                                                <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                                    <input type="text" placeholder=" " v-model="checkoutForm.billingSameFlow.firstName"
                                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus:outline-none" />
                                                    <label class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                                        peer-focus:top-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">First name</label>
                                                </div>
                                                <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                                    <input type="text" placeholder=" " v-model="checkoutForm.billingSameFlow.lastName"
                                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus:outline-none" />
                                                    <label class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                                        peer-focus:top-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">Last name</label>
                                                </div>
                                            </div>
                                            <div class="relative border border-gray-300 focus-within:border-black transition-all mb-3">
                                                <input type="text" placeholder=" " v-model="checkoutForm.billingSameFlow.address"
                                                    class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus:outline-none" />
                                                <label class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                                    peer-focus:top-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">Address</label>
                                            </div>
                                            <div class="relative border border-gray-300 focus-within:border-black transition-all mb-3">
                                                <input type="text" placeholder=" " v-model="checkoutForm.billingSameFlow.apartment"
                                                    class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus:outline-none" />
                                                <label class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                                    peer-focus:top-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">Apartment, suite, etc. (optional)</label>
                                            </div>
                                            <div class="grid grid-cols-3 gap-3">
                                                <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                                    <input type="text" placeholder=" " v-model="checkoutForm.billingSameFlow.city"
                                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus:outline-none" />
                                                    <label class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                                        peer-focus:top-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">City</label>
                                                </div>
                                                <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                                    <input type="text" placeholder=" " v-model="checkoutForm.billingSameFlow.state"
                                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus:outline-none" />
                                                    <label class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                                        peer-focus:top-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">State</label>
                                                </div>
                                                <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                                    <input type="text" placeholder=" " v-model="checkoutForm.billingSameFlow.postcode"
                                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-white focus:outline-none" />
                                                    <label class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                                        peer-focus:top-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">Postcode</label>
                                                </div>
                                            </div>
                                        </div>
                                    </Transition>
                                </div>
                            </Transition>
                        </div>
 
                        <!-- More Payment Options -->
                        <div class="flex relative p-1 items-center justify-between mt-2"
                            :class="showMoreOptions ? 'border border-black bg-gray-100' : 'border border-gray-300 bg-white'"
                        >
                            <div class="flex ml-3 items-center">
                                <input type="radio" :checked="showMoreOptions"
                                    @change="checkoutForm.payment.method = 'Klarna'"
                                    class="mr-2">
                                <p class="text-[13px] font-medium">More Payment Options</p>
                            </div>
                            <div class="flex justify-center items-center h-11 pr-4">
                                <button type="button" class="flex justify-center bg-white border border-gray-200 h-5 w-8">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" class="text-blue-500">
                                        <circle cx="5" cy="12" r="3"></circle>
                                        <circle cx="13" cy="12" r="3"></circle>
                                        <circle cx="21" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                            </div>
                        </div>
 
                        <div v-if="showMoreOptions">
                            <div class="flex-grid mt-4 border-t border-gray-200">
                                <label class="flex justify-between items-center border-b border-x border-gray-200 active:bg-gray-100 transition-colors cursor-pointer">
                                    <div class="flex items-center py-4">
                                        <input type="radio" v-model="checkoutForm.payment.method" value="Klarna" name="moreOptions-desktop" class="ml-3 mr-3 w-4 h-4">
                                        <p class="text-[13px] font-medium">Klarna</p>
                                    </div>
                                    <span class="text-[18px] font-[1000] tracking-tighter text-black font-sans mr-4">Klarna</span>
                                </label>
                                <label class="flex justify-between items-center border-b border-x border-gray-200 active:bg-gray-100 transition-colors cursor-pointer">
                                    <div class="flex items-center py-4">
                                        <input type="radio" v-model="checkoutForm.payment.method" value="PayPal" name="moreOptions-desktop" class="ml-3 mr-3 w-4 h-4">
                                        <p class="text-[13px] font-medium">PayPal</p>
                                    </div>
                                    <div class="flex mr-4">
                                        <span class="text-[18px] font-[1000] italic tracking-tight text-[#003087]">Pay</span>
                                        <span class="text-[18px] font-[1000] italic tracking-tight text-[#009cde]">Pal</span>
                                    </div>
                                </label>
                            </div>
                            <div class="mt-3 px-1 min-h-[40px]">
                                <p v-if="checkoutForm.payment.method === 'Klarna'" class="text-[13px] leading-relaxed text-gray-600">
                                    After clicking <span class="font-semibold">"Pay now"</span>, you will be redirected to Klarna to complete your purchase.
                                </p>
                                <p v-else-if="checkoutForm.payment.method === 'PayPal'" class="text-[13px] leading-relaxed text-gray-600">
                                    After clicking <span class="font-semibold">"Pay now"</span>, you will be redirected to PayPal.com to complete your purchase.
                                </p>
                            </div>
                        </div>
 
                        <!-- Payment Options row -->
                        <div class="flex justify-between mt-8">
                            <h3 class="text-[13px] text-gray-700">Payment Options</h3>
                            <div class="flex gap-1 items-center">
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
                    </div>
 
                    <!-- ── Billing Address ── -->
                    <div class="mb-8">
                        <h2 class="text-[15px] font-medium text-gray-900 mb-3">Billing address</h2>
                        <div class="flex items-center p-4 cursor-pointer"
                            :class="checkoutForm.billingOptions === 'same' ? 'border border-black bg-gray-100' : 'border border-gray-300 bg-white'"
                        >
                            <input type="radio" v-model="checkoutForm.billingOptions" value="same" name="billing-desktop" class="mr-3">
                            <p class="text-[13px] font-normal text-gray-800">Same as shipping address</p>
                        </div>
                        <div class="flex items-center p-4 cursor-pointer"
                            :class="checkoutForm.billingOptions === 'different' ? 'border border-black bg-gray-100' : 'border border-gray-300 bg-white'"
                        >
                            <input type="radio" v-model="checkoutForm.billingOptions" value="different" name="billing-desktop" class="mr-3">
                            <p class="text-[13px] font-normal text-gray-800">Use a different billing address</p>
                        </div>

                        <Transition
                            @enter="onEnter"
                            @after-enter="onAfterEnter"
                            @leave="onLeave"
                            @after-leave="onAfterLeave"
                        >
                            <div v-if="checkoutForm.billingOptions === 'different'" class="mt-3">
                                <!-- Country -->
                                <div class="relative w-full mb-3">
                                    <select name="billing-country-desktop" id="billing-country-desktop" v-model="checkoutForm.billingDifferent.country"
                                        class="peer block w-full appearance-none border border-gray-300 focus:border-black bg-white px-3 pb-1 pt-5 text-[13px] focus:outline-none transition-all"
                                    >
                                        <option value="" disabled>Select country</option>
                                        <option value="AR">Argentina</option>
                                        <option value="AU">Australia</option>
                                        <option value="AT">Austria</option>
                                        <option value="BS">Bahamas</option>
                                        <option value="BD">Bangladesh</option>
                                        <option value="BE">Belgium</option>
                                        <option value="BR">Brazil</option>
                                        <option value="CA">Canada</option>
                                        <option value="CN">China</option>
                                        <option value="DK">Denmark</option>
                                        <option value="FI">Finland</option>
                                        <option value="FR">France</option>
                                        <option value="DE">Germany</option>
                                        <option value="GR">Greece</option>
                                        <option value="HK">Hong Kong</option>
                                        <option value="IN">India</option>
                                        <option value="IE">Ireland</option>
                                        <option value="IL">Israel</option>
                                        <option value="IT">Italy</option>
                                        <option value="JP">Japan</option>
                                        <option value="MX">Mexico</option>
                                        <option value="NL">Netherlands</option>
                                        <option value="NZ">New Zealand</option>
                                        <option value="NO">Norway</option>
                                        <option value="PH">Philippines</option>
                                        <option value="PL">Poland</option>
                                        <option value="PT">Portugal</option>
                                        <option value="SG">Singapore</option>
                                        <option value="ZA">South Africa</option>
                                        <option value="KR">South Korea</option>
                                        <option value="ES">Spain</option>
                                        <option value="SE">Sweden</option>
                                        <option value="CH">Switzerland</option>
                                        <option value="TW">Taiwan</option>
                                        <option value="TH">Thailand</option>
                                        <option value="TR">Turkey</option>
                                        <option value="AE">United Arab Emirates</option>
                                        <option value="GB">United Kingdom</option>
                                        <option value="US">United States</option>
                                        <option value="VN">Vietnam</option>
                                    </select>
                                    <label for="billing-country-desktop"
                                        class="absolute left-3 top-1.5 text-[11px] text-gray-400 pointer-events-none"
                                    >Country/Region</label>
                                    <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                        <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </div>
                                </div>

                                <!-- First / Last name -->
                                <div class="grid grid-cols-2 gap-3 mb-3">
                                    <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                        <input type="text" id="bd-firstname-desktop" placeholder=" " autocomplete="given-name"
                                            v-model="checkoutForm.billingDifferent.firstName"
                                            @blur="validateField('billingDifferent.firstName')"
                                            class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                                        />
                                        <label for="bd-firstname-desktop"
                                            class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                            peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                            peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                        >First name</label>
                                    </div>
                                    <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                        <input type="text" id="bd-lastname-desktop" placeholder=" " autocomplete="family-name"
                                            v-model="checkoutForm.billingDifferent.lastName"
                                            @blur="validateField('billingDifferent.lastName')"
                                            class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                                        />
                                        <label for="bd-lastname-desktop"
                                            class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                            peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                            peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                        >Last name</label>
                                    </div>
                                </div>
                                <p v-if="formErrors['billingDifferent.firstName']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.firstName'] }}</p>
                                <p v-if="formErrors['billingDifferent.lastName']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.lastName'] }}</p>

                                <!-- Address -->
                                <div class="relative border border-gray-300 focus-within:border-black transition-all mb-3">
                                    <input type="text" id="bd-address-desktop" placeholder=" " autocomplete="street-address"
                                        v-model="checkoutForm.billingDifferent.address"
                                        @blur="validateField('billingDifferent.address')"
                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                                    />
                                    <label for="bd-address-desktop"
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                        peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >Address</label>
                                </div>
                                <p v-if="formErrors['billingDifferent.address']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.address'] }}</p>

                                <!-- Apartment -->
                                <div class="relative border border-gray-300 focus-within:border-black transition-all mb-3">
                                    <input type="text" id="bd-apartment-desktop" placeholder=" " autocomplete="address-line2"
                                        v-model="checkoutForm.billingDifferent.apartment"
                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                                    />
                                    <label for="bd-apartment-desktop"
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                        peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >Apartment, suite, etc. (optional)</label>
                                </div>

                                <!-- City / State / Postcode -->
                                <div class="grid grid-cols-3 gap-3 mb-3">
                                    <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                        <input type="text" placeholder=" " autocomplete="address-level2"
                                            v-model="checkoutForm.billingDifferent.city"
                                            @blur="validateField('billingDifferent.city')"
                                            class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none" />
                                        <label class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                            peer-focus:top-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">City</label>
                                    </div>
                                    <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                        <input type="text" placeholder=" " autocomplete="address-level1"
                                            v-model="checkoutForm.billingDifferent.state"
                                            @blur="validateField('billingDifferent.state')"
                                            class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none" />
                                        <label class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                            peer-focus:top-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">State</label>
                                    </div>
                                    <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                        <input type="text" placeholder=" " autocomplete="postal-code"
                                            v-model="checkoutForm.billingDifferent.postcode"
                                            @blur="validateField('billingDifferent.postcode')"
                                            class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none" />
                                        <label class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                            peer-focus:top-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">Postcode</label>
                                    </div>
                                </div>
                                <p v-if="formErrors['billingDifferent.city']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.city'] }}</p>
                                <p v-if="formErrors['billingDifferent.state']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.state'] }}</p>
                                <p v-if="formErrors['billingDifferent.postcode']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.postcode'] }}</p>

                                <!-- Phone -->
                                <div class="relative border border-gray-300 focus-within:border-black transition-all">
                                    <input type="tel" id="bd-phone-desktop" placeholder=" "
                                        v-model="checkoutForm.billingDifferent.phone"
                                        @blur="validateField('billingDifferent.phone')"
                                        class="peer w-full border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                                    />
                                    <label for="bd-phone-desktop"
                                        class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                        peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                        peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                                    >Phone (optional)</label>
                                </div>
                                <p v-if="formErrors['billingDifferent.phone']" class="text-red-500 text-xs mt-1 px-1">{{ formErrors['billingDifferent.phone'] }}</p>
                            </div>
                        </Transition>
                    </div>

                    <!-- ── Legal / Consent Text ── -->
                    <div class="mb-8">
                        <p class="text-[13px] text-gray-600 leading-relaxed">
                            By clicking below and placing your order, you agree (i) to make your purchase
                            from Global-e as merchant of record for this transaction, subject to Global-e's
                            <u>Terms &amp; Conditions</u>; (ii) that your information will be handled by Global-e in
                            accordance with the Global-e <u>Privacy Policy</u>; and (iii) that your information
                            (excluding the payment details) will be shared between Global-e and LemonTree.
                        </p>
                    </div>

                    <!-- ── Carbon Offset ── -->
                    <div class="mb-8">
                        <h2 class="text-[15px] font-medium text-gray-900 mb-1">Carbon Offset</h2>
                        <div class="flex items-center gap-1 mb-3">
                            <p class="text-[13px] text-gray-500">Learn more about how we do this.</p>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <div class="flex items-center border border-gray-300 p-4">
                            <input type="checkbox" name="co2-offset-desktop" id="co2-offset-desktop" v-model="co2offset" class="mr-3">
                            <label for="co2-offset-desktop" class="text-[13px] text-gray-800 cursor-pointer">
                                Offset CO2 emissions from shipping for $0.16
                            </label>
                        </div>
                    </div>

                    <!-- ── PAY NOW button ── -->
                    <button type="submit"
                        class="flex w-full justify-center items-center bg-black text-white text-[15px] py-4 hover:bg-gray-900 transition-colors duration-200 mb-6"
                    >
                        PAY NOW
                    </button>
 
                    
 
                </div>
            </div>
 
            <!-- ══════════════════════════════════════════
                 RIGHT COLUMN — Order Summary (fixed sidebar)
            ══════════════════════════════════════════ -->
            <div class="w-[380px] xl:w-[440px] flex-shrink-0 border-l border-gray-200 bg-gray-50 flex flex-col">
 
                <!-- Sticky inner wrapper -->
                <div class="sticky top-0 max-h-screen px-8 py-10">
 
                    <!-- Cart items -->
                    <div class="overflow-y-auto max-h-[40vh] hide-scrollbar scroll-smooth mb-6 pr-1">
                        <div
                            v-for="item in cartStore.cart"
                            :key="item.id"
                            class="flex items-start gap-3 mb-4"
                        >
                            <!-- Thumbnail -->
                            <div class="inline-block border border-gray-200 p-0.5 bg-white relative flex-shrink-0">
                                <img
                                    :src="item.img || '/placeholder.jpg'"
                                    :alt="item.title"
                                    class="w-16 h-16 object-cover bg-gray-100"
                                />
                                <div class="absolute top-0 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-md">
                                    {{ item.quantity }}
                                </div>
                            </div>
 
                            <!-- Info -->
                            <div class="flex-1 min-w-0">
                                <p class="font-light leading-relaxed text-[13px] text-gray-900">
                                    {{ item.title }} | Navy
                                </p>
                                <p class="text-[12px] text-gray-500 mt-0.5">{{ item.size || '' }}</p>
                            </div>
 
                            <p class="font-sans text-[13px] font-medium text-gray-900 tracking-tight tabular-nums flex-shrink-0">
                                ${{ (item.price * item.quantity).toFixed(2) }}
                            </p>
                        </div>
                    </div>
 
                    <!-- Divider -->
                    <div class="border-t border-gray-200 mb-5"></div>
 
                    <!-- Discount code -->
                    <div class="flex gap-2 mb-5">
                        <div class="relative border border-gray-300 focus-within:border-black transition-all flex-1">
                            <input type="text" id="discountcode-desktop" placeholder=" " autocomplete="off"
                                v-model="discountcode"
                                class="peer w-full h-11 border-0 text-[13px] pt-5 pb-1 px-3 text-black bg-transparent focus:outline-none"
                            />
                            <label for="discountcode-desktop"
                                class="absolute left-3 top-3 text-[13px] text-gray-400 transition-all duration-200 pointer-events-none
                                peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-800
                                peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                            >Discount code or gift card</label>
                        </div>
                        <button type="button"
                            :disabled="isApplyDisabled"
                            :class="isApplyDisabled ? 'bg-gray-50 text-gray-400 border-gray-300' : 'bg-black text-white border-black'"
                            class="border text-[13px] transition-colors duration-300 px-4 h-11"
                        >
                            APPLY
                        </button>
                    </div>
 
                    <!-- Divider -->
                    <div class="border-t border-gray-200 mb-5"></div>
 
                    <!-- Subtotal -->
                    <div class="flex justify-between mb-2">
                        <span class="text-[13px] text-gray-700">
                            Subtotal · {{ cartStore.cart.reduce((acc, item) => acc + item.quantity, 0) }} items
                        </span>
                        <span class="text-[13px] text-gray-900">${{ subtotal.toFixed(2) }}</span>
                    </div>
 
                    <!-- Shipping -->
                    <div class="flex justify-between mb-5">
                        <span class="text-[13px] text-gray-700">Shipping</span>
                        <span class="text-[13px] text-gray-500">{{ shipping === 0 ? 'Free' : 'Enter shipping address' }}</span>
                    </div>
 
                    <!-- Total -->
                    <div class="flex justify-between items-baseline border-t border-gray-200 pt-5">
                        <span class="text-[18px] font-normal text-gray-900">Total</span>
                        <span class="text-[18px] font-medium text-gray-900">USD ${{ total.toFixed(2) }}</span>
                    </div>

                    <!-- Tax notice -->
                    <div class="flex p-5 gap-3 bg-gray-100 border border-gray-200 mb-10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        <p class="text-[13px] text-gray-700 leading-normal">
                            The total amount you pay includes all applicable customs duties & taxes.
                            We guarantee no additional charges on delivery.
                        </p>
                    </div>
 
                </div>
            </div>
 
 
            </div><!-- end max-width wrapper -->
 
        </form>
 
        <!-- ── True full-width footer ── -->
        <div class="w-full border-t border-gray-200 py-6">
            <div class="flex gap-6 justify-center text-[13px] underline text-gray-600">
                <a href="#">Refund policy</a>
                <a href="#">Privacy policy</a>
                <a href="#">Terms of service</a>
                <a href="#">Contact</a>
            </div>
        </div>
 
    </div>
    </form>
    
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

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>