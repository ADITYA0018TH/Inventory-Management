# 5. SYSTEM DESIGN

---

## 5.1 SYSTEM DESIGN & METHODOLOGY

The system design and methodology employed in the development of PharmaLink — Advanced Inventory & Supply Chain Management are crucial for ensuring operational efficiency, data integrity, scalability, and security. This section outlines the key design principles, architectural methodology, and system components used in the project.

---

### 1. Design Principles

**Modularity:**
PharmaLink is designed with a fully modular architecture. Each functional area — Authentication, Inventory, Procurement, Quality Control, Compliance, Reporting — is implemented as an independent module with its own React page components, Express.js route handlers, and Mongoose models. This separation ensures that changes to one module do not affect others, making the system easy to maintain, test, and extend.

**Scalability:**
The system architecture supports horizontal and vertical scaling. The Node.js backend is stateless (JWT-based authentication), allowing multiple server instances to run behind a load balancer without session conflicts. MongoDB's document model scales naturally with growing data volumes. New modules (e.g., mobile app, IoT integration) can be added without restructuring the existing codebase.

**Flexibility:**
PharmaLink accommodates diverse pharmaceutical business workflows. Product types (Tablet, Syrup, Injection), order statuses, batch lifecycle stages, and user roles are all configurable via Mongoose schema enums. New product types, status stages, or user roles can be added with minimal code changes, allowing the system to adapt to different organizational requirements.

**Resilience:**
Express.js middleware handles errors globally, returning structured JSON error responses for all API failures. React's component error boundaries prevent UI crashes from propagating across the application. Socket.IO implements automatic reconnection logic for WebSocket disconnections, ensuring real-time features recover gracefully from network interruptions.

**Security:**
The system implements multi-layered security: JWT tokens with configurable expiry for stateless authentication, bcrypt password hashing (salt rounds: 10) for credential storage, TOTP-based Two-Factor Authentication via Speakeasy, role-based access control enforced at both the React Router level and Express.js middleware level, and environment variable-based secret management ensuring no credentials are hardcoded in the codebase.

---

### 2. Methodology

**Modular Full-Stack Development Lifecycle:**
PharmaLink follows a structured full-stack development lifecycle organized around feature modules. Each module progresses through the same stages: database schema design → backend API development → frontend UI implementation → integration testing → refinement. This ensures consistent quality and completeness across all 17 modules.

**REST API Architecture:**
All backend functionality is exposed through a RESTful API with consistent endpoint conventions (`/api/products`, `/api/batches`, `/api/orders`, etc.), standard HTTP method semantics, and JSON request/response formats. This clean API contract enables independent development and testing of frontend and backend layers.

**Component-Based Frontend Development:**
The React frontend is built using a component hierarchy — layout components (Sidebar, Header), reusable UI primitives (Button, Dialog, Select from Radix UI), common components (SearchBar, Pagination, NotificationBell), and page-level module components. This promotes code reuse and ensures visual consistency across all 17 modules.

**Real-Time Event-Driven Communication:**
Socket.IO implements an event-driven communication layer for real-time features. The server emits named events (e.g., `new_notification`, `new_message`, `stock_alert`) and clients subscribe to relevant events, updating their UI state reactively without polling.

**Iterative Testing & Refinement:**
Each module was tested end-to-end after implementation — API endpoints verified via Postman, UI components validated for responsiveness across breakpoints (375px, 768px, 1024px, 1440px), and real-time features stress-tested for concurrent user scenarios before proceeding to the next module.

---

### 3. System Components

**Frontend (React.js + Vite + Tailwind CSS):**
The frontend is a single-page application (SPA) built with React.js v19, bundled with Vite for fast development and optimized production builds. Tailwind CSS v4 provides the utility-first styling system. Radix UI primitives and shadcn/ui patterns form the accessible component library. React Router DOM v7 handles client-side routing with protected routes and role-based redirects. Recharts renders all data visualizations. Axios manages all HTTP communication with the backend API.

**Backend (Node.js + Express.js):**
The backend is a RESTful API server built with Node.js and Express.js. It handles all business logic — authentication, inventory operations, order processing, compliance monitoring, report generation, and real-time event emission. JWT middleware protects all authenticated routes. Role-based middleware enforces permission checks at the controller level. PDFKit and json2csv handle report generation. Nodemailer delivers automated email notifications.

**Database (MongoDB + Mongoose):**
MongoDB stores all application data as JSON-like documents across 17 collections. Mongoose provides schema validation, relationship management via ObjectId references, and query building. Compound indexes (e.g., on WarehouseStock for warehouseId + materialId) prevent data duplication and optimize query performance.

