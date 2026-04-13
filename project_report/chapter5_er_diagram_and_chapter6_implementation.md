# 5. SYSTEM DESIGN (Continued)

---

## ENTITY – RELATIONSHIP DIAGRAM

The Entity-Relationship (ER) Diagram for PharmaLink illustrates the key entities in the MongoDB database and the relationships between them. Since PharmaLink uses MongoDB (a document-oriented NoSQL database), relationships are represented through ObjectId references rather than traditional foreign keys, but the logical entity relationships remain consistent with relational ER modeling.

**Key Entities and Relationships:**

**User** (PK: _id)
- Fields: name, email, password (hashed), role, companyName, gstNumber, isActive, twoFactorSecret, twoFactorEnabled, createdAt
- Relationships:
  - One User (Admin) **manages** many Products, Batches, Orders, PurchaseOrders
  - One User (Distributor) **places** many Orders
  - One User **receives** many Notifications
  - One User **sends/receives** many Messages
  - One User **generates** many AuditLog entries

**Product** (PK: _id)
- Fields: name, type, pricePerUnit, sku, description, formula[], storageConditions, qcTests[], materialCosts[]
- Relationships:
  - One Product **has** many Batches
  - One Product **references** many RawMaterials (via formula array)
  - One Product **appears in** many Order line items

**Batch** (PK: _id | FK: productId → Product)
- Fields: batchId, productId, quantityProduced, mfgDate, expDate, status, qrCodeData, hashChain[]
- Relationships:
  - One Batch **belongs to** one Product
  - One Batch **has** many QualityChecks
  - One Batch **may trigger** one Recall
  - One Batch **is stored in** many WarehouseStock entries

**Order** (PK: _id | FK: distributorId → User)
- Fields: distributorId, items[], totalAmount, status, invoiceNumber, tracking[], orderDate
- Relationships:
  - One Order **is placed by** one Distributor (User)
  - One Order **contains** many Products (via items array)
  - One Order **generates** AuditLog entries on status change

**PurchaseOrder** (PK: _id | FK: supplierId → Supplier, approvedBy → User)
- Fields: poNumber, supplierId, items[], totalAmount, status, approvedBy, approvedAt, notes, createdAt
- Relationships:
  - One PurchaseOrder **is raised for** one Supplier
  - One PurchaseOrder **is approved by** one User (Admin)
  - One PurchaseOrder **contains** many RawMaterial line items

**Supplier** (PK: _id)
- Fields: name, contactPerson, email, phone, address, gstNumber, materials[], rating, autoRating, status, createdAt
- Relationships:
  - One Supplier **supplies** many RawMaterials
  - One Supplier **is referenced by** many PurchaseOrders

**QualityCheck** (PK: _id | FK: batchId → Batch)
- Fields: batchId, inspector, testDate, tests[], overallStatus, notes, createdAt
- Relationships:
  - One QualityCheck **is performed on** one Batch
  - One QualityCheck (failed) **may initiate** one Recall

**Warehouse** (PK: _id | FK: managerId → User)
- Fields: name, location, capacity, managerId, isActive, createdAt
- Relationships:
  - One Warehouse **is managed by** one User
  - One Warehouse **holds** many WarehouseStock entries

**WarehouseStock** (PK: _id | FK: warehouseId → Warehouse, materialId → RawMaterial)
- Fields: warehouseId, materialId, quantity, lastUpdated
- Compound unique index on (warehouseId, materialId)
- Relationships:
  - One WarehouseStock entry **belongs to** one Warehouse
  - One WarehouseStock entry **tracks** one RawMaterial

**AuditLog** (PK: _id | FK: userId → User)
- Fields: userId, userName, action, entity, entityId, details, timestamp
- Relationships:
  - One AuditLog entry **is created by** one User
  - One AuditLog entry **references** one entity (Product/Batch/Order/etc.)

**Notification** (PK: _id | FK: userId → User)
- Fields: userId, type, title, message, read, link, createdAt
- Relationships:
  - One Notification **is delivered to** one User
  - Notifications are triggered by system events across all modules

*Figure 7.0 — PharmaLink Entity-Relationship Diagram*

