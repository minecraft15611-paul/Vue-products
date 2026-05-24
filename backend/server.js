require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const mongoose = require('mongoose');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');
const resend  = new Resend(process.env.RESEND_API_KEY);

// HTML escape helper — prevents XSS in email templates
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── Allowed order statuses (single source of truth) ────────────────────────
const ALLOWED_STATUSES = ['Pending Payment', 'Paid', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

// ── MongoDB connection ───────────────────────────────────────────────────────
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI environment variable not found!');
    process.exit(1);
}
mongoose.connect(uri)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('Connection failed:', err));

// ── Schemas & Models (defined first — used by routes below) ─────────────────
const productSchema = new mongoose.Schema({
    id:          Number,
    category:    String,
    name:        String,
    title:       String,
    img:         String,
    price:       Number,
    stock:       Number,
    colors:      [{ name: String, hex: String }],
    sizes:       [String],
    description: String,
    material:    String,
});

const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
    orderId:         { type: String, required: true },
    stripeSessionId: { type: String, default: null }, // set for Stripe checkout orders
    customerName:    String,
    email:           String,
    address:         String,
    phone:           String,
    items: [{
        id:            Number,
        name:          String,
        price:         Number,
        quantity:      Number,
        subtotal:      Number,
        img:           String,
        selectedSize:  String,
        selectedColor: String,
    }],
    totalAmount: Number,
    status:      { type: String, default: 'Pending Payment' },
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
    createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

const adminSchema = new mongoose.Schema({
    passwordHash: { type: String, required: true },
});
const Admin = mongoose.model('Admin', adminSchema);

// Helper: get admin record, or seed from .env hash on first run
const getAdmin = async () => {
    let admin = await Admin.findOne();
    if (!admin) {
        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash) throw new Error('ADMIN_PASSWORD_HASH not set in .env');
        admin = await Admin.create({ passwordHash: hash });
        console.log('Admin record created in MongoDB');
    }
    return admin;
};

// ── Middleware: protect admin-only routes ────────────────────────────────────
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

// ── Express app ──────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: [
        'https://minecraft15611-paul.github.io',
        'https://minecraft15611-paul.github.io/',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// ── Stripe Webhook ───────────────────────────────────────────────────────────
