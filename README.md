<div align="center">
  <img src="frontend/public/logo.svg" alt="PharmaLink Logo" width="80" />
  <h1>PharmaLink</h1>
  <p><strong>Advanced Inventory & Supply Chain Management</strong></p>
  <p>A full-stack web application for pharmaceutical inventory, procurement, quality control, compliance monitoring, and real-time supply chain operations.</p>

  <p>
    <img src="https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=white" />
    <img src="https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" />
    <img src="https://img.shields.io/badge/Socket.IO-v4-010101?logo=socket.io&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/License-MIT-green" />
  </p>
</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Seed Demo Data](#seed-demo-data)
  - [Running the App](#running-the-app)
- [Demo Credentials](#demo-credentials)
- [Modules](#modules)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Author](#author)

---

## Overview

PharmaLink is a production-quality, multi-module pharmaceutical supply chain management platform. It replaces manual spreadsheet-based systems with a single integrated web application that manages the complete product lifecycle — from raw material procurement and batch manufacturing through quality control, warehouse storage, distribution, and regulatory compliance reporting.

Built as a final year B.Tech project by **Aditya Raj** (Enrollment: 2203051050671), Department of Computer Science and Engineering, **Parul Institute of Technology, Parul University** — AY 2025-26.

---

## Features

- **17 Functional Modules** covering every aspect of pharmaceutical supply chain management
- **Role-Based Access Control** — Admin, Distributor, Quality Inspector, Warehouse Manager
- **JWT Authentication** with bcrypt password hashing and TOTP-based **2FA** via Speakeasy
- **Real-Time Messaging & Notifications** powered by Socket.IO
- **Automated Daily Compliance Snapshots** with weighted composite scoring
- **QR Code Generation** (server-side) and **Browser-Based QR Scanning** (no hardware needed)
- **PDF & CSV Report Exports** for inventory, orders, compliance, and audit logs
- **Recharts Dashboards** with bar charts, pie charts, and KPI cards
- **Expiry Intelligence** — proactive batch expiry monitoring with visual timelines
- **Demand Forecasting** — historical order trend analysis
- **Audit Log** — immutable, timestamped record of all system actions
- **Responsive UI** — works on desktop and mobile browsers

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | v19.2.0 | Component-based SPA framework |
| Vite | v7.3.1 | Build tool with fast HMR |
| Tailwind CSS | v4.2.1 | Utility-first styling |
| Radix UI | v1.4.3 | Accessible UI primitives |
| Recharts | v3.7.0 | Interactive data visualizations |
| Axios | v1.13.5 | HTTP client with JWT interceptors |
| React Router DOM | v7.13.0 | Client-side routing |
| Socket.IO Client | v4.8.3 | Real-time WebSocket communication |
| Lucide React | v0.575.0 | SVG icon library |
| GSAP + Motion | v3.14 / v12.34 | UI animations |
| html5-qrcode | v2.3.8 | Browser-based QR scanning |
| React Hot Toast | v2.6.0 | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | v18+ LTS | JavaScript runtime |
| Express.js | v4.21.2 | REST API framework |
| MongoDB + Mongoose | v8.10.0 | Database + ODM |
| Socket.IO | v4.8.3 | Real-time WebSocket server |
| jsonwebtoken | v9.0.3 | JWT authentication |
| bcryptjs | v3.0.3 | Password hashing |
| Speakeasy | v2.0.0 | TOTP 2FA |
| PDFKit | v0.17.2 | PDF report generation |
| json2csv | v6.0.0 | CSV export |
| qrcode | v1.5.4 | Server-side QR generation |
| Nodemailer | v8.0.1 | Email notifications |

---

## Project Structure

```
Inventory-Management/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT + RBAC middleware
│   ├── models/                  # 17 Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Batch.js
│   │   ├── Order.js
│   │   ├── PurchaseOrder.js
│   │   ├── Supplier.js
│   │   ├── RawMaterial.js
│   │   ├── Warehouse.js
│   │   ├── WarehouseStock.js
│   │   ├── QualityCheck.js
│   │   ├── Recall.js
│   │   ├── Return.js
│   │   ├── StorageLog.js
│   │   ├── ComplianceSnapshot.js
│   │   ├── AuditLog.js
│   │   ├── Notification.js
│   │   └── Message.js
│   ├── routes/                  # 20 Express route modules
│   ├── utils/
│   │   └── email.js             # Nodemailer config
│   ├── seed.js                  # Demo data seeder
│   ├── server.js                # Entry point
│   ├── .env                     # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── logo.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # SearchBar, Pagination, NotificationBell, etc.
│   │   │   ├── layout/          # Sidebar, Header, Layout
│   │   │   └── ui/              # Radix UI + shadcn components
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   ├── pages/
│   │   │   ├── admin/           # 20 admin module pages
│   │   │   ├── distributor/     # 6 distributor pages
│   │   │   ├── shared/          # Messages, Profile
│   │   │   └── public/          # Landing page
│   │   ├── api.js               # Axios instance with JWT interceptor
│   │   ├── App.jsx              # Routes + role-based navigation
│   │   └── index.css            # Global styles
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **npm** v9+

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/Inventory-Management.git
cd Inventory-Management
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pharmalink
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000

# Email (optional — for automated notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

> For MongoDB Atlas: create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), get your connection string, and replace the `MONGO_URI` value.

### Seed Demo Data

Populate the database with demo products, batches, users, and orders:

```bash
cd backend
node seed.js
```

This creates:
- 4 user accounts (Admin, Distributor, Quality Inspector, Warehouse Manager)
- 12 raw materials
- 7 pharmaceutical products (tablets, syrups, injections)
- 8 batches with QR codes
- 4 sample orders

### Running the App

**Start the backend server** (from `backend/` folder):
```bash
npm run dev
```
Backend runs at `http://localhost:5000`

**Start the frontend** (from `frontend/` folder):
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@pharmalink.com | Admin@123 |
| **Distributor** | distributor@pharmalink.com | Distributor@123 |
| **Quality Inspector** | inspector@pharmalink.com | Inspector@123 |
| **Warehouse Manager** | warehouse@pharmalink.com | Warehouse@123 |

---

## Modules

| # | Module | Route | Access |
|---|---|---|---|
| 1 | Dashboard & Analytics | `/admin/dashboard` | Admin |
| 2 | Products | `/admin/products` | Admin |
| 3 | Batches | `/admin/batches` | Admin |
| 4 | Raw Materials / Inventory | `/admin/inventory` | Admin |
| 5 | Warehouses | `/admin/warehouses` | Admin |
| 6 | Purchase Orders | `/admin/purchase-orders` | Admin |
| 7 | Suppliers | `/admin/suppliers` | Admin |
| 8 | Orders | `/admin/orders` | Admin |
| 9 | Quality Control | `/admin/quality` | Admin, Quality Inspector |
| 10 | Recalls | `/admin/recalls` | Admin |
| 11 | Returns | `/admin/returns` | Admin |
| 12 | Shipment Tracking | `/admin/shipping` | Admin |
| 13 | Expiry Intelligence | `/admin/expiry` | Admin |
| 14 | Demand Forecasting | `/admin/forecasting` | Admin |
| 15 | Storage Compliance | `/admin/storage` | Admin, Warehouse Manager |
| 16 | Compliance Snapshots | `/admin/compliance` | Admin |
| 17 | Audit Log | `/admin/audit-log` | Admin |
| 18 | User Management | `/admin/users` | Admin |
| 19 | Reports | `/admin/reports` | Admin |
| 20 | Messages | `/app/messages` | All roles |
| 21 | Product Catalog | `/distributor/catalog` | Distributor |
| 22 | Distributor Orders | `/distributor/orders` | Distributor |
| 23 | Batch Scanner / Verify | `/distributor/scanner` | Distributor |

---

## API Endpoints

Base URL: `http://localhost:5000/api`

All routes except `/auth/login` and `/auth/register` require:
```
Authorization: Bearer <jwt_token>
```

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login and receive JWT |
| POST | `/auth/register` | Register new user |
| GET | `/products` | Get all products |
| POST | `/products` | Create product (Admin) |
| GET | `/batches` | Get all batches |
| GET | `/batches/expiring` | Get batches expiring in 30 days |
| GET | `/orders` | Get all orders |
| POST | `/orders` | Place order (Distributor) |
| PUT | `/orders/:id/status` | Update order status (Admin) |
| GET | `/purchase-orders` | Get all purchase orders |
| POST | `/purchase-orders` | Create purchase order |
| GET | `/suppliers` | Get all suppliers |
| POST | `/quality` | Log quality check |
| POST | `/recalls` | Initiate product recall |
| GET | `/compliance` | Get compliance snapshots |
| GET | `/storage` | Get storage logs |
| GET | `/audit` | Get audit log entries |
| GET | `/notifications` | Get user notifications |
| GET | `/messages/:userId` | Get message thread |
| POST | `/messages` | Send message |
| GET | `/reports/inventory` | Generate PDF report |
| GET | `/export/orders` | Export orders as CSV |

---

## Screenshots

> Run the app and navigate to these URLs to take screenshots:

| Figure | Description | URL |
|---|---|---|
| Dashboard | KPI cards + charts | `localhost:5173/admin/dashboard` |
| Products | Product catalog table | `localhost:5173/admin/products` |
| Batches | Batch list + QR modal | `localhost:5173/admin/batches` |
| Messages | Real-time chat interface | `localhost:5173/app/messages` |
| Quality Control | QC test logging | `localhost:5173/admin/quality` |
| Compliance | Compliance snapshots | `localhost:5173/admin/compliance` |

---

## Author

**Aditya Raj**
Enrollment No: 2203051050671
B.Tech. Computer Science and Engineering
Parul Institute of Technology, Parul University
Academic Year: 2025-26

---

<div align="center">
  <p>Built with React.js, Node.js, MongoDB, and Socket.IO</p>
  <p>© 2025-26 Aditya Raj — Parul Institute of Technology</p>
</div>