**Real-Time Layer (Socket.IO):**
Socket.IO maintains persistent WebSocket connections between the server and all connected clients. It powers the real-time messaging module and the automated notification delivery system. The server broadcasts events to specific users or rooms based on role and context.

**Integration Layer:**
The QR code subsystem integrates the `qrcode` library (server-side generation) with `html5-qrcode` (frontend camera scanning). Nodemailer integrates with SMTP email services for automated notifications. The system is cloud-platform agnostic, deployable on any Node.js-compatible hosting environment.

---

## 5.2 DATA STRUCTURE DESIGN

PharmaLink follows a structured approach to organizing and managing pharmaceutical supply chain data across MongoDB collections. The data structure ensures efficient storage, retrieval, and processing of all supply chain entities — from user accounts and product catalogs through batch records, orders, quality checks, and audit logs.

The system is designed to handle complex, interrelated supply chain data efficiently, ensuring seamless storage, retrieval, and cross-module data flow. Each MongoDB collection follows a well-defined Mongoose schema with appropriate field types, validation rules, default values, and ObjectId references to related collections. The data undergoes validation at the schema level before persistence, ensuring data integrity throughout the system.

---

### User Data Structure

The User collection stores authentication credentials and profile information for all platform users.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique identifier |
| `name` | String (required) | Full name of the user |
| `email` | String (required, unique) | Login email address |
| `password` | String (required) | bcrypt-hashed password |
| `role` | String (enum) | admin / distributor / quality_inspector / warehouse_manager |
| `companyName` | String | Organization name (for distributors) |
| `gstNumber` | String | GST registration number (optional) |
| `isActive` | Boolean | Account active/suspended status |
| `twoFactorSecret` | String | TOTP secret for 2FA (Speakeasy) |
| `twoFactorEnabled` | Boolean | Whether 2FA is enabled for this account |
| `createdAt` | Date | Account creation timestamp |

---

### Product Data Structure

The Product collection stores the pharmaceutical product catalog with storage requirements and quality check templates.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique identifier |
| `name` | String (required) | Product name (e.g., "Aster Cold Relief") |
| `type` | String (enum) | Tablet / Syrup / Injection |
| `pricePerUnit` | Number (required) | Selling price per unit |
| `sku` | String (unique) | Stock Keeping Unit identifier |
| `description` | String | Product description |
| `formula` | Array | Raw material composition (materialId + quantityRequired) |
| `storageConditions` | Object | Min/max temperature and humidity requirements |
| `qcTests` | Array | Custom quality check test templates (name + description) |
| `materialCosts` | Array | Cost per unit of each raw material used |

---

### Batch Data Structure

The Batch collection maintains complete lifecycle records for each manufactured product batch, including QR traceability and hash chain for tamper-evident event logging.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique identifier |
| `batchId` | String (required, unique) | Human-readable batch identifier (e.g., "AST-2026-001") |
| `productId` | ObjectId (ref: Product) | Associated product |
| `quantityProduced` | Number (required) | Total units produced in this batch |
| `mfgDate` | Date (required) | Manufacturing date |
| `expDate` | Date (required) | Expiry date |
| `status` | String (enum) | In Production / Quality Check / Released / Shipped |
| `qrCodeData` | String | Encoded QR code string for physical labeling |
| `hashChain` | Array | Tamper-evident event log (event, hash, previousHash, timestamp, actor) |

---

### Order Data Structure

The Order collection manages distributor orders with full shipment tracking history.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique identifier |
| `distributorId` | ObjectId (ref: User) | Ordering distributor |
| `items` | Array | Order line items (productId, quantity, batchId) |
| `totalAmount` | Number | Total order value |
| `status` | String (enum) | Pending / Approved / Shipped / Delivered / Cancelled |
| `invoiceNumber` | String | Generated invoice reference |
| `tracking` | Array | Shipment tracking events (status, location, timestamp, note) |
| `orderDate` | Date | Order creation timestamp |

---

### Purchase Order Data Structure

The PurchaseOrder collection manages raw material procurement from suppliers.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique identifier |
| `poNumber` | String (required, unique) | Purchase order reference number |
| `supplierId` | ObjectId (ref: Supplier) | Associated supplier |
| `items` | Array | Line items (materialId, quantity, unit, unitPrice) |
| `totalAmount` | Number | Total procurement value |
| `status` | String (enum) | Draft / Approved / Sent / Received |
| `approvedBy` | ObjectId (ref: User) | User who approved the PO |
| `approvedAt` | Date | Approval timestamp |
| `notes` | String | Additional procurement notes |
| `createdAt` | Date | PO creation timestamp |

---

### Quality Check Data Structure