---

# 6. IMPLEMENTATION

---

## 6.1 IMPLEMENTATION PLATFORM

PharmaLink — Advanced Inventory & Supply Chain Management was implemented as a full-stack web application using a modern JavaScript-based technology stack, ensuring efficient API processing, real-time communication, persistent data storage, and a responsive user interface. The following components constitute the complete implementation platform:

---

**Hardware Infrastructure:**

The system was developed and tested on a local development machine with the following specifications:

- **Processor:** Intel Core i5/i7 or AMD Ryzen 5/7 (or equivalent) — sufficient for running the Node.js backend server, MongoDB instance, and React development server concurrently
- **RAM:** Minimum 8GB (16GB recommended) — to comfortably run the full development stack including VS Code, Node.js, MongoDB, and browser-based testing simultaneously
- **Storage:** SSD storage (minimum 256GB) — ensures fast read/write speeds for MongoDB data files, node_modules, and Vite build artifacts
- **Network:** Stable broadband internet connection — required for MongoDB Atlas cloud connectivity, npm package management, and real-time Socket.IO testing

---

**Software Environment:**

- **Operating System:** macOS / Windows 10/11 / Ubuntu (Node.js and MongoDB are cross-platform compatible)
- **Runtime:** Node.js v18+ (LTS) — JavaScript runtime for the backend server
- **Package Manager:** npm — for managing both frontend and backend dependencies

---

**Development Environment:**

- **IDE:** Visual Studio Code — with ESLint, Prettier, and MongoDB extensions for an integrated development experience
- **API Testing:** Postman — for testing and validating all REST API endpoints during development
- **Version Control:** Git / GitHub — for source control, feature branching, and commit history management
- **Database GUI:** MongoDB Compass — for visual inspection and querying of MongoDB collections during development

---

**Deployment Environment:**

- **Backend Server:** Node.js + Express.js application, deployable on Render / Railway / DigitalOcean / AWS EC2
- **Frontend:** React.js SPA built with Vite, served as static files via any CDN or web server (Netlify, Vercel, or same server as backend)
- **Database:** MongoDB Atlas (cloud-hosted MongoDB) — provides managed database infrastructure with automatic backups, scaling, and monitoring
- **Real-Time:** Socket.IO server co-hosted with the Express.js backend on the same Node.js process

---

## 6.2 PROCESS / PROGRAM / TECHNOLOGY / MODULES

This section details the processes, programs, technologies, and modules implemented in PharmaLink:

---

**Processes:**

The project follows a full-stack web application development lifecycle, including:

- **Requirements & Schema Design:** Defining MongoDB schemas for all 17 entities, establishing API endpoint contracts, and designing the React component hierarchy before writing any implementation code.
- **Backend API Development:** Implementing RESTful API routes for all modules using Express.js, with JWT authentication middleware, role-based access control, and Mongoose-based database operations.
- **Frontend UI Development:** Building React page components for all 17 modules with Tailwind CSS styling, Radix UI components, and Recharts visualizations — consuming the backend REST API via Axios.
- **Real-Time Integration:** Implementing Socket.IO event emission on the backend for critical events (new orders, stock alerts, messages) and Socket.IO client subscriptions on the frontend for live UI updates.
- **Compliance Automation:** Implementing the automated daily compliance snapshot scheduler using `setInterval` in `server.js`, which calculates composite compliance scores across testing rate, expiry score, storage score, recall score, and order fulfillment rate.
- **Testing & Refinement:** End-to-end testing of all API endpoints via Postman, UI responsiveness testing across breakpoints, and real-time feature validation under concurrent user scenarios.

---

**Programs:**

- **Frontend:** Implemented using React.js v19 with Vite as the build tool. The SPA provides role-specific dashboards, 17 functional module pages, real-time notification bell, Socket.IO-powered messaging, and interactive Recharts visualizations — all consuming the backend REST API via Axios with JWT token injection via request interceptors.

- **Backend:** Implemented using Node.js and Express.js. The server (`server.js`) initializes the Express application, establishes MongoDB connection via Mongoose, sets up the Socket.IO server with user registration and room-based event delivery, registers 20 API route modules, and runs the automated daily compliance snapshot scheduler.

