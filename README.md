# 🍋 LemonTree

> A full-stack e-commerce project built with Vue 3 + TypeScript + Express + MongoDB.

🔗 **Live Demo:** [minecraft15611-paul.github.io/Vue-products](https://minecraft15611-paul.github.io/Vue-products/)

---

## ✨ Features at a Glance

| Area | What's included |
|---|---|
| 🛍️ Shopping | Product listing, search, filter, pagination, hover image swap |
| 🛒 Cart | Quantity controls, localStorage persistence, discount codes |
| 💳 Checkout | Stripe payments, CO₂ offset opt-in, order confirmation |
| 🔐 Auth | OTP email login, Google OAuth, JWT via HTTP-only cookie |
| 🔧 Admin | Product CRUD, order status management |
| 🐛 Monitoring | Sentry error tracking (frontend + backend) |

---

## 🚀 Tech Stack

### Frontend
| Tool | Role |
|---|---|
| Vue 3 + TypeScript | UI framework |
| Pinia | State management |
| Vue Router 4 | Routing (Hash history) |
| Tailwind CSS v4 | Styling |
| Vite 8 | Build tool |
| Firebase Auth | Google OAuth |
| Axios | HTTP client |
| Zod + Vee-Validate | Form validation |
| Sentry | Error monitoring |

### Backend
| Tool | Role |
|---|---|
| Express 5 | REST API |
| MongoDB + Mongoose | Database |
| Stripe | Payments |
| Resend | OTP emails |
| JWT + bcryptjs | Auth & session |
| Sentry | Error monitoring |

---

## 🛠️ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/minecraft15611-paul/Vue-products.git
cd Vue-products
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend
```bash
cd backend
npm install
node server.js
```

### 4. Deploy (GitHub Pages)
```bash
cd frontend
npm run deploy
```

---

## ⚙️ Environment Variables

### `frontend/.env`
```env
VITE_API_URL=https://lemontree-api.onrender.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### `backend/.env`
```env
MONGODB_URI=...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
RESEND_API_KEY=...
```

---

## 💳 Test Discount Codes

| Code | Discount | Min Spend |
|---|---|---|
| `SAVE10` | 10% off | $500 |
| `GIFT100` | $100 off | $1000 |

---

## 🏗️ Project Structure

```
Vue-products/
├── frontend/
│   └── src/
│       ├── views/          # Pages (Home, ProductsList, Cart, Checkout, Admin...)
│       ├── components/     # Shared UI (Header, Footer, Toast, CartIcon...)
│       ├── stores/         # Pinia stores (cart.ts, auth.ts)
│       ├── schemas/        # Zod validation schemas
│       ├── composables/    # useDiscount.ts
│       ├── service/        # Auth API calls
│       └── firebase/       # Firebase config
└── backend/
    └── server.js           # Express API (products, orders, auth, Stripe webhooks)
```

---

## 🔒 Route Guards

| Route | Condition |
|---|---|
| `/CheckoutView` | Must come from cart with items |
| `/success` | Must have completed checkout |
| `/Admin` | Admin key required |

---

## 📝 Notes

- **Backend cold start** — hosted on Render free tier, first request may take ~30s to wake up.
- **Google OAuth** — uses redirect flow in production (GitHub Pages), popup in local dev.
- **Cart persistence** — saved to `localStorage`, survives page refreshes. Stock resets on next product fetch.
- **Sentry** — frontend errors tracked via `@sentry/vue` in `main.ts`, backend via `@sentry/node` in `server.js`.