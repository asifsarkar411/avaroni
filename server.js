require('dotenv').config();

// Fallback to public DNS to resolve MongoDB SRV records (only needed on local networks with buggy DNS)
if (!process.env.VERCEL && process.env.MONGO_URI && process.env.MONGO_URI.startsWith('mongodb+srv://')) {
  try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    console.warn('DNS server override failed:', e);
  }
}

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const sanitize = require('mongo-sanitize');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// --- MODELS ---
const User = require('./models/User');           // Secure Login User Model
const Order = require('./models/Order');         // E-commerce Order Model
const Product = require('./models/Product');     // E-commerce Product Model
const BannerCard = require('./models/BannerCard'); // E-commerce Slider Model
const Category = require('./models/Category');   // Dynamic Categories Model
const PromoCode = require('./models/PromoCode'); // Promo Codes Model
const NavSlider = require('./models/NavSlider'); // Navbar Promo Slider Model
const ReturnRequest = require('./models/ReturnRequest'); // Return Requests Model
const ContactMessage = require('./models/ContactMessage'); // Contact Messages Model
const Review = require('./models/Review');               // Customer Reviews Model
const FlashSale = require('./models/FlashSale');           // Flash Sale Sticky Countdown Model

// ==========================================
// STARTUP ENVIRONMENT VARIABLE GUARD
// ==========================================
const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    console.error(`CRITICAL: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Set them in your .env file (local) or Vercel Environment Variables (production).');
    console.error('See .env.example for a template.');
}

const app = express();

// ==========================================
// MIDDLEWARE & SECURITY & OPTIMIZATION
// ==========================================
app.use(compression()); // Enable Gzip compression to reduce network payload sizes

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: ["'self'", "https:"],
            frameAncestors: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    xFrameOptions: { action: "sameorigin" },
    xContentTypeOptions: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
})); 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors()); // Allow frontend to communicate with backend

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: function (res, filePath) {
        // Optimize caching headers for static assets
        if (filePath.endsWith('.html')) {
            // HTML files: always re-validate to ensure latest content updates
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        } else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
            // CSS/JS: Cache for 1 hour, re-validate afterwards to maintain fresh styling/scripting
            res.setHeader('Cache-Control', 'public, max-age=3600');
        } else if (/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(filePath)) {
            // Images: Cache long term (7 days) for instant loading
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        }
    }
})); // Serves your HTML/CSS/JS

// ==========================================
// DATABASE CONNECTION (SERVERLESS OPTIMIZED)
// ==========================================
let isConnected = false;

async function connectDB() {
    if (isConnected || mongoose.connection.readyState >= 1) {
        isConnected = true;
        return;
    }

    try {
        const dbOptions = {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        };
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/glamour_store', dbOptions);
        isConnected = true;
        console.log('MongoDB Connected successfully');

        // Only run seeding/migrations on local dev server startup (never block serverless requests)
        if (!process.env.VERCEL) {
            await seedCategories();
            await migrateBase64ToFiles();
        }
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
    }
}

// Global middleware ensuring DB connection for all API routes
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        if (!isConnected && mongoose.connection.readyState < 1) {
            return res.status(503).json({ success: false, message: 'Database connection unavailable. Please try again shortly.' });
        }
        next();
    } catch (err) {
        console.error('DB middleware error:', err);
        return res.status(503).json({ success: false, message: 'Database connection failed.' });
    }
});

// Initial local connection trigger
connectDB();

// Seed Categories Function
async function seedCategories() {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      const initialCats = [
        { name: "women", displayName: "Women Dress", slug: "women", subcategories: ["Saree", "Three Piece", "Kurti"] },
        { name: "ornament", displayName: "Ornament", slug: "ornament", subcategories: ["Necklace", "Ring", "Bracelet"] },
        { name: "kids", displayName: "Kids Zone", slug: "kids", subcategories: ["Toys", "Clothing", "Shoes"] }
      ];
      await Category.insertMany(initialCats);
      console.log('Categories seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding categories:', err);
  }
}

// Helper function to handle image storage:
// Always store Base64 Data URIs directly in MongoDB so images are self-contained
// and render identically across Vercel production, localhost, and mobile without 404s.
function saveBase64Image(base64Str) {
    return base64Str || '';
}

// Convert local disk file paths (/uploads/xxx.jpeg) to Base64 if file exists on disk,
// or fallback to placeholder image if missing on Vercel
function convertDiskFileToBase64(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') return './img/profile_image.jpg';
    if (imagePath.startsWith('data:image/')) return imagePath;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

    const relativePath = imagePath.replace(/^\//, '');
    const localFilePath = path.join(__dirname, 'public', relativePath);

    if (fs.existsSync(localFilePath)) {
        try {
            const fileBuffer = fs.readFileSync(localFilePath);
            const ext = path.extname(localFilePath).toLowerCase().replace('.', '') || 'jpeg';
            const mimeType = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : (ext === 'png' ? 'image/png' : (ext === 'webp' ? 'image/webp' : `image/${ext}`));
            return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
        } catch (e) {
            console.error(`Error reading ${localFilePath}:`, e.message);
        }
    }
    // Fallback if file is missing (e.g. on serverless Vercel filesystem)
    return './img/profile_image.jpg';
}

// Database migration script to clean up disk file paths and convert to self-contained Base64
async function migrateBase64ToFiles() {
    try {
        console.log("Checking database image URLs for Vercel compatibility...");

        // 1. Products
        const allProducts = await Product.find();
        let prodMigratedCount = 0;
        for (const prod of allProducts) {
            if (!prod.imageUrl || typeof prod.imageUrl !== 'string' || !prod.imageUrl.trim()) {
                prod.imageUrl = './img/profile_image.jpg';
                await prod.save();
                prodMigratedCount++;
            } else if (prod.imageUrl.startsWith('/uploads/') || prod.imageUrl.startsWith('uploads/')) {
                prod.imageUrl = convertDiskFileToBase64(prod.imageUrl);
                await prod.save();
                prodMigratedCount++;
            }
        }
        if (prodMigratedCount > 0) {
            console.log(`Normalized image URLs for ${prodMigratedCount} products.`);
        }

        // 2. NavSliders
        const sliders = await NavSlider.find();
        let sliderCount = 0;
        for (const slider of sliders) {
            if (slider.imageUrl && (slider.imageUrl.startsWith('/uploads/') || slider.imageUrl.startsWith('uploads/'))) {
                slider.imageUrl = convertDiskFileToBase64(slider.imageUrl);
                await slider.save();
                sliderCount++;
            }
        }
        if (sliderCount > 0) {
            console.log(`Migrated ${sliderCount} nav slider images.`);
        }

        // 3. BannerCards
        const cards = await BannerCard.find();
        let migratedCardsCount = 0;
        for (const card of cards) {
            if (!card || !Array.isArray(card.images)) continue;
            let updated = false;
            for (let i = 0; i < card.images.length; i++) {
                if (card.images[i] && (card.images[i].startsWith('/uploads/') || card.images[i].startsWith('uploads/'))) {
                    card.images[i] = convertDiskFileToBase64(card.images[i]);
                    updated = true;
                }
            }
            if (updated) {
                card.markModified('images');
                await card.save();
                migratedCardsCount++;
            }
        }
        if (migratedCardsCount > 0) {
            console.log(`Migrated images in ${migratedCardsCount} banner cards.`);
        }

        console.log("Image URL optimization check finished.");
    } catch (err) {
        console.error("Migration execution error:", err);
    }
}


// ==========================================
// NODEMAILER SETUP (For 2FA, Password Reset, & Order Receipts)
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
const uploadDir = process.env.VERCEL ? '/tmp/uploads/' : path.join(__dirname, 'public/uploads');
try { if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true }); } catch(e) { console.warn('Upload dir creation skipped:', e.message); }

app.use('/uploads', express.static(uploadDir));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
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

// Rate limiters to prevent brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,                    // 5 registrations per hour per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many accounts created. Please try again later.' }
});

// 1. REGISTER
app.post('/api/register', registerLimiter, async (req, res) => {
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
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// 2. LOGIN (Password Check & 2FA Trigger)
app.post('/api/login', authLimiter, async (req, res) => {
    try {
        const rawEmail = sanitize(req.body.email || '');
        const password = req.body.password || ''; 

        if (!rawEmail || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const email = rawEmail.trim().toLowerCase();

        // Case-insensitive email search
        const user = await User.findOne({ email: new RegExp(`^${email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') });
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

        // Generate 2FA Code (Valid for 15 minutes)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorCode = otpCode;
        user.twoFactorExpires = new Date(Date.now() + 900000); // 15 minutes
        await user.save();

        console.log(`🔑 [ADMIN OTP CODE FOR ${user.email}]: ${otpCode}`);

        // Send email asynchronously in background if configured, without blocking HTTP response
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Your Admin Verification Code - AVARONI',
                text: `Your admin login verification code is: ${otpCode}\n\nIt is valid for 15 minutes.`
            }, (mailErr) => {
                if (mailErr) {
                    console.warn("⚠️ SMTP Email Warning (code logged to console):", mailErr.message);
                }
            });
        }

        return res.json({ 
            twoFactorRequired: true, 
            code: otpCode,
            message: `Verification Code: ${otpCode} (also sent to ${user.email})`
        });
    } catch (error) {
        console.error("Login Error details:", error);
        res.status(500).json({ message: "Server error during login: " + (error.message || "Unknown error") });
    }
});

