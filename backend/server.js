require('dotenv').config(); // 載入環境變數
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// 允許你的 GitHub Pages 網址連線
app.use(cors({
    origin: [
        'https://minecraft15611-paul.github.io',
        'https://minecraft15611-paul.github.io/',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ── Stripe Webhook ──────────────────────────────────────────────────────────────────
// 💡 MUST be before express.json() — Stripe requires the raw request body for signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook 簽章驗證失敗：', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        try {
            // ── Parse lean cart from metadata ─────────────────────────────────
            const leanItems = JSON.parse(session.metadata.items); // [{ id, quantity }]
            const ids = leanItems.map(i => i.id);

            // ── Look up full product details from MongoDB ──────────────────────
            const products = await Product.find({ id: { $in: ids } });

            const orderItems = leanItems.map(lean => {
                const product = products.find(p => p.id === lean.id);
                if (!product) throw new Error(`找不到商品 id: ${lean.id}`);
                return {
                    id:       product.id,
                    name:     product.name || product.title,
                    price:    product.price,
                    quantity: lean.quantity,
                    subtotal: +(product.price * lean.quantity).toFixed(2),
                    img:      product.img,
                    selectedColor: null,
                    selectedSize:  null,
                };
            });

            const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

            // ── Build shipping address from Stripe session ─────────────────────
            const addr    = session.shipping_details?.address ?? {};
            const name    = session.shipping_details?.name ?? '';
            const [firstName, ...rest] = name.split(' ');
            const lastName = rest.join(' ');

            // ── Generate order ID ──────────────────────────────────────────────
            const datePart     = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
            const orderId      = `ORD-${datePart}-${randomSuffix}`;

            // ── Create order in MongoDB ────────────────────────────────────────
            const newOrder = new Order({
                orderId,
                stripeSessionId: session.id,          // stored so SuccessView can query by it
                customerName:    name,
                email:           session.customer_details?.email ?? '',
                address:         `${addr.line1 ?? ''}${addr.line2 ? ', ' + addr.line2 : ''}`,
                phone:           session.customer_details?.phone ?? '',
                items:           orderItems,
                totalAmount:     +totalAmount.toFixed(2),
                status:          '已付款',
                shippingDetails: {
                    firstName,
                    lastName,
                    address:   addr.line1 ?? '',
                    apartment: addr.line2 ?? '',
                    city:      addr.city ?? '',
                    state:     addr.state ?? '',
                    postcode:  addr.postal_code ?? '',
                    country:   addr.country ?? '',
                },
            });

            await newOrder.save();

            // ── Deduct stock ───────────────────────────────────────────────────
            for (const item of orderItems) {
                await Product.findOneAndUpdate(
                    { id: item.id },
                    { $inc: { stock: -item.quantity } }
                );
            }

            console.log(`✅ Express checkout 訂單已建立：${orderId}`);
        } catch (err) {
            console.error('處理 Webhook 時發生錯誤：', err.message);
            return res.status(500).json({ error: '伺服器錯誤' });
        }
    }

    res.json({ received: true });
});

app.use(express.json()); // parse incoming JSON bodies

// ── MongoDB 連線 ────────────────────────────────────────────────────────────────────
const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("錯誤：找不到 MONGODB_URI 環境變數！");
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => console.log("MongoDB 連線成功！"))
    .catch(err => console.log("連線失敗：", err));

// ── Schema 定義 ─────────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
    id: Number,
    category: String,
    name: String,
    title: String,
    img: String,
    price: Number,
    stock: Number,
    colors: [{ name: String, hex: String }],
    sizes: [String],
    description: String,
    material: String
});

const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    stripeSessionId: { type: String, default: null }, // set for express checkout orders
    customerName: String,
    email: String,
    address: String,
    phone: String,
    items: [
        {
            id: Number,
            name: String,
            price: Number,
            quantity: Number,
            subtotal: Number,
            img: String,
            selectedSize: String,
            selectedColor: String,
        }
    ],
    totalAmount: Number,
    status: { type: String, default: '待付款' },
    // Full shipping address — populated by Stripe webhook for express checkout orders
    shippingDetails: {
        firstName: String,
        lastName:  String,
        address:   String,
        apartment: String,
        city:      String,
        state:     String,
        postcode:  String,
        country:   String,
    },
    createdAt: { type: Date, default: Date.now }
});

mongoose.deleteModel(/Order/);
const Order = mongoose.model('Order', orderSchema);

// ── Admin Schema ────────────────────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
    passwordHash: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

// Helper: get admin record, or create one from .env hash on first run
const getAdmin = async () => {
    let admin = await Admin.findOne();
    if (!admin) {
        // First time: seed from ADMIN_PASSWORD_HASH in .env
        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash) throw new Error('ADMIN_PASSWORD_HASH not set in .env');
        admin = await Admin.create({ passwordHash: hash });
        console.log('Admin record created in MongoDB');
    }
    return admin;
};

// ── Admin Auth ──────────────────────────────────────────────────────────────────────

