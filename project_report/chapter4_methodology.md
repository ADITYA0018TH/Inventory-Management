# CHAPTER 4: METHODOLOGY — SYSTEM DESIGN AND IMPLEMENTATION
Pages 25–39

---

## 4.1 SYSTEM DESIGN METHODOLOGY

PharmaLink follows a modular, feature-driven full-stack development methodology structured around the following design principles:

**Modularity:** Each functional area is implemented as an independent module with its own React page components, Express.js route handlers, and Mongoose models. Changes to one module do not affect others.

**Scalability:** The stateless JWT-based backend supports horizontal scaling. MongoDB's document model scales naturally with data volume. New modules can be added without restructuring existing code.

**Security:** Multi-layered security — JWT authentication, bcrypt hashing, TOTP 2FA, RBAC at both frontend and backend levels, environment variable-based secret management.

**Real-Time:** Socket.IO event-driven communication layer for messaging and notifications without polling.

**REST API Architecture:** All backend functionality exposed through RESTful endpoints with consistent naming, HTTP method semantics, and JSON request/response formats.

---

## 4.2 DATABASE STRUCTURE DESIGN

PharmaLink uses MongoDB with Mongoose ODM. The following tables define the schema for each major entity.

---

### User Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated unique identifier |
| name | String (required) | Full name of the user |
| email | String (required, unique) | Login email address |
| password | String (required) | bcrypt-hashed password |
| role | String (enum) | admin / distributor / quality_inspector / warehouse_manager |
| companyName | String | Organization name (for distributors) |
| gstNumber | String | GST registration number |
| isActive | Boolean | Account active/suspended status |
| twoFactorSecret | String | TOTP secret for 2FA (Speakeasy) |
| twoFactorEnabled | Boolean | Whether 2FA is enabled |
| createdAt | Date | Account creation timestamp |

---

### Product Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated unique identifier |
| name | String (required) | Product name |
| type | String (enum) | Tablet / Syrup / Injection |
| pricePerUnit | Number (required) | Selling price per unit |
| sku | String (unique) | Stock Keeping Unit identifier |
| description | String | Product description |
| formula | Array | Raw material composition (materialId + quantityRequired) |
| storageConditions | Object | Min/max temperature and humidity requirements |
| qcTests | Array | Custom quality check test templates |
| materialCosts | Array | Cost per unit of each raw material |

---

### Batch Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated unique identifier |
| batchId | String (required, unique) | Human-readable batch identifier |
| productId | ObjectId (ref: Product) | Associated product |
| quantityProduced | Number (required) | Total units produced |
| mfgDate | Date (required) | Manufacturing date |
| expDate | Date (required) | Expiry date |
| status | String (enum) | In Production / Quality Check / Released / Shipped |
| qrCodeData | String | Encoded QR code string for physical labeling |
| hashChain | Array | Tamper-evident event log (event, hash, previousHash, timestamp, actor) |

---

### Order Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated unique identifier |
| distributorId | ObjectId (ref: User) | Ordering distributor |
| items | Array | Order line items (productId, quantity, batchId) |
| totalAmount | Number | Total order value |
| status | String (enum) | Pending / Approved / Shipped / Delivered / Cancelled |
| invoiceNumber | String | Generated invoice reference |
| tracking | Array | Shipment tracking events (status, location, timestamp, note) |
| orderDate | Date | Order creation timestamp |

---

### Purchase Order Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated unique identifier |
| poNumber | String (required, unique) | Purchase order reference number |
| supplierId | ObjectId (ref: Supplier) | Associated supplier |
| items | Array | Line items (materialId, quantity, unit, unitPrice) |
| totalAmount | Number | Total procurement value |
| status | String (enum) | Draft / Approved / Sent / Received |
| approvedBy | ObjectId (ref: User) | User who approved the PO |
| approvedAt | Date | Approval timestamp |
| notes | String | Additional procurement notes |
| createdAt | Date | PO creation timestamp |

---

### Quality Check Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated unique identifier |
| batchId | ObjectId (ref: Batch) | Inspected batch |
| inspector | String (required) | Name of the quality inspector |
| testDate | Date | Date of inspection |
| tests | Array | Individual test results (name, result, Pass/Fail status) |
| overallStatus | String (enum) | Pass / Fail / Pending |
| notes | String | Inspector remarks |
| createdAt | Date | Record creation timestamp |

---

### Supplier Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated unique identifier |
| name | String (required) | Supplier company name |
| contactPerson | String | Primary contact name |
| email | String | Contact email |
| phone | String | Contact phone number |
| address | String | Supplier address |
| gstNumber | String | GST registration number |
| materials | Array | ObjectId references to supplied raw materials |
| rating | Number (1–5) | Manual performance rating |
| autoRating | Number (1–5) | Auto-calculated rating from PO history |
| status | String (enum) | Active / Inactive |
| createdAt | Date | Supplier record creation timestamp |

---

### Warehouse & WarehouseStock Collections

