<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import MyHeader from '../components/MyHeader.vue';
import MyFooter from '../components/MyFooter.vue';
import TheToast from '../components/TheToast.vue';

const API = import.meta.env.VITE_API_URL;
const authStore = useAuthStore();
const router = useRouter();

// ── Tabs ──────────────────────────────────────────────────────────────────────
type Tab = 'info' | 'orders' | 'address';
const activeTab = ref<Tab>('info');

// ── Profile data ──────────────────────────────────────────────────────────────
interface SavedAddress { fullName: string; phone: string; address: string; city: string; }
interface Profile { email: string; name: string; provider: string; role: string; savedAddress: SavedAddress; createdAt: string; }

const profile = ref<Profile | null>(null);
const profileLoading = ref(true);
const profileError = ref('');

// ── Orders data ───────────────────────────────────────────────────────────────
interface OrderItem { name: string; quantity: number; subtotal: number; selectedSize?: string; selectedColor?: string; img?: string; }
interface Order {
    _id: string; orderId: string; status: string; totalAmount: number;
    createdAt: string; items: OrderItem[]; cancelledAt?: string; cancelReason?: string;
}
const orders = ref<Order[]>([]);
const ordersLoading = ref(false);
const ordersError = ref('');
const expandedOrder = ref<string | null>(null);
const cancellingOrderId = ref<string | null>(null);
const cancelError = ref('');

// ── Name edit ─────────────────────────────────────────────────────────────────
const editingName = ref(false);
const nameInput = ref('');
const nameSaving = ref(false);
const nameError = ref('');
const nameSuccess = ref(false);

// ── Address form ──────────────────────────────────────────────────────────────
const addressForm = ref<SavedAddress>({ fullName: '', phone: '', address: '', city: '' });
const addressFocused = ref<Record<string, boolean>>({});
const addressSaving = ref(false);
const addressError = ref('');
const addressSuccess = ref(false);

// ── Computed ──────────────────────────────────────────────────────────────────
const CANCELLABLE = ['Pending Payment'];

const statusColor = (status: string) => {
    const map: Record<string, string> = {
        'Pending Payment': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        'Paid':            'bg-blue-50 text-blue-700 border border-blue-200',
        'Processing':      'bg-purple-50 text-purple-700 border border-purple-200',
        'Shipped':         'bg-indigo-50 text-indigo-700 border border-indigo-200',
        'Completed':       'bg-green-50 text-green-700 border border-green-200',
        'Cancelled':       'bg-gray-100 text-gray-500 border border-gray-200',
    };
    return map[status] ?? 'bg-gray-100 text-gray-500';
};

const providerLabel = computed(() =>
    profile.value?.provider === 'google' ? 'Google' : 'Email OTP'
);

const inputClass = (hasError: boolean, focused: boolean) => [
    'border-b transition-all duration-150',
    hasError   ? 'border-red-400'  :
    focused    ? 'border-black'    : 'border-gray-200',
];