- **Authentication Middleware:** The `auth.js` middleware module provides four middleware functions — `auth` (JWT verification), `adminOnly` (admin role enforcement), `qualityAccess` (admin + quality_inspector), and `warehouseAccess` (admin + warehouse_manager) — applied to protected routes to enforce role-based access control at the API level.

---

**Technologies:**

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React.js v19 | Component-based SPA development |
| Build Tool | Vite v7 | Fast development server and optimized builds |
| CSS Framework | Tailwind CSS v4 | Utility-first responsive styling |
| UI Components | Radix UI + shadcn | Accessible component primitives |
| Charts | Recharts | Interactive data visualizations |
| HTTP Client | Axios | REST API communication with JWT interceptors |
| Routing | React Router DOM v7 | Client-side routing with protected routes |
| Animations | GSAP + Motion | UI transitions and micro-interactions |
| Icons | Lucide React | Consistent SVG icon set |
| Notifications | React Hot Toast | In-app feedback messages |
| Backend Runtime | Node.js v18+ | Server-side JavaScript execution |
| API Framework | Express.js | RESTful API routing and middleware |
| Database | MongoDB + Mongoose | Document storage with schema validation |
| Real-Time | Socket.IO v4 | WebSocket-based messaging and notifications |
| Authentication | JWT + bcryptjs | Stateless auth + password hashing |
| 2FA | Speakeasy | TOTP-based two-factor authentication |
| PDF Export | PDFKit | Programmatic PDF report generation |
| CSV Export | json2csv | JSON-to-CSV data export |
| QR Generation | qrcode | Server-side QR code generation |
| QR Scanning | html5-qrcode | Browser-based camera QR scanning |
| Email | Nodemailer | Automated SMTP email notifications |
| Version Control | Git / GitHub | Source control and collaboration |

---

**Modules:**

1. **Authentication & User Management Module** — JWT login/logout, bcrypt password hashing, TOTP 2FA via Speakeasy, role-based route protection, user profile management
2. **Product & Category Management Module** — Full CRUD for pharmaceutical products with type classification, SKU management, storage condition specifications, and QC test templates
3. **Batch Management & Tracking Module** — Batch lifecycle management (In Production → Quality Check → Released → Shipped), QR code generation, hash chain event logging
4. **Raw Material Management Module** — Raw material catalog with stock tracking, minimum threshold alerts, and supplier linkage
5. **Warehouse & Stock Management Module** — Multi-warehouse facility management, real-time stock level tracking, compound-indexed WarehouseStock records
6. **Purchase Order & Procurement Module** — End-to-end PO workflow (Draft → Approved → Sent → Received) with automatic stock updates on receipt
7. **Supplier Management Module** — Vendor profiles with contact details, supplied materials, manual and auto-calculated performance ratings
8. **Quality Control Module** — Structured QC test logging against batches with pass/fail tracking, inspector attribution, and overall status determination
9. **Product Recall Management Module** — Recall initiation from failed QC, affected stock identification, stakeholder notification, and recall status tracking
10. **Returns Management Module** — Distributor return processing with reason tracking, quantity management, and status workflow
11. **Expiry Intelligence Module** — Proactive batch expiry monitoring with configurable alert windows and visual expiry timeline dashboard
12. **Demand Forecasting Module** — Historical order data analysis with trend visualization and procurement recommendation generation
13. **Storage Compliance & Compliance Snapshot Module** — Storage condition monitoring against product-defined thresholds, automated daily compliance snapshot calculation (composite score across 5 metrics), and on-demand compliance report generation
14. **Audit Log Module** — Automatic logging of all significant system actions with user attribution, entity reference, and timestamp — providing a complete, immutable activity history
15. **Real-Time Messaging & Notification Module** — Socket.IO-powered direct messaging between users, automated notification generation for critical events (low stock, expiry, order updates, recalls), in-platform delivery with email fallback
16. **Reports & Data Export Module** — Aggregated operational reports with PDF (PDFKit) and CSV (json2csv) export for inventory status, order history, quality metrics, and compliance summaries
17. **Dashboard & Analytics Module** — Role-specific KPI dashboards with Recharts bar charts (production volume by product), pie charts (order status distribution), low stock alert panels, and expiry warning lists — with configurable date filters (Last 30/90/365 days / All time)

