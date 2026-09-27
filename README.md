# WRON_WAVE CLOTHING - E-Commerce Website

Official full-stack e-commerce web application for **WRON_WAVE CLOTHING** (`@wron_wave`), featuring dark streetwear aesthetics, collection filtering, cart management, instant WhatsApp checkout, and an admin management portal.

---

## ⚡ Quick Start (Running Locally)

The project consists of a React frontend and an Express backend.

### 1. Start the Backend API (Port 5000)
```bash
cd server
npm install
npm start
```
*API will run at: `http://localhost:5000`*

### 2. Start the Frontend Storefront (Port 5173)
```bash
cd client
npm install
npm run dev
```
*Storefront will run at: `http://localhost:5173`*

---

## 🚀 How to Deploy 100% FREE (Zero Cost)

You can host this website completely free of cost with high performance and free SSL:

### Option 1: Deploy on Vercel (Recommended, Free Forever)
1. Initialize git and push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "WRON_WAVE Storefront launch"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **"Add New Project"** and import your repository.
4. Framework preset: **Vite** (Root Directory: `./client` or use the included `vercel.json`).
5. Click **"Deploy"**.
6. Within 60 seconds, your site will be live at `https://your-brand.vercel.app`!

### Option 2: Deploy Frontend on Netlify + Backend on Render
- **Netlify**: Drag and drop the `client/dist` folder into [Netlify Drop](https://app.netlify.com/drop) for instant free hosting.
- **Render**: Connect your GitHub repo to [Render.com](https://render.com) and deploy the `server/` folder as a Free Web Service.

---

## 🛍️ Features & Collections

- **Streetwear Aesthetic**: High-contrast dark theme (black/zinc/white) matching the WRON_WAVE brand poster.
- **5 Brand Collections**:
  1. Unique Collection of Printed T-Shirts
  2. Overseas T-Shirts
  3. Vintage Classic Formal Shirts
  4. Baggy Jeans with 90s Style
  5. Trendy Gen-Z Styles & Youth Outfits
- **Seamless Checkout & Automated Order Alerts**:
  - **Automated WhatsApp Order Alerts**: Customer orders trigger instant background notifications to the admin via CallMeBot backend API (admin number is kept private and never exposed to customers).
  - **Web Checkout**: Standard checkout supporting Cash on Delivery (COD) and UPI QR payment.
- **First 10 Customers 50% OFF**: Automatic promotional discount with coupon code `WAVE50`.
- **Admin Control Panel**: Toggle the **Admin** button in the top navigation bar to view real-time incoming orders, customer phone numbers, addresses, and add new products to the catalog.
- **Offline Resilient**: Pre-seeded with catalog fallback, so the website works smoothly even before starting the backend.

