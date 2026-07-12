# আভরণী (Avaroni) - Secure E-commerce Platform

A modern, secure e-commerce web application featuring administrative controls, banner carousel customization, inventory tracking, secure login with 2-step verification, password recovery, and order confirmation mailing.

## Features
- **Admin Dashboard:** Control product inventory, show/hide items, manage banner slideshows.
- **Secure Authentication:** Built-in password lockout, 2-Factor Authentication (OTP), and dynamic password reset links.
- **MongoDB Atlas Integration:** Persistent cloud database.
- **Responsive Layout:** Designed for a premium customer experience across mobile, tablet, and desktop devices.

## Technology Stack
- **Backend:** Node.js, Express, Mongoose, Nodemailer, Multer
- **Frontend:** Semantic HTML5, Vanilla CSS3, Javascript (ES6)
- **Database:** MongoDB Atlas (Cloud Database)

## Setup & Running Localy
1. **Clone the repository:**
   ```bash
   git clone https://github.com/asifsarkar411/avaroni.git
   cd avaroni
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   PORT=5000
   ```
4. **Start the application:**
   ```bash
   npm start
   ```
