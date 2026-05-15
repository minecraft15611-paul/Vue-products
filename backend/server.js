require('dotenv').config(); // 載入環境變數
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');

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

const uri = process.env.MONGODB_URI;


if (!uri) {
    console.error("錯誤：找不到 MONGODB_URI 環境變數！");
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => console.log("MongoDB 連線成功！"))
    .catch(err => console.log("連線失敗：", err));

// 定義資料的「長相」(Schema)
const productSchema = new mongoose.Schema({
  id: Number, // 雖然 MongoDB 會自動生成 _id，但保留原始 id 有助於前端 router 跳轉 
    category: String,
    name: String,
    title: String,
    img: String,
    price: Number,
    stock: Number,
  // 增加陣列型態支援
colors: [
    {
        name: String,
        hex: String
    }
    ],
    sizes: [String],
    description: String,
    material: String
});
 
const Product = mongoose.model('Product', productSchema);

// 定義訂單模型 (Order Schema)
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

// ── Middleware (must come before ALL routes) ────────────────────────────────────────
app.use(express.json()); // parse incoming JSON bodies

// --- 訂單路由設定 ---

// 1. [POST] 接收前台訂單，並扣除庫存
app.post('/api/orders', async (req, res) => {
    try {
        // Step 1: Save the order
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();

        // Step 2: Deduct stock for each item
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

// 2. [GET] 獲取所有訂單 (後台使用)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }); 
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "抓取訂單失敗", error: err });
    }
});

// 3. [PUT] 更新訂單狀態 (後台更換：已付款/已出貨)
app.put('/api/orders/:id', async (req, res) => {
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

// 3. 路由設定 (Routes)
// [GET] 獲取所有商品
app.get('/api/products', async (req, res) => {
    try {
        const dbProducts = await Product.find(); // 向資料庫要所有商品
        res.json(dbProducts);
    } catch (err) {
        res.status(500).json({ message: "抓取失敗", error: err });
    }
});

// [POST] 接收 Vue 上傳的新商品
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body); // 建立新商品物件
        const savedProduct = await newProduct.save(); // 存進資料庫
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: "新增失敗", error: err });
    }
});
 
    // [DELETE] 刪除指定商品
    app.delete('/api/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findOneAndDelete({ id: req.params.id });
        if (!deletedProduct) return res.status(404).json({ message: "找不到商品" });
        res.json({ message: "刪除成功", product: deletedProduct });
    } catch (err) {
        res.status(500).json({ message: "刪除失敗", error: err });
    }
    });

    // [PUT] 修改指定商品資料
    app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findOneAndUpdate(
        { id: req.params.id }, 
        req.body, 
        { new: true } // 回傳修改後的資料
        );
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: "更新失敗", error: err });
    }
    });

    // [DELETE] 刪除指定訂單
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ message: "找不到該訂單" });
        }
        res.json({ message: "訂單已成功刪除" });
    } catch (err) {
        res.status(500).json({ message: "刪除失敗", error: err });
    }
});



// 4. 啟動伺服器
    app.listen(PORT, () => {
    console.log(`後端伺服器已啟動，正在監聽 Port: ${PORT}`);
    });