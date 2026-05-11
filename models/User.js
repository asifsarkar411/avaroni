const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true 
    },
    
    // --- SECURITY & 2FA FIELDS ---
    twoFactorCode: { 
        type: String 
    },
    twoFactorExpires: { 
        type: Date 
    },
    failedLoginAttempts: { 
        type: Number, 
        default: 0 
    },
    lockUntil: { 
        type: Date 
    },
    knownIps: { 
        type: [String], 
        default: [] 
    },

    // --- PASSWORD RESET FIELDS ---
    resetPasswordToken: { 
        type: String 
    },
    resetPasswordExpires: { 
        type: Date 
    },
    
    // --- DASHBOARD & ANALYTICS ---
    loginCount: { 
        type: Number, 
        default: 0 
    },
    loginHistory: [{
        time: { type: Date, default: Date.now },
        device: String,
        ip: String
    }]
});

/**Automatically hashes the password before saving to the database.**/
userSchema.pre('save', async function() {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return;

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);