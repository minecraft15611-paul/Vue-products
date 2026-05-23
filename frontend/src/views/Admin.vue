<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCartStore } from '../stores/cart';
import axios from 'axios';

const cartStore = useCartStore();
const isEditMode = ref(false); // 判斷目前是新增還是修改

//
const isAuthenticated = ref(false); // 🌟 驗證狀態
const adminKey = ref(""); // 🌟 使用者輸入的金鑰

const login = async () => {
    try {
        const res = await axios.post('https://lemontree-api.onrender.com/api/admin/login', {
        password: adminKey.value
    });
        const token = res.data.token;
        sessionStorage.setItem('admin_token', token); // store JWT, not just 'true'
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        isAuthenticated.value = true;
    } catch {
        alert("Invalid key, please re-enter.");
        adminKey.value = "";
    }
};

//
const logout = () => {
    if (confirm("Are you sure you want to log out of the management system?")) {
    sessionStorage.removeItem('admin_token');
    delete axios.defaults.headers.common['Authorization'];
    isAuthenticated.value = false;
  }
};

// 檢查是否曾經登入過
onMounted(() => {
    const token = sessionStorage.getItem('admin_token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        isAuthenticated.value = true;
    }
    cartStore.fetchProducts();
    fetchOrders();
});

// 初始表單資料模板
const initialItem = () => ({
    category: "Men's Apparel",
    name: "",
    title: "New Arrival",
    price: 0,
    stock: 10, // ✨ 新增預設庫存
    img: "https://picsum.photos/seed/default/400/300",
    colors: [] as { name: string; hex: string }[],
    sizes: ["S", "M", "L", "XL"] as string[], // ✨ 預設勾選全尺寸
    description: "",
    material: "100% Cotton"
});

const newItem = ref(initialItem());
const tempColor = ref({ name: '', hex: '#000000' });

// 進入編輯模式：將現有商品資料填入表單
const editProduct = (product: any) => {
    isEditMode.value = true;
    newItem.value = {
        ...product,
        colors: [...product.colors.map(c => ({ ...c }))],
        sizes: [...product.sizes]
     }; 
    window.scrollTo({ top: 300, behavior: 'smooth' });
};
 
// 重置表單：回到新增模式
const resetForm = () => {
    isEditMode.value = false;
    newItem.value = initialItem();
};

// 核心功能：儲存資料 (判斷新增或修改)
const handleSave = async () => {
    if (!newItem.value.name || newItem.value.price <= 0) {
        alert("Please enter the full product name and price.");
        return;
    }

    try {
        if (isEditMode.value) {
            // [PUT] 執行修改邏輯，對應 server.js 的 app.put
            await axios.put(`https://lemontree-api.onrender.com/api/products/${newItem.value.id}`, newItem.value);
            alert("Product information has been successfully updated!");
        } else {
            // [POST] 執行新增邏輯
            await axios.post('https://lemontree-api.onrender.com/api/products', newItem.value);
            alert("New product successfully listed!");
        }
        resetForm(); // 操作完後清空表單
        cartStore.fetchProducts(); // 重新抓取資料庫最新資料
    } catch (error) {
        console.error("儲存失敗:", error);
        alert("Failed to connect to the backend; please check if server.js is running.");
    }
};

// 刪除功能
const deleteProduct = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
        await axios.delete(`https://lemontree-api.onrender.com/api/products/${id}`);
        alert("The product has been removed from the database.");
        cartStore.fetchProducts();
    } catch (error) {
        alert("Deletion failed.");
    }
};

// 顏色管理功能
const addColor = () => {
    if (tempColor.value.name.trim()) {
        newItem.value.colors.push({ ...tempColor.value });
        tempColor.value.name = '';
    }
};
const removeColor = (index: number) => {
    newItem.value.colors.splice(index, 1);
};

//
const currentTab = ref('products'); // 預設停留在商品管理，方便你繼續測試功能

interface Order {
  _id: string
  orderId: string
  customerName: string
  email: string
  phone: string
  address: string
  totalAmount: number
  status: string
  createdAt: string
  items: {
    id: number
    name: string
    price: number
    quantity: number
    selectedSize: string
    selectedColor: { name: string; hex: string }
  }[]
}
const orders = ref<Order[]>([]);

// 抓取訂單
const fetchOrders = async () => {
    try {
        const res = await axios.get('https://lemontree-api.onrender.com/api/orders');
        orders.value = res.data;
    } catch (err) {
        console.error("Failed to fetch orders.", err);
    }
};

// 更新訂單狀態
const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
        await axios.put(`https://lemontree-api.onrender.com/api/orders/${orderId}`, { status: newStatus });
        fetchOrders(); // 重新整理列表
    } catch (err) {
        alert("Update failed.");
    }
};


