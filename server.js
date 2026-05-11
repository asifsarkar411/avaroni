require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require('nodemailer');
const sanitize = require('mongo-sanitize');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');

// --- MODELS ---
const User = require('./models/User');           // Secure Login User Model
const Order = require('./models/Order');         // E-commerce Order Model
const Product = require('./models/Product');     // E-commerce Product Model
const BannerCard = require('./models/BannerCard'); // E-commerce Slider Model

const app = express();

// ==========================================
// MIDDLEWARE & SECURITY
// ==========================================
app.use(helmet()); // Protection against XSS and malicious headers
app.use(express.json());
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.static(path.join(__dirname, 'public'))); // Serves your HTML/CSS/JS

// ==========================================
// DATABASE CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/glamour_store')
  .then(() => console.log('MongoDB Connected successfully: glamour_store'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// ==========================================
// NODEMAILER SETUP (For 2FA & Password Reset)
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  },
  tls: { rejectUnauthorized: false }
});

// ==========================================
// MULTER CONFIGURATION (Image Uploads)
// ==========================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Allow modern image formats
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/avif", "image/gif"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Allowed formats: .jpg, .png, .jpeg, .webp, .avif, .gif"), false);
        }
    }
});

// ==========================================
// 🔐 AUTHENTICATION ROUTES (Secure Login)
// ==========================================

// 1. REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const username = sanitize(req.body.username);
        const email = sanitize(req.body.email);
        const password = req.body.password; 

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: "Admin User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error during registration" });
    }
});

// 2. LOGIN (Password Check & 2FA Trigger)
app.post('/api/login', async (req, res) => {
    try {
        const email = sanitize(req.body.email);
        const password = req.body.password; 

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Check Lockout
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingSeconds = Math.ceil((user.lockUntil - Date.now()) / 1000);
            return res.status(403).json({ message: `Account locked. Try again in ${remainingSeconds} seconds.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 3) {
                user.lockUntil = Date.now() + 60000; 
                await user.save();
                return res.status(403).json({ message: "Account locked for 1 minute due to too many failed attempts." });
            }
            await user.save();
            return res.status(400).json({ message: `Invalid password. ${3 - user.failedLoginAttempts} attempt(s) remaining.` });
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;

        // Generate 2FA
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorCode = otpCode;
        user.twoFactorExpires = Date.now() + 600000; 
        await user.save();

        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your Admin Verification Code',
            text: `Your admin login code is: ${otpCode}\n\nIt expires in 10 minutes.`
        }, (error) => {
            if (error) return res.status(500).json({ message: "Error sending verification code" });
            res.json({ twoFactorRequired: true, message: "Code sent to email" });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login" });
    }
});

// 3. VERIFY 2FA & ISSUE JWT
app.post('/api/verify-2fa', async (req, res) => {
    try {
        const email = sanitize(req.body.email);
        const code = sanitize(req.body.code);
        
        const user = await User.findOne({ 
            email: email, twoFactorCode: code, twoFactorExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired code" });

        const currentIp = req.ip || req.connection.remoteAddress || 'Unknown IP';
        if (!user.knownIps.includes(currentIp)) {
            user.knownIps.push(currentIp);
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Security Alert: New Admin Login Detected',
                text: `We noticed a successful admin login from a new IP Address: ${currentIp}`
            }, () => {});
        }

        user.twoFactorCode = undefined;
        user.twoFactorExpires = undefined;
        user.loginCount += 1;
        await user.save();

        // Create JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '10d' });
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ message: "Verification server error" });
    }
});

// 4. FORGOT / RESET PASSWORD
app.post('/api/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: sanitize(req.body.email) });
        if (!user) return res.status(404).json({ message: "User not found" });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        const resetLink = `http://localhost:5000/reset-password.html?token=${resetToken}`;
        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Admin Password Reset',
            text: `Click here to reset your admin password: ${resetLink}`
        }, (err) => {
            if (err) return res.status(500).json({ message: "Email delivery failed" });
            res.json({ message: "Reset link sent to email!" });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/reset-password', async (req, res) => {
    try {
        const user = await User.findOne({ resetPasswordToken: sanitize(req.body.token), resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        user.password = req.body.password; 
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Reset error" });
    }
});

// ==========================================
// 🛡️ JWT VERIFICATION MIDDLEWARE (Gatekeeper)
// ==========================================
function verifyAdminToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey', (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: "Unauthorized: Invalid or expired token" });
        req.user = decoded; 
        next(); // Token is valid! Allow the action.
    });
}

// ==========================================
// 🛍️ PUBLIC ROUTES (Customers can access these)
// ==========================================

// Get Products
app.get('/api/products', async (req, res) => {
    try {
        let filter = { isAvailable: true }; 
        if (req.query.category) filter.category = req.query.category;
        const products = await Product.find(filter);
        res.json({ success: true, products });
    } catch (error) { res.status(500).json({ success: false }); }
});

// Place an Order
app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, email, phone, address, transactionId, cartItems, totalAmount } = req.body;
        const newOrder = new Order({ customerName, email, phone, address, transactionId, cartItems, totalAmount });
        await newOrder.save(); 

        for (let item of cartItems) {
            const product = await Product.findById(item.id);
            if (product) {
                product.stockQuantity -= item.quantity;
                if (product.stockQuantity <= 0) product.isAvailable = false; 
                await product.save();
            }
        }
        res.status(201).json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

// Get Banner Cards (For the Homepage Slider)
app.get('/api/banner-cards', async (req, res) => {
    try {
        const cards = await BannerCard.find().sort({ createdAt: 1 });
        res.json({ success: true, cards });
    } catch (error) { res.status(500).json({ success: false }); }
});

// ==========================================
// 🔒 PROTECTED ADMIN ROUTES (Require JWT)
// ==========================================

app.get('/api/user-data', verifyAdminToken, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
});