// ── API helpers ───────────────────────────────────────────────────────────────
async function fetchProfile() {
    profileLoading.value = true;
    profileError.value = '';
    try {
        const res = await fetch(`${API}/api/users/me/profile`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load profile');
        profile.value = await res.json();
        nameInput.value = profile.value!.name;
        addressForm.value = { ...profile.value!.savedAddress };
    } catch (e: unknown) {
        profileError.value = e instanceof Error ? e.message : 'Could not load profile';
    } finally {
        profileLoading.value = false;
    }
}

async function fetchOrders() {
    ordersLoading.value = true;
    ordersError.value = '';
    try {
        const res = await fetch(`${API}/api/users/me/orders`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load orders');
        orders.value = await res.json();
    } catch (e: unknown) {
        ordersError.value = e instanceof Error ? e.message : 'Could not load orders';
    } finally {
        ordersLoading.value = false;
    }
}

async function saveName() {
    if (!nameInput.value.trim()) { nameError.value = 'Name cannot be empty'; return; }
    nameSaving.value = true;
    nameError.value = '';
    nameSuccess.value = false;
    try {
        const res = await fetch(`${API}/api/users/me/name`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: profile.value!.email, name: nameInput.value.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save name');
        profile.value!.name = data.name;
        authStore.setUser({ email: data.email, name: data.name });
        editingName.value = false;
        nameSuccess.value = true;
        setTimeout(() => { nameSuccess.value = false; }, 3000);
    } catch (e: unknown) {
        nameError.value = e instanceof Error ? e.message : 'Failed to save name';
    } finally {
        nameSaving.value = false;
    }
}

async function saveAddress() {
    addressSaving.value = true;
    addressError.value = '';
    addressSuccess.value = false;
    try {
        const res = await fetch(`${API}/api/users/me/address`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(addressForm.value),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save address');
        profile.value!.savedAddress = data.savedAddress;
        addressSuccess.value = true;
        setTimeout(() => { addressSuccess.value = false; }, 3000);
    } catch (e: unknown) {
        addressError.value = e instanceof Error ? e.message : 'Failed to save address';
    } finally {
        addressSaving.value = false;
    }
}

async function cancelOrder(orderId: string) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    cancellingOrderId.value = orderId;
    cancelError.value = '';
    try {
        const res = await fetch(`${API}/api/users/me/orders/${orderId}/cancel`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to cancel order');
        // Update local state
        const idx = orders.value.findIndex(o => o.orderId === orderId);
        if (idx !== -1) orders.value[idx] = { ...orders.value[idx], status: 'Cancelled', cancelledAt: data.order.cancelledAt };
    } catch (e: unknown) {
        cancelError.value = e instanceof Error ? e.message : 'Failed to cancel order';
    } finally {
        cancellingOrderId.value = null;
    }
}

function switchTab(tab: Tab) {
    activeTab.value = tab;
    if (tab === 'orders' && orders.value.length === 0 && !ordersLoading.value) {
        fetchOrders();
    }
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
    if (!authStore.user) {
        router.push('/LoginView');
        return;
    }
    await fetchProfile();
});
</script>

<template>
    <MyHeader />
    <TheToast />

    <main class="min-h-screen bg-white">

        <!-- ── Loading / Error state ── -->
        <div v-if="profileLoading" class="flex justify-center items-center h-64">
            <svg class="animate-spin h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
        </div>

        <div v-else-if="profileError" class="flex flex-col items-center justify-center min-h-[400px] p-8">
            <p class="text-sm text-gray-500 mb-4">{{ profileError }}</p>
            <button @click="fetchProfile" class="text-xs uppercase tracking-widest border border-black px-6 py-2 hover:bg-black hover:text-white transition-all">
                Try again
            </button>
        </div>

        <!-- ── Main content ── -->
        <div v-else-if="profile" class="max-w-2xl mx-auto px-4 lg:px-0 py-12">

            <!-- Page title -->
            <div class="mb-8">
                <h1 class="text-2xl font-light tracking-wide">My Account</h1>
                <p class="text-[13px] text-gray-400 mt-1">{{ profile.email }}</p>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-gray-200 mb-8 gap-0">
                <button
                    v-for="tab in (['info', 'orders', 'address'] as Tab[])"
                    :key="tab"
                    @click="switchTab(tab)"
                    :class="[
                        'relative px-5 py-3 text-xs uppercase tracking-widest font-medium transition-colors duration-200',
                        activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-700'
                    ]"
                >
                    {{ tab === 'info' ? 'My Info' : tab === 'orders' ? 'My Orders' : 'Saved Address' }}
                    <span
                        v-show="activeTab === tab"
                        class="absolute bottom-0 left-0 w-full h-px bg-black"
                    />
                </button>
            </div>

            <!-- ══════════════ TAB: INFO ══════════════ -->
            <Transition name="page-fade" mode="out-in">
            <div v-if="activeTab === 'info'" key="info" class="space-y-6">

                <!-- Name -->
                <div class="border-b border-gray-100 pb-6">
                    <div class="flex items-start justify-between mb-2">
                        <span class="text-[11px] uppercase tracking-widest text-gray-400">Name</span>
                        <button
                            v-if="!editingName"
                            @click="editingName = true; nameInput = profile.name"
                            class="text-[11px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline underline-offset-2"
                        >Edit</button>
                    </div>

                    <div v-if="!editingName" class="flex items-center gap-2">
                        <span class="text-[15px] font-light">{{ profile.name || '—' }}</span>
                        <span v-if="nameSuccess" class="text-[11px] text-green-600 uppercase tracking-widest">Saved</span>
                    </div>

                    <div v-else class="flex flex-col gap-2">
                        <input
                            v-model="nameInput"
                            type="text"
                            placeholder="Your name"
                            class="w-full px-0 py-2 text-[14px] outline-none bg-transparent"
                            :class="inputClass(!!nameError, false)"
                            @keyup.enter="saveName"
                            @focus="nameError = ''"
                        />
                        <p v-if="nameError" class="text-[12px] text-red-500">{{ nameError }}</p>
                        <div class="flex gap-3 mt-1">
                            <button
                                @click="saveName"
                                :disabled="nameSaving"
                                class="bg-black text-white text-[12px] uppercase tracking-widest px-5 py-2 hover:bg-gray-800 disabled:opacity-60 transition-all flex items-center gap-2"
                            >
                                <svg v-if="nameSaving" class="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                <span>Save</span>
                            </button>
                            <button @click="editingName = false; nameError = ''" class="text-[12px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors px-2">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Email -->
                <div class="border-b border-gray-100 pb-6">
                    <span class="text-[11px] uppercase tracking-widest text-gray-400 block mb-2">Email</span>
                    <span class="text-[15px] font-light">{{ profile.email }}</span>
                </div>

                <!-- Login method -->
                <div class="border-b border-gray-100 pb-6">
                    <span class="text-[11px] uppercase tracking-widest text-gray-400 block mb-2">Sign-in method</span>
                    <span class="inline-flex items-center gap-2 text-[13px] text-gray-700">
                        <!-- Google icon -->
                        <svg v-if="profile.provider === 'google'" width="14" height="14" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                        </svg>
                        <!-- Email icon -->
                        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <path d="M2 7l10 7 10-7"/>
                        </svg>
                        {{ providerLabel }}
                    </span>
                </div>

                <!-- Member since -->
                <div class="pb-6">
                    <span class="text-[11px] uppercase tracking-widest text-gray-400 block mb-2">Member since</span>
                    <span class="text-[15px] font-light">{{ formatDate(profile.createdAt) }}</span>
                </div>

                <!-- Sign out -->
                <button
                    @click="authStore.signOut(router)"
                    :disabled="authStore.signingOut"
                    class="text-[12px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline underline-offset-2 disabled:opacity-50 flex items-center gap-2"
                >
                    <svg v-if="authStore.signingOut" class="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <span>Sign out</span>
                </button>

            </div>
            </Transition>

            <!-- ══════════════ TAB: ORDERS ══════════════ -->
            <Transition name="page-fade" mode="out-in">
            <div v-if="activeTab === 'orders'" key="orders">

                <div v-if="ordersLoading" class="flex justify-center py-16">
                    <svg class="animate-spin h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                </div>

                <div v-else-if="ordersError" class="text-center py-16">
                    <p class="text-[13px] text-gray-400 mb-4">{{ ordersError }}</p>
                    <button @click="fetchOrders" class="text-xs uppercase tracking-widest border border-black px-5 py-2 hover:bg-black hover:text-white transition-all">
                        Retry
                    </button>
                </div>

                <div v-else-if="orders.length === 0" class="text-center py-16">
                    <p class="text-[13px] text-gray-400 mb-6">No orders yet.</p>
                    <router-link to="/ProductsList" class="text-xs uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-all">
                        Start Shopping
                    </router-link>
                </div>

                <div v-else class="space-y-3">
                    <p v-if="cancelError" class="text-[12px] text-red-500 mb-2">{{ cancelError }}</p>

                    <div
                        v-for="order in orders"
                        :key="order._id"
                        class="border border-gray-100 rounded-sm overflow-hidden"
                    >
                        <!-- Order row -->
                        <button
                            class="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                            @click="expandedOrder = expandedOrder === order._id ? null : order._id"
                        >
                            <div class="flex items-center gap-4">
                                <!-- Chevron -->
                                <svg
                                    class="text-gray-300 transition-transform duration-200 flex-shrink-0"
                                    :class="expandedOrder === order._id ? 'rotate-90' : ''"
                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                                >
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                                <div>
                                    <p class="text-[13px] font-medium text-gray-800">{{ order.orderId }}</p>
                                    <p class="text-[11px] text-gray-400 mt-0.5">{{ formatDate(order.createdAt) }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class="text-[13px] font-light">${{ order.totalAmount?.toFixed(2) }}</span>
                                <span :class="['text-[11px] px-2 py-0.5 rounded-sm uppercase tracking-wide', statusColor(order.status)]">
                                    {{ order.status }}
                                </span>
                            </div>
                        </button>

                        <!-- Expanded detail -->
                        <Transition name="page-fade">
                        <div v-if="expandedOrder === order._id" class="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                            <div class="space-y-3 mb-4">
                                <div
                                    v-for="(item, idx) in order.items"
                                    :key="idx"
                                    class="flex items-center gap-3"
                                >
                                    <img
                                        v-if="item.img"
                                        :src="item.img"
                                        :alt="item.name"
                                        class="w-12 h-12 object-cover rounded-sm bg-gray-100"
                                    />
                                    <div class="flex-1 min-w-0">
                                        <p class="text-[13px] truncate">{{ item.name }}</p>
                                        <p class="text-[11px] text-gray-400">
                                            x{{ item.quantity }}
                                            <span v-if="item.selectedSize"> · {{ item.selectedSize }}</span>
                                            <span v-if="item.selectedColor"> · {{ item.selectedColor }}</span>
                                        </p>
                                    </div>
                                    <span class="text-[13px] text-gray-600 flex-shrink-0">${{ item.subtotal?.toFixed(2) }}</span>
                                </div>
                            </div>

                            <!-- Cancel button -->
                            <div v-if="CANCELLABLE.includes(order.status)" class="border-t border-gray-100 pt-3 flex justify-end">
                                <button
                                    @click="cancelOrder(order.orderId)"
                                    :disabled="cancellingOrderId === order.orderId"
                                    class="text-[11px] uppercase tracking-widest text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                                >
                                    <svg v-if="cancellingOrderId === order.orderId" class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Cancel Order
                                </button>
                            </div>

                            <!-- Cancelled info -->
                            <div v-if="order.status === 'Cancelled' && order.cancelledAt" class="border-t border-gray-100 pt-3">
                                <p class="text-[11px] text-gray-400">Cancelled on {{ formatDate(order.cancelledAt) }}</p>
                            </div>
                        </div>
                        </Transition>
                    </div>
                </div>
            </div>
            </Transition>

            <!-- ══════════════ TAB: ADDRESS ══════════════ -->
            <Transition name="page-fade" mode="out-in">
            <div v-if="activeTab === 'address'" key="address" class="max-w-md">

                <p class="text-[13px] text-gray-400 mb-6">
                    Your saved address will be pre-filled at checkout to save you time.
                </p>

                <div class="space-y-5">

                    <div v-for="field in [
                        { key: 'fullName', label: 'Full Name',    placeholder: 'Your full name',     type: 'text' },
                        { key: 'phone',    label: 'Phone',        placeholder: '+1 234 567 8900',    type: 'tel' },
                        { key: 'address',  label: 'Address',      placeholder: '123 Main St',        type: 'text' },
                        { key: 'city',     label: 'City',         placeholder: 'New York',           type: 'text' },
                    ]" :key="field.key">
                        <div>
                            <label class="text-[11px] uppercase tracking-widest text-gray-400 block mb-1.5">{{ field.label }}</label>
                            <input
                                v-model="(addressForm as any)[field.key]"
                                :type="field.type"
                                :placeholder="field.placeholder"
                                class="w-full px-0 py-2 text-[14px] outline-none bg-transparent transition-all duration-150"
                                :class="inputClass(false, !!addressFocused[field.key])"
                                @focus="addressFocused[field.key] = true"
                                @blur="addressFocused[field.key] = false"
                            />
                        </div>
                    </div>

                </div>

                <p v-if="addressError" class="text-[12px] text-red-500 mt-4">{{ addressError }}</p>

                <div class="flex items-center gap-4 mt-8">
                    <button
                        @click="saveAddress"
                        :disabled="addressSaving"
                        class="bg-black text-white text-[12px] uppercase tracking-widest px-8 py-3 hover:bg-gray-800 disabled:opacity-60 transition-all flex items-center gap-2"
                    >
                        <svg v-if="addressSaving" class="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        <span>Save Address</span>
                    </button>
                    <span v-if="addressSuccess" class="text-[11px] text-green-600 uppercase tracking-widest">Saved</span>
                </div>

            </div>
            </Transition>

        </div>
    </main>

    <hr class="border-t border-gray-200">
    <MyFooter />
</template>