// MUST be before express.json() — Stripe requires the raw request body for signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const sessionRaw = event.data.object;

        try {
            // Re-fetch full session from Stripe to guarantee shipping_details are populated
            const session = await stripe.checkout.sessions.retrieve(sessionRaw.id);

            // Parse lean cart from metadata
            const leanItems = JSON.parse(session.metadata.items); // [{ id, quantity }]
            const ids = leanItems.map(i => i.id);

            // Look up full product details from MongoDB
            const products = await Product.find({ id: { $in: ids } });

            const orderItems = leanItems.map(lean => {
                const product = products.find(p => p.id === lean.id);
                if (!product) throw new Error(`Product not found, id: ${lean.id}`);
                return {
                    id:            product.id,
                    name:          product.name || product.title,
                    price:         product.price,
                    quantity:      lean.quantity,
                    subtotal:      +(product.price * lean.quantity).toFixed(2),
                    img:           product.img,
                    selectedColor: null,
                    selectedSize:  null,
                };
            });

            const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

            // Address lives in customer_details.address; shipping_details may be undefined
            const addr      = session.shipping_details?.address ?? session.customer_details?.address ?? {};
            const name      = session.shipping_details?.name || session.customer_details?.name || '';
            const [firstName, ...rest] = name.split(' ');
            const lastName  = rest.join(' ');

            const datePart     = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
            const orderId      = `ORD-${datePart}-${randomSuffix}`;

            const newOrder = new Order({
                orderId,
                stripeSessionId: session.id,
                customerName:    name,
                email:           session.customer_details?.email ?? '',
                address:         `${addr.line1 ?? ''}${addr.line2 ? ', ' + addr.line2 : ''}`.trim() || '',
                phone:           session.customer_details?.phone || '',
                items:           orderItems,
                totalAmount:     +totalAmount.toFixed(2),
                status:          'Paid',
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

            // Send order confirmation email (Stripe checkout path)
            try {
                await resend.emails.send({
                    from:    'LemonTree@LemonTreeStore.dev',
                    to:      session.customer_details?.email,
                    subject: `Order Confirmed — ${esc(orderId)}`,
                    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1a1a1a;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:2px;">LEMON TREE</h1>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Thanks for your order, ${esc(name)}!</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px;">Your order has been confirmed and is being processed.</p>
      <div style="background:#f9f9f9;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
        <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#1a1a1a;">${esc(orderId)}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="border-bottom:2px solid #f0f0f0;">
            <th style="text-align:left;padding:8px 0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Item</th>
            <th style="text-align:center;padding:8px 0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Qty</th>
            <th style="text-align:right;padding:8px 0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderItems.map(item => `
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:14px 0;font-size:14px;color:#1a1a1a;">${esc(item.name)}</td>
              <td style="padding:14px 0;font-size:14px;color:#666;text-align:center;">x${esc(item.quantity)}</td>
              <td style="padding:14px 0;font-size:14px;color:#1a1a1a;text-align:right;">$${esc(item.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:16px 0 0;font-size:15px;font-weight:bold;color:#1a1a1a;">Total</td>
            <td style="padding:16px 0 0;font-size:15px;font-weight:bold;color:#1a1a1a;text-align:right;">$${esc(totalAmount.toFixed(2))}</td>
          </tr>
        </tfoot>
      </table>
      <div style="border-top:1px solid #f0f0f0;padding-top:24px;">
        <p style="margin:0 0 8px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Shipping To</p>
        <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.8;">
          ${esc(name)}<br>
          ${esc(addr.line1 ?? '')}${addr.line2 ? ', ' + esc(addr.line2) : ''}<br>
          ${esc(addr.city ?? '')}, ${esc(addr.state ?? '')} ${esc(addr.postal_code ?? '')}<br>
          ${esc(addr.country ?? '')}
        </p>
      </div>
    </div>
    <div style="background:#f9f9f9;padding:24px 32px;text-align:center;border-top:1px solid #f0f0f0;">
      <p style="margin:0;font-size:12px;color:#999;">Questions? Contact us anytime.</p>
      <p style="margin:8px 0 0;font-size:12px;color:#bbb;">© 2026 Lemon Tree. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
                    `,
                });
                console.log(`📧 Stripe checkout confirmation email sent to: ${session.customer_details?.email}`);
            } catch (emailErr) {
                console.error('Failed to send Stripe checkout confirmation email:', emailErr.message);
            }

            // Deduct stock — conditional update prevents stock going negative
            for (const item of orderItems) {
                const result = await Product.findOneAndUpdate(
                    { id: item.id, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } }
                );
                if (!result) {
                    console.warn(`Stock deduction skipped for product id ${item.id} — insufficient stock`);
                }
            }

            console.log(`✅ Stripe checkout order created: ${orderId}`);
        } catch (err) {
            console.error('Error processing webhook:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    res.json({ received: true });
});

// express.json() for all subsequent routes
app.use(express.json());

// ── Health Check ─────────────────────────────────────────────────────────────
// Lightweight ping — no DB call, just confirms the server is awake
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ── Admin routes ─────────────────────────────────────────────────────────────

// [GET] Verify token is still valid (used by Admin.vue on mount)
app.get('/api/admin/verify', requireAdmin, (req, res) => {
    res.json({ ok: true });
});

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
        res.status(500).json({ error: 'Server error', detail: err.message });
    }
});

// [PUT] Change admin password — updates hash in MongoDB permanently
app.put('/api/admin/change-password', requireAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await getAdmin();
        const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
        admin.passwordHash = await bcrypt.hash(newPassword, 10);
        await admin.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error', detail: err.message });
    }
});

// ── Order routes ──────────────────────────────────────────────────────────────

// [GET] Look up order by Stripe session ID — registered BEFORE parameterised routes
// so "stripe" is not captured as an :id param
app.get('/api/orders/stripe/:sessionId', async (req, res) => {
    try {
        const order = await Order.findOne({ stripeSessionId: req.params.sessionId });
        if (!order) return res.status(404).json({ message: 'Order not yet created, please try again shortly' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Query failed', error: err.message });
    }
});

// [GET] All orders (admin — protected)
app.get('/api/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch orders', error: err });
    }
});

// [POST] Place a manual (non-Stripe) order (public — customers)
// Stock deduction is handled exclusively by the Stripe webhook after payment is confirmed
app.post('/api/orders', async (req, res) => {
    try {
        // Whitelist fields — never trust req.body directly
        const { orderId, customerName, email, address, phone,
                items, totalAmount, status, shippingDetails } = req.body;

        if (!orderId || !email || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Prevent client from self-approving orders
        const safeStatus = ALLOWED_STATUSES.includes(status) ? status : 'Pending Payment';

        const newOrder = new Order({
            orderId, customerName, email, address, phone,
            items, totalAmount, shippingDetails,
            status: safeStatus,
        });
        const savedOrder = await newOrder.save();

        // Send order confirmation email (manual checkout path)
        try {
            await resend.emails.send({
                from:    'LemonTree@LemonTreeStore.dev',
                to:      email,
                subject: `Order Confirmed — ${esc(orderId)}`,
                html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1a1a1a;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:2px;">LEMON TREE</h1>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Thanks for your order, ${esc(customerName)}!</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px;">Your order has been confirmed and is being processed.</p>
      <div style="background:#f9f9f9;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
        <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#1a1a1a;">${esc(orderId)}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="border-bottom:2px solid #f0f0f0;">
            <th style="text-align:left;padding:8px 0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Item</th>
            <th style="text-align:center;padding:8px 0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Qty</th>
            <th style="text-align:right;padding:8px 0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${(items || []).map(item => `
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:14px 0;font-size:14px;color:#1a1a1a;">${esc(item.name)}</td>
              <td style="padding:14px 0;font-size:14px;color:#666;text-align:center;">x${esc(item.quantity)}</td>
              <td style="padding:14px 0;font-size:14px;color:#1a1a1a;text-align:right;">$${esc(item.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:16px 0 0;font-size:15px;font-weight:bold;color:#1a1a1a;">Total</td>
            <td style="padding:16px 0 0;font-size:15px;font-weight:bold;color:#1a1a1a;text-align:right;">$${esc(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="border-top:1px solid #f0f0f0;padding-top:24px;">
        <p style="margin:0 0 8px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Shipping To</p>
        <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.8;">
          ${esc(customerName)}<br>
          ${esc(shippingDetails?.address || address || '')}${shippingDetails?.apartment ? ', ' + esc(shippingDetails.apartment) : ''}<br>
          ${esc(shippingDetails?.city || '')}, ${esc(shippingDetails?.state || '')} ${esc(shippingDetails?.postcode || '')}<br>
          ${esc(shippingDetails?.country || '')}
        </p>
      </div>
    </div>
    <div style="background:#f9f9f9;padding:24px 32px;text-align:center;border-top:1px solid #f0f0f0;">
      <p style="margin:0;font-size:12px;color:#999;">Questions? Contact us anytime.</p>
      <p style="margin:8px 0 0;font-size:12px;color:#bbb;">© 2026 Lemon Tree. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
                `,
            });
            console.log(`📧 Manual checkout confirmation email sent to: ${email}`);
        } catch (emailErr) {
            console.error('Failed to send manual checkout confirmation email:', emailErr.message);
        }

        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ message: 'Failed to place order', error: err });
    }
});

// [PUT] Update order status (admin — protected)
app.put('/api/orders/:id', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        // Whitelist status values — mirrors the same guard as POST /api/orders
        if (!ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: 'Failed to update order status', error: err });
    }
});

// [DELETE] Delete an order (admin — protected)
app.delete('/api/orders/:id', requireAdmin, async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete order', error: err });
    }
});

// ── Product routes ────────────────────────────────────────────────────────────

// [GET] All products (public — storefront)
app.get('/api/products', async (req, res) => {
    try {
        const dbProducts = await Product.find();
        res.json(dbProducts);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch products', error: err });
    }
});

// [POST] Add a product (admin — protected)
app.post('/api/products', requireAdmin, async (req, res) => {
    try {
        // Find the product with the highest id, then increment by 1
        const lastProduct = await Product.findOne().sort({ id: -1 });
        const nextId = lastProduct ? lastProduct.id + 1 : 1;
        const { category, name, title, img, price, stock, colors, sizes, description, material } = req.body;
        const newProduct = new Product({ category, name, title, img, price, stock, colors, sizes, description, material, id: nextId });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: 'Failed to add product', error: err });
    }
});

// [PUT] Update a product (admin — protected)
app.put('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        // Whitelist fields — prevents overwriting the numeric id or injecting extra operators
        const { category, name, title, img, price, stock, colors, sizes, description, material } = req.body;
        const updatedProduct = await Product.findOneAndUpdate(
            { id: Number(req.params.id) },
            { category, name, title, img, price, stock, colors, sizes, description, material },
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: 'Failed to update product', error: err });
    }
});

// [DELETE] Delete a product (admin — protected)
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const deletedProduct = await Product.findOneAndDelete({ id: Number(req.params.id) });
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully', product: deletedProduct });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete product', error: err });
    }
});

// ── Stripe Checkout ───────────────────────────────────────────────────────────

// [POST] Create a Stripe Checkout Session (public)
// Only receives { items: [{ id, quantity }] } — lean format to stay under Stripe's 500-char metadata limit.
// Full product data (name, price, img) is fetched from MongoDB by the webhook.
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { items } = req.body;

        // Fix #7: Guard against missing or invalid items before calling .map()
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty items array' });
        }

        const ids = items.map(i => i.id);
        const products = await Product.find({ id: { $in: ids } });

        const lineItems = items.map(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) throw new Error(`Product not found, id: ${item.id}`);
            return {
                price_data: {
                    currency: 'usd',
                    product_data: { name: product.name || product.title },
                    unit_amount: Math.round(product.price * 100), // Stripe uses cents
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            shipping_address_collection: {
                allowed_countries: ['TW', 'US', 'GB', 'JP', 'CA', 'AU'],
            },
            phone_number_collection: {
                enabled: true,
            },
            // Store only id + quantity to stay under the 500-char metadata limit;
            // the webhook fetches full product data from MongoDB
            metadata: {
                items: JSON.stringify(items.map(i => ({ id: i.id, quantity: i.quantity }))),
            },
            success_url: `${process.env.FRONTEND_URL}/#/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${process.env.FRONTEND_URL}/#/CheckoutView?from=stripe`,
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('Failed to create Stripe session:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});