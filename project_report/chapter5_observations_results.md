# CHAPTER 5: OBSERVATIONS, RESULTS AND DISCUSSION
Pages 40–44

---

## 5.1 SYSTEM OUTCOMES

All 17 functional modules of PharmaLink were successfully implemented and verified as fully functional. The following table summarizes the implementation status and key outcomes:

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

Table 2.0 — PharmaLink Module Implementation Status

---

## 5.2 TESTING RESULTS

### 5.2.1 Testing Plan

The testing plan for PharmaLink covered six testing types:

**Unit Testing** — Individual API endpoints tested via Postman for correct HTTP status codes, response structures, and data for valid and invalid inputs.

**Integration Testing** — Cross-module workflows validated end-to-end (e.g., creating a Purchase Order and verifying automatic stock update on receipt).

**Performance Testing** — API response times measured under realistic data volumes; dashboard parallel API calls tested for completion within acceptable timeframes.

**Security Testing** — Unauthorized API access attempts (expected 401), Admin-only routes with Distributor token (expected 403), bcrypt hash verification, 2FA TOTP validation and rejection.

**Real-Time Feature Testing** — Socket.IO message delivery latency, notification badge updates, and reconnection behavior after simulated network interruption.

**User Acceptance Testing** — System tested with representative Admin and Distributor users for usability, navigation clarity, and workflow correctness.

---

### 5.2.2 Test Cases and Results

| Test No | Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | User Authentication & JWT Token Generation | Valid credentials return JWT; invalid return 401 | JWT generated on valid login; 401 on invalid | Pass |
| 2 | Role-Based Access Control (RBAC) | Distributor token rejected on Admin routes with 403 | 403 returned correctly for Distributor on Admin routes | Pass |
| 3 | Product & Batch CRUD Operations | Product/batch created, retrieved, updated; QR code generated | All CRUD operations successful; QR code stored | Pass |
| 4 | Purchase Order Workflow & Auto Stock Update | PO status updates; stock increments on receipt; audit log created | PO workflow complete; stock updated; audit log confirmed | Pass |
| 5 | Quality Control & Recall Initiation | QC record stored; recall initiated; notification generated | QC record created; recall initiated; notification delivered | Pass |
| 6 | Real-Time Messaging via Socket.IO | Messages delivered in real-time; notification badge updates | Sub-second delivery confirmed; badge updated correctly | Pass |
| 7 | Compliance Snapshot Calculation | Snapshot created with all 5 metrics and correct overall score | All metrics calculated correctly; API response confirmed | Pass |
| 8 | PDF & CSV Report Generation | PDF and CSV files generated with accurate data | Both formats downloaded successfully with correct data | Pass |
| 9 | QR Code Generation & Browser Scanning | QR scannable via browser camera; decoded data matches batch | Successfully scanned on Android and iOS; data matched | Pass |
| 10 | Dashboard Analytics & Date Filter | KPI cards and charts display accurate data; filter updates charts | All KPIs correct; date filter updated all chart data | Pass |
| 11 | Two-Factor Authentication (2FA) | Valid TOTP grants access; invalid/expired TOTP rejected | Valid TOTP granted login; expired code rejected correctly | Pass |
| 12 | Expiry Intelligence & Low Stock Alerts | Near-expiry batches and low-stock materials appear in panels | Both panels displayed correct data from database | Pass |

Table 4.0 — PharmaLink Test Case Summary

All 12 test cases passed. No critical failures were encountered.

---

## 5.3 PERFORMANCE METRICS

| Module / Feature | Metric | Result | Status |
|---|---|---|---|
| User Login (JWT generation) | API Response Time | < 200ms | Pass |
| Product List (GET /api/products) | API Response Time | < 150ms | Pass |
| Batch List with date filter | API Response Time | < 250ms | Pass |
| Dashboard (5 parallel API calls) | Total Load Time | < 800ms | Pass |
| Socket.IO message delivery | Real-Time Latency | < 100ms | Pass |
| Socket.IO notification delivery | Real-Time Latency | < 150ms | Pass |
| PDF Report Generation | Generation Time | < 1.5s | Pass |
| CSV Export (Orders) | Generation Time | < 500ms | Pass |
| QR Code Generation (server-side) | Generation Time | < 300ms | Pass |
| Compliance Snapshot Calculation | Execution Time | < 500ms | Pass |
| Audit Log Query (paginated) | API Response Time | < 200ms | Pass |
| Global Search endpoint | API Response Time | < 300ms | Pass |

Table 6.0 — PharmaLink System Performance Metrics

---

## 5.4 RESULT ANALYSIS AND DISCUSSION

PharmaLink was evaluated based on key performance indicators including system functionality, operational efficiency, security robustness, real-time responsiveness, and compliance automation effectiveness.

**Functional Completeness:** All 17 planned modules were implemented and verified. The system demonstrated consistent performance across all core workflows — authentication, inventory management, procurement, quality control, compliance monitoring, and report generation.

**Security Validation:** JWT token generation, bcrypt password hashing, and TOTP 2FA all performed as expected. Unauthorized API access attempts were correctly rejected. Role-based access control correctly restricted Admin-only routes from Distributor users at both the React Router and Express.js middleware levels.

**Real-Time Performance:** Socket.IO messaging delivered messages with sub-100ms latency. The automated notification system correctly triggered and delivered notifications for all configured events without manual intervention.

**Compliance Automation:** The daily compliance snapshot correctly calculated composite scores across all five weighted metrics. The weighted formula produced accurate overall compliance scores reflecting the true operational state of the system.

**Comparative Advantage:** Compared to traditional pharmaceutical management methods (spreadsheets, disconnected ERP systems), PharmaLink provides instant automated inventory updates, real-time dashboards, automated daily compliance snapshots, and QR-based batch traceability — capabilities that manual systems fundamentally cannot match.

**Cost Effectiveness:** Built entirely on open-source technologies with zero framework licensing costs. Deployable on affordable cloud platforms (Render, Railway, MongoDB Atlas free tier), making it economically viable for small to mid-sized pharmaceutical organizations.

---

## 5.5 SCREENSHOTS

**Figure 12.0 — Admin Dashboard**
The Admin Dashboard displays four KPI stat cards (Total Products, Total Batches, Total Revenue in ₹, Pending Orders), a Production Volume bar chart grouped by product name, an Order Status donut pie chart, a Low Stock Alerts panel, and an Expiring in 30 Days panel — with a configurable date filter (Last 30/90/365 days / All time).

**Figure 13.0 — Inventory Management Module**
The Inventory module provides a searchable, paginated data table of all products with columns for Name, Type, SKU, Price Per Unit, and Storage Conditions. A "Add Product" button opens a Radix UI Dialog modal with a structured form for all product attributes.

**Figure 14.0 — Batch Management & QR Traceability**
The Batch Management module displays all batches with Batch ID, Product, Manufacturing Date, Expiry Date, Quantity, and Status (color-coded badge). Each batch includes a QR code modal for physical labeling and a hash chain viewer showing the tamper-evident event history.

**Figure 15.0 — Real-Time Messaging Interface**
The Messages module provides a WhatsApp-style chat interface with a user list sidebar and message thread. Messages are delivered in real-time via Socket.IO. The notification bell shows an unread count badge that updates instantly as new notifications arrive.

---

Parul University — Parul Institute of Technology
Department of Computer Science and Engineering
Academic Year: 2025-26