// Get ALL products (Including hidden)
app.get('/api/admin/products', verifyAdminToken, async (req, res) => {
    try { const products = await Product.find().sort({ _id: -1 }); res.json({ success: true, products }); } 
    catch (error) { res.status(500).json({ success: false }); }
});

// Add Product
app.post('/api/products', verifyAdminToken, upload.single('image'), async (req, res) => {
    try {
        const productData = {
            name: req.body.name, price: req.body.price, category: req.body.category,
            stockQuantity: Number(req.body.stock), imageUrl: `/uploads/${req.file.filename}` 
        };
        const newProduct = new Product(productData);
        await newProduct.save();
        res.status(201).json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

// Delete Product
app.delete('/api/admin/products/:id', verifyAdminToken, async (req, res) => {
    try { await Product.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (error) { res.status(500).json({ success: false }); }
});

// Toggle Product Availability
app.patch('/api/admin/products/:id/toggle', verifyAdminToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        product.isAvailable = !product.isAvailable;
        await product.save();
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

// Get Customer Orders
app.get('/api/admin/orders', verifyAdminToken, async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.json({ success: true, orders });
    } catch (error) { res.status(500).json({ success: false }); }
});

// Admin Manage Banner Cards
app.post('/api/banner-cards', verifyAdminToken, async (req, res) => {
    try {
        const newCard = new BannerCard({ images: [] });
        await newCard.save();
        res.json({ success: true, card: newCard });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.patch('/api/banner-cards/:cardId/heading', verifyAdminToken, async (req, res) => {
    try {
        const card = await BannerCard.findById(req.params.cardId);
        card.heading = req.body.heading;
        await card.save();
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/banner-cards/:cardId', verifyAdminToken, async (req, res) => {
    try { await BannerCard.findByIdAndDelete(req.params.cardId); res.json({ success: true }); } 
    catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/banner-cards/:cardId/images', verifyAdminToken, upload.single('image'), async (req, res) => {
    try {
        const card = await BannerCard.findById(req.params.cardId);
        card.images.push(`/uploads/${req.file.filename}`);
        await card.save();
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/banner-cards/:cardId/images/:imageIndex', verifyAdminToken, async (req, res) => {
    try {
        const card = await BannerCard.findById(req.params.cardId);
        card.images.splice(req.params.imageIndex, 1);
        await card.save();
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`E-commerce Secured Backend running on http://localhost:${PORT}`));