const deleteOrder = async (orderId: string) => {
    if (!orderId) {
        alert("Order ID not found, unable to delete.");
        return;
    }
    if (!confirm("Are you sure you want to permanently delete this order? This action cannot be undone.")) return;
    
    try {
        await axios.delete(`https://lemontree-api.onrender.com/api/orders/${orderId}`);
        alert("Order deleted.");
        fetchOrders(); 
    } catch (err) {
        console.error("Deletion failed:", err);
        alert("System error, unable to delete.");
    }
};

// 儀表板所需的簡單統計資料 (未來可對接後端 API)
const dynamicStats = computed(() => {
    // 1. 計算今日營收 (篩選出今天的訂單並加總 totalAmount)
    const today = new Date().toLocaleDateString();
    const todayRevenue = orders.value
        .filter(order => new Date(order.createdAt).toLocaleDateString() === today)
        .reduce((sum, order) => sum + order.totalAmount, 0);

    // 2. 今日新增訂單數
    const orderCount = orders.value.filter(
        order => new Date(order.createdAt).toLocaleDateString() === today
    ).length;

    // 3. 庫存警示 (直接延用你原本在 template 裡的邏輯，但統一管理)
    const lowStockCount = cartStore.products.filter(p => p.stock <= 5).length;

    return {
        todayRevenue,
        orderCount,
        lowStockCount
    };
});

const passwordForm = ref({ current: '', new: '', confirm: '' });

const changePassword = async () => {
    if (!passwordForm.value.current || !passwordForm.value.new) {
        alert("Please fill in all fields.");
        return;
    }
    if (passwordForm.value.new !== passwordForm.value.confirm) {
        alert("The new password and confirm password do not match.");
        return;
    }
    if (passwordForm.value.new.length < 4) {
        alert("New password must be at least 4 characters long.");
        return;
    }
    try {
        await axios.put('https://lemontree-api.onrender.com/api/admin/change-password', {
            currentPassword: passwordForm.value.current,
            newPassword: passwordForm.value.new
        });
        alert("Password updated successfully! Please use your new password for your next login.");
        passwordForm.value = { current: '', new: '', confirm: '' };
    } catch (err) {
        alert("Current password is incorrect, please re-enter.");
    }
};

</script>

<template>
    <div v-if="isAuthenticated" class="min-h-screen bg-gray-100 p-3 md:p-6 font-sans">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 text-center">LemonTree Management Backend</h2>
            
            <div class="w-full overflow-x-auto pb-2">
                <div class="flex justify-center gap-2 md:gap-4 bg-white p-2 rounded-2xl shadow-sm w-max mx-auto border border-gray-200">
                    <button @click="currentTab = 'dashboard'" 
                        :class="currentTab === 'dashboard' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-500'"
                        class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300">
                        🏠 Data Dashboard
                    </button>
                    <button @click="currentTab = 'products'" 
                        :class="currentTab === 'products' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-500'"
                        class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300">
                        📦 Product Management
                    </button>
                    <button @click="currentTab = 'orders'; fetchOrders()" 
                        :class="currentTab === 'orders' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-500'"
                        class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300">
                        📜 Order Processing
                    </button>
                </div>
            </div>
            <div class="mt-auto lg:pt-6 border-t border-gray-100">
                <router-link 
                    to="/" 
                    class="flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span class="font-medium">Back to Website Home</span>
                </router-link>
                
                <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span class="text-sm font-medium">Exit Management System</span>
                </button>
                <button @click="currentTab = 'settings'" 
    :class="currentTab === 'settings' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-500'"
    class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300">
    ⚙️ Settings
</button>
            </div>
            

            <div v-if="currentTab === 'dashboard'" class="animate-fadeIn">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div class="text-gray-400 text-xs font-bold uppercase tracking-wider">Today's Revenue</div>
                        <div class="text-3xl font-black text-gray-800 mt-1">${{ dynamicStats.todayRevenue }}</div>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div class="text-gray-400 text-xs font-bold uppercase tracking-wider">New Orders</div>
                        <div class="text-3xl font-black text-blue-600 mt-1">{{ dynamicStats.orderCount }} Count (Units)</div>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div class="text-gray-400 text-xs font-bold uppercase tracking-wider">Stock Alert</div>
                        <div class="text-3xl font-black text-red-500 mt-1">{{ dynamicStats.lowStockCount }} Items</div>
                    </div>
                </div>
            </div>

            <div v-if="currentTab === 'settings'" class="animate-fadeIn max-w-md mx-auto">
    <div class="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <h3 class="text-lg font-bold text-gray-700 mb-6">🔐 Change Administrator Password</h3>
        <div class="space-y-4">
            <div>
                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Password</label>
                <input v-model="passwordForm.current" type="password"
                    class="mt-1 block w-full border border-gray-300 rounded-xl p-3 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Current Password">
            </div>
            <div>
                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                <input v-model="passwordForm.new" type="password"
                    class="mt-1 block w-full border border-gray-300 rounded-xl p-3 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter New Password">
            </div>
            <div>
                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                <input v-model="passwordForm.confirm" type="password"
                    class="mt-1 block w-full border border-gray-300 rounded-xl p-3 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Re-enter New Password">
            </div>
            <button @click="changePassword"
                class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm shadow-md active:scale-95 transition-all mt-2">
                💾 Save New Password
            </button>
        </div>
    </div>