// Middleware — protect admin-only routes (must be defined before any route that uses it)
const requireAdmin = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
    try {
        jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// [POST] Admin login — validates password against MongoDB and returns JWT
app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        const admin = await getAdmin();
        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Unauthorized' });
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: '伺服器錯誤', detail: err.message });
    }
});

// [PUT] Change admin password — updates hash in MongoDB permanently
app.put('/api/admin/change-password', requireAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await getAdmin();

        const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!valid) return res.status(401).json({ error: '目前密碼錯誤' });

        admin.passwordHash = await bcrypt.hash(newPassword, 10);
        await admin.save();

        res.json({ message: '密碼已成功更新' });
    } catch (err) {
        res.status(500).json({ error: '伺服器錯誤', detail: err.message });
    }
});

// ── 訂單路由 ────────────────────────────────────────────────────────────────────────

// [POST] 接收前台訂單 (public — customers place orders)
// ⚠️  Stock deduction removed — now handled exclusively by Stripe webhook after payment confirmed
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ message: "下單失敗", error: err });
    }
});

// [GET] 獲取所有訂單 (後台使用 — protected)
app.get('/api/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "抓取訂單失敗", error: err });
    }
});

// [PUT] 更新訂單狀態 (後台 — protected)
app.put('/api/orders/:id', requireAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: "更新狀態失敗", error: err });
    }
});

// [DELETE] 刪除指定訂單 (後台 — protected)
app.delete('/api/orders/:id', requireAdmin, async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ message: "找不到該訂單" });
        res.json({ message: "訂單已成功刪除" });
    } catch (err) {
        res.status(500).json({ message: "刪除失敗", error: err });
    }
});

// ── 商品路由 ────────────────────────────────────────────────────────────────────────

// [GET] 獲取所有商品 (public — storefront needs this)
app.get('/api/products', async (req, res) => {
    try {
        const dbProducts = await Product.find();
        res.json(dbProducts);
    } catch (err) {
        res.status(500).json({ message: "抓取失敗", error: err });
    }
});

// [POST] 新增商品 (後台 — protected)
app.post('/api/products', requireAdmin, async (req, res) => {
    try {
        // Find the product with the highest id, then add 1
        const lastProduct = await Product.findOne().sort({ id: -1 });
        const nextId = lastProduct ? lastProduct.id + 1 : 1;

        const newProduct = new Product({ ...req.body, id: nextId });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: "新增失敗", error: err });
    }
});

// [PUT] 修改指定商品 (後台 — protected)
app.put('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { id: Number(req.params.id) },
            req.body,
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: "找不到商品" });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: "更新失敗", error: err });
    }
});

// [DELETE] 刪除指定商品 (後台 — protected)
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const deletedProduct = await Product.findOneAndDelete({ id: Number(req.params.id) });
        if (!deletedProduct) return res.status(404).json({ message: "找不到商品" });
        res.json({ message: "刪除成功", product: deletedProduct });
    } catch (err) {
        res.status(500).json({ message: "刪除失敗", error: err });
    }
});

// ── Stripe 結帳 ─────────────────────────────────────────────────────────────────────

// [POST] 建立 Express Checkout 的 Stripe Session (public)
// 只接收 { items: [{ id, quantity }] } — 精簡格式，避免超過 Stripe metadata 500字元限制
// 完整商品資料 (name, price, img) 由 Webhook 從 MongoDB 撈取
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { items } = req.body; // [{ id: 1, quantity: 2 }, ...]

        // Look up full product details from MongoDB to build line items
        const ids = items.map(i => i.id);
        const products = await Product.find({ id: { $in: ids } });

        const lineItems = items.map(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) throw new Error(`找不到商品 id: ${item.id}`);
            return {
                price_data: {
                    currency: 'twd',
                    product_data: { name: product.name || product.title },
                    unit_amount: product.price * 100, // Stripe 單位為「分」
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            // 強制 Stripe 結帳頁收集外送地址
            shipping_address_collection: {
                allowed_countries: ['TW', 'US', 'GB', 'JP', 'CA', 'AU'],
            },
            // 只存 id + quantity，避免超過 500 字元限制；Webhook 再從 DB 撈完整資料
            metadata: {
                items: JSON.stringify(items.map(i => ({ id: i.id, quantity: i.quantity }))),
            },
            // 帶上 session_id，讓 SuccessView 能查詢剛建立的訂單
            success_url: `${process.env.FRONTEND_URL}/#/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${process.env.FRONTEND_URL}/#/CheckoutView`,
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('建立 Stripe Session 失敗：', err.message);
        res.status(500).json({ error: err.message });
    }
});

// [GET] SuccessView 用 session_id 查詢 Webhook 建立好的訂單 (public)
app.get('/api/orders/stripe/:sessionId', async (req, res) => {
    try {
        const order = await Order.findOne({ stripeSessionId: req.params.sessionId });
        if (!order) return res.status(404).json({ message: '訂單尚未建立，請稍候再試' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: '查詢失敗', error: err.message });
    }
});

// ── 啟動伺服器 ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`後端伺服器已啟動，正在監聽 Port: ${PORT}`);
});