---

## 6.3 OUTCOMES

### Module Performance & Feature Completion

The following table summarizes the implementation status and key outcomes for each major module of PharmaLink:

| Module | Status | Key Outcome |
|---|---|---|
| Authentication & User Management | Complete | JWT + bcrypt + 2FA working; role-based routing enforced |
| Product Management | Complete | Full CRUD with SKU, storage conditions, QC templates |
| Batch Management | Complete | Lifecycle tracking, QR generation, hash chain logging |
| Raw Material Management | Complete | Stock tracking with low-threshold alerts |
| Warehouse & Stock Management | Complete | Multi-warehouse stock with compound-indexed records |
| Purchase Order & Procurement | Complete | Full PO workflow with auto stock update on receipt |
| Supplier Management | Complete | Vendor profiles with auto-calculated performance rating |
| Quality Control | Complete | Test logging with pass/fail and overall status |
| Recall Management | Complete | Recall workflow with notification and audit trail |
| Returns Management | Complete | Return processing with reason and status tracking |
| Expiry Intelligence | Complete | Proactive expiry alerts with visual timeline |
| Demand Forecasting | Complete | Historical trend analysis with procurement insights |
| Storage Compliance | Complete | Condition monitoring + daily automated snapshots |
| Audit Log | Complete | All write operations auto-logged with full attribution |
| Messaging & Notifications | Complete | Socket.IO real-time delivery + email fallback |
| Reports & Export | Complete | PDF and CSV export for all major report types |
| Dashboard & Analytics | Complete | Role-specific KPIs with Recharts visualizations |

*Table 2.0 — PharmaLink Module Implementation Status*

---

### Compliance Score Calculation

The automated daily compliance snapshot calculates a composite compliance score using the following weighted formula implemented in `server.js`:

| Metric | Weight | Calculation |
|---|---|---|
| Batch Testing Rate | 25% | (Batches with QC / Total Batches) × 100 |
| Expiry Score | 20% | (Released Batches not expired / Released Batches) × 100 |
| Storage Score | 25% | (Storage logs without violations / Total logs) × 100 |
| Recall Completion Rate | 15% | (Completed Recalls / Total Recalls) × 100 |
| Order Fulfillment Rate | 15% | (Delivered Orders / Non-cancelled Orders) × 100 |
| **Overall Score** | **100%** | Weighted sum of all five metrics |

*Table 3.0 — Compliance Score Calculation Formula*

---

### Dashboard Analytics Output

The Admin Dashboard aggregates real-time data across all modules and presents the following KPI cards and charts:

| KPI Card | Data Source | Description |
|---|---|---|
| Total Products | Products collection | Count of all active pharmaceutical products |
| Total Batches | Batches collection | Count of all batches in the selected date range |
| Total Revenue | Orders collection | Sum of totalAmount for delivered orders |
| Pending Orders | Orders collection | Count of orders with status = "Pending" |

**Charts rendered on the Dashboard:**
- **Production Volume by Product** (Bar Chart) — Aggregates `quantityProduced` from all batches, grouped by product name, rendered using Recharts `BarChart` with configurable date filter (Last 30/90/365 days / All time)
- **Order Status Distribution** (Pie Chart) — Displays the count of orders in each status (Pending, Approved, Shipped, Delivered) as a donut chart using Recharts `PieChart` with `innerRadius`
- **Low Stock Alerts Panel** — Lists all raw materials where `currentStock < minimumThreshold`, fetched from `/api/raw-materials/alerts`
- **Expiring in 30 Days Panel** — Lists all batches with `expDate` within the next 30 days, fetched from `/api/batches/expiring`

*Figure 8.0 — PharmaLink Admin Dashboard with KPI Cards and Recharts Visualizations*

---

### Sample API Implementation (Authentication Module)

The following code snippet illustrates the JWT authentication middleware implementation in `backend/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');

// Verify JWT token
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Check if user is admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};
```

