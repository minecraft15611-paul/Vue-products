const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

const mongoose = require('mongoose');

// 貼上你剛複製的字串，記得把 <password> 換成你設定的密碼
const uri = "mongodb+srv://admin:12356@cluster0.ygu4a9x.mongodb.net/?appName=Cluster0";

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

// 1. 中間件設定
app.use(cors());        // 允許 Vue 跨網域存取
app.use(express.json()); // 解析前端傳來的 JSON 資料


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

// 4. 啟動伺服器
app.listen(PORT, () => {
  console.log(`後端伺服器運行中：http://localhost:${PORT}`);
});
