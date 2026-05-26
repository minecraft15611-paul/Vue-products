# 🍋 LemonTree — Vue 3 E-Commerce Practice Project

🔗 **Live Demo:** [minecraft15611-paul.github.io/Vue-products](https://minecraft15611-paul.github.io/Vue-products/)

A full-stack e-commerce practice project built with **Vue 3 + TypeScript** on the frontend and **Express + MongoDB** on the backend. It has evolved far beyond a simple cart demo — featuring real authentication, Stripe payments, an admin panel, and a custom REST API.

---

## 🏗️ Project Structure

```
Vue-products/
├── frontend/          # Vue 3 + TypeScript + Tailwind CSS
└── backend/           # Express + MongoDB + Stripe REST API
```

---

## 🚀 Tech Stack

### Frontend
| Tool | Role |
|---|---|
| Vue 3 (Composition API) | UI framework |
| TypeScript | Type safety |
| Pinia | Global state management |
| Vue Router 4 | Client-side routing (Hash history) |
| Tailwind CSS v4 | Utility-first styling |
| Vite 8 | Build tool |
| Firebase Auth | Google OAuth redirect flow |
| Axios | HTTP client (Admin panel) |
| Zod + Vee-Validate | Form schema validation |
| Vue Tel Input | Phone field with country picker |
| Lodash-es (debounce) | Optimized search input |

### Backend
| Tool | Role |
|---|---|
| Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Stripe | Payment processing |
| Resend | Transactional email (OTP) |
| JSON Web Token | Session auth via HTTP-only cookies |
| bcryptjs | OTP code hashing |
| dotenv | Environment variable management |

---

## ✨ Features

### 🛍️ Shopping
- Product listing with **hover image swap** (second image on hover)
- **Search** (debounced, 500ms) + **category filter** + **pagination** (6 per page)
- Product detail page with **mobile swipe carousel** and **desktop 2×2 image grid**
- Color & size selector with validation before add-to-cart
- "Selected For You" random product recommendations
- Real-time **stock sync** — inventory updates as items are added/removed

### 🛒 Cart & Checkout
- Shopping cart with quantity controls (increase/decrease/remove)
- `localStorage` cart persistence across page refreshes
- Discount code system (`SAVE10` / `GIFT100`) with min-spend validation
- CO₂ offset opt-in at checkout (+$0.15)
- **Stripe** payment integration (Express Checkout + redirect flow)
- Success page with order confirmation

### 🔐 Authentication
- **OTP email login** — enter email → receive 6-digit code via Resend → verify
- **Google OAuth** — popup in dev, redirect in production (Firebase Auth)
- JWT session stored in HTTP-only cookie (backend issues on verify)
- `/api/auth/me` endpoint to restore session on page load

### 🔧 Admin Panel
- View all orders with status management (`Pending Payment` → `Paid` → `Shipped` → `Completed` → `Cancelled`)
- Product management (CRUD) — add/edit/delete products
- Accessible via header "Admin Panel" link

### 🌐 API
- Backend hosted on Render: `https://lemontree-api.onrender.com`
- Products served from MongoDB (with local JSON fallback in `/public/api/Products.json`)

---

## 📁 Frontend Source Layout

```
frontend/src/
├── App.vue                    # Root component (mounts router-view, init auth)
├── main.ts                    # App entry point
├── router/
│   └── index.js               # Routes + navigation guards
├── stores/
│   ├── cart.ts                # Cart, products, search, filter, toast — all shared state
│   └── auth.ts                # Auth state (OTP + Google), session init
├── views/
│   ├── Home.vue               # Landing page
│   ├── ProductsList.vue       # Product grid with search/filter/pagination
│   ├── ProductDetail.vue      # Single product with carousel, color/size, accordion
│   ├── ShoppingCart.vue       # Cart review page
│   ├── CheckoutView.vue       # Full checkout form (shipping, billing, payment)
│   ├── LoginView.vue          # OTP + Google login
│   ├── LoginCallbackView.vue  # Google redirect handler
│   ├── SuccessView.vue        # Post-payment confirmation
│   ├── Admin.vue              # Admin dashboard
│   └── NotFoundView.vue       # 404
├── components/
│   ├── MyHeader.vue           # Sticky header with nav, search, cart icon, auth
│   ├── MyFooter.vue           # Footer
│   ├── HomePage.vue           # Home page content
│   ├── SplashCover.vue        # Initial splash screen
│   ├── TheToast.vue           # Global toast notification
│   ├── OrderList.vue          # Order list component
│   ├── addToCartButton.vue    # Add to cart CTA
│   ├── buyButton.vue          # Buy/confirm button
│   ├── cartIcon.vue           # Cart icon with badge count
│   └── Payment.vue            # Payment method component
├── composables/
│   └── useDiscount.ts         # Coupon code logic (SAVE10, GIFT100)
├── schemas/
│   ├── authSchema.ts          # Zod schema for login form
│   └── checkoutSchema.ts      # Zod schema for checkout form
├── service/
│   └── auth.ts                # Auth API calls (sendOtp, verifyOtp, fetchMe, logout...)
└── firebase/
    └── config.ts              # Firebase app init (Google Auth)
```

---

## 🔒 Route Guards

| Route | Guard |
|---|---|
| `/CheckoutView` | `requiresCart` — must enter from cart page with items |
| `/success` | `fromCheckout` — must have `localStorage` flag or Stripe `session_id` |
| `/Admin` | `requiresAdmin` — open (no auth check yet) |

---

## 🧾 Pinia Cart Store — Key API

```ts
// Products
fetchProducts()        // Fetches from backend API
products               // Ref<Product[]>
filteredProducts       // Computed — filtered by category + search
isLoading / apiError

// Cart
cart                   // Ref<CartItem[]> — persisted to localStorage
addToCart(product, color?, size?)
removeItem(item)
decreaseQty(item)
increaseQty(item)
clearCart()
totalPrice             // Computed total
cartCount              // Computed item count

// Search & Filter
tempInput              // v-model for search input (debounced → searchQuery)
selectedCategory       // Active category
setCategory(cat)
goHome()

// Toast
toast                  // { show, message }
```

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://lemontree-api.onrender.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Backend (`backend/.env`)
```env
MONGODB_URI=...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
RESEND_API_KEY=...
```

---

## 🛠️ Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
node server.js
```

### Deploy (Frontend → GitHub Pages)
```bash
cd frontend
npm run deploy   # builds + publishes via gh-pages
```

---

## 💳 Discount Codes (for testing)

| Code | Type | Discount | Min Spend |
|---|---|---|---|
| `SAVE10` | Percent | 10% off | $500 |
| `GIFT100` | Fixed | $100 off | $1000 |

---

## 📝 Notes

- The backend is hosted on Render's free tier — the first request may be slow while the server wakes up.
- Google OAuth uses **redirect** in production (GitHub Pages) and **popup** in local dev due to browser restrictions.
- Cart data survives page refreshes via `localStorage`, but stock quantities reset on next product fetch.