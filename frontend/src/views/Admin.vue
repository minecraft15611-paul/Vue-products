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

// 儀表板所需的簡單統計資料 (未來可對接後端 API)
const stats = ref({
    todayRevenue: 1250,
    orderCount: 8,
    lowStockCount: 0
});

</script>

<template>
    <div class="min-h-screen bg-gray-100 p-2 md:p-6 font-sans">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-xl md:text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-tight">LemonTree 管理中心</h2>

            <div class="flex justify-start md:justify-center mb-8 overflow-x-auto no-scrollbar">
                <div class="flex flex-nowrap gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 min-w-max mx-auto">
                    <button @click="currentTab = 'dashboard'" 
                        :class="currentTab === 'dashboard' ? 'bg-gray-900 text-white shadow-md' : 'hover:bg-gray-100 text-gray-500'"
                        class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap">
                        🏠 數據主頁
                    </button>
                    <button @click="currentTab = 'products'" 
                        :class="currentTab === 'products' ? 'bg-gray-900 text-white shadow-md' : 'hover:bg-gray-100 text-gray-500'"
                        class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap">
                        📦 商品管理
                    </button>
                    <button @click="currentTab = 'orders'" 
                        :class="currentTab === 'orders' ? 'bg-gray-900 text-white shadow-md' : 'hover:bg-gray-100 text-gray-500'"
                        class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap">
                        📜 訂單處理
                    </button>
                </div>
            </div>

            <div v-if="currentTab === 'dashboard'" class="animate-fadeIn">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">今日營收</div>
                        <div class="text-2xl font-black text-gray-800 mt-1">${{ stats.todayRevenue }}</div>
                    </div>
                    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">新增訂單</div>
                        <div class="text-2xl font-black text-blue-600 mt-1">{{ stats.orderCount }} 筆</div>
                    </div>
                    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-red-500">
                        <div class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">庫存警示</div>
                        <div class="text-2xl font-black mt-1">{{ cartStore.products.filter(p => p.stock <= 5).length }} 項</div>
                    </div>
                </div>
            </div>

            <div v-if="currentTab === 'products'" class="animate-fadeIn">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-1">
                        <div class="bg-white shadow-xl rounded-2xl p-5 border border-gray-200">
                            <h3 class="text-lg font-bold mb-5 text-gray-700">
                                {{ isEditMode ? '📝 編輯商品' : '✨ 快速上架' }}
                            </h3>
                            <div class="space-y-4">
                                <div class="group">
                                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">商品名稱</span>
                                    <input v-model="newItem.name" type="text" class="mt-1 block w-full border border-gray-300 rounded-xl p-3 bg-gray-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition" placeholder="商品名稱">
                                </div>
                                <div class="flex flex-col gap-3 pt-2">
                                    <button @click="handleSave" :class="isEditMode ? 'bg-green-600' : 'bg-blue-600'" class="w-full text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-sm">
                                        {{ isEditMode ? '💾 儲存並更新資料' : '🚀 立即發布商品' }}
                                    </button>
                                    <button v-if="isEditMode" @click="resetForm" class="w-full bg-gray-200 text-gray-600 py-2.5 rounded-2xl font-semibold text-sm">取消編輯</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-2">
                        <div class="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
                            <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
                                <h3 class="font-bold text-gray-700 text-sm">📋 商品庫存列表</h3>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left min-w-[650px]">
                                    <thead class="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest border-b">
                                        <tr>
                                            <th class="px-4 py-4 font-bold">商品詳情</th>
                                            <th class="px-4 py-4 font-bold text-center">價格</th>
                                            <th class="px-4 py-4 font-bold text-center">庫存規格</th>
                                            <th class="px-4 py-4 font-bold text-center">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100">
                                        <tr v-for="p in cartStore.products" :key="p.id" class="hover:bg-blue-50/50 transition-colors">
                                            <td class="px-4 py-4">
                                                <div class="flex items-center gap-3">
                                                    <img :src="p.img" class="w-10 h-10 object-cover rounded-lg border border-gray-200">
                                                    <div class="max-w-[120px] md:max-w-[180px]">
                                                        <div class="font-extrabold text-gray-800 text-xs truncate">{{ p.name }}</div>
                                                        <div class="text-[9px] text-gray-400 font-medium">{{ p.category }}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-4 py-4 text-center font-mono font-bold text-blue-600 text-xs">${{ p.price }}</td>
                                            <td class="px-4 py-4 text-center">
                                                <span :class="p.stock <= 5 ? 'text-red-500 font-black' : 'text-gray-700 font-bold'" class="text-[11px]">
                                                    {{ p.stock <= 5 ? '⚠️' : '📦' }} {{ p.stock || 0 }}
                                                </span>
                                            </td>
                                            <td class="px-4 py-4 text-center">
                                                <div class="flex justify-center items-center gap-3">
                                                    <button @click="editProduct(p)" class="text-blue-500 hover:text-blue-700 font-extrabold text-[11px] bg-blue-50 px-3 py-1.5 rounded-lg transition-all">修改</button>
                                                    <button @click="deleteProduct(p.id)" class="text-gray-300 hover:text-red-500 font-bold text-[11px] transition-all">刪除</button>
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

            <div v-if="currentTab === 'orders'" class="animate-fadeIn">
                <div class="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden text-center py-20">
                    <div class="text-5xl mb-4">📜</div>
                    <h3 class="text-xl font-bold text-gray-700">訂單管理系統</h3>
                    <p class="text-gray-400 mt-2 text-sm px-6">目前尚無進行中的訂單。準備好建立後端訂單 API 了嗎？</p>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* 隱藏捲軸但保留功能 */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>