</div>

            <div v-if="currentTab === 'products'" class="animate-fadeIn">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        <div class="lg:col-span-1">
            <div class="bg-white shadow-lg rounded-2xl p-4 md:p-5 border border-gray-200">
                <h3 class="text-base md:text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
                    {{ isEditMode ? '📝 Edit Product' : '✨ Quick Launch' }}
                </h3>
                
                <div class="space-y-4">
                    <div class="group">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Basic Information</span>
                        <input v-model="newItem.name" type="text" class="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 md:p-3 bg-gray-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition" placeholder="Product Name">
                    </div>

                    <div class="grid grid-cols-2 gap-2 md:gap-3">
                        <input v-model.number="newItem.price" type="number" class="block w-full border border-gray-300 rounded-xl p-2.5 md:p-3 bg-gray-50 text-sm outline-none" placeholder="Price (USD)">
                        <select v-model="newItem.category" class="block w-full border border-gray-300 rounded-xl p-2.5 md:p-3 bg-gray-50 text-xs md:text-sm outline-none">
                            <option>Men's Apparel</option>
                            <option>Women's Apparel</option>
                            <option>Accessories</option>
                            <option>Jewelry</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="group">
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock Level</span>
                            <input v-model.number="newItem.stock" type="number" class="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 bg-gray-50 text-sm" placeholder="Quantity">
                        </div>
                        <div class="group">
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Size</span>
                            <div class="flex gap-1.5 mt-1.5 flex-wrap">
                                <label v-for="s in ['S', 'M', 'L', 'XL']" :key="s" class="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-lg text-[10px] cursor-pointer active:bg-blue-100">
                                    <input type="checkbox" :value="s" v-model="newItem.sizes" class="w-3 h-3"> {{ s }}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-50 p-3 md:p-4 rounded-xl border border-dashed border-gray-300">
                        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Spec Color</span>
                        <div class="flex gap-2 mt-2">
                            <input v-model="tempColor.name" type="text" placeholder="Name" class="border rounded-lg flex-1 p-2 text-xs">
                            <input v-model="tempColor.hex" type="color" class="h-8 w-8 border rounded-lg cursor-pointer bg-white p-1">
                            <button @click="addColor" type="button" class="bg-gray-900 text-white px-3 rounded-lg text-xs font-bold">Add</button>
                        </div>
                        <div class="flex gap-2 mt-3 flex-wrap">
                            <span v-for="(c, index) in newItem.colors" :key="index" class="flex items-center bg-white border border-gray-200 px-2 py-1 rounded-lg text-[10px] shadow-sm">
                                <span :style="{ backgroundColor: c.hex }" class="w-2.5 h-2.5 rounded-full mr-1.5 border border-gray-300"></span>
                                {{ c.name }}
                                <button @click="removeColor(index)" class="ml-1 text-gray-400 hover:text-red-500">×</button>
                            </span>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 pt-2">
                        <button @click="handleSave" :class="isEditMode ? 'bg-green-600' : 'bg-blue-600'" class="w-full text-white font-bold py-3 rounded-xl text-sm shadow-md active:scale-95 transition-all">
                            {{ isEditMode ? '💾 Save Update' : '🚀 Publish Product' }}
                        </button>
                        <button v-if="isEditMode" @click="resetForm" class="w-full bg-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="lg:col-span-2">
            <div class="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
                <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 class="font-bold text-gray-700 text-sm md:text-base">📋 Product List</h3>
                    <span class="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{{ cartStore.products.length }}</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left min-w-[600px] md:min-w-[700px]">
                        <thead class="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest border-b">
                            <tr>
                                <th class="px-4 py-3 font-bold">Details</th>
                                <th class="px-4 py-3 font-bold text-center">Unit Price</th>
                                <th class="px-4 py-3 font-bold text-center">Stock Specs</th> 
                                <th class="px-4 py-3 font-bold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="p in cartStore.products" :key="p.id" class="hover:bg-blue-50/30">
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <img :src="p.img" class="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg border border-gray-100">
                                        <div class="max-w-[120px] md:max-w-[150px]">
                                            <div class="font-bold text-gray-800 text-xs truncate">{{ p.name }}</div>
                                            <div class="text-[9px] text-gray-400">{{ p.category }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-center font-mono font-bold text-blue-600 text-xs">${{ p.price }}</td>
                                
                                <td class="px-4 py-3">
                                    <div class="flex flex-col items-center gap-1">
                                        <span :class="p.stock <= 5 ? 'text-red-500' : 'text-gray-600'" class="text-[10px] font-bold">
                                            {{ p.stock <= 5 ? '⚠️' : '📦' }}{{ p.stock }}
                                        </span>
                                        <div class="flex gap-0.5 flex-wrap justify-center">
                                            <span v-for="s in p.sizes" :key="s" class="text-[8px] bg-gray-100 text-gray-500 px-1 rounded border border-gray-200">{{ s }}</span>
                                        </div>
                                    </div>
                                </td>

                                <td class="px-4 py-3 text-center">
                                    <div class="flex justify-center gap-2">
                                        <button @click="editProduct(p)" class="text-blue-500 bg-blue-50 px-2 py-1 rounded-md text-[10px] font-bold">Edit</button>
                                        <button @click="deleteProduct(p.id)" class="text-red-400 hover:text-red-600 text-[10px]">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="md:hidden text-center py-2 text-[9px] text-gray-400 bg-gray-50 border-t italic">
                    ← Left and Right Swipe to View Full Information →
                </div>
            </div>
        </div>
    </div>
</div>

            <div v-if="currentTab === 'orders'" class="animate-fadeIn">
    <div class="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left min-w-[800px]">
                <thead class="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-widest border-b">
                    <tr>
                        <th class="px-6 py-4 font-bold">Order ID/Time</th>
                        <th class="px-6 py-4 font-bold">Purchased Items</th>
                        <th class="px-6 py-4 font-bold">Customer Information</th>
                        <th class="px-6 py-4 font-bold text-center">Total</th>
                        <th class="px-6 py-4 font-bold text-center">Status/Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="order in orders" :key="order._id" class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="text-xs font-bold text-gray-800">{{ order.orderId }}</div>
                            <div class="text-[10px] text-gray-400">{{ new Date(order.createdAt).toLocaleString() }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex flex-col gap-2">
                                <div v-for="item in order.items" :key="item.id" class="flex items-center gap-2">
                                    <img :src="cartStore.products.find(p => p.id === item.id)?.img" class="w-8 h-8 object-cover rounded border border-gray-100" />
                                    <span class="text-[10px] text-gray-600 truncate max-w-[100px]">
                                        {{ item.name }} x{{ item.quantity }}
                                    </span>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-xs font-bold">{{ order.customerName }}</div>
                            <div class="text-[10px] text-gray-500">{{ order.phone }}</div>
                        </td>
                        <td class="px-6 py-4 text-center text-blue-600 font-mono font-bold text-sm">
                            ${{ order.totalAmount }}
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center justify-center gap-3">
                                <select 
                                    @change="updateOrderStatus(order._id, $event.target.value)"
                                    :class="order.status === '待付款' ? 'text-orange-500' : 'text-green-600'"
                                    class="bg-gray-50 border border-gray-200 rounded-lg text-xs p-1 outline-none focus:ring-2 focus:ring-green-100">
                                    <option :selected="order.status === '待付款'">Pending Payment</option>
                                    <option :selected="order.status === '已付款'">Paid</option>
                                    <option :selected="order.status === '已出貨'">Shipped</option>
                                    <option :selected="order.status === '已取消'">Cancelled</option>
                                </select>
                                <button @click="deleteOrder(order._id)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

        </div>
    </div>

    <div v-else class="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div class="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
            <h2 class="text-3xl font-black text-green-600 mb-2">LemonTree</h2>
            <p class="text-gray-400 text-sm mb-8 font-bold">Administrator Permission Verification</p>
            
            <input 
                v-model="adminKey" 
                type="password" 
                placeholder="Please Enter Administrator Key"
                @keyup.enter="login"
                class="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl mb-6 outline-none focus:border-green-400 transition-all text-center tracking-widest font-mono"
            />
            
            <button 
                @click="login"
                class="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95"
            >
                Enter Management System
            </button>
            
            <router-link to="/" class="block mt-6 text-gray-400 text-xs hover:underline italic">Back to Website Home</router-link>
        </div>
    </div>
</template>

<style scoped>
.animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.overflow-x-auto::-webkit-scrollbar {
    display: none; /* 隱藏捲軸 */
}
</style>