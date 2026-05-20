# LemonTree — Full-Stack E-Commerce App

> A production-grade online store built with Vue 3, Pinia, Tailwind CSS, and a Node.js/MongoDB backend.  
> 一個使用 Vue 3、Pinia、Tailwind CSS 與 Node.js/MongoDB 後端打造的全端電商網站。

**🔗 Live Demo:** [minecraft15611-paul.github.io/Vue-products](https://minecraft15611-paul.github.io/Vue-products/)  
**🗂 Backend API:** [lemontree-api.onrender.com](https://lemontree-api.onrender.com/api/products)

---

## 📌 About This Project | 專案簡介

LemonTree is a fully functional e-commerce web application I built independently as a career-switch portfolio project. It covers the entire user journey — from browsing products, selecting colors and sizes, adding to cart, checking out with form validation, all the way through to an admin panel for managing products and orders. It also integrates a real Stripe payment flow with webhook order creation.

LemonTree 是我作為轉職作品獨立開發的全功能電商網站，涵蓋完整的使用者流程：商品瀏覽、顏色／尺寸選擇、加入購物車、結帳表單驗證，以及管理後台的商品與訂單管理，並整合了真實的 Stripe 金流與 Webhook 訂單建立機制。

---

## ✨ Key Features | 主要功能

| Feature | Description |
|---|---|
| 🛍 Product Catalog | Filter by category, real-time debounced search, pagination |
| 🛒 Shopping Cart | Persistent cart (localStorage), quantity control, stock sync |
| 💳 Checkout | Multi-step form with Zod schema validation, coupon codes, 3 payment methods |
| 🔐 Auth | Firebase passwordless email-link login (magic link flow) |
| 📦 Admin Panel | JWT-protected dashboard — add/edit/delete products, manage order status |
| 📱 Responsive | Mobile-first design with separate layouts for mobile and desktop |
| 🚀 CI/CD | Auto-deploy to GitHub Pages via GitHub Actions on every push |
| 💰 Stripe Payments | Express checkout via Stripe hosted page with Webhook order creation |

---

## 🧠 What I Learned & Technical Decisions | 技術決策與學習

### 1. State Management with Pinia
The entire cart system — product fetching, filtering, search, stock management, and toast notifications — lives in a single Pinia store. I chose this approach to avoid prop-drilling across deeply nested components and to make cart state accessible from anywhere, including route guards.

使用單一 Pinia Store 管理購物車、商品篩選、搜尋與庫存，避免深層 props 傳遞，也讓 router guard 能直接存取購物車狀態。

### 2. Debounced Search
Rather than filtering on every keystroke, I used `lodash-es`'s `debounce` with a 500ms delay on a `tempInput` ref, which feeds into the actual `searchQuery` only after the user stops typing. This prevents unnecessary re-renders on every keypress.

搜尋輸入使用 `lodash-es` 的 `debounce`，延遲 500ms 後才觸發過濾，避免每次按鍵都重新渲染。

### 3. Schema-Driven Form Validation with Zod
The checkout form uses `zod`'s `superRefine()` for conditional validation — credit card fields only validate when the user picks "credit card" as payment; billing address fields only validate when the user opts for a different billing address. This keeps the schema declarative and avoids complex imperative if/else logic.

結帳表單使用 `zod` 的 `superRefine()` 做條件驗證，信用卡欄位只在選擇信用卡時驗證，帳單地址只在選擇不同地址時驗證，讓驗證邏輯保持宣告式。

### 4. Passwordless Authentication (Firebase Email Link)
Instead of a traditional username/password login, I implemented Firebase's email-link sign-in (magic link). The flow handles cross-device sign-in — if the user opens the link on a different device, the app detects the missing localStorage token and prompts them to re-enter their email.

使用 Firebase 無密碼 Email Link 登入，並處理跨裝置情境：若使用者在不同裝置開啟連結，App 會偵測到 localStorage 中無 token 並提示重新輸入 Email。

### 5. JWT-Protected Admin Backend
The Express backend uses bcrypt to hash and compare the admin password, then issues a signed JWT (8h expiry). All admin routes are protected by a `requireAdmin` middleware that verifies the token on every request. The frontend stores the JWT in `sessionStorage` and attaches it as a `Bearer` header via Axios defaults.

後端使用 bcrypt 雜湊密碼並簽發 JWT（8小時有效），所有管理路由均由 `requireAdmin` middleware 驗證 token，前端將 JWT 存於 `sessionStorage` 並透過 Axios 預設 header 附加。

### 6. Optimistic Stock Management
When a user adds an item to cart, the product's stock is immediately decremented in the Pinia store (optimistic UI). The real decrement only hits MongoDB when an order is placed via `$inc`. This makes the UI feel instant without waiting for a server round-trip.

加入購物車時立即在 Pinia store 扣除庫存（樂觀更新），實際扣庫存的操作在下單時才透過 MongoDB 的 `$inc` 完成，讓 UI 反應更即時。

### 7. Stripe Express Checkout with Webhook Order Creation
The app supports a one-click express checkout flow powered by Stripe. Clicking the express checkout button sends a lean cart payload `[{ id, quantity }]` to the backend, which looks up full product details from MongoDB, builds Stripe line items, and creates a hosted Checkout Session. After the customer completes payment on Stripe's page, Stripe fires a `checkout.session.completed` webhook to the backend. The webhook re-fetches the full session from the Stripe API to guarantee complete shipping and customer data, then saves the order to MongoDB with status `已付款` and decrements stock.

On the frontend, `SuccessView` detects the `session_id` query parameter in the URL and polls the backend (`/api/orders/stripe/:sessionId`) with retries until the webhook-created order appears, then displays the full order summary including items, totals, and shipping address.

Key engineering decisions in this flow:
- **Lean metadata**: only `[{ id, quantity }]` is stored in Stripe metadata to stay within the 500-character limit; full product data is fetched from MongoDB in the webhook
- **Re-fetch on webhook**: instead of trusting the raw webhook payload (which can have incomplete `shipping_details`), the backend re-fetches the session via `stripe.checkout.sessions.retrieve()` to get guaranteed complete data
- **Hash-based routing**: switched from `createWebHistory` to `createWebHashHistory` so GitHub Pages can serve the `/#/success` redirect URL from Stripe without a 404
- **Polling with retries**: `SuccessView` retries up to 20 times with 3s intervals to handle webhook delivery delay

Stripe Express Checkout 流程：前端送出精簡購物車資料，後端建立 Stripe Checkout Session 並重導向；付款完成後 Stripe 觸發 Webhook，後端重新向 Stripe API 取得完整 Session 資料，再將訂單存入 MongoDB 並扣除庫存。前端 SuccessView 透過輪詢後端 API 取得 Webhook 建立的訂單並顯示完整摘要。

---

## 🏗 Architecture | 架構說明

```
Frontend (Vue 3 SPA)          Backend (Express + MongoDB)
─────────────────────         ───────────────────────────
src/
├── views/          ←─── pages (routed)
├── components/     ←─── reusable UI
├── stores/         ←─── Pinia (cart, auth)
├── composables/    ←─── useDiscount()
├── schemas/        ←─── Zod validation
├── service/        ←─── Firebase auth calls
├── firebase/       ←─── Firebase config
└── router/         ←─── Vue Router + guards

GitHub Actions → build → GitHub Pages
Backend hosted on Render

Payment Flow:
Frontend → POST /api/create-checkout-session → Stripe hosted page
Stripe → POST /webhook → MongoDB order creation + stock deduction
Frontend SuccessView → GET /api/orders/stripe/:sessionId (polling)
```

---

## 🛠 Tech Stack | 技術棧

**Frontend**
- Vue 3 (Composition API, `<script setup>`)
- TypeScript
- Pinia — state management
- Vue Router 4 — client-side routing with navigation guards
- Tailwind CSS v4 — utility-first styling
- Zod — schema-driven form validation
- Firebase Auth — passwordless email-link authentication
- Axios — HTTP client
- Lodash-ES — debounce utility
- Vite — build tool

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- Stripe — payment processing + webhook handling
- JSON Web Token (JWT)
- bcryptjs
- CORS

**DevOps**
- GitHub Actions — CI/CD pipeline
- GitHub Pages — frontend hosting
- Render — backend hosting

---

## 🚀 Getting Started | 本地啟動

```bash
# Clone the repo
git clone https://github.com/minecraft15611-paul/Vue-products.git
cd Vue-products
git checkout dev-tailwind

# Frontend
cd frontend
npm install
cp .env.example .env   # fill in your Firebase keys
npm run dev

# Backend (separate terminal)
cd ../backend
npm install
# create .env with MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD_HASH,
# STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FRONTEND_URL
node server.js
```

---

## 📂 Project Structure | 專案結構

```
Vue-products/
├── frontend/
│   ├── src/
│   │   ├── views/          # Home, ProductsList, ProductDetail,
│   │   │                   # ShoppingCart, CheckoutView, LoginView,
│   │   │                   # LoginCallbackView, SuccessView, Admin
│   │   ├── components/     # MyHeader, MyFooter, HomePage,
│   │   │                   # TheToast, cartIcon, buyButton, addToCartButton
│   │   ├── stores/         # cart.ts, auth.ts
│   │   ├── composables/    # useDiscount.ts
│   │   ├── schemas/        # authSchema.ts, checkoutSchema.ts
│   │   ├── service/        # auth.ts (Firebase)
│   │   └── router/         # index.js
│   └── public/api/         # Products.json (fallback data)
└── backend/
    └── server.js           # Express REST API + Stripe webhook
```

---

## 🔒 Security Notes | 安全說明

- Admin password is stored as a **bcrypt hash** in MongoDB — never in plaintext
- All admin API routes require a valid **JWT Bearer token**
- Firebase credentials are injected at **build time via GitHub Secrets** — never committed to the repo
- CORS is restricted to the production domain and localhost only
- Stripe webhook signature is verified with `stripe.webhooks.constructEvent()` to prevent spoofed events

---

## 👤 About Me | 關於我

I'm a career switcher transitioning into frontend engineering. This project represents my ability to build and ship a complete, real-world application independently — from UI design decisions and state architecture to backend API design, third-party payment integration, and CI/CD deployment.

我是一位正在轉職的前端工程師。這個專案展示了我獨立規劃並完成一個完整全端應用的能力，涵蓋 UI 設計決策、狀態架構、後端 API 設計、第三方金流整合到 CI/CD 部署。

📧 Feel free to reach out — [your email here]  
💼 [Your LinkedIn here]  
🐙 [Your GitHub profile here]

---