*Figure 9.0 — JWT Authentication Middleware (auth.js)*

---

### Sample Frontend Implementation (Dashboard Analytics)

The following code snippet illustrates the Dashboard's data loading and Recharts visualization implementation:

```javascript
// Load all dashboard data in parallel
const loadDashboard = async () => {
    const params = dateFilter > 0 ? `?days=${dateFilter}` : '';
    const [statsRes, alertsRes, expiringRes, productsRes, batchesRes] = 
        await Promise.all([
            API.get(`/orders/stats${params}`),
            API.get('/raw-materials/alerts'),
            API.get('/batches/expiring'),
            API.get('/products'),
            API.get(`/batches${params}`),
        ]);
    setStats(statsRes.data);
    setAlerts(alertsRes.data);
    setExpiring(expiringRes.data);
};

// Production volume chart — aggregated from batch data
const productionData = batches.reduce((acc, batch) => {
    const name = batch.productId?.name || 'Unknown';
    const existing = acc.find(i => i.name === name);
    if (existing) existing.quantity += batch.quantityProduced;
    else acc.push({ name, quantity: batch.quantityProduced });
    return acc;
}, []);
```

*Figure 10.0 — Dashboard Data Loading and Chart Aggregation (Dashboard.jsx)*

---

### Sample Backend Implementation (Compliance Snapshot Automation)

The following code snippet illustrates the automated daily compliance snapshot calculation in `server.js`:

```javascript
async function saveComplianceSnapshot() {
    const totalBatches = await Batch.countDocuments();
    const testedBatches = await QualityCheck.distinct('batchId');
    const testingRate = totalBatches > 0 
        ? (testedBatches.length / totalBatches * 100) : 0;

    const releasedBatches = await Batch.countDocuments({ status: 'Released' });
    const expiredBatches = await Batch.countDocuments({ 
        status: 'Released', expDate: { $lt: new Date() } 
    });
    const expiryScore = releasedBatches > 0 
        ? ((releasedBatches - expiredBatches) / releasedBatches * 100) : 100;

    const overall = testingRate * 0.25 + expiryScore * 0.20 
        + storageScore * 0.25 + recallScore * 0.15 + fulfillmentRate * 0.15;

    await new ComplianceSnapshot({ overall, testingRate, expiryScore, 
        storageScore, recallScore, fulfillmentRate }).save();
}

// Run once per day
setInterval(saveComplianceSnapshot, 86400000);
```

*Figure 11.0 — Automated Compliance Snapshot Calculation (server.js)*

---

### PharmaLink Web Application Screenshots

**Figure 12.0 — Admin Dashboard**
The Admin Dashboard displays four KPI stat cards (Total Products, Total Batches, Total Revenue in ₹, Pending Orders), a Production Volume bar chart grouped by product name, an Order Status donut pie chart, a Low Stock Alerts panel listing raw materials below minimum threshold, and an Expiring in 30 Days panel listing near-expiry batches — all with a configurable date filter (Last 30/90/365 days / All time) in the top-right corner.

**Figure 13.0 — Inventory Management Module**
The Inventory module provides a searchable, paginated data table of all products with columns for Name, Type, SKU, Price Per Unit, and Storage Conditions. Action buttons allow inline editing and deletion. A "Add Product" button opens a Radix UI Dialog modal with a structured form for entering all product attributes including formula composition and QC test templates.

**Figure 14.0 — Batch Management & QR Traceability**
The Batch Management module displays all batches with their Batch ID, associated Product, Manufacturing Date, Expiry Date, Quantity Produced, and current Status (color-coded badge). Each batch row includes a QR code icon that opens a modal displaying the generated QR code for physical labeling, and a hash chain viewer showing the complete tamper-evident event history for that batch.

**Figure 15.0 — Real-Time Messaging Interface**
The Messages module provides a WhatsApp-style chat interface with a user list on the left sidebar and a message thread on the right. Messages are delivered in real-time via Socket.IO — new messages appear instantly without page refresh. The notification bell in the top navigation bar shows an unread count badge that updates in real-time as new notifications arrive.
