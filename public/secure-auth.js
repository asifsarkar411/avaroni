/**
 * TOAST NOTIFICATION SYSTEM
 */
function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    const prefix = type === 'success' ? "🎉 " : "⚠️ ";
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${prefix} ${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4000);
}

/**
 * TOGGLE PASSWORD VISIBILITY
 */
document.querySelectorAll('.fa-eye, #togglePassword, #toggleRegPassword').forEach(eye => {
    eye.addEventListener('click', function () {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});

/**
 * REGISTRATION LOGIC
 */
const registerForm = document.getElementById('registerForm'); // <-- UNCOMMENTED THIS
if (registerForm) { // <-- UNCOMMENTED THIS

    /* // Keeping your password UI logic commented out as you had it
    const regPasswordInput = document.getElementById('reg-password');
    const regReqBox = document.getElementById('reg-password-requirements');

    if (regPasswordInput && regReqBox) {
        regPasswordInput.addEventListener('focus', () => regReqBox.style.display = 'block');
        
        regPasswordInput.addEventListener('input', function() {
            // ... (your password rules logic) ...
        });
    }
    */

    // THIS IS NOW SAFELY INSIDE THE IF STATEMENT
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        
        // Make sure to get the element dynamically here if regPasswordInput is commented out above
        const passwordInput = document.getElementById('reg-password');
        const password = passwordInput ? passwordInput.value : '';

        // Final Validation Check
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[@$!%*?&]/.test(password)) {
            showToast("Please ensure all password requirements are met.", "error");
            return; 
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();

            if (response.ok) {
                showToast("Account created! Redirecting to login...", 'success');
                // Redirect to your specific login page
                setTimeout(() => { window.location.href = 'admin-login.html'; }, 2000);
            } else {
                showToast(data.message || "Registration failed", 'error');
            }
        } catch (error) {
            showToast('Network error during registration.', 'error');
        }
    });

} // <-- UNCOMMENTED THIS ENDING BRACKET
/**
 * LOGIN LOGIC (2-Step Verification)
 */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const otpGroup = document.getElementById('otp-group');
    const otpInput = document.getElementById('otp-code');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // STEP 1: Initial Login Request
        if (!otpGroup || otpGroup.style.display === 'none') {
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (response.ok && data.twoFactorRequired) {
                    showToast(data.message || "Code sent to your email!", 'success');
                    if (otpGroup) otpGroup.style.display = 'block';
                    if (otpInput) {
                        otpInput.required = true;
                        otpInput.focus();
                    }
                } else {
                    showToast(data.message || "Invalid email or password", 'error');
                }
            } catch (error) {
                showToast('Login failed. Check server connection.', 'error');
            }
        } 
        // STEP 2: Verify OTP Code
        else {
            try {
                const response = await fetch('/api/verify-2fa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, code: otpInput.value })
                });
                const data = await response.json();

                if (response.ok && data.token) {
                    showToast("Login successful! Entering Dashboard...", 'success');
                    // Store token as adminToken to match your ecommerce dashboard
                    localStorage.setItem('adminToken', data.token);
                    setTimeout(() => { window.location.href = 'admin.html'; }, 1500);
                } else {
                    showToast(data.message || "Invalid or expired code", 'error');
                }
            } catch (error) {
                showToast('Verification failed.', 'error');
            }
        }
    });
}

/**
 * FORGOT PASSWORD LOGIC
 */
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const btn = forgotForm.querySelector('button');
        
        const originalText = btn.innerText;
        btn.innerText = "Sending...";
        btn.disabled = true;

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (response.ok) {
                showToast(data.message || "Reset link sent to your email!", 'success');
                setTimeout(() => { window.location.href = 'admin-login.html'; }, 3000);
            } else {
                showToast(data.message || "Could not find that email.", 'error');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error');
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

/**
 * RESET PASSWORD LOGIC
 */
const resetPasswordForm = document.getElementById('resetPasswordForm');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('new-password').value;
        const btn = resetPasswordForm.querySelector('button');
        
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            showToast("Invalid or missing reset token.", "error");
            return;
        }

        btn.innerText = "Updating...";
        btn.disabled = true;

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            const data = await response.json();

            if (response.ok) {
                showToast("Password updated successfully! Redirecting...", 'success');
                setTimeout(() => { window.location.href = 'admin-login.html'; }, 2000);
            } else {
                showToast(data.message || "Token expired or invalid.", 'error');
                btn.innerText = "Update Password";
                btn.disabled = false;
            }
        } catch (error) {
            showToast('Network error while resetting password.', 'error');
            btn.innerText = "Update Password";
            btn.disabled = false;
        }
    });
}