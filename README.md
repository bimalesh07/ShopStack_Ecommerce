# ShopStack Ecommerce 🛍️

**ShopStack** is a multi-vendor e-commerce platform built using Django REST Framework and React. It features a clean, responsive design with a modular backend and is fully containerized for consistent development and deployment.

---

## 🔗 Live Demo
- **Frontend**: [shopstack-frontend.vercel.app](https://shopstack-frontend.vercel.app)
- **Backend API**: [shopstack-ecommerce-1.onrender.com](https://shopstack-ecommerce-1.onrender.com)
- **API Documentation**: [Swagger UI](https://shopstack-ecommerce-1.onrender.com/api/docs/)

---

## Technical Overview
- **Architecture**: Decoupled Monorepo (Django REST + React).
- **Design**: Clean, minimalist UI built with Tailwind CSS.
- **Processing**: Async task handling with Celery/Redis.
- **Payments**: Integrated Razorpay checkout flow.
- **Infrastructure**: Ready for Docker orchestration.

---

## Core Features

### **Customer Experience**
- **UI/UX**: Minimalist design with smooth transitions and responsive layouts.
- **Product Discovery**: Advanced search, category filtering, and slug-based navigation.
- **Dynamic Cart & Wishlist**: Real-time updates with persistent storage.
- **Checkout System**: Integrated Razorpay payment gateway with shipping fee logic.
- **User Reviews**: Detailed review system with dynamic, initial-based colorful avatars.
- **Order Tracking**: Real-time status updates (To Ship, Shipped, Delivered).

### **Vendor Dashboard**
- **Product Management**: Create, update, and track product inventory.
- **Order Fulfillment**: Efficiently manage customer orders and update shipping status.
- **Inventory Control**: Real-time stock level management.

### **System Implementation**
- **Authentication**: Secure JWT-based auth with Google OAuth2 integration.
- **Media Management**: Automated image optimization and storage via **Cloudinary**.
- **Background Tasks**: Asynchronous processing using **Celery** and **Redis**.
- **API Documentation**: Interactive OpenAPI 3.0 documentation via **Swagger UI**.
- **Scalability**: Dockerized services for consistent deployment.

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: Django 4.2+ & Django Rest Framework (DRF)
- **Database**: PostgreSQL (Neon/Supabase)
- **Auth**: SimpleJWT & Social Auth
- **Task Queue**: Celery with Redis (Upstash)
- **Storage**: Cloudinary (Media) & WhiteNoise (Static)
- **Payments**: Razorpay Integration
- **Documentation**: DRF Spectacular (Swagger/Redoc)

### **Frontend**
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Rich Text**: React Quill
- **API Client**: Axios

---

## ⚙️ Installation & Setup

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/ShopStack_Ecommerce.git
cd ShopStack_Ecommerce
```

### **2. Environment Configuration**
You need to set up `.env` files in both directories.

**Backend (`backend/.env`):**
```env
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=postgres://...
REDIS_URL=rediss://...
CELERY_BROKER_URL=rediss://...
CLOUDINARY_CLOUD_NAME=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

### **3. Run with Docker (Recommended)**
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/api/docs/`

### **4. Local Development (Manual)**

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ Deployment

This project is deployed using a hybrid cloud approach:
- **Backend**: Hosted on **Render** (Dockerized).
- **Frontend**: Hosted on **Vercel**.
- **Database**: **Neon** (Serverless PostgreSQL).
- **Cache/Broker**: **Upstash** (Managed Redis).
- **Storage**: **Cloudinary** (Media assets).

### **Production Links**
- **Live Site**: `https://shopstack-frontend.vercel.app`
- **API Endpoint**: `https://shopstack-ecommerce-1.onrender.com/api/`

### **Manual Deployment Setup**
1.  **Backend (Render)**:
    - Environment: `Docker`
    - Build Context: `./backend`
    - Start Command: `./entrypoint.sh python manage.py runserver 0.0.0.0:8000`
2.  **Frontend (Vercel)**:
    - Build Command: `npm run build`
    - Output Directory: `dist`
3.  **Workers (Render Background Worker)**:
    - Start Command: `celery -A config worker --loglevel=info`

---

## ⚙️ Background Tasks (Celery & Redis)

ShopStack uses **Celery** for handling long-running processes asynchronously:
- **Email Notifications**: Sending order confirmations and welcome emails.
- **Inventory Updates**: Processing stock changes in the background.
- **Payment Verification**: Verifying Razorpay webhooks (Planned).

To run the worker locally:
```bash
celery -A config worker --loglevel=info
```

---

## System Configuration
- **JWT Authentication**: Secure stateless authentication.
- **CORS Configuration**: Restricts API access to authorized domains.
- **Cloudinary**: Offloads image processing and hosting for faster page loads.
- **Upstash Redis**: High-performance caching and message brokering.

---

## 📂 Project Structure

```text
ShopStack_Ecommerce/
├── backend/            # Django REST API
│   ├── address/        # User address management
│   ├── cart/           # Shopping cart logic
│   ├── config/         # Project core settings (settings, urls, celery)
│   ├── order/          # Order processing & history
│   ├── payments/       # Razorpay integration
│   ├── products/       # Product catalog & categories
│   ├── reviews/        # Rating & review system
│   ├── users/          # Custom User model & Auth
│   ├── vendors/        # Vendor-specific logic
│   ├── wishlist/       # User favorites
│   ├── entrypoint.sh   # Docker entry point script
│   └── Dockerfile      # Backend containerization
├── frontend/           # React SPA
│   ├── src/
│   │   ├── api/        # Axios service layers
│   │   ├── components/ # Reusable UI components
│   │   ├── features/   # Business logic modules (Cart, Checkout, etc.)
│   │   └── pages/      # View components
│   └── Dockerfile      # Frontend containerization
└── docker-compose.yml  # Orchestration for all services
```

---

## 🤝 Contributing
1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed by [Bimalesh]**