// Helper for JWT Secret with secure fallback
function getJwtSecret() {
    return process.env.JWT_SECRET || 'avaroni_secure_jwt_secret_key_987654321_fallback';
}

// 3. VERIFY 2FA & ISSUE JWT
app.post('/api/verify-2fa', async (req, res) => {
    try {
        const rawEmail = sanitize(req.body.email || '');
        const rawCode = sanitize(req.body.code || '').toString();
        // Strip spaces, tabs, dashes so copy-pasted '123 456' or '123-456' works natively
        const cleanCode = rawCode.replace(/[\s-]+/g, '').trim();
        const email = rawEmail.trim().toLowerCase();
        
        if (!email || !cleanCode) {
            return res.status(400).json({ message: "Email and 6-digit verification code are required." });
        }

        const user = await User.findOne({ 
            email: new RegExp(`^${email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')
        });

        if (!user) {
            return res.status(400).json({ message: "User account not found." });
        }

        if (!user.twoFactorCode) {
            return res.status(400).json({ message: "No verification code active. Please log in again to generate a new code." });
        }

        if (user.twoFactorCode.toString().trim() !== cleanCode) {
            return res.status(400).json({ message: "Invalid verification code. Please check the 6-digit code sent to your email." });
        }

        if (user.twoFactorExpires && new Date(user.twoFactorExpires).getTime() < Date.now()) {
            return res.status(400).json({ message: "Verification code has expired. Please log in again to request a new code." });
        }

        const currentIp = req.ip || req.socket.remoteAddress || 'Unknown IP';
        if (!Array.isArray(user.knownIps)) user.knownIps = [];
        if (!user.knownIps.includes(currentIp)) {
            user.knownIps.push(currentIp);
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: 'Security Alert: New Admin Login Detected',
                    text: `We noticed a successful admin login from a new IP Address: ${currentIp}`
                }, () => {});
            }
        }

        user.twoFactorCode = undefined;
        user.twoFactorExpires = undefined;
        user.loginCount = (user.loginCount || 0) + 1;
        await user.save();

        // Create JWT (uses getJwtSecret with fallback)
        const token = jwt.sign({ id: user._id }, getJwtSecret(), { expiresIn: '10d' });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error("2FA Verification Error:", error);
        res.status(500).json({ message: "Server error verifying code" });
    }
});

// 4. FORGOT / RESET PASSWORD
app.post('/api/forgot-password', authLimiter, async (req, res) => {
    try {
        const user = await User.findOne({ email: sanitize(req.body.email) });
        if (!user) return res.status(404).json({ message: "User not found" });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        const resetLink = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;
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
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/reset-password', authLimiter, async (req, res) => {
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
        console.error("Reset Password Error:", error);
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
    jwt.verify(token, getJwtSecret(), (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: "Unauthorized: Invalid or expired token" });
        req.user = decoded; 
        next(); // Token is valid! Allow the action.
    });
}

// ==========================================
// 🛍️ PUBLIC ROUTES (Customers can access these)
// ==========================================

// ==========================================
// 🏷️ CATEGORY ROUTES
// ==========================================

// Get Categories (Public)
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ success: true, categories });
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({ success: false, message: "Failed to load categories" });
    }
});

// Helper function to generate clean URL slug
function generateCategorySlug(str) {
    if (!str) return 'cat-' + Date.now();
    let slug = str.trim().toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\u00C0-\u024F\u0980-\u09FF-]/g, '')
        .replace(/-+/g, '-');
    return slug || ('cat-' + Date.now());
}

// Add Category (Admin)
app.post('/api/admin/categories', verifyAdminToken, async (req, res) => {
    try {
        const { displayName, subcategories } = req.body;
        if (!displayName || !displayName.trim()) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        const cleanDisplayName = displayName.trim();
        const slug = generateCategorySlug(cleanDisplayName);
        const name = slug;

        // Check if category already exists by slug or name
        let category = await Category.findOne({ $or: [{ slug }, { name }] });
        if (category) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        category = new Category({
            name,
            displayName: cleanDisplayName,
            slug,
            subcategories: subcategories || []
        });

        await category.save();
        res.status(201).json({ success: true, category });
    } catch (error) {
        console.error("Add Category Error:", error);
        res.status(500).json({ success: false, message: "Failed to create category" });
    }
});

// Add Subcategory (Admin)
app.post('/api/admin/categories/:id/subcategories', verifyAdminToken, async (req, res) => {
    try {
        const { subcategory } = req.body;
        if (!subcategory || !subcategory.trim()) {
            return res.status(400).json({ success: false, message: "Subcategory name is required" });
        }

        const cleanSub = subcategory.trim();
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        // Add subcategory if it doesn't already exist (case-insensitive check)
        const exists = category.subcategories.some(s => s.toLowerCase() === cleanSub.toLowerCase());
        if (!exists) {
            category.subcategories.push(cleanSub);
            category.markModified('subcategories');
            await category.save();
        }

        res.json({ success: true, category });
    } catch (error) {
        console.error("Add Subcategory Error:", error);
        res.status(500).json({ success: false, message: "Failed to add subcategory" });
    }
});

// Delete Subcategory (Admin)
app.delete('/api/admin/categories/:id/subcategories/:subName', verifyAdminToken, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        const subToDelete = decodeURIComponent(req.params.subName).trim().toLowerCase();
        category.subcategories = category.subcategories.filter(sub => sub.toLowerCase() !== subToDelete);
        category.markModified('subcategories');
        await category.save();

        res.json({ success: true, category });
    } catch (error) {
        console.error("Delete Subcategory Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete subcategory" });
    }
});

// Delete Category (Admin)
app.delete('/api/admin/categories/:id', verifyAdminToken, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete Category Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete category" });
    }
});

// ==========================================
// 🎟️ PROMO CODE ROUTES
// ==========================================

// Validate Promo Code (Public)
app.post('/api/promocodes/validate', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ success: false, message: "Promo code is required" });

        // Case-insensitive match
        const promo = await PromoCode.findOne({ code: { $regex: new RegExp(`^${code}$`, 'i') }, isActive: true });
        if (!promo) {
            return res.status(404).json({ success: false, message: "Invalid or inactive promo code" });
        }

        res.json({
            success: true,
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue
        });
    } catch (error) {
        console.error("Validate Promo Code Error:", error);
        res.status(500).json({ success: false, message: "Validation failed" });
    }
});

// ==========================================
// ⚡ FLASH SALE COUNTDOWN BANNER ROUTES
// ==========================================

// 1. Get Flash Sale Banner Config (Public)
app.get('/api/flash-sale', async (req, res) => {
    try {
        const flashSale = await FlashSale.findOne().sort({ _id: -1 });
        res.json({ success: true, flashSale });
    } catch (error) {
        console.error("Get Flash Sale Error:", error);
        res.status(500).json({ success: false, message: "Failed to load flash sale banner" });
    }
});

// 2. Save / Update Flash Sale Banner Config (Admin)
app.post('/api/admin/flash-sale', verifyAdminToken, async (req, res) => {
    try {
        const { title, subtitle, buttonText, buttonLink, endTime, isActive, bgColor, textColor, accentColor } = req.body;
        
        if (!endTime) {
            return res.status(400).json({ success: false, message: "Countdown End Time is required." });
        }

        let flashSale = await FlashSale.findOne().sort({ _id: -1 });
        if (!flashSale) {
            flashSale = new FlashSale();
        }

        flashSale.title = title ? title.trim() : "⚡ Flash Sale Ends In:";
        flashSale.subtitle = subtitle ? subtitle.trim() : "";
        flashSale.buttonText = buttonText ? buttonText.trim() : "Shop Now";
        flashSale.buttonLink = buttonLink ? buttonLink.trim() : "index.html#products";
        flashSale.endTime = new Date(endTime);
        flashSale.isActive = isActive !== undefined ? Boolean(isActive) : true;
        flashSale.bgColor = bgColor || "#111111";
        flashSale.textColor = textColor || "#ffffff";
        flashSale.accentColor = accentColor || "#e60050";

        await flashSale.save();
        res.json({ success: true, message: "Flash sale countdown banner updated successfully!", flashSale });
    } catch (error) {
        console.error("Update Flash Sale Error:", error);
        res.status(500).json({ success: false, message: "Failed to save flash sale banner config." });
    }
});

// List Promo Codes (Admin)
app.get('/api/admin/promocodes', verifyAdminToken, async (req, res) => {
    try {
        const promos = await PromoCode.find();
        res.json({ success: true, promos });
    } catch (error) {
        console.error("Get Promo Codes Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch promo codes" });
    }
});

// Create Promo Code (Admin)
app.post('/api/admin/promocodes', verifyAdminToken, async (req, res) => {
    try {
        const { code, discountType, discountValue } = req.body;
        if (!code || !discountType || !discountValue) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const upperCode = code.toUpperCase().replace(/\s+/g, '');
        
        let existing = await PromoCode.findOne({ code: upperCode });
        if (existing) {
            return res.status(400).json({ success: false, message: "Promo code already exists" });
        }

        const promo = new PromoCode({
            code: upperCode,
            discountType,
            discountValue: Number(discountValue),
            isActive: true
        });

        await promo.save();
        res.status(201).json({ success: true, promo });
    } catch (error) {
        console.error("Create Promo Code Error:", error);
        res.status(500).json({ success: false, message: "Failed to create promo code" });
    }
});

// Delete Promo Code (Admin)
app.delete('/api/admin/promocodes/:id', verifyAdminToken, async (req, res) => {
    try {
        await PromoCode.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete Promo Code Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete promo code" });
    }
});

// Get Products (supports ?category=, ?search=, no params = all products)
app.get('/api/products', async (req, res) => {
    try {
        let filter = { isAvailable: { $ne: false } }; 
        if (req.query.category) {
            filter.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
        }
        
        // Search by name (case-insensitive partial match)
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        const products = await Product.find(filter).sort({ _id: -1 }); // Newest first
        res.json({ success: true, products });
    } catch (error) { 
        console.error("Get Products Error:", error);
        res.status(500).json({ success: false }); 
    }
});

// Get Single Product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        // Validate MongoDB ObjectId to prevent CastError 500 when invalid IDs are passed
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, message: "Invalid product ID format" });
        }

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        
        // Get related products (same category or subcategory, excluding this one)
        let relatedFilter = { 
            _id: { $ne: product._id }, 
            isAvailable: true,
            $or: [
                { category: product.category },
                { subcategory: product.subcategory && product.subcategory.trim() ? product.subcategory : '__none__' }
            ]
        };
        const relatedProducts = await Product.find(relatedFilter).limit(8).sort({ _id: -1 });
        
        res.json({ success: true, product, relatedProducts });
    } catch (error) { 
        console.error("Get Product By ID Error:", error);
        res.status(500).json({ success: false }); 
    }
});

// Place an Order & Send Email Confirmation
// 🌟 FIX: Server-Side Total Recalculation & Tamper-Proof Order Placement

// Helper to normalize image URLs for order records
function formatImageUrl(url) {
    if (!url || typeof url !== 'string' || !url.trim()) {
        return './img/profile_image.jpg';
    }
    let clean = url.trim().replace(/\\/g, '/');
    if (clean.startsWith('data:image/')) return clean;
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    if (!clean.startsWith('/') && !clean.startsWith('./')) {
        clean = '/' + clean;
    }
    return clean;
}

app.post(['/api/orders', '/api/checkout'], async (req, res) => {
    try {
        const { name, email, phone, address, paymentMethod, trxId, cartItems, promoCode, shippingFee } = req.body;

        if (!name || !phone || !address) {
            return res.status(400).json({ success: false, message: "Name, phone number, and delivery address are required." });
        }

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Your shopping cart is empty." });
        }

        // 1. Recalculate Subtotal from Database Prices (Prevent Price Tampering)
        let serverSubtotal = 0;
        const verifiedCartItems = [];
        const productsToUpdate = [];

        for (let item of cartItems) {
            const productId = item.id || item._id;
            if (!productId) {
                return res.status(400).json({ success: false, message: "Invalid product in cart." });
            }

            const dbProduct = await Product.findById(productId);
            if (!dbProduct) {
                return res.status(400).json({ success: false, message: `Product "${item.name || 'Item'}" no longer exists.` });
            }

            const requestedQty = Math.max(1, parseInt(item.quantity) || 1);
            if (dbProduct.stockQuantity < requestedQty) {
                return res.status(400).json({ success: false, message: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stockQuantity} remaining.` });
            }

            const dbPrice = Number(dbProduct.price) || 0;
            const itemTotal = dbPrice * requestedQty;
            serverSubtotal += itemTotal;

            verifiedCartItems.push({
                id: dbProduct._id,
                name: dbProduct.name,
                price: dbPrice,
                quantity: requestedQty,
                image: formatImageUrl(dbProduct.imageUrl)
            });

            productsToUpdate.push({ dbProduct, requestedQty });
        }

        // 2. Validate & Recalculate Promo Code Discount on Server
        let serverDiscount = 0;
        let appliedPromoCode = '';

        if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
            const cleanCode = promoCode.trim();
            const promo = await PromoCode.findOne({ 
                code: { $regex: new RegExp(`^${cleanCode}$`, 'i') }, 
                isActive: true 
            });

            if (promo) {
                appliedPromoCode = promo.code;
                if (promo.discountType === 'percentage') {
                    serverDiscount = serverSubtotal * (Number(promo.discountValue) / 100);
                } else if (promo.discountType === 'fixed') {
                    serverDiscount = Number(promo.discountValue);
                }
                serverDiscount = Math.min(serverSubtotal, Math.max(0, serverDiscount));
            }
        }

        // 3. Recalculate Shipping Fee on Server
        const requestedShipping = Number(shippingFee);
        const serverShippingFee = (requestedShipping === 80) ? 80 : 150;

        // 4. Calculate Final Server Total
        const serverTotalAmount = Math.max(0, Math.round(serverSubtotal - serverDiscount)) + serverShippingFee;

        // 5. Generate Random Order Number
        const orderNumber = 'ORD-' + Math.floor(10000 + Math.random() * 90000);

        // 6. Save Order with Server-Calculated Totals
        const newOrder = new Order({ 
            orderNumber,
            customerName: name, 
            email: email || '', 
            phone, 
            address, 
            paymentMethod: paymentMethod || 'cod',
            transactionId: trxId || '', 
            cartItems: verifiedCartItems, 
            totalAmount: serverTotalAmount,
            discountAmount: Math.round(serverDiscount),
            promoCode: appliedPromoCode,
            shippingFee: serverShippingFee,
            orderDate: new Date()
        });
        await newOrder.save(); 

        // 7. Deduct Verified Product Inventory Stock
        for (let { dbProduct, requestedQty } of productsToUpdate) {
            dbProduct.stockQuantity -= requestedQty;
            if (dbProduct.stockQuantity <= 0) dbProduct.isAvailable = false; 
            await dbProduct.save();
        }

        // 8. Prepare & Send Confirmation Email
        if (email) {
            try {
                const itemsListHtml = verifiedCartItems.map(item => 
                    `<li style="margin-bottom: 5px;">${item.name} (x${item.quantity}) - ৳${item.price}</li>`
                ).join('');

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email, 
                    subject: `Order Confirmation - ${orderNumber} | আভরণী`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
                            <h2 style="color: #111111; text-align: center;">Thank you for your order, ${name}!</h2>
                            <p style="text-align: center; font-size: 16px;">Your order has been successfully placed and is being processed.</p>
                            
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Order Number:</strong> <span style="font-size: 18px; color: #111111;">${orderNumber}</span></p>
                                <p style="margin: 5px 0 0 0;"><strong>Payment Method:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash'}</p>
                            </div>
                            
                            <h3>Order Details:</h3>
                            <ul style="list-style-type: none; padding-left: 0; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                                ${itemsListHtml}
                            </ul>
                            
                            <h3 style="color: #333;">Total Amount: <span style="color: #111111;">৳${serverTotalAmount}</span></h3>
                            
                            <h4>Shipping Address:</h4>
                            <p style="background-color: #f1f1f1; padding: 10px; border-radius: 4px;">${address}</p>
                            
                            <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #777;">Thanks for shopping with আভরণী!</p>
                        </div>
                    `
                };
                await transporter.sendMail(mailOptions);
            } catch (emailErr) {
                console.warn("Order email notification warning:", emailErr);
            }
        }

        // 9. Return Success Response
        res.status(201).json({ 
            success: true, 
            message: 'Order placed successfully!', 
            orderNumber,
            totalAmount: serverTotalAmount 
        });
    } catch (error) { 
        console.error("Checkout Error:", error);
        res.status(500).json({ success: false, message: "Failed to process order" }); 
    }
});

// Get Banner Cards (For the Homepage Slider)
app.get('/api/banner-cards', async (req, res) => {
    try {
        const cards = await BannerCard.find().sort({ createdAt: 1 });
        res.json({ success: true, cards });
    } catch (error) { 
        console.error("Get Banner Cards Error:", error);
        res.status(500).json({ success: false }); 
    }
});

// ==========================================
// 🌟 CUSTOMER REVIEWS & RATINGS API 🌟
// ==========================================

// Submit a new Customer Review (Public)
app.post('/api/reviews', async (req, res) => {
    try {
        const { productId, productName, reviewerName, rating, comment } = req.body;
        if (!reviewerName || !rating || !comment) {
            return res.status(400).json({ success: false, message: "Please provide name, rating, and comment." });
        }

        const newReview = new Review({
            productId: productId || '',
            productName: productName || 'General Review',
            reviewerName,
            rating: Number(rating),
            comment,
            isPublished: false
        });

        await newReview.save();
        res.status(201).json({ success: true, message: "Thank you! Your review has been submitted for admin approval." });
    } catch (error) {
        console.error("Submit Review Error:", error);
        res.status(500).json({ success: false, message: "Failed to submit review." });
    }
});

// Fetch Published Reviews (For Homepage Slider)
app.get('/api/reviews/published', async (req, res) => {
    try {
        const reviews = await Review.find({ isPublished: true }).sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        console.error("Get Published Reviews Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews." });
    }
});

// Fetch ALL Reviews (Admin Protected)
app.get('/api/admin/reviews', verifyAdminToken, async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        console.error("Get Admin Reviews Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews." });
    }
});

// Toggle Publish Status of Review (Admin Protected)
app.put('/api/admin/reviews/:id/publish', verifyAdminToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found." });

        review.isPublished = req.body.isPublished !== undefined ? req.body.isPublished : !review.isPublished;
        await review.save();

        res.json({ success: true, message: `Review ${review.isPublished ? 'published to homepage!' : 'un-published.'}`, review });
    } catch (error) {
        console.error("Publish Review Error:", error);
        res.status(500).json({ success: false, message: "Failed to update review status." });
    }
});

// Delete Review (Admin Protected)
app.delete('/api/admin/reviews/:id', verifyAdminToken, async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Review deleted successfully." });
    } catch (error) {
        console.error("Delete Review Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete review." });
    }
});

// ==========================================
// 🔒 PROTECTED ADMIN ROUTES (Require JWT)
// ==========================================

app.get('/api/user-data', verifyAdminToken, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
});

// ==========================================
// ⚙️ ADMIN SETTINGS & USER MANAGEMENT ROUTES
// ==========================================

// 1. Change Admin Email
app.put('/api/admin/settings/email', verifyAdminToken, async (req, res) => {
    try {
        const { currentPassword, newEmail } = req.body;
        if (!currentPassword || !newEmail || !newEmail.trim()) {
            return res.status(400).json({ success: false, message: "Current password and new email address are required." });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User account not found." });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password." });
        }

        const cleanEmail = sanitize(newEmail.trim().toLowerCase());
        const existing = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
        if (existing) {
            return res.status(400).json({ success: false, message: "This email address is already in use by another user." });
        }

        user.email = cleanEmail;
        await user.save();
        res.json({ success: true, message: "Email updated successfully!", email: cleanEmail });
    } catch (error) {
        console.error("Change Email Error:", error);
        res.status(500).json({ success: false, message: "Server error changing email." });
    }
});

// 2. Change Admin Password
app.put('/api/admin/settings/password', verifyAdminToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current password and new password are required." });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters long." });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User account not found." });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password." });
        }

        user.password = newPassword; // Automatically hashed by pre('save') hook
        await user.save();
        res.json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ success: false, message: "Server error changing password." });
    }
});

// 3. Get All Admin Users
app.get('/api/admin/users', verifyAdminToken, async (req, res) => {
    try {
        const users = await User.find().select('-password -twoFactorCode').sort({ _id: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch user accounts." });
    }
});

// 4. Create Access for Another User
app.post('/api/admin/users', verifyAdminToken, async (req, res) => {
    try {
        const username = sanitize(req.body.username || '').trim();
        const email = sanitize(req.body.email || '').trim().toLowerCase();
        const password = req.body.password || '';

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Username, email, and password are required." });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "An account with this email already exists." });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ success: true, message: `Access granted for user "${username}" (${email}).` });
    } catch (error) {
        console.error("Create User Error:", error);
        res.status(500).json({ success: false, message: "Failed to create user account." });
    }
});

// 5. Delete Sub-User Access
app.delete('/api/admin/users/:id', verifyAdminToken, async (req, res) => {
    try {
        const targetId = req.params.id;
        if (targetId === req.user.id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot delete your own logged-in account." });
        }

        const totalAdmins = await User.countDocuments();
        if (totalAdmins <= 1) {
            return res.status(400).json({ success: false, message: "Cannot delete the sole remaining administrator account." });
        }

        await User.findByIdAndDelete(targetId);
        res.json({ success: true, message: "User access revoked successfully." });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete user." });
    }
});

// Get ALL products (Including hidden)
app.get('/api/admin/products', verifyAdminToken, async (req, res) => {
    try { 
        const products = await Product.find().sort({ _id: -1 }); 
        res.json({ success: true, products }); 
    } catch (error) { 
        console.error("Get Admin Products Error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to fetch admin products" }); 
    }
});

// Add Product
// Product creation - JSON body with Base64 image
app.post('/api/products', verifyAdminToken, async (req, res) => {
    try {
        // Check Content-Type to decide parsing strategy
        const contentType = req.headers['content-type'] || '';
        
        let imageUrl = "";
        let bodyData = req.body;

        // If multipart, use multer manually
        if (contentType.includes('multipart/form-data')) {
            await new Promise((resolve, reject) => {
                upload.single('image')(req, res, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
            bodyData = req.body;
            if (req.file) {
                const mimeType = req.file.mimetype || 'image/jpeg';
                const fileBuffer = fs.readFileSync(req.file.path);
                imageUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
            }
        } else {
            // JSON body with Base64 image — convert to high-res static file
            imageUrl = saveBase64Image(bodyData.image || "");
        }

        if (!imageUrl) {
            return res.status(400).json({ success: false, message: "Product image is required" });
        }

        const productData = {
            name: bodyData.name, 
            price: Number(bodyData.price), 
            category: bodyData.category,
            subcategory: bodyData.subcategory || "",
            size: bodyData.size || "",
            colour: bodyData.colour || "",
            brand: bodyData.brand || "",
            stockQuantity: Number(bodyData.stock) || 1, 
            imageUrl: imageUrl 
        };
        const newProduct = new Product(productData);
        await newProduct.save();
        res.status(201).json({ success: true });
    } catch (error) { 
        console.error("Add Product Error:", error);
        res.status(500).json({ success: false, message: "Failed to add product" }); 
    }
});

// Delete Product
app.delete('/api/admin/products/:id', verifyAdminToken, async (req, res) => {
    try { 
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found or already deleted" });
        }
        res.json({ success: true, message: "Product deleted successfully!" }); 
    } catch (error) { 
        console.error("Delete Product Error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to delete product" }); 
    }
});

// Edit / Update Product (Admin)
app.put('/api/admin/products/:id', verifyAdminToken, async (req, res) => {
    try {
        const { name, price, category, subcategory, size, colour, brand, stock, image } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (name !== undefined) product.name = name.trim();
        if (price !== undefined) product.price = Number(price);
        if (category !== undefined) product.category = category;
        if (subcategory !== undefined) product.subcategory = subcategory;
        if (size !== undefined) product.size = size.trim();
        if (colour !== undefined) product.colour = colour.trim();
        if (brand !== undefined) product.brand = brand.trim();
        if (stock !== undefined) product.stockQuantity = Number(stock);

        // If a new image was uploaded (Base64 string), save as static high-res file
        if (image && image.trim() !== '' && image !== product.imageUrl) {
            product.imageUrl = saveBase64Image(image);
        }

        await product.save();
        res.json({ success: true, message: "Product updated successfully!", product });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ success: false, message: "Failed to update product" });
    }
});

// Toggle Product Availability
app.patch('/api/admin/products/:id/toggle', verifyAdminToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        product.isAvailable = !product.isAvailable;
        await product.save();
        res.json({ success: true });
    } catch (error) { 
        console.error("Toggle Product Error:", error);
        res.status(500).json({ success: false }); 
    }
});

// Get Admin Dashboard Stats
app.get('/api/admin/dashboard-stats', verifyAdminToken, async (req, res) => {
    try {
        const ordersCount = await Order.countDocuments();
        const productsCount = await Product.countDocuments();
        const bannersCount = await BannerCard.countDocuments();
        const slidersCount = await NavSlider.countDocuments();
        const returnsCount = await ReturnRequest.countDocuments();
        const messagesCount = await ContactMessage.countDocuments({ status: 'unread' });

        const revenueData = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        res.json({
            success: true,
            stats: {
                ordersCount,
                productsCount,
                bannersCount,
                slidersCount,
                returnsCount,
                messagesCount,
                totalRevenue
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Failed to load statistics" });
    }
});

// Get Admin Analytics & Graphs Data
app.get('/api/admin/analytics', verifyAdminToken, async (req, res) => {
    try {
        const orders = await Order.find();
        
        // 1. Order Overview Status Breakdown
        const orderStatusCounts = {
            Pending: 0,
            Processing: 0,
            Approved: 0,
            Cancelled: 0
        };

        orders.forEach(o => {
            const rawStatus = (o.status || 'Pending').toLowerCase();
            if (rawStatus.includes('process')) {
                orderStatusCounts.Processing++;
            } else if (rawStatus.includes('approve') || rawStatus.includes('deliver') || rawStatus.includes('complet')) {
                orderStatusCounts.Approved++;
            } else if (rawStatus.includes('cancel') || rawStatus.includes('reject')) {
                orderStatusCounts.Cancelled++;
            } else {
                orderStatusCounts.Pending++;
            }
        });

        // 2. Monthly Sales Trend (Last 6 Months)
        const monthlySalesMap = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
            monthlySalesMap[key] = 0;
        }

        orders.forEach(o => {
            if (o.status !== 'Cancelled' && o.createdAt) {
                const d = new Date(o.createdAt);
                const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
                if (monthlySalesMap[key] !== undefined) {
                    monthlySalesMap[key] += (o.totalAmount || 0);
                }
            }
        });

        // 3. Monthly Payment Record (Breakdown by Payment Method)
        const paymentMap = {
            'Cash on Delivery': 0,
            'bKash': 0,
            'Nagad': 0,
            'Rocket': 0,
            'Bank Transfer': 0
        };

        orders.forEach(o => {
            const method = o.paymentMethod || 'Cash on Delivery';
            if (paymentMap[method] !== undefined) {
                paymentMap[method] += (o.totalAmount || 0);
            } else {
                paymentMap['Cash on Delivery'] += (o.totalAmount || 0);
            }
        });

        // 4. Top Selling Products
        const productSalesMap = {};
        orders.forEach(o => {
            if (o.status !== 'Cancelled' && Array.isArray(o.items)) {
                o.items.forEach(item => {
                    const pName = item.name || 'Product';
                    const qty = Number(item.quantity) || 1;
                    productSalesMap[pName] = (productSalesMap[pName] || 0) + qty;
                });
            }
        });

        const topProducts = Object.keys(productSalesMap)
            .map(name => ({ name, quantity: productSalesMap[name] }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        res.json({
            success: true,
            analytics: {
                orderOverview: orderStatusCounts,
                monthlySalesTrend: {
                    labels: Object.keys(monthlySalesMap),
                    data: Object.values(monthlySalesMap)
                },
                paymentRecord: {
                    labels: Object.keys(paymentMap),
                    data: Object.values(paymentMap)
                },
                topSellingProducts: {
                    labels: topProducts.map(p => p.name),
                    data: topProducts.map(p => p.quantity)
                }
            }
        });
    } catch (error) {
        console.error("Analytics Endpoint Error:", error);
        res.status(500).json({ success: false, message: "Failed to load analytics" });
    }
});

// Get Customer Orders
app.get('/api/admin/orders', verifyAdminToken, async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.json({ success: true, orders });
    } catch (error) { 
        console.error("Get Orders Error:", error);
        res.status(500).json({ success: false }); 
    }
});

// Update Order Status (Approve or Cancel) & Send Automated Email to Customer
app.all('/api/admin/orders/:id/status', verifyAdminToken, async (req, res) => {
    if (req.method !== 'PUT' && req.method !== 'POST') {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }
    try {
        const { status } = req.body;
        if (!['Approved', 'Processing', 'Cancelled', 'Pending'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value." });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        order.status = status;
        await order.save();

        // Send Email Notification to Customer on Approve or Cancel
        if (status === 'Approved' || status === 'Cancelled') {
            const isApproved = status === 'Approved';
            const emailSubject = isApproved 
                ? `Order Approved - ${order.orderNumber} | আভরণী` 
                : `Order Cancelled - ${order.orderNumber} | আভরণী`;

            const itemsListHtml = (order.cartItems || []).map(item => 
                `<li style="margin-bottom: 5px;">${item.name} (x${item.quantity}) - ৳${item.price}</li>`
            ).join('');

            const emailBody = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: ${isApproved ? '#28a745' : '#dc3545'}; text-align: center;">
                        ${isApproved ? '🎉 Order Approved!' : '❌ Order Cancelled'}
                    </h2>
                    <p style="font-size: 15px;">Dear <strong>${order.customerName}</strong>,</p>
                    <p style="font-size: 14px; line-height: 1.6;">
                        ${isApproved 
                            ? `We are happy to inform you that your order <strong>${order.orderNumber}</strong> has been <strong>APPROVED</strong> and is currently being processed for dispatch!`
                            : `We regret to inform you that your order <strong>${order.orderNumber}</strong> has been <strong>CANCELLED</strong>. If you have questions or believe this is an error, please contact customer support.`
                        }
                    </p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 5px solid ${isApproved ? '#28a745' : '#dc3545'};">
                        <p style="margin: 0;"><strong>Order Number:</strong> <span style="color: #e60050; font-weight: bold;">${order.orderNumber}</span></p>
                        <p style="margin: 5px 0 0 0;"><strong>Status:</strong> <span style="color: ${isApproved ? '#28a745' : '#dc3545'}; font-weight: bold; text-transform: uppercase;">${status}</span></p>
                        <p style="margin: 5px 0 0 0;"><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash'}</p>
                    </div>

                    <h3>Order Details:</h3>
                    <ul style="list-style-type: none; padding-left: 0; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                        ${itemsListHtml}
                    </ul>

                    <h3 style="color: #333;">Total Amount: <span style="color: #e60050;">৳${order.totalAmount}</span></h3>

                    <h4>Shipping Address:</h4>
                    <p style="background-color: #f1f1f1; padding: 10px; border-radius: 4px;">${order.address}</p>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0 15px 0;">
                    <p style="text-align: center; color: #888; font-size: 13px;">Thank you for shopping with <strong>আভরণী</strong>.</p>
                </div>
            `;

            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: order.email,
                    subject: emailSubject,
                    html: emailBody
                });
                console.log(`Order status (${status}) email sent successfully to ${order.email}`);
            } catch (mailErr) {
                console.error("Failed to send order status update email:", mailErr);
            }
        }

        res.json({ 
            success: true, 
            message: `Order status updated to "${status}" and email sent to customer!`,
            order 
        });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({ success: false, message: "Failed to update order status." });
    }
});

