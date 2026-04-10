<script setup lang="ts">
    import { useCartStore } from '../stores/cart';

    const cartStore = useCartStore();
</script>


<template>
        <!-- =============== Mobible Vsersion =============== -->
            
    <div class="overflow-y-auto" style="max-height: 360px;">

        <!-- =============== Populated State =============== -->

        <ul v-if="cartStore.cart.length > 0">
            <li
            v-for="(item, index) in cartStore.cart"
            :key="item.id"
            class="flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0"
            >
            <!-- Thumbnail -->
            <img
                :src="item.img || '/placeholder.jpg'"
                :alt="item.title"
                class="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
            />

            <!-- Info -->
            <div class="flex-1 min-w-0">
                <p class="text-xs uppercase tracking-widest text-gray-300 mb-0.5">
                    {{ item.category }}
                </p>
                <h3 class="text-sm font-medium text-gray-900 truncate mb-2">
                    {{ item.title }}
                </h3>

                <div class="flex items-center justify-between">

                        <!-- Quantity Controls -->
                    <div class="flex items-center border border-gray-200 rounded-md overflow-hidden">
                        <button
                            @click="cartStore.decreaseQty(item)"
                            class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors text-base leading-none"
                        >−
                        </button>
                        <span class="text-xs font-medium text-gray-800 w-5 text-center">
                            {{ item.quantity || 1 }}
                        </span>
                        <button
                            @click="cartStore.increaseQty(item)"
                            class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors text-base leading-none"
                        >+
                        </button>
                    </div>

                    <!-- Item Price -->
                    <span class="text-sm font-medium text-gray-900">
                        ${{ item.price.toFixed(2) }}
                    </span>
                </div>
            </div>

            <!-- Remove Button -->
            <button
                @click="cartStore.removeItem(item)"
                class="self-start mt-0.5 text-gray-300 hover:text-gray-600 transition-colors text-lg leading-none"
            >×</button>
            </li>
        </ul>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-16 px-6 text-center">
            <p class="text-xs uppercase tracking-widest text-gray-300 mb-3">Your cart is empty</p>
            <p class="text-sm text-gray-400">Explore our collections to find something you love.</p>
        </div>

    </div>

        <!-- =============== Desktop Vsersion =============== -->

    <div>

    </div>

</template>