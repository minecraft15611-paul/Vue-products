# 🍋 LemonTree

> A full-stack e-commerce project built with Vue 3 + TypeScript + Express + MongoDB.

🔗 **Live Demo:** [minecraft15611-paul.github.io/Vue-products](https://minecraft15611-paul.github.io/Vue-products/)

---

## ✨ Features at a Glance

| Area | What's included |
|---|---|
| 🛍️ Shopping | Product listing, search, filter, pagination, hover image swap |
| 🛒 Cart | Quantity controls, localStorage persistence, discount codes |
| 💳 Checkout | Stripe payments, CO₂ offset opt-in, order confirmation email |
| 🔐 Auth | OTP email login, Google OAuth, JWT via HTTP-only cookie |
| 🔧 Admin | Product CRUD, order status management, password-protected |
| 🐛 Monitoring | Sentry error tracking (frontend + backend) |

---

## 🏆 Engineering Highlights

### 🔐 Secure Auth with HTTP-only Cookies
JWT sessions are stored in **HTTP-only cookies** — never in `localStorage` or JavaScript-accessible memory. This means XSS attacks cannot steal session tokens. The cookie is configured with `Secure: true` and `SameSite: none` to support cross-origin requests between GitHub Pages (frontend) and Render (backend).

```
Browser              GitHub Pages              Render API
  │                       │                        │
  │── POST /auth/otp ─────────────────────────────▶│
  │                       │         Set-Cookie: userToken (httpOnly; Secure; SameSite=none)
  │◀──────────────────────────────────────────────│
  │                       │                        │
  │  🔒 Token stored in httpOnly cookie            │
  │  ✅ Invisible to JavaScript / XSS              │
```

Two separate cookies protect different access levels:
- `userToken` — issued after OTP or Google OAuth, required for customer routes (`/api/users/me`, `/api/orders`)
- `adminToken` — issued after admin password login, required for all `/api/admin/*` routes

### 🔑 Two-Factor OTP Login
Email login uses a **time-limited, hashed OTP** flow:
1. User enters email → backend generates a 6-digit code, hashes it with bcrypt, stores it in MongoDB with a TTL index (auto-deletes after expiry)
2. User enters code → backend verifies against hash, never stores plaintext
3. On success → JWT issued and set as HTTP-only cookie

Rate limiting (`3 attempts / 15 min`) prevents brute force on the OTP endpoint.

### 🌐 Google OAuth (Popup)
Firebase Auth uses `signInWithPopup` in all environments. The previous `signInWithRedirect` approach was removed because Chrome's third-party storage restrictions between `github.io` and `firebaseapp.com` caused `getRedirectResult` to always return null, breaking Google login for all users.

After Firebase resolves the identity, the **email and display name are sent to the backend**, which issues its own JWT cookie — Firebase tokens are never trusted directly by the API.

### 💳 Stripe Webhook Order Creation
Stripe Express Checkout orders are created server-side via **webhook**, not from the frontend. This prevents order fraud — a user cannot create an order without a real Stripe payment completing.

```
Frontend           Stripe              Backend (Render)
   │                  │                      │
   │── Checkout ──▶   │                      │
   │                  │── webhook POST ──────▶│
   │                  │   checkout.session    │ verify signature
   │                  │   .completed          │ create Order in MongoDB
   │                  │                      │ send confirmation email
```

The webhook signature is verified with `stripe.webhooks.constructEvent()` before any order is written.

### 🚨 Sentry Error Monitoring
Both frontend and backend are instrumented with Sentry:
- **Frontend** (`@sentry/vue`) — captures Vue component errors, navigation breadcrumbs, and user interactions leading up to a crash
- **Backend** (`@sentry/node`) — captures unhandled Express errors with request context

This enabled catching a production crash in `SuccessView.vue` where `item.imgs[0]` was undefined because the order snapshot serialized `imgs[]` as a singular `img` string — identified and fixed using the Sentry breadcrumb trail.

---

## 🚀 Tech Stack

### Frontend
| Tool | Role |
|---|---|
| Vue 3 + TypeScript | UI framework |
| Pinia | State management |
| Vue Router 4 | Routing (Hash history) |
| Tailwind CSS v4 | Styling |
| Vite | Build tool |
| Firebase Auth | Google OAuth redirect/popup |
| Axios | HTTP client |
| Zod + Vee-Validate | Form validation |
| Sentry | Error monitoring |

### Backend
| Tool | Role |
|---|---|
| Express 5 | REST API |
| MongoDB + Mongoose | Database |
| Stripe | Payments + webhooks |
| Resend | Transactional emails (OTP + order confirmation) |
| JWT + bcryptjs | Session tokens + OTP hashing |
| cookie-parser | HTTP-only cookie handling |
| express-rate-limit | Brute force protection |
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
STRIPE_WEBHOOK_SECRET=...
RESEND_API_KEY=...
ADMIN_PASSWORD_HASH=...
SENTRY_DSN=...
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
│       ├── views/          # Pages (Home, ProductsList, Cart, Checkout, Admin, Success...)
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
| `/Admin` | Admin cookie required |

---

## 📝 Notes

- **Backend cold start** — hosted on Render free tier, first request may take ~30s to wake up.
- **Google OAuth** — uses `signInWithPopup` in all environments. Works for all users with no custom domain required.
- **OTP email login** — currently limited to Resend-verified addresses. Requires a custom sending domain to work for all users.
- **Cart persistence** — saved to `localStorage`, survives page refreshes.
- **OTP codes** — stored hashed in MongoDB with a TTL index; auto-deleted on expiry, never stored in plaintext.
- **Cookies** — `httpOnly: true`, `secure: true`, `sameSite: 'none'` for cross-origin GitHub Pages ↔ Render support.

---

## 🔄 CI/CD

Automated pipeline via **GitHub Actions** — triggers on every push to `dev-tailwind` branch.

```
git push → Type Check (vue-tsc) → Build → Deploy to GitHub Pages
```

| Step | Tool | What it does |
|---|---|---|
| Type Check | `vue-tsc --noEmit` | Fails the pipeline if TypeScript errors exist |
| Build | `vite build` | Compiles and bundles the frontend |
| Deploy | `peaceiris/actions-gh-pages` | Publishes `dist/` to GitHub Pages |

If type check or build fails → deploy is blocked and GitHub sends an email alert.