// Track Order API (Public - Search by orderNumber or MongoDB _id)
app.get('/api/orders/track/:orderId', async (req, res) => {
    try {
        const queryStr = (req.params.orderId || '').trim();
        if (!queryStr) {
            return res.status(400).json({ success: false, message: "Order ID is required." });
        }

        // Try exact match or regex match on orderNumber
        let order = await Order.findOne({ 
            orderNumber: new RegExp(`^${queryStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') 
        });

        // Fallback: search by Mongo ObjectId
        if (!order && mongoose.Types.ObjectId.isValid(queryStr)) {
            order = await Order.findById(queryStr);
        }

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found. Please check your Order ID and try again." });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error("Track Order Error:", error);
        res.status(500).json({ success: false, message: "Server error tracking order." });
    }
});

// Get Order by Order Number (for invoice generation)
app.get('/api/orders/:orderNumber', async (req, res) => {
    try {
        const queryStr = (req.params.orderNumber || '').trim();
        let order = await Order.findOne({ 
            orderNumber: new RegExp(`^${queryStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') 
        });
        if (!order && mongoose.Types.ObjectId.isValid(queryStr)) {
            order = await Order.findById(queryStr);
        }
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.json({ success: true, order });
    } catch (error) {
        console.error("Get Order Error:", error);
        res.status(500).json({ success: false });
    }
});

// Admin Manage Banner Cards
app.post('/api/banner-cards', verifyAdminToken, async (req, res) => {
    try {
        const newCard = new BannerCard({ images: [] });
        await newCard.save();
        res.json({ success: true, card: newCard });
    } catch (error) { 
        console.error("Create Banner Card Error:", error);
        res.status(500).json({ success: false }); 
    }
});

app.patch('/api/banner-cards/:cardId/heading', verifyAdminToken, async (req, res) => {
    try {
        const card = await BannerCard.findById(req.params.cardId);
        if (!card) return res.status(404).json({ success: false, message: "Card not found" });

        card.heading = req.body.heading;
        await card.save();
        res.json({ success: true });
    } catch (error) { 
        console.error("Update Banner Heading Error:", error);
        res.status(500).json({ success: false }); 
    }
});

app.delete('/api/banner-cards/:cardId', verifyAdminToken, async (req, res) => {
    try { 
        await BannerCard.findByIdAndDelete(req.params.cardId); 
        res.json({ success: true }); 
    } catch (error) { 
        console.error("Delete Banner Card Error:", error);
        res.status(500).json({ success: false }); 
    }
});

app.post('/api/banner-cards/:cardId/images', verifyAdminToken, upload.single('image'), async (req, res) => {
    try {
        let imageUrl = "";
        
        // Support both Base64 JSON and Multer file upload
        if (req.body.image) {
            imageUrl = saveBase64Image(req.body.image);
        } else if (req.file) {
            const mimeType = req.file.mimetype || 'image/jpeg';
            const fileBuffer = fs.readFileSync(req.file.path);
            imageUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
        } else {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        const card = await BannerCard.findById(req.params.cardId);
        if (!card) return res.status(404).json({ success: false, message: "Card not found" });

        card.images.push(imageUrl);
        await card.save();
        res.json({ success: true });
    } catch (error) { 
        console.error("Upload Banner Image Error:", error);
        res.status(500).json({ success: false, message: "Failed to upload image" }); 
    }
});

app.delete('/api/banner-cards/:cardId/images/:imageIndex', verifyAdminToken, async (req, res) => {
    try {
        const card = await BannerCard.findById(req.params.cardId);
        if (!card) return res.status(404).json({ success: false, message: "Card not found" });

        card.images.splice(req.params.imageIndex, 1);
        await card.save();
        res.json({ success: true });
    } catch (error) { 
        console.error("Delete Banner Image Error:", error);
        res.status(500).json({ success: false }); 
    }
});
// ==========================================
// 🎯 NAVBAR PROMO SLIDER ROUTES
// ==========================================

// Get all nav slider images (Public)
app.get('/api/nav-sliders', async (req, res) => {
    try {
        const sliders = await NavSlider.find().sort({ order: 1, createdAt: -1 });
        res.json({ success: true, sliders });
    } catch (error) {
        console.error("Get Nav Sliders Error:", error);
        res.status(500).json({ success: false });
    }
});

// Add a nav slider image (Admin)
app.post('/api/nav-sliders', verifyAdminToken, async (req, res) => {
    try {
        const { imageData, link, order } = req.body;
        if (!imageData) return res.status(400).json({ success: false, message: "Image is required" });

        const newSlider = new NavSlider({
            imageUrl: saveBase64Image(imageData),
            link: link || '',
            order: order || 0
        });
        await newSlider.save();
        res.json({ success: true, slider: newSlider });
    } catch (error) {
        console.error("Add Nav Slider Error:", error);
        res.status(500).json({ success: false });
    }
});

// Delete a nav slider image (Admin)
app.delete('/api/nav-sliders/:id', verifyAdminToken, async (req, res) => {
    try {
        await NavSlider.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete Nav Slider Error:", error);
        res.status(500).json({ success: false });
    }
});

// ==========================================
// ↩️ PRODUCT RETURN REQUESTS ROUTES
// ==========================================

// Submit a Return Request (Public)
app.post('/api/returns', async (req, res) => {
    try {
        const { orderId, email, reason, details } = req.body;
        if (!orderId || !email || !reason) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        // Validate that order exists and matches email
        const order = await Order.findOne({ orderNumber: orderId.trim() });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order ID not found." });
        }

        if (order.email.toLowerCase() !== email.trim().toLowerCase()) {
            return res.status(400).json({ success: false, message: "Email does not match the record for this order ID." });
        }

        // Check if a request already exists for this order
        const existingRequest = await ReturnRequest.findOne({ orderNumber: orderId.trim() });
        if (existingRequest) {
            return res.status(400).json({ success: false, message: "A return request has already been submitted for this order ID." });
        }

        const newRequest = new ReturnRequest({
            orderNumber: orderId.trim(),
            email: email.trim().toLowerCase(),
            reason,
            details: details || ''
        });
        await newRequest.save();

        res.json({ success: true, message: "Return request submitted successfully." });
    } catch (error) {
        console.error("Submit Return Request Error:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});

// Get all Return Requests (Admin)
app.get('/api/admin/returns', verifyAdminToken, async (req, res) => {
    try {
        const returns = await ReturnRequest.find().sort({ createdAt: -1 });
        res.json({ success: true, returns });
    } catch (error) {
        console.error("Get Return Requests Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// Approve or Reject a Return Request (Admin)
app.patch('/api/admin/returns/:id/status', verifyAdminToken, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status update." });
        }

        const request = await ReturnRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Return request not found." });
        }

        request.status = status;
        await request.save();

        // Retrieve customer order details for customer name
        const order = await Order.findOne({ orderNumber: request.orderNumber });
        const customerName = order ? order.customerName : 'Customer';

        // Send Email notification to Customer
        const isApproved = status === 'approved';
        const emailSubject = isApproved 
            ? `Your Return Request has been Approved | আভরণী`
            : `Update on Your Return Request | আভরণী`;
            
        const emailBody = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: ${isApproved ? '#28a745' : '#dc3545'}; text-align: center;">
                    Return Request ${isApproved ? 'Approved' : 'Rejected'}
                </h2>
                <p>Dear ${customerName},</p>
                <p>We are writing to update you on your return request for Order ID: <strong>${request.orderNumber}</strong>.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid ${isApproved ? '#28a745' : '#dc3545'};">
                    <p style="margin: 0;"><strong>Status:</strong> <span style="font-size: 16px; color: ${isApproved ? '#28a745' : '#dc3545'}; text-transform: uppercase; font-weight: bold;">${status}</span></p>
                    <p style="margin: 5px 0 0 0;"><strong>Reason for Return:</strong> ${request.reason}</p>
                </div>

                ${isApproved 
                    ? `<p>Our support team will contact you shortly via phone or email to coordinate the product pickup or drop-off process and complete your refund/exchange.</p>`
                    : `<p>Unfortunately, your return request could not be approved at this time. If you have questions or believe this is in error, please reply to this email or contact customer service.</p>`
                }

                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="text-align: center; color: #888; font-size: 12px;">Thank you for choosing আভরণী.</p>
            </div>
        `;

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: request.email,
                subject: emailSubject,
                html: emailBody
            });
            console.log(`Return request status email sent successfully to ${request.email}`);
        } catch (mailErr) {
            console.error("Failed to send return status email:", mailErr);
        }

        res.json({ success: true, message: `Return request ${status} successfully.` });
    } catch (error) {
        console.error("Update Return Request Status Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// ==========================================
// 📬 CUSTOMER CONTACT MESSAGES ROUTES
// ==========================================

// Submit a Contact Message (Public)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const newMessage = new ContactMessage({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim()
        });
        await newMessage.save();

        res.json({ success: true, message: "Message sent successfully." });
    } catch (error) {
        console.error("Submit Contact Message Error:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});

// Get all Contact Messages (Admin)
app.get('/api/admin/messages', verifyAdminToken, async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (error) {
        console.error("Get Contact Messages Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// Mark Contact Message as Read (Admin)
app.patch('/api/admin/messages/:id/read', verifyAdminToken, async (req, res) => {
    try {
        const message = await ContactMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found." });
        }

        message.status = 'read';
        await message.save();

        res.json({ success: true, message: "Message marked as read." });
    } catch (error) {
        console.error("Mark Message Read Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// Delete a Contact Message (Admin)
app.delete('/api/admin/messages/:id', verifyAdminToken, async (req, res) => {
    try {
        const result = await ContactMessage.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: "Message not found." });
        }
        res.json({ success: true, message: "Message deleted successfully." });
    } catch (error) {
        console.error("Delete Message Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// ==========================================
// START SERVER
// ==========================================
// Only listen locally — Vercel handles this automatically in serverless mode
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`E-commerce Secured Backend running on http://localhost:${PORT}`));
}

// Export for Vercel serverless deployment
module.exports = app;