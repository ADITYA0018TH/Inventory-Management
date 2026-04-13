# 1. OVERVIEW OF THE PROJECT

---

## 1.1 BACKGROUND

PharmaLink — Advanced Inventory & Supply Chain Management is a final year B.E. project developed by Aditya Raj, a student of the Department of Computer Science and Engineering at Parul Institute of Technology, Parul University, during the Academic Year 2025-26.

The project was conceived to address a critical and widely recognized problem in the pharmaceutical industry: the absence of an integrated, technology-driven platform for managing the complete pharmaceutical supply chain. Pharmaceutical organizations — ranging from manufacturers and warehouse operators to distributors and compliance officers — continue to rely on fragmented, manual, and disconnected systems for inventory tracking, procurement, quality control, and regulatory compliance. These legacy approaches result in stockouts, expired product losses, compliance failures, delayed order fulfillment, and poor traceability across the supply chain.

PharmaLink was developed as a comprehensive response to these challenges. The project applies modern full-stack web development technologies — React.js, Node.js, Express.js, MongoDB, and Socket.IO — to build a production-quality, multi-module pharmaceutical supply chain management platform. The system covers the complete operational lifecycle of pharmaceutical products: from raw material procurement and batch manufacturing through quality control, warehouse management, distribution, compliance monitoring, and audit logging.

The project was developed independently as an academic final year project, with the student serving as the sole developer responsible for all aspects of the system — requirements analysis, database schema design, backend API development, frontend UI implementation, real-time feature integration, compliance automation, and testing. The project demonstrates the practical application of computer science and software engineering principles to a real-world industry problem of significant social and economic importance.

---

## 1.2 SCOPE OF WORK

The scope of PharmaLink encompasses the complete design, development, and testing of a full-stack web application for pharmaceutical supply chain management. The project covers the following areas of work:

**Full-Stack Web Application Development:**
Design and implementation of a complete web application with a React.js single-page application (SPA) frontend and a Node.js/Express.js RESTful API backend. The frontend provides role-specific dashboards, module pages, and interactive data visualizations. The backend handles all business logic, data operations, authentication, real-time communication, and report generation.

**Database Design and Implementation:**
Design of a MongoDB document database schema covering 17 collections — Users, Products, Batches, RawMaterials, Warehouses, WarehouseStock, Orders, PurchaseOrders, Suppliers, QualityChecks, Recalls, Returns, StorageLogs, ComplianceSnapshots, AuditLogs, Notifications, and Messages. Implementation of Mongoose schemas with validation rules, ObjectId references, compound indexes, and default values.

**Security Architecture:**
Implementation of a multi-layer security system including JWT-based stateless authentication, bcrypt password hashing (salt rounds: 10), Time-based One-Time Password (TOTP) Two-Factor Authentication via Speakeasy, and role-based access control enforced at both the React Router and Express.js middleware levels.

**Real-Time Communication System:**
Integration of Socket.IO for bidirectional WebSocket communication, enabling real-time messaging between platform users and instant notification delivery for critical supply chain events — low stock alerts, expiry warnings, order status changes, quality check failures, and product recalls.

**Compliance Automation:**
Implementation of an automated daily compliance snapshot system that calculates composite compliance scores across five weighted metrics (Batch Testing Rate, Expiry Score, Storage Score, Recall Completion Rate, Order Fulfillment Rate) using a scheduled function in the backend server.

**Reporting and Data Export:**
Development of a reporting module that generates downloadable PDF reports (via PDFKit) and CSV exports (via json2csv) covering inventory status, order history, quality metrics, compliance summaries, and audit logs.

**QR Code Traceability:**
Integration of server-side QR code generation (via the `qrcode` library) for products and batches, and browser-based QR scanning (via `html5-qrcode`) enabling hardware-free batch identification using any smartphone camera.

**Testing and Validation:**
Comprehensive end-to-end testing of all 17 functional modules through API endpoint validation (Postman), UI responsiveness testing across device breakpoints, real-time feature validation, and security control verification — documented through 12 formal test cases.

