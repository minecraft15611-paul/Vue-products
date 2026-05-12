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
    img: "https://picsum.photos/seed/default/400/300",
    colors: [] as { name: string; hex: string }[],
    sizes: [] as string[],
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
            await axios.put(`http://localhost:3000/api/products/${newItem.value.id}`, newItem.value);
            alert("商品資訊已成功更新！");
        } else {
            // [POST] 執行新增邏輯
            await axios.post('http://localhost:3000/api/products', newItem.value);
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
const deleteProduct = async (id: number) => {
    if (!confirm("確定要刪除這項商品嗎？")) return;
    try {
        await axios.delete(`http://localhost:3000/api/products/${id}`);
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
</script>

<template>

    <div class="min-h-screen bg-gray-100 p-3 md:p-6 font-sans">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 text-center">LemonTree 管理中心</h2>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div class="lg:col-span-1">
                    <div class="bg-white shadow-xl rounded-2xl p-5 border border-gray-200 sticky lg:top-6">
                        <h3 class="text-lg font-bold mb-5 flex items-center gap-2 text-gray-700">
                            {{ isEditMode ? '📝 編輯商品內容' : '✨ 快速上架商品' }}
                        </h3>
                        
                        <div class="space-y-4">
                            <div class="group">
                                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">商品基本資訊</span>
                                <input v-model="newItem.name" type="text" class="mt-1 block w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition outline-none" placeholder="商品名稱">
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <input v-model.number="newItem.price" type="number" class="block w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:bg-white transition outline-none" placeholder="價格 (USD)">
                                <select v-model="newItem.category" class="block w-full border border-gray-300 rounded-xl p-3 bg-gray-50 text-sm outline-none">
                                    <option>Men's Apparel</option>
                                    <option>Women's Apparel</option>
                                    <option>Accessories</option>
                                    <option>Jewelry</option>
                                </select>
                            </div>

                            <div class="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300">
                                <span class="text-xs font-bold text-gray-500 uppercase">規格配置</span>
                                <div class="flex gap-2 mt-2">
                                    <input v-model="tempColor.name" type="text" placeholder="顏色" class="border rounded-lg flex-1 p-2 text-sm">
                                    <input v-model="tempColor.hex" type="color" class="h-10 w-10 border rounded-lg cursor-pointer bg-white p-1">
                                    <button @click="addColor" type="button" class="bg-gray-900 text-white px-3 rounded-lg text-sm font-bold">加</button>
                                </div>
                                <div class="flex gap-2 mt-3 flex-wrap">
                                    <span v-for="(c, index) in newItem.colors" :key="index" class="flex items-center bg-white border border-gray-200 px-2 py-1 rounded-lg text-xs shadow-sm">
                                        <span :style="{ backgroundColor: c.hex }" class="w-3 h-3 rounded-full mr-1.5 border border-gray-300"></span>
                                        {{ c.name }}
                                        <button @click="removeColor(index)" class="ml-1.5 text-gray-400 hover:text-red-500 font-bold">×</button>
                                    </span>
                                </div>
                            </div>

                            <div class="flex flex-col gap-3 pt-2">
                                <button @click="handleSave" :class="isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'" class="w-full text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all">
                                    {{ isEditMode ? '💾 儲存並更新資料' : '🚀 立即發布商品' }}
                                </button>
                                <button v-if="isEditMode" @click="resetForm" class="w-full bg-gray-200 text-gray-600 py-2.5 rounded-2xl font-semibold hover:bg-gray-300 transition">
                                    取消編輯
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <div class="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
                        <div class="p-5 border-b bg-gray-50 flex justify-between items-center">
                            <h3 class="font-bold text-gray-700 text-lg flex items-center gap-2">
                                📋 商品庫存列表
                                <span class="bg-blue-100 text-blue-600 text-xs px-2.5 py-1 rounded-full font-bold">{{ cartStore.products.length }}</span>
                            </h3>
                        </div>

                        <div class="overflow-x-auto w-full">
                            <table class="w-full text-left min-w-[600px]">
                                <thead class="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-widest">
                                    <tr>
                                        <th class="px-6 py-4 font-bold">商品詳情</th>
                                        <th class="px-6 py-4 font-bold hidden md:table-cell text-center">分類</th>
                                        <th class="px-6 py-4 font-bold text-center">單價</th>
                                        <th class="px-6 py-4 font-bold text-center">功能操作</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="p in cartStore.products" :key="p.id" class="hover:bg-blue-50/50 transition-colors">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-4">
                                                <img :src="p.img" class="w-14 h-14 object-cover rounded-xl border border-gray-200 shadow-sm">
                                                <div class="max-w-[180px]">
                                                    <div class="font-extrabold text-gray-800 text-sm truncate">{{ p.name }}</div>
                                                    <div class="text-[10px] text-gray-400 font-medium md:hidden">{{ p.category }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-center text-gray-500 text-xs font-medium hidden md:table-cell">{{ p.category }}</td>
                                        <td class="px-6 py-4 text-center font-mono font-bold text-blue-600 text-sm">${{ p.price }}</td>
                                        <td class="px-6 py-4">
                                            <div class="flex justify-center items-center gap-4">
                                                <button @click="editProduct(p)" class="text-blue-500 hover:text-blue-700 font-extrabold text-xs bg-blue-50 px-4 py-2 rounded-xl transition-all">修改</button>
                                                <button @click="deleteProduct(p.id)" class="text-gray-300 hover:text-red-500 font-bold text-xs transition-all">刪除</button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="md:hidden text-center py-3 text-gray-400 text-[10px] bg-gray-50 italic border-t border-gray-100">
                            💡 提示：若畫面不完整可左右滑動表格
                        </div>
                    </div>
                </div>

            </div>

            <div class="mt-10 text-center pb-12">
                <router-link to="/" class="text-gray-400 text-sm font-medium hover:text-blue-500 transition-all inline-flex items-center gap-1">
                    <span class="text-lg">←</span> 返回商城前台
                </router-link>
            </div>
        </div>
    </div>
</template>