**Warehouse:**

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated unique identifier |
| name | String (required) | Warehouse facility name |
| location | String (required) | Physical location/address |
| capacity | Number | Maximum storage capacity (units) |
| managerId | ObjectId (ref: User) | Assigned warehouse manager |
| isActive | Boolean | Operational status |
| createdAt | Date | Record creation timestamp |

**WarehouseStock (Compound Index: warehouseId + materialId):**

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated unique identifier |
| warehouseId | ObjectId (ref: Warehouse) | Associated warehouse |
| materialId | ObjectId (ref: RawMaterial) | Stocked raw material |
| quantity | Number | Current stock quantity |
| lastUpdated | Date | Last stock update timestamp |

---

### Audit Log Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated unique identifier |
| userId | ObjectId (ref: User) | User who performed the action |
| userName | String | Display name of the acting user |
| action | String (required) | Action description |
| entity | String | Affected entity type |
| entityId | String | ID of the affected entity |
| details | String | Human-readable description of the change |
| timestamp | Date | Exact timestamp of the action |

---

### Notification Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated unique identifier |
| userId | ObjectId (ref: User) | Recipient user |
| type | String (enum) | order / stock / expiry / recall / quality / system |
| title | String (required) | Notification headline |
| message | String (required) | Notification body text |
| read | Boolean | Read/unread status |
| link | String | Deep link to the relevant module page |
| createdAt | Date | Notification creation timestamp |

---

## 4.3 SYSTEM DIAGRAMS

### Use Case Diagram

**Actors:** Admin, Distributor

**Admin Use Cases:**
- Login / Logout (with optional 2FA)
- Manage Products & Batches
- Manage Raw Materials & Warehouses
- Process Purchase Orders
- Manage Suppliers
- Conduct Quality Checks
- Manage Product Recalls & Returns
- Monitor Storage Compliance
- Generate Compliance Snapshots
- View Audit Logs
- Generate & Export Reports
- View Expiry Intelligence Dashboard
- View Demand Forecasting
- Send & Receive Messages
- Manage User Accounts

**Distributor Use Cases:**
- Login / Logout
- Browse Product Catalog
- Place & Track Orders
- View Order History
- Send & Receive Messages
- View Notifications

Figure 3.0 — PharmaLink Use Case Diagram

---

### Activity Diagram

Flow: User accesses PharmaLink → Login (email/password) → 2FA verification (if enabled) → JWT token issued → Role check → Admin Dashboard OR Distributor Dashboard → Select Module → Perform Operation → System validates → Persists to MongoDB → Updates UI → Critical events trigger Socket.IO notification → Audit Log entry created → Logout

Figure 4.0 — PharmaLink Activity Diagram

---

### Sequence Diagram

1. Distributor logs in → POST /api/auth/login → JWT token returned
2. Distributor browses products → GET /api/products → Product list returned
3. Distributor places order → POST /api/orders → Order created in MongoDB
4. Socket.IO emits new_order event to Admin → Admin notification bell updates
5. Admin approves order → PUT /api/orders/:id/status → AuditLog entry created
6. Socket.IO emits order_status_update to Distributor → Order status updates in real-time
7. Nodemailer sends order approval email to Distributor
8. Admin marks order Shipped → Tracking entry added → Distributor notified
9. Admin marks order Delivered → Final audit log entry created

Figure 5.0 — PharmaLink Sequence Diagram

---

### Data Flow Diagram

**External Entities:** Admin User, Distributor User, Email Service (SMTP)

**Level 1 Processes:**
1. Authentication Process — validates credentials, issues JWT, verifies TOTP
2. Inventory Management — CRUD on Products, Batches, RawMaterials, WarehouseStock
3. Order Processing — validates stock, creates Order, updates inventory, emits Socket.IO event
4. Quality Control — records QC tests, determines overall status, triggers recall if failed
5. Compliance & Audit — auto-logs all write operations, generates compliance snapshots
6. Notification & Messaging — creates Notification documents, emits via Socket.IO, sends email
7. Reporting — aggregates data from all collections, formats as PDF/CSV

Figure 6.0 — PharmaLink Data Flow Diagram

---

### Entity-Relationship Diagram

Key relationships:
- User (1) → places → many Orders (Distributor)
- User (1) → manages → many Products, Batches, PurchaseOrders (Admin)
- Product (1) → has → many Batches
- Batch (1) → has → many QualityChecks
- Batch (1) → may trigger → one Recall
- PurchaseOrder (1) → raised for → one Supplier
- Warehouse (1) → holds → many WarehouseStock entries
- WarehouseStock (compound unique: warehouseId + materialId)
- AuditLog (many) → created by → one User
- Notification (many) → delivered to → one User

Figure 7.0 — PharmaLink Entity-Relationship Diagram

---

## 4.4 IMPLEMENTATION PLATFORM

**Hardware:**
- Processor: Intel Core i5/i7 or AMD Ryzen 5/7
- RAM: Minimum 8GB (16GB recommended)
- Storage: SSD minimum 256GB
- Network: Stable broadband internet connection
- Mobile Device: Any modern smartphone (for QR scanning tests)

**Software Environment:**
- Operating System: macOS / Windows 10/11 / Ubuntu
- Runtime: Node.js v18+ LTS
- Package Manager: npm
- IDE: Visual Studio Code
- API Testing: Postman
- Version Control: Git / GitHub
- Database GUI: MongoDB Compass

**Deployment:**
- Backend: Node.js + Express.js on Render / Railway / DigitalOcean
- Frontend: React SPA (Vite build) on Netlify / Vercel
- Database: MongoDB Atlas (cloud-hosted)

---

## 4.5 MODULE IMPLEMENTATION

### 4.5.1 Authentication & User Management Module

JWT login/logout with bcrypt password validation, optional TOTP 2FA via Speakeasy, profile management, and user account administration. The auth middleware in backend/middleware/auth.js provides four functions: auth (JWT verification), adminOnly (admin role enforcement), qualityAccess, and warehouseAccess.

```javascript
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
```

Figure 9.0 — JWT Authentication Middleware (auth.js)

---

### 4.5.2 Dashboard & Analytics Module

The Admin Dashboard makes 5 parallel API calls via Promise.all on load, rendering 4 KPI stat cards, a Production Volume bar chart (Recharts BarChart), an Order Status donut pie chart (Recharts PieChart), a Low Stock Alerts panel, and an Expiring in 30 Days panel — all with a configurable date filter.

```javascript
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
```

Figure 10.0 — Dashboard Data Loading (Dashboard.jsx)

---

### 4.5.3 Compliance Snapshot Automation

The automated daily compliance snapshot runs via setInterval in server.js, calculating a composite score across 5 weighted metrics:

| Metric | Weight | Calculation |
|---|---|---|
| Batch Testing Rate | 25% | (Batches with QC / Total Batches) × 100 |
| Expiry Score | 20% | (Released Batches not expired / Released Batches) × 100 |
| Storage Score | 25% | (Storage logs without violations / Total logs) × 100 |
| Recall Completion Rate | 15% | (Completed Recalls / Total Recalls) × 100 |
| Order Fulfillment Rate | 15% | (Delivered Orders / Non-cancelled Orders) × 100 |
| Overall Score | 100% | Weighted sum of all five metrics |

Table 3.0 — Compliance Score Calculation Formula

```javascript
async function saveComplianceSnapshot() {
    const totalBatches = await Batch.countDocuments();
    const testedBatches = await QualityCheck.distinct('batchId');
    const testingRate = totalBatches > 0
        ? (testedBatches.length / totalBatches * 100) : 0;
    // ... (additional metric calculations)
    const overall = testingRate * 0.25 + expiryScore * 0.20
        + storageScore * 0.25 + recallScore * 0.15 + fulfillmentRate * 0.15;
    await new ComplianceSnapshot({ overall, testingRate, expiryScore,
        storageScore, recallScore, fulfillmentRate }).save();
}
setInterval(saveComplianceSnapshot, 86400000); // Run daily
```

Figure 11.0 — Automated Compliance Snapshot Calculation (server.js)

---

### 4.5.4 All 17 Modules Summary

| Module | Backend Route | Frontend Page | Key Features |
|---|---|---|---|
| Authentication | /api/auth | Login, Register, Profile | JWT, bcrypt, 2FA, RBAC |
| Products | /api/products | Products.jsx | CRUD, SKU, storage conditions, QC templates |
| Batches | /api/batches | Batches.jsx | Lifecycle, QR code, hash chain |
| Raw Materials | /api/raw-materials | Inventory.jsx | Stock tracking, low-threshold alerts |
| Warehouses | /api/warehouses | Warehouses.jsx | Multi-warehouse, stock management |
| Purchase Orders | /api/purchase-orders | PurchaseOrders.jsx | Full PO workflow, auto stock update |
| Suppliers | /api/suppliers | Suppliers.jsx | Vendor profiles, auto-rating |
| Quality Control | /api/quality | QualityControl.jsx | Test logging, pass/fail, inspector |
| Recalls | /api/recalls | Recalls.jsx | Recall workflow, notifications |
| Returns | /api/returns | Returns.jsx | Return processing, status workflow |
| Expiry Intelligence | /api/batches/expiring | ExpiryIntelligence.jsx | Expiry timeline, alerts |
| Forecasting | /api/forecasting | Forecasting.jsx | Historical trend analysis |
| Storage Compliance | /api/storage, /api/compliance | StorageCompliance.jsx, Compliance.jsx | Condition monitoring, snapshots |
| Audit Log | /api/audit | AuditLog.jsx | Immutable action history |
| Messaging | /api/messages | Messages.jsx | Socket.IO real-time chat |
| Notifications | /api/notifications | NotificationBell.jsx | Socket.IO alerts, email fallback |
| Dashboard | /api/orders/stats | Dashboard.jsx | KPI cards, Recharts charts |

Table 2.0 — PharmaLink Module Implementation Status

---

Parul University — Parul Institute of Technology
Department of Computer Science and Engineering
Academic Year: 2025-26