---

## 1.3 SYSTEM ARCHITECTURE OVERVIEW

PharmaLink follows a three-tier web application architecture:

**Tier 1 — Presentation Layer (React.js Frontend):**
The frontend is a Single Page Application (SPA) built with React.js v19, bundled with Vite v7. It provides 17 module pages, role-specific dashboards, real-time notification bell, Socket.IO-powered messaging, and Recharts-based data visualizations. Tailwind CSS v4 provides the utility-first styling system. Radix UI primitives and shadcn/ui patterns form the accessible component library. React Router DOM v7 handles client-side routing with protected routes and role-based redirects.

**Tier 2 — Application Layer (Node.js/Express.js Backend):**
The backend is a RESTful API server built with Node.js and Express.js. It exposes 20 route modules covering all functional areas of the system. JWT middleware protects all authenticated routes. Role-based middleware enforces permission checks at the controller level. Socket.IO is co-hosted with the Express server for real-time event delivery. PDFKit and json2csv handle report generation. Nodemailer delivers automated email notifications.

**Tier 3 — Data Layer (MongoDB + Mongoose):**
MongoDB stores all application data as JSON-like documents across 17 collections. Mongoose provides schema validation, relationship management via ObjectId references, and query building. Compound indexes optimize query performance for frequently accessed data patterns.

```
┌─────────────────────────────────────────────────────┐
│              React.js Frontend (Vite SPA)            │
│   Tailwind CSS │ Radix UI │ Recharts │ Socket.IO     │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────┐
│         Node.js + Express.js REST API Server         │
│   JWT Auth │ RBAC │ Socket.IO │ PDFKit │ Nodemailer  │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│              MongoDB (17 Collections)                │
│   Products │ Batches │ Orders │ Users │ AuditLogs    │
└─────────────────────────────────────────────────────┘
```

*Figure 1.0 — PharmaLink Three-Tier System Architecture*

---

## 1.4 PROJECT CAPACITY AND SCALE

PharmaLink is designed to handle the operational data volumes typical of a small to mid-sized pharmaceutical organization. The system's capacity and scale characteristics are as follows:

**Data Volume:**
The MongoDB document model scales naturally with growing data volumes. The system is designed to handle thousands of products, batches, orders, and audit log entries without performance degradation. Compound indexes on frequently queried fields (e.g., WarehouseStock's `{warehouseId, materialId}` compound index) ensure query performance remains consistent as data grows.

**Concurrent Users:**
The Node.js event-driven, non-blocking I/O architecture efficiently handles multiple concurrent API requests without thread-blocking. Socket.IO's room-based event delivery scales to support multiple simultaneous connected users receiving real-time notifications and messages.

**Real-Time Performance:**
Socket.IO message delivery operates with sub-100ms latency under normal network conditions. The automated compliance snapshot calculation — which aggregates data across 5 MongoDB collections — completes in under 500ms, making it suitable for daily scheduled execution without impacting system performance.

**Report Generation:**
PDF report generation via PDFKit and CSV export via json2csv complete within 1.5 seconds and 500ms respectively for typical data volumes, providing a responsive user experience for on-demand report requests.

**Deployment Scalability:**
The stateless JWT-based authentication architecture allows the Node.js backend to be horizontally scaled across multiple server instances behind a load balancer without session conflicts. MongoDB Atlas provides managed database infrastructure with automatic scaling, backups, and monitoring. The React frontend is served as a static build, deployable on any CDN for global distribution.

---

# 2. OVERVIEW OF SYSTEM MODULES AND DEVELOPMENT PROCESS

---

## 2.1 MODULE OVERVIEW

PharmaLink comprises 17 functional modules, each addressing a specific aspect of pharmaceutical supply chain management. The modules are organized into five functional groups:

**Core Inventory Management:**
- Product & Category Management Module
- Batch Management & Tracking Module
- Raw Material Management Module
- Warehouse & Stock Management Module

**Procurement & Supplier Management:**
- Purchase Order & Procurement Module
- Supplier Management Module

**Quality, Safety & Compliance:**
- Quality Control Module
- Product Recall Management Module
- Returns Management Module
- Storage Compliance & Compliance Snapshot Module
- Audit Log Module

**Intelligence & Analytics:**
- Expiry Intelligence Module
- Demand Forecasting Module
- Dashboard & Analytics Module
- Reports & Data Export Module

**Communication & Access:**
- Authentication & User Management Module
- Real-Time Messaging & Notification Module

Each module has its own React page component(s) on the frontend, dedicated Express.js route handler(s) on the backend, and one or more Mongoose model(s) for data persistence. This modular architecture ensures that changes to one module do not affect others, making the system maintainable, testable, and extensible.

---

## 2.2 TECHNICAL SPECIFICATIONS

PharmaLink is built on the following technical specifications:

**Frontend Technical Specifications:**

| Component | Technology | Version |
|---|---|---|
| Framework | React.js | v19.2.0 |
| Build Tool | Vite | v7.3.1 |
| CSS Framework | Tailwind CSS | v4.2.1 |
| UI Components | Radix UI | v1.4.3 |
| Charts | Recharts | v3.7.0 |
| HTTP Client | Axios | v1.13.5 |
| Routing | React Router DOM | v7.13.0 |
| Real-Time Client | Socket.IO Client | v4.8.3 |
| Icons | Lucide React | v0.575.0 |
| Animations | GSAP + Motion | v3.14.2 / v12.34.3 |
| QR Scanning | html5-qrcode | v2.3.8 |
| Notifications | React Hot Toast | v2.6.0 |

**Backend Technical Specifications:**

| Component | Technology | Version |
|---|---|---|
| Runtime | Node.js | v18+ LTS |
| Framework | Express.js | v4.21.2 |
| Database | MongoDB + Mongoose | v8.10.0 |
| Real-Time Server | Socket.IO | v4.8.3 |
| Authentication | jsonwebtoken | v9.0.3 |
| Password Hashing | bcryptjs | v3.0.3 |
| 2FA | Speakeasy | v2.0.0 |
| PDF Generation | PDFKit | v0.17.2 |
| CSV Export | json2csv | v6.0.0 |
| QR Generation | qrcode | v1.5.4 |
| Email | Nodemailer | v8.0.1 |

---

## 2.3 DEVELOPMENT PROCESS OVERVIEW

PharmaLink was developed following a structured, modular full-stack development lifecycle organized around the following key stages:

**Stage 1 — Requirements Analysis & Schema Design:**
Defining functional requirements for all 17 modules, designing MongoDB schemas for all entities, establishing REST API endpoint contracts, and planning the React component hierarchy. This stage produced the complete data model and API specification before any implementation code was written.

**Stage 2 — Backend API Development:**
Implementing RESTful API routes for all modules using Express.js, with JWT authentication middleware, role-based access control, and Mongoose-based database operations. Each route module was tested independently via Postman before frontend integration.

**Stage 3 — Frontend UI Development:**
Building React page components for all 17 modules with Tailwind CSS styling, Radix UI components, and Recharts visualizations — consuming the backend REST API via Axios with JWT token injection via request interceptors.

**Stage 4 — Real-Time Integration:**
Implementing Socket.IO event emission on the backend for critical events (new orders, stock alerts, messages, notifications) and Socket.IO client subscriptions on the frontend for live UI updates without page refresh.

**Stage 5 — Compliance Automation:**
Implementing the automated daily compliance snapshot scheduler using `setInterval` in `server.js`, which calculates composite compliance scores across five MongoDB collections and persists the result as a ComplianceSnapshot document.

**Stage 6 — Testing & Refinement:**
End-to-end testing of all API endpoints via Postman, UI responsiveness testing across breakpoints (375px, 768px, 1024px, 1440px), real-time feature validation under concurrent user scenarios, and security control verification — followed by bug fixes and UI refinement.

---

## 2.4 DETAILED MODULE DESCRIPTIONS

**1. Authentication & User Management:**
Handles user registration, login with JWT token issuance, optional TOTP-based 2FA verification via Speakeasy, profile management, and user account administration. Role-based route protection ensures each user type (Admin, Distributor, quality_inspector, warehouse_manager) accesses only their authorized modules.

**2. Product & Category Management:**
Provides full CRUD operations for the pharmaceutical product catalog. Each product record includes name, type (Tablet/Syrup/Injection), SKU, price per unit, description, raw material formula composition, storage condition specifications (min/max temperature and humidity), and custom QC test templates.

**3. Batch Management & Tracking:**
Manages the complete batch lifecycle from In Production through Quality Check, Released, and Shipped stages. Each batch record includes manufacturing date, expiry date, quantity produced, QR code data for physical labeling, and a hash chain for tamper-evident event logging.

**4. Raw Material Management:**
Maintains the raw material catalog with current stock levels, minimum threshold alerts, unit specifications, and supplier linkage. The `/api/raw-materials/alerts` endpoint powers the Dashboard's Low Stock Alerts panel.

**5. Warehouse & Stock Management:**
Manages multi-warehouse facility records and real-time stock levels per warehouse per material. WarehouseStock uses a compound unique index on `{warehouseId, materialId}` to prevent duplicate records and optimize warehouse-specific queries.

**6. Purchase Order & Procurement:**
Implements end-to-end PO workflow from Draft through Approved, Sent, and Received stages. Upon marking a PO as Received, the system automatically increments WarehouseStock quantities for all line items and creates an AuditLog entry.

**7. Supplier Management:**
Maintains vendor profiles with contact details, supplied materials, GST numbers, and both manual and auto-calculated performance ratings derived from PO fulfillment history.

**8. Quality Control:**
Provides structured QC test logging against specific batches with individual test results (pass/fail), overall status determination, inspector attribution, and remarks. Failed QC results can directly initiate the Recall workflow.

**9. Product Recall Management:**
Manages recall initiation from failed QC or manual trigger, affected stock identification across warehouses, stakeholder notification via the notification system, and recall status tracking through to completion.

**10. Returns Management:**
Handles distributor return requests with reason tracking, quantity management, and status workflow from Pending through Approved/Rejected to Processed.

**11. Expiry Intelligence:**
Proactively monitors batch expiry dates and provides visual timelines of approaching expiry events. The `/api/batches/expiring` endpoint returns all batches expiring within 30 days, powering both the Dashboard panel and the dedicated Expiry Intelligence module page.

**12. Demand Forecasting:**
Analyzes historical order and consumption data to identify demand trends and generate procurement recommendations. Visualized using Recharts line charts showing order volume trends over configurable time periods.

**13. Storage Compliance & Compliance Snapshot:**
Monitors warehouse storage conditions against product-defined temperature and humidity thresholds. The automated daily compliance snapshot calculates a composite score across five metrics and persists it for trend analysis and regulatory reporting.

**14. Audit Log:**
Automatically records every significant system action — product creation, batch status change, order approval, user login, recall initiation — with user attribution, entity reference, action description, and precise timestamp. Provides a complete, immutable activity history for regulatory inspections.

**15. Real-Time Messaging & Notifications:**
Socket.IO-powered direct messaging between platform users with message history persistence. Automated notification generation for critical events with in-platform delivery via Socket.IO and email fallback via Nodemailer.

**16. Reports & Data Export:**
Aggregates data across all modules to generate comprehensive operational reports. Supports PDF export (PDFKit) and CSV export (json2csv) for inventory status, order history, quality metrics, compliance summaries, and audit logs.

**17. Dashboard & Analytics:**
Role-specific KPI dashboards with four stat cards (Products, Batches, Revenue, Pending Orders), Production Volume bar chart, Order Status donut pie chart, Low Stock Alerts panel, and Expiring in 30 Days panel — all with configurable date filters (Last 30/90/365 days / All time).

---

*Parul University — Parul Institute of Technology*
*Department of Computer Science and Engineering*
*Academic Year: 2025-26*
