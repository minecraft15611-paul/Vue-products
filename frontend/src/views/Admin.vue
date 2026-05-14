<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import axios from 'axios';

const cartStore = useCartStore();
const isEditMode = ref(false); // 判斷目前是新增還是修改

onMounted(() => {
    cartStore.fetchProducts();
});

// 初始表單資料模板
const initialItem = () => ({
    id: Date.now(),
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
    newItem.value = { ...product }; // 使用展開運算子進行淺拷貝，避免直接更動 Store 資料
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
 
// 重置表單：回到新增模式
const resetForm = () => {
    isEditMode.value = false;
    newItem.value = initialItem();
};

// 核心功能：儲存資料 (判斷新增或修改)
const handleSave = async () => {
    if (!newItem.value.name || newItem.value.price <= 0) {
        alert("請輸入完整的商品名稱與價格");
        return;
    }

    try {
        if (isEditMode.value) {
            // [PUT] 執行修改邏輯，對應 server.js 的 app.put
            await axios.put(`https://lemontree-api.onrender.com/api/products/${newItem.value.id}`, newItem.value);
            alert("商品資訊已成功更新！");
        } else {
            // [POST] 執行新增邏輯
            await axios.post('https://lemontree-api.onrender.com/api/products', newItem.value);
            alert("新商品上架成功！");
        }
        resetForm(); // 操作完後清空表單
        cartStore.fetchProducts(); // 重新抓取資料庫最新資料
    } catch (error) {
        console.error("儲存失敗:", error);
        alert("連線後端失敗，請確認 server.js 是否正在運行");
    }
};

// 刪除功能
const deleteProduct = async (id: string | number) => {
    if (!confirm("確定要刪除這項商品嗎？")) return;
    try {
        await axios.delete(`https://lemontree-api.onrender.com/api/products/${id}`);
        alert("商品已從資料庫移除");
        cartStore.fetchProducts();
    } catch (error) {
        alert("刪除失敗");
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
const orders = ref([]); // 存放訂單資料

// 抓取訂單
const fetchOrders = async () => {
    try {
        const res = await axios.get('https://lemontree-api.onrender.com/api/orders');
        orders.value = res.data;
    } catch (err) {
        console.error("抓取訂單失敗", err);
    }
};

// 更新訂單狀態
const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
        await axios.put(`https://lemontree-api.onrender.com/api/orders/${orderId}`, { status: newStatus });
        fetchOrders(); // 重新整理列表
    } catch (err) {
        alert("更新失敗");
    }
};

// 儀表板所需的簡單統計資料 (未來可對接後端 API)
const stats = ref({
    todayRevenue: 1250,
    orderCount: 8,
    lowStockCount: 0
});

</script>

<template>
    <div class="min-h-screen bg-gray-100 p-3 md:p-6 font-sans">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 text-center">LemonTree 管理後台</h2>

            <div class="flex justify-center gap-2 md:gap-4 mb-8 bg-white p-2 rounded-2xl shadow-sm w-max mx-auto border border-gray-200">
                <button @click="currentTab = 'dashboard'" 
                    :class="currentTab === 'dashboard' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-500'"
                    class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300">
                    🏠 數據主頁
                </button>
                <button @click="currentTab = 'products'" 
                    :class="currentTab === 'products' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-500'"
                    class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300">
                    📦 商品管理
                </button>
                <button @click="currentTab = 'orders'; fetchOrders()" 
                    :class="currentTab === 'orders' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-500'"
                    class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300">
                    📜 訂單處理
                </button>
            </div>

            <div v-if="currentTab === 'dashboard'" class="animate-fadeIn">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div class="text-gray-400 text-xs font-bold uppercase tracking-wider">今日營收</div>
                        <div class="text-3xl font-black text-gray-800 mt-1">${{ stats.todayRevenue }}</div>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div class="text-gray-400 text-xs font-bold uppercase tracking-wider">新增訂單</div>
                        <div class="text-3xl font-black text-blue-600 mt-1">{{ stats.orderCount }} 筆</div>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div class="text-gray-400 text-xs font-bold uppercase tracking-wider">庫存警示</div>
                        <div class="text-3xl font-black text-red-500 mt-1">{{ cartStore.products.filter(p => p.stock <= 5).length }} 項</div>
                    </div>
                </div>
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400 italic">
                    數據視覺化圖表開發中...
                </div>
            </div>

            <div v-if="currentTab === 'products'" class="animate-fadeIn">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        <div class="lg:col-span-1">
            <div class="bg-white shadow-lg rounded-2xl p-4 md:p-5 border border-gray-200">
                <h3 class="text-base md:text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
                    {{ isEditMode ? '📝 編輯商品' : '✨ 快速上架' }}
                </h3>
                
                <div class="space-y-4">
                    <div class="group">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">商品基本資訊</span>
                        <input v-model="newItem.name" type="text" class="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 md:p-3 bg-gray-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition" placeholder="商品名稱">
                    </div>

                    <div class="grid grid-cols-2 gap-2 md:gap-3">
                        <input v-model.number="newItem.price" type="number" class="block w-full border border-gray-300 rounded-xl p-2.5 md:p-3 bg-gray-50 text-sm outline-none" placeholder="價格 (USD)">
                        <select v-model="newItem.category" class="block w-full border border-gray-300 rounded-xl p-2.5 md:p-3 bg-gray-50 text-xs md:text-sm outline-none">
                            <option>Men's Apparel</option>
                            <option>Women's Apparel</option>
                            <option>Accessories</option>
                            <option>Jewelry</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="group">
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">庫存量</span>
                            <input v-model.number="newItem.stock" type="number" class="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 bg-gray-50 text-sm" placeholder="數量">
                        </div>
                        <div class="group">
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">尺寸</span>
                            <div class="flex gap-1.5 mt-1.5 flex-wrap">
                                <label v-for="s in ['S', 'M', 'L', 'XL']" :key="s" class="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-lg text-[10px] cursor-pointer active:bg-blue-100">
                                    <input type="checkbox" :value="s" v-model="newItem.sizes" class="w-3 h-3"> {{ s }}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-50 p-3 md:p-4 rounded-xl border border-dashed border-gray-300">
                        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">規格顏色</span>
                        <div class="flex gap-2 mt-2">
                            <input v-model="tempColor.name" type="text" placeholder="名稱" class="border rounded-lg flex-1 p-2 text-xs">
                            <input v-model="tempColor.hex" type="color" class="h-8 w-8 border rounded-lg cursor-pointer bg-white p-1">
                            <button @click="addColor" type="button" class="bg-gray-900 text-white px-3 rounded-lg text-xs font-bold">加</button>
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
                            {{ isEditMode ? '💾 儲存更新' : '🚀 發布商品' }}
                        </button>
                        <button v-if="isEditMode" @click="resetForm" class="w-full bg-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold">
                            取消
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="lg:col-span-2">
            <div class="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
                <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 class="font-bold text-gray-700 text-sm md:text-base">📋 商品清單</h3>
                    <span class="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{{ cartStore.products.length }}</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left min-w-[600px] md:min-w-[700px]">
                        <thead class="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest border-b">
                            <tr>
                                <th class="px-4 py-3 font-bold">詳情</th>
                                <th class="px-4 py-3 font-bold text-center">單價</th>
                                <th class="px-4 py-3 font-bold text-center">庫存規格</th> 
                                <th class="px-4 py-3 font-bold text-center">操作</th>
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
                                        <button @click="editProduct(p)" class="text-blue-500 bg-blue-50 px-2 py-1 rounded-md text-[10px] font-bold">改</button>
                                        <button @click="deleteProduct(p.id)" class="text-red-400 hover:text-red-600 text-[10px]">刪</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="md:hidden text-center py-2 text-[9px] text-gray-400 bg-gray-50 border-t italic">
                    ← 左右滑動查看完整資訊 →
                </div>
            </div>
        </div>
    </div>
</div>

            <div v-if="currentTab === 'orders'" class="animate-fadeIn">
                <div class="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left min-w-[700px]">
                            <thead class="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-widest border-b">
                                <tr>
                                    <th class="px-6 py-4 font-bold">訂單編號/時間</th>
                                    <th class="px-6 py-4 font-bold">客戶資訊</th>
                                    <th class="px-6 py-4 font-bold text-center">總額</th>
                                    <th class="px-6 py-4 font-bold text-center">狀態/操作</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="order in orders" :key="order._id" class="hover:bg-gray-50">
                                    <td class="px-6 py-4">
                                        <div class="text-xs font-bold text-gray-800">{{ order.orderId }}</div>
                                        <div class="text-[10px] text-gray-400">{{ new Date(order.createdAt).toLocaleString() }}</div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="text-xs font-bold">{{ order.customerName }}</div>
                                        <div class="text-[10px] text-gray-500">{{ order.phone }}</div>
                                    </td>
                                    <td class="px-6 py-4 text-center text-blue-600 font-mono font-bold">${{ order.totalAmount }}</td>
                                    <td class="px-6 py-4 text-center">
                                        <select 
                                            @change="updateOrderStatus(order._id, $event.target.value)"
                                            :class="order.status === '待付款' ? 'text-orange-500' : 'text-green-600'"
                                            class="bg-gray-50 border border-gray-200 rounded-lg text-xs p-1 outline-none">
                                            <option>待付款</option>
                                            <option>已付款</option>
                                            <option>已出貨</option>
                                            <option>已取消</option>
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

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
</style>