The QualityCheck collection records inspection results for each batch against defined test criteria.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique identifier |
| `batchId` | ObjectId (ref: Batch) | Inspected batch |
| `inspector` | String (required) | Name of the quality inspector |
| `testDate` | Date | Date of inspection |
| `tests` | Array | Individual test results (name, result, Pass/Fail status) |
| `overallStatus` | String (enum) | Pass / Fail / Pending |
| `notes` | String | Inspector remarks |
| `createdAt` | Date | Record creation timestamp |

---

### Supplier Data Structure

The Supplier collection maintains vendor profiles with performance ratings and associated materials.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique identifier |
| `name` | String (required) | Supplier company name |
| `contactPerson` | String | Primary contact name |
| `email` | String | Contact email |
| `phone` | String | Contact phone number |
| `address` | String | Supplier address |
| `gstNumber` | String | GST registration number |
| `materials` | Array | ObjectId references to supplied raw materials |
| `rating` | Number (1–5) | Manual performance rating |
| `autoRating` | Number (1–5) | Auto-calculated rating from PO performance history |
| `status` | String (enum) | Active / Inactive |
| `createdAt` | Date | Supplier record creation timestamp |

---

### Warehouse & Stock Data Structures

The Warehouse collection stores facility information, while WarehouseStock tracks material quantities per warehouse with a compound unique index preventing duplicate entries.

**Warehouse:**

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique identifier |
| `name` | String (required) | Warehouse facility name |
| `location` | String (required) | Physical location/address |
| `capacity` | Number | Maximum storage capacity (units) |
| `managerId` | ObjectId (ref: User) | Assigned warehouse manager |
| `isActive` | Boolean | Operational status |
| `createdAt` | Date | Record creation timestamp |

**WarehouseStock (Compound Index: warehouseId + materialId):**

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique identifier |
| `warehouseId` | ObjectId (ref: Warehouse) | Associated warehouse |
| `materialId` | ObjectId (ref: RawMaterial) | Stocked raw material |
| `quantity` | Number | Current stock quantity |
| `lastUpdated` | Date | Last stock update timestamp |

---

### Audit Log Data Structure

The AuditLog collection provides a complete, immutable activity history for all significant system actions.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique identifier |
| `userId` | ObjectId (ref: User) | User who performed the action |
| `userName` | String | Display name of the acting user |
| `action` | String (required) | Action description (e.g., "Created Batch", "Updated Order Status") |
| `entity` | String | Affected entity type (e.g., "Batch", "Order", "Product") |
| `entityId` | String | ID of the affected entity |
| `details` | String | Human-readable description of the change |
| `timestamp` | Date | Exact timestamp of the action |

---

### Notification Data Structure

The Notification collection stores in-platform alerts delivered via Socket.IO and persisted for the notification bell UI.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique identifier |
| `userId` | ObjectId (ref: User) | Recipient user |
| `type` | String (enum) | order / stock / expiry / recall / quality / system |
| `title` | String (required) | Notification headline |
| `message` | String (required) | Notification body text |
| `read` | Boolean | Read/unread status |
| `link` | String | Deep link to the relevant module page |
| `createdAt` | Date | Notification creation timestamp |

---

### Data Processing & Validation

Before persisting data to MongoDB, the system applies the following processing steps:

- **Schema Validation:** Mongoose schemas enforce required fields, data types, enum constraints, and uniqueness rules at the database layer — preventing invalid data from being stored regardless of the source.
- **Input Sanitization:** Express.js middleware validates and sanitizes all incoming request bodies before they reach route handlers, preventing injection attacks and malformed data.
- **Relationship Integrity:** ObjectId references between collections (e.g., Batch → Product, Order → User, PurchaseOrder → Supplier) are validated at the application layer before write operations, ensuring referential consistency.
- **Compound Indexing:** The WarehouseStock collection uses a compound unique index on `{warehouseId, materialId}` to prevent duplicate stock records and optimize warehouse-specific stock queries.
- **Timestamp Automation:** All collections use `default: Date.now` for timestamp fields, ensuring consistent, server-side timestamp generation independent of client clock accuracy.

In summary, PharmaLink's data structure design ensures seamless data flow from user input through API processing to MongoDB persistence and back to the React UI. The structured organization of all supply chain entities — with well-defined schemas, validation rules, and cross-collection references — provides a reliable, consistent data foundation that supports all 17 functional modules while maintaining data integrity, query performance, and audit traceability throughout the system.

---

## USE CASE DIAGRAM

The Use Case Diagram for PharmaLink illustrates the interactions between the two primary actors — **Admin** and **Distributor** — and the system's functional use cases.

**Actors:**
- **Admin** — Has full system access including inventory management, procurement, quality control, compliance monitoring, user management, and reporting.
- **Distributor** — Has restricted access to order placement, order tracking, product catalog viewing, and messaging.

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

*Figure 3.0 — PharmaLink Use Case Diagram*

---

## ACTIVITY DIAGRAM

The Activity Diagram for PharmaLink illustrates the primary operational workflow from user authentication through supply chain operations to reporting.

**Flow:**
1. **Start** → User accesses the PharmaLink web application
2. **Authentication** → Login with email/password → 2FA verification (if enabled) → JWT token issued
3. **Role Check** → Admin Dashboard OR Distributor Dashboard
4. **Admin Flow:**
   - Select Module (Inventory / Orders / QC / Compliance / Reports)
   - Perform Operation (Create / Read / Update / Delete)
   - System validates input → Persists to MongoDB → Updates UI state
   - Critical events → Trigger Socket.IO notification → Email alert (if configured)
   - Audit Log entry automatically created for all write operations
5. **Distributor Flow:**
   - Browse Products → Place Order → Track Order Status
   - Receive notifications on order status changes
6. **Reporting** → Generate PDF/CSV report → Download
7. **End** → Logout → JWT token invalidated

*Figure 4.0 — PharmaLink Activity Diagram*

---

## SEQUENCE DIAGRAM

The Sequence Diagram illustrates the interaction between system components during a typical order placement and fulfillment workflow.

**Actors/Components:** Distributor, Admin, React Frontend, Express.js API Server, MongoDB, Socket.IO Server, Notification Service

**Sequence:**
1. Distributor logs in → Frontend sends POST `/api/auth/login` → API validates credentials → Returns JWT token
2. Distributor browses products → Frontend sends GET `/api/products` → API queries MongoDB → Returns product list
3. Distributor places order → Frontend sends POST `/api/orders` → API validates stock availability → Creates Order document in MongoDB → Returns order confirmation
4. Socket.IO server emits `new_order` event to Admin clients → Admin notification bell updates in real-time
5. Admin reviews order → Sends PUT `/api/orders/:id/status` (Approved) → API updates Order status in MongoDB → Creates AuditLog entry
6. Socket.IO server emits `order_status_update` event to Distributor → Distributor's order status updates in real-time
7. Nodemailer sends order approval email to Distributor
8. Admin updates order to Shipped → Tracking entry added to Order document → Distributor notified via Socket.IO
9. Admin marks order Delivered → Final status update → Audit log entry created → Distributor receives delivery notification

*Figure 5.0 — PharmaLink Sequence Diagram*

---

## DATA FLOW DIAGRAM

The Data Flow Diagram (DFD) for PharmaLink illustrates how data moves between external entities, processes, and data stores across the system.

**External Entities:**
- Admin User
- Distributor User
- Email Service (SMTP)

**Level 0 — Context Diagram:**
All users interact with the PharmaLink System, which processes supply chain operations and stores data in MongoDB, while sending notifications via the Email Service.

**Level 1 — Main Processes:**

1. **Authentication Process**
   - Input: Login credentials from User
   - Process: Validate credentials → Generate JWT → Optionally verify TOTP
   - Output: JWT token to User / Error response

2. **Inventory Management Process**
   - Input: Product/Batch/Stock data from Admin
   - Process: Validate schema → Persist to MongoDB → Update related collections
   - Data Stores: Products, Batches, WarehouseStock, RawMaterials

3. **Order Processing Process**
   - Input: Order request from Distributor
   - Process: Validate stock → Create Order → Update inventory → Emit Socket.IO event
   - Data Stores: Orders, Products, WarehouseStock
   - Output: Order confirmation to Distributor, notification to Admin

4. **Quality Control Process**
   - Input: QC test results from Admin/Inspector
   - Process: Record test results → Determine overall status → Trigger recall if failed
   - Data Stores: QualityChecks, Batches, Recalls

5. **Compliance & Audit Process**
   - Input: System actions from all users
   - Process: Auto-log all write operations → Generate compliance snapshots on demand
   - Data Stores: AuditLogs, ComplianceSnapshots, StorageLogs

6. **Notification & Messaging Process**
   - Input: Trigger events from all processes
   - Process: Create Notification document → Emit via Socket.IO → Send email via Nodemailer
   - Data Stores: Notifications, Messages
   - Output: Real-time notification to User, Email to User

7. **Reporting Process**
   - Input: Report request from Admin
   - Process: Aggregate data from multiple collections → Format as PDF/CSV
   - Data Stores: All collections (read-only)
   - Output: Downloadable PDF/CSV report

*Figure 6.0 — PharmaLink Data Flow Diagram*
