Vue 3 + Pinia Shopping Cart Project

這是一個基於 Vue 3 (Composition API) 與 Pinia 狀態管理開發的電商購物車練習專案。本專案已完成從組件傳遞（Props/Emits）到全域狀態管理的架構重構，實現了邏輯與畫面的完全解耦。

🚀 技術棧
Vue 3：前端開發框架。

Pinia：官方推薦的狀態管理庫（取代 Vuex）。
Vite：高效的前端構建工具。
Fake Store API：用於獲取模擬商品資料。

🛠 核心架構：Pinia Store (cart.js)
專案將所有資料流集中於 useCartStore 管理，主要包含以下部分：

State:

products: 儲存從 API 獲取的商品清單。
cart: 儲存購物車內的商品、數量。

Getters:

totalPrice: 自動計算購物車總金額。
cartCount: 即時計算購物車內物品總數。

Actions:

fetchProducts(): 非同步獲取 API 資料並初始化庫存。
addToCart() / removeFromCart(): 處理購物邏輯並同步更新 products 庫存。
clearCart(): 一鍵清空購物車並歸還所有商品庫存。

✨ 主要功能
全域狀態管理：組件（ProductList, Cart）直接與 Store 連線，無需透過 App.vue 層層傳遞資料。

資料持久化：使用 watch 監聽購物車變動，並自動同步至瀏覽器 localStorage，重新整理後內容不消失。
庫存同步系統：加入或移除商品時，首頁商品的庫存數量（Stock）會即時增減。
篩選與分頁：支援商品名稱搜尋、價格區間篩選、分類切換以及分頁功能。

src/
├── components/
│   ├── Cart.vue          # 購物車顯示組件
│   └── ProductList.vue   # 商品列表、搜尋、篩選與分頁組件
├── stores/
│   └── cart.js           # Pinia Store (所有邏輯核心)
└── App.vue               # 根組件 (僅負責掛載與 API 初始化)
