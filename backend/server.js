require('dotenv').config(); // 載入環境變數
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

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
            selectedSize: String,
            selectedColor: { name: String, hex: String }
        }
    ],
    totalAmount: Number,
    status: { type: String, default: '待付款' },
    createdAt: { type: Date, default: Date.now }
});

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

// [POST] 接收前台訂單，並扣除庫存 (public — customers place orders)
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();

        for (const item of req.body.items) {
            await Product.findOneAndUpdate(
                { id: item.id },
                { $inc: { stock: -item.quantity } }
            );
        }

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
        const newProduct = new Product(req.body);
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

// ── 啟動伺服器 ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`後端伺服器已啟動，正在監聽 Port: ${PORT}`);
});