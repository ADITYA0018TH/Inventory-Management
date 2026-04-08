# PharmaLink: A Blockchain-Inspired Pharmaceutical Supply Chain Management System with Advanced Analytics and Intelligent Compliance

## Aditya Raj
### *Computer Science and Engineering*
### *Parul University*
### *Vadodara, Gujarat, India*
### *2203051050671@paruluniversity.ac.in*
### *Project Guide – Prof. Ashish Patel*

---

### *1. Abstract*

**The pharmaceutical supply chain is one of the most regulation-intensive domains in modern industry, demanding end-to-end traceability, quality assurance, and rapid response to safety events such as product recalls. Existing systems are often fragmented, paper-based, or lack real-time visibility across stakeholders. This paper presents PharmaLink, a full-stack web application designed to digitize and intelligently manage the pharmaceutical supply chain — from raw material procurement to final product delivery.**

**PharmaLink integrates a blockchain-inspired SHA-256 hash chain for immutable batch lifecycle tracking, QR code-based product verification for anti-counterfeiting, role-based access control (RBAC) with JWT authentication and Time-based One-Time Password (TOTP) two-factor authentication, dual-model demand forecasting using Simple Moving Average (SMA) and Exponential Weighted Moving Average (EWMA), ABC inventory classification using the Pareto principle, real-time notifications via WebSocket (Socket.io), a weighted compliance scoring engine with historical trend tracking, automated supplier performance rating, recall impact analysis, and batch cost tracking with profit margin computation. The system is built on the MERN stack (MongoDB, Express.js, React, Node.js) with a RESTful API architecture and deployed as a single-page application.**

**Evaluation demonstrates that PharmaLink addresses critical gaps in pharmaceutical supply chain transparency, counterfeit drug detection, storage compliance monitoring, and regulatory audit readiness. The system further extends standard supply chain platforms with intelligent analytics including EWMA-based forecasting, compliance score history, automated supplier rating from purchase order delivery data, and financial impact quantification for product recalls — making enterprise-grade supply chain intelligence accessible to small and medium pharmaceutical manufacturers.**

*Keywords – Pharmaceutical Supply Chain, Blockchain Traceability, Inventory Management, Demand Forecasting, EWMA, Compliance Monitoring, MERN Stack, QR Code Verification, Real-Time Notifications, Role-Based Access Control, Good Manufacturing Practice, Supplier Performance, Recall Impact Analysis.*

---

### *2. INTRODUCTION*

The global pharmaceutical supply chain is a complex, multi-stakeholder ecosystem involving manufacturers, raw material suppliers, quality inspectors, warehouse operators, and distributors. According to the World Health Organization (WHO), approximately 10% of medicines in low- and middle-income countries are substandard or falsified [1]. Counterfeit drugs, improper storage conditions, expired products reaching consumers, and delayed recall responses are persistent challenges that cost lives and erode public trust in healthcare systems.

Traditional supply chain management in the pharmaceutical sector relies heavily on manual record-keeping, siloed ERP systems, and reactive quality control processes. These approaches fail to provide the real-time visibility and comprehensive audit trails required by regulatory bodies such as the U.S. Food and Drug Administration (FDA), the European Medicines Agency (EMA), and India's Central Drugs Standard Control Organisation (CDSCO). The absence of integrated digital systems creates blind spots across the supply chain, making it difficult to trace a product from raw material to end consumer.

To address these challenges, we propose PharmaLink — a web-based pharmaceutical supply chain management system that provides a unified platform for all supply chain stakeholders. The system is designed to assist pharmaceutical manufacturers and distributors in managing the complete product lifecycle with transparency, traceability, and regulatory compliance. By integrating a user-friendly web-based interface, administrators can manage production batches, monitor storage conditions, initiate recalls, and generate compliance reports in real time, while distributors can place orders, track shipments, and verify product authenticity.

The key contributions of this project include:

- A blockchain-inspired immutable hash chain for batch lifecycle tracking using SHA-256 cryptographic hashing
- QR code generation and public verification endpoint for anti-counterfeiting
- Dual-model demand forecasting using 3-month window SMA and Exponential Weighted Moving Average (EWMA, α=0.3)
- ABC inventory classification using MongoDB aggregation pipelines
- A weighted compliance scoring engine across five GMP-aligned dimensions with historical snapshot tracking
- Real-time push notifications using WebSocket (Socket.io)
- Role-based access control (RBAC) with JWT authentication, TOTP-based 2FA, and expanded roles (quality_inspector, warehouse_manager)
- Comprehensive audit logging for regulatory readiness
- First-Expired-First-Out (FEFO) batch suggestion and expiry heatmap intelligence
- Automated supplier performance rating computed from purchase order delivery history
- Recall impact analysis quantifying units affected, percentage distributed, and estimated financial exposure
- Batch cost tracking with formula-based material cost breakdown and profit margin computation
- Compliance score history via daily snapshots enabling regulatory trend analysis
- Bulk CSV import for storage condition readings from laboratory data loggers
- Distributor analytics portal with spend trends, order status breakdown, and top product analysis

The remainder of this paper is organized as follows: Section 3 reviews related work. Section 4 describes the methodology. Section 5 presents the implementation. Section 6 covers deployment and maintenance. Section 7 discusses results. Section 8 concludes with future directions.

---

### *3. LITERATURE REVIEW*

The rapid advancement of web technologies and distributed ledger concepts has opened new possibilities for pharmaceutical supply chain digitization. Existing research spans blockchain traceability, demand forecasting, inventory classification, and compliance management, each of which informs the design of PharmaLink.

Sylim et al. [2] proposed a blockchain-based drug traceability system using Ethereum smart contracts, demonstrating improved supply chain transparency but noting significant computational overhead and infrastructure requirements. MediLedger [3], an industry consortium, uses a permissioned blockchain for prescription drug verification across major pharmaceutical distributors. However, full blockchain deployment requires consensus mechanisms and distributed node infrastructure that may be impractical for small-to-medium manufacturers.

Research by Hasan et al. [4] introduced the concept of lightweight blockchain patterns — using cryptographic hash chains stored in conventional databases — to achieve tamper-evidence and auditability without the overhead of a distributed consensus network. PharmaLink adopts this approach, implementing SHA-256 hash chains within MongoDB documents, providing verifiable batch provenance at a fraction of the infrastructure cost.

In the domain of demand forecasting, Chopra and Meindl [5] established Simple Moving Average (SMA) and Exponential Smoothing as foundational baseline methods for supply chain planning. While machine learning approaches such as LSTM and ARIMA offer higher accuracy on large datasets, Makridakis et al. [6] demonstrated that SMA provides a practical, interpretable baseline appropriate for systems with limited historical data — consistent with the operational context of small pharmaceutical manufacturers.

ABC analysis, derived from the Pareto principle, has been widely adopted for inventory prioritization in supply chains [7]. By classifying products into categories A (top 80% of revenue), B (next 15%), and C (remaining 5%), organizations can focus procurement and safety stock policies on high-value items. PharmaLink integrates this classification directly into its analytics dashboard using real-time MongoDB aggregation.

Regarding compliance and quality management, existing enterprise QMS platforms such as MasterControl and Veeva Vault provide comprehensive regulatory documentation capabilities but are expensive and not integrated with supply chain operations. Studies by Kumar et al. [8] highlight the need for integrated compliance scoring that spans quality control, storage monitoring, and recall management — a gap that PharmaLink's weighted compliance engine directly addresses.

The significance of real-time communication in supply chain systems has been demonstrated by Ivanov et al. [9], who showed that immediate notification of disruptions (stockouts, recalls, quality failures) significantly reduces response time and downstream impact. PharmaLink implements this through Socket.io WebSocket connections, enabling sub-second notification delivery to affected stakeholders.

Building on these insights, PharmaLink integrates blockchain-inspired traceability, SMA-based forecasting, ABC classification, weighted compliance scoring, and real-time notifications into a unified MERN stack platform — providing a practical, accessible, and comprehensive solution for pharmaceutical supply chain management.

---

### *4. METHODOLOGY*

This section outlines the approach used to develop PharmaLink. The methodology includes defining system requirements, designing the architecture, selecting appropriate technologies, modeling the data, implementing core algorithms, and evaluating system performance. The goal is to build a reliable, traceable, and compliance-ready pharmaceutical supply chain management system.

#### 1. Requirements Analysis

The primary objective of PharmaLink is to provide a digitized, end-to-end pharmaceutical supply chain management platform with built-in traceability, quality assurance, and regulatory compliance capabilities. The system is designed to serve two primary user roles: pharmaceutical manufacturers (Admin) and distributors.

The key requirements for the system include:

- **Batch Traceability:** Every production batch must be assigned a cryptographic hash chain recording all lifecycle events, enabling tamper-evident provenance tracking.
- **Anti-Counterfeiting:** Each batch must generate a QR code that can be publicly scanned to verify product authenticity without requiring system login.
- **Inventory Management:** The system must track raw materials, finished products, and warehouse stock with automated low-stock threshold alerts.
- **Quality Control:** Multi-parameter quality check records must be maintained per batch, with pass/fail tracking and batch status progression.
- **Storage Compliance:** Temperature and humidity readings must be logged per batch and automatically flagged as violations when outside product-defined storage conditions.
- **Demand Forecasting:** The system must provide per-product demand predictions using historical order data to support production planning.
- **Compliance Scoring:** A quantitative compliance score must be computed across five regulatory dimensions to assess audit readiness.
- **Security:** Role-based access control, JWT authentication, TOTP-based 2FA, bcrypt password hashing, and comprehensive audit logging must be implemented.
- **Real-Time Notifications:** Stakeholders must receive immediate push notifications for critical events such as order status changes, low stock alerts, and recall initiations.

#### 2. System Architecture

PharmaLink follows a three-tier client-server architecture with a clear separation of concerns across presentation, application, and data layers.

```
┌──────────────────────────────────────────────────────┐
│               React Frontend (SPA)                    │
│  Vite + Tailwind CSS + Recharts + Socket.io Client    │
└─────────────────────┬────────────────────────────────┘
                      │  HTTP REST / WebSocket
┌─────────────────────▼────────────────────────────────┐
│           Node.js + Express.js API Server             │
│  JWT Auth │ RBAC │ Socket.io │ PDFKit │ QRCode        │
└─────────────────────┬────────────────────────────────┘
                      │  Mongoose ODM
┌─────────────────────▼────────────────────────────────┐
│                  MongoDB Atlas                         │
│  Products │ Batches │ Orders │ Users │ AuditLogs ...   │
└──────────────────────────────────────────────────────┘
```

Fig. 1. System Architecture Diagram

The overall workflow for a batch lifecycle consists of:

1. **Raw Material Procurement:** Admin creates purchase orders for suppliers; materials are received and stocked in warehouses.
2. **Batch Production:** Admin creates a batch; the system atomically deducts raw materials per the product formula and generates a QR code and genesis hash block.
3. **Quality Control:** Inspector records multi-parameter QC tests; batch status progresses from "Quality Check" to "Released" upon passing.
4. **Storage Monitoring:** Temperature and humidity readings are logged; violations are automatically detected and flagged.
5. **Distribution:** Distributor places an order; admin approves and ships; distributor tracks shipment status in real time.
6. **Post-Market Surveillance:** Admin initiates recalls with automatic email notification to affected distributors; returns are processed and resolved.

Fig. 2. Batch Lifecycle Activity Diagram

#### 3. Technology Stack

The project leverages a modern JavaScript-based full-stack architecture:

- **Frontend Framework:** React 19 with Vite build tool
- **Styling:** Tailwind CSS v4 with Radix UI primitives
- **Data Visualization:** Recharts library
- **Real-Time Communication:** Socket.io (client and server)
- **Backend Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT), bcryptjs, speakeasy (TOTP 2FA)
- **QR Code Generation:** qrcode (Node.js)
- **Document Export:** PDFKit (PDF), json2csv (CSV)
- **Email Notifications:** Nodemailer
- **Deployment:** MongoDB Atlas (cloud database), Vite production build

#### 4. Data Modeling

PharmaLink defines 17 MongoDB collections to represent all supply chain entities:

| Collection | Purpose |
|---|---|
| User | Authentication, roles (admin, distributor, quality_inspector, warehouse_manager), 2FA |
| Product | Product catalog with formula, storage conditions, QC test templates, material costs |
| RawMaterial | Raw material inventory with threshold alerts |
| Batch | Production batches with hash chain and QR code |
| Order | Distributor orders with shipment tracking |
| PurchaseOrder | Supplier procurement orders |
| Supplier | Supplier registry with manual and auto-calculated ratings |
| QualityCheck | QC test results per batch (product-defined test templates) |
| StorageLog | Temperature/humidity readings with violation flags |
| Warehouse | Warehouse registry |
| WarehouseStock | Per-warehouse material stock levels |
| Recall | Product recall management with impact analysis |
| Return | Order return processing |
| AuditLog | Immutable action log for all system events |
| Notification | Real-time user notifications |
| Message | Inter-user messaging |
| ComplianceSnapshot | Daily compliance score snapshots for trend analysis |

Table 1. MongoDB Data Collections

#### 5. Core Algorithms

**5.1 Blockchain-Inspired Hash Chain**

Each batch is assigned a cryptographic hash chain. For every lifecycle event, a SHA-256 hash is computed over the event data and the previous block's hash:

```
H_n = SHA256(event_n || previousHash_{n-1} || timestamp_n)
```

The genesis block uses `previousHash = "0"`. Chain integrity is verified by confirming the `previousHash` linkage across all blocks. Any tampering with a historical event invalidates all subsequent hashes, making unauthorized modifications detectable.

**5.2 Demand Forecasting (SMA and EWMA)**

PharmaLink implements two complementary forecasting models over a 12-month historical window.

Simple Moving Average (3-month window):

```
SMA_t = (D_{t-1} + D_{t-2} + D_{t-3}) / 3
```

Exponential Weighted Moving Average (α = 0.3):

```
EWMA_t = α × D_t + (1 − α) × EWMA_{t-1}
```

Where `D_t` is the actual order quantity in month `t` and α = 0.3 weights recent observations more heavily than older ones. Both models generate a 3-month forward forecast. EWMA is more responsive to recent demand shifts, while SMA provides a stable baseline. Both series are rendered simultaneously on the forecasting dashboard, enabling planners to compare model outputs before making production decisions.

**5.3 ABC Inventory Classification**

Products are classified by cumulative revenue contribution:

1. Aggregate revenue per product: `Revenue_p = Σ (quantity × pricePerUnit)`
2. Sort by revenue descending and compute cumulative percentage.
3. Assign: Category A (≤ 80%), B (≤ 95%), C (> 95%).

**5.4 Compliance Scoring Engine**

A weighted compliance score is computed across five regulatory dimensions:

| Metric | Formula | Weight |
|---|---|---|
| Batch Testing Rate | (Tested Batches / Total Batches) × 100 | 25% |
| Expiry Management | (Non-expired Released / Released Batches) × 100 | 20% |
| Storage Compliance | (Non-violation Logs / Total Logs) × 100 | 25% |
| Recall Response Rate | (Completed Recalls / Total Recalls) × 100 | 15% |
| Order Fulfillment Rate | (Delivered / (Total − Cancelled)) × 100 | 15% |

```
Overall Score = 0.25×TestingRate + 0.20×ExpiryScore + 0.25×StorageScore
              + 0.15×RecallScore + 0.15×FulfillmentRate
```

Table 2. Compliance Scoring Weights

**5.5 FEFO Expiry Intelligence**

Batches are suggested in First-Expired-First-Out order, sorted by earliest expiry date. An expiry heatmap categorizes active batches into four urgency windows: Expired, Critical (≤ 30 days), Warning (31–60 days), and Caution (61–90 days).

**5.6 Automated Supplier Performance Rating**

Supplier ratings are auto-calculated from purchase order delivery history rather than relying on manual input:

```
DeliveryRate = ReceivedPOs / TotalSentPOs
AutoRating = round(DeliveryRate × 5)  [clamped to 1–5]
```

The effective rating displayed is the auto-calculated value when PO history exists, falling back to the manually set rating otherwise. A supplier performance panel shows total POs, received count, pending count, total value, and delivery rate.

**5.7 Recall Impact Analysis**

When a recall is initiated, the system computes a financial and operational impact report:

```
TotalUnitsAffected = Σ quantity for all orders containing the recalled batch
PercentageDistributed = (TotalUnitsAffected / BatchQuantityProduced) × 100
EstimatedFinancialImpact = TotalUnitsAffected × pricePerUnit
```

This transforms the recall module from a notification tool into a decision-support system, providing quantified exposure data for regulatory reporting.

**5.8 Batch Cost Tracking**

Each batch's production cost is computed from the product formula and per-material cost configuration:

```
LineCost_i = quantityRequired_i × quantityProduced × costPerUnit_i
TotalBatchCost = Σ LineCost_i
CostPerProducedUnit = TotalBatchCost / quantityProduced
ProfitMargin = ((sellingPrice − costPerProducedUnit) / sellingPrice) × 100
```

This enables profit margin analysis per batch and per product, supporting pricing and production efficiency decisions.

**5.9 Compliance Score History**

A `ComplianceSnapshot` document is saved daily via a server-side interval, recording all five metric values and the weighted overall score with a timestamp. The compliance dashboard renders a multi-line trend chart over the last 30 snapshots, enabling administrators to track regulatory readiness over time and identify degradation before inspections.

---

### *5. IMPLEMENTATION*

The implementation of PharmaLink involves the integration of the frontend dashboard, RESTful API backend, real-time WebSocket layer, and MongoDB database to deliver a functional and secure pharmaceutical supply chain management platform.

#### 1. Frontend Development

The user interface is developed using React 19 with Vite, providing a fast, modular single-page application. The admin dashboard comprises 19 pages covering all supply chain modules. Tailwind CSS v4 provides utility-first styling, while Recharts renders interactive data visualizations including line charts for sales trends and forecasting, bar charts for production volume, and pie charts for ABC classification.

The distributor portal provides a separate interface for order placement, shipment tracking, product verification via QR scan, and return management. React Router v7 handles client-side routing with protected routes enforcing role-based access at the UI level.

Fig. 3. Admin Dashboard Interface

#### 2. Backend API Implementation

The backend exposes 20 RESTful API route groups:

`/api/auth`, `/api/products`, `/api/raw-materials`, `/api/batches`, `/api/orders`, `/api/purchase-orders`, `/api/suppliers`, `/api/quality`, `/api/storage`, `/api/warehouses`, `/api/recalls`, `/api/returns`, `/api/compliance`, `/api/forecasting`, `/api/analytics`, `/api/reports`, `/api/export`, `/api/audit`, `/api/notifications`, `/api/messages`

All protected routes require a Bearer JWT token in the Authorization header. Admin-only routes additionally enforce the `adminOnly` middleware, returning HTTP 403 for unauthorized access attempts.

#### 3. Batch Creation and Hash Chain

Batch creation uses MongoDB ACID transactions to atomically deduct raw materials according to the product formula and create the batch with its genesis hash block. The transaction is rolled back entirely if any material has insufficient stock, maintaining inventory consistency.

```javascript
// Atomic batch creation with formula-based material deduction
const session = await mongoose.startSession();
session.startTransaction();
// Deduct each ingredient: totalRequired = quantityRequired × quantityProduced
// Generate genesis hash and QR code
// Commit or rollback atomically
```

Each subsequent status change (Quality Check → Released → Shipped) appends a new hash block to the chain, creating an immutable audit trail of the batch lifecycle.

Fig. 4. Batch Hash Chain Viewer

#### 4. Security Implementation

The security architecture implements multiple layers of protection:

- **JWT Authentication:** Stateless tokens with role claims (admin/distributor) and 7-day expiry embedded in the payload.
- **Two-Factor Authentication:** TOTP-based 2FA using the speakeasy library. Setup generates a QR code for authenticator app enrollment. Login with 2FA enabled issues a short-lived 5-minute temporary token, requiring TOTP validation before issuing the full session token.
- **Password Security:** bcryptjs with salt rounds for all stored credentials; current password verification required for password changes.
- **Audit Logging:** Every significant action is recorded in the AuditLog collection with user identity, entity type, entity ID, human-readable description, and timestamp.
- **Account Management:** Admin can activate or deactivate distributor accounts; deactivated accounts are rejected at login.

#### 5. Real-Time Notification System

Socket.io manages persistent WebSocket connections between the server and connected clients. Upon login, each user registers their socket connection by user ID, joining a named room. Server-side events emit targeted notifications to specific user rooms, enabling immediate delivery without polling.

```javascript
// Server: emit to specific user
io.to(userId).emit('notification', { message, type, timestamp });

// Client: register on login
socket.emit('register', userId);
```

#### 6. Recall Management

When a recall is initiated, the system automatically identifies all distributors who received orders containing the affected batch, creates the recall record with FDA-style severity classification (Class I, II, or III), and dispatches HTML email notifications to all affected distributors via Nodemailer. The recall status progresses from Initiated → In Progress → Completed, with completion timestamp recorded for compliance reporting.

An impact analysis endpoint (`GET /api/recalls/:id/impact`) computes total units affected, percentage of the batch distributed, and estimated financial impact based on product price per unit. This data is rendered in an expandable impact panel on the recalls page.

#### 7. Storage Compliance Enhancements

The storage compliance module was extended with two capabilities. First, a temperature and humidity trend chart renders per-batch readings over time using Recharts `LineChart`, enabling visual identification of storage condition drift. Second, a bulk CSV import endpoint (`POST /api/storage/bulk-import`) accepts arrays of readings with automatic violation detection, supporting laboratories that export data from physical data loggers.

#### 8. Quality Control Templates

QC test templates are now defined per product rather than hardcoded in the frontend. The `Product` model includes a `qcTests` array of `{ name, description }` objects. When a QC inspection is opened, the frontend fetches product-specific tests via `GET /api/quality/templates/:batchId`, falling back to four default tests (Visual Inspection, pH Level, Dissolution, Assay) if no custom tests are defined.

#### 9. Distributor Analytics

A dedicated analytics portal was added for distributors, providing monthly spend trend (area chart), order status breakdown (donut chart), and top products ordered (bar chart) — all computed client-side from the distributor's order history. This gives distributors data-driven visibility into their own procurement patterns.

#### 10. Testing and Evaluation

To ensure the reliability and accuracy of PharmaLink, multiple testing methodologies were applied during development:

**Unit Testing:** Each individual API route and business logic function was tested independently to verify correct behavior, including hash chain generation, formula-based material deduction, compliance score calculation, and SMA forecasting.

**Integration Testing:** End-to-end data flow was verified across the frontend, API, and database layers. Critical workflows tested include batch creation with material deduction, order lifecycle from placement to delivery, and recall initiation with email dispatch.

**System Testing:** Complete workflow testing validated the full supply chain lifecycle from raw material procurement through production, quality control, distribution, and post-market surveillance.

**Security Testing:** Authentication flows were tested including JWT validation, 2FA setup and verification, role-based access enforcement, and account deactivation. Input validation was verified across all API endpoints.

**Performance Testing:** API response times were measured under concurrent load. MongoDB aggregation pipelines for compliance scoring, ABC analysis, and forecasting were optimized with appropriate indexes.

---

### *6. DEPLOYMENT AND MAINTENANCE*

#### 1. Deployment Strategy

- **Frontend:** Built using `vite build` producing optimized static assets, deployable to any static hosting service (Vercel, Netlify, or served via Express).
- **Backend:** Node.js Express server deployable to cloud platforms (Render, Railway, AWS EC2). Environment variables managed via `.env` for MongoDB URI, JWT secret, and email credentials.
- **Database:** MongoDB Atlas cloud-hosted cluster providing managed backups, auto-scaling, and global distribution.
- **Scalability:** The stateless JWT authentication and Socket.io architecture support horizontal scaling behind a load balancer with Redis adapter for multi-instance WebSocket coordination.

Fig. 5. PharmaLink Web Interface — Compliance Dashboard

#### 2. Maintenance and Support

- **Bug Fixes:** Issues are tracked and resolved through version-controlled releases; the modular route structure isolates changes to specific modules.
- **Security Updates:** JWT secrets and bcrypt salt rounds are configurable via environment variables, enabling rotation without code changes. Dependencies are monitored for CVEs.
- **Performance Optimization:** MongoDB indexes on frequently queried fields (batchId, orderDate, distributorId) ensure consistent query performance as data volume grows.
- **Audit Trail Integrity:** The AuditLog collection is append-only by design; no update or delete operations are exposed through the API, preserving the integrity of the compliance record.

#### 3. System Updates and Enhancements

- **IoT Sensor Integration:** Future updates will include automated temperature and humidity logging from warehouse IoT sensors via MQTT, eliminating manual data entry for storage compliance.
- **Mobile Application:** A React Native companion app for distributors and field inspectors will enable QR scanning and order management on mobile devices.
- **Distributed Blockchain:** Anchoring batch hash roots to a public or permissioned blockchain (e.g., Hyperledger Fabric) will provide stronger tamper-evidence guarantees independent of the database administrator.

---

### *7. RESULTS AND DISCUSSION*

#### 1. Functional Coverage

PharmaLink successfully implements the complete pharmaceutical supply chain lifecycle across six operational phases:

- **Procurement:** Raw material management with threshold alerts, supplier registry with ratings, purchase order workflow (Draft → Approved → Sent → Received).
- **Production:** Formula-based batch creation with atomic raw material deduction, QR code generation, and genesis hash block creation.
- **Quality Assurance:** Multi-parameter QC records per batch, pass/fail tracking, batch status progression through defined lifecycle states.
- **Distribution:** Order management (Pending → Approved → Shipped → Delivered), PDF invoice generation, shipment tracking with timestamped location history.
- **Post-Market Surveillance:** Recall management with Class I/II/III severity classification, automated distributor email notification, return processing.
- **Analytics and Compliance:** Demand forecasting with SMA charts, ABC inventory classification, weighted compliance scoring, 10-item audit readiness checklist.

#### 2. Traceability and Anti-Counterfeiting

The hash chain mechanism ensures that any modification to a historical batch event is detectable through chain integrity verification. The public QR verification endpoint (`/api/batches/verify/:batchId`) enables field-level authenticity checks by distributors and pharmacists without requiring system credentials, directly addressing the WHO-identified problem of falsified medicines in the supply chain.

Table 3. Batch Lifecycle Events Tracked in Hash Chain

| Event | Hash Block | Actor |
|---|---|---|
| Batch Created | Genesis block (previousHash = "0") | Admin |
| Status: Quality Check | Block 2 | Admin |
| Status: Released | Block 3 | Admin |
| Status: Shipped | Block 4 | Admin |

#### 3. Compliance Readiness

The compliance scoring engine provides a quantitative, real-time measure of regulatory readiness across five GMP-aligned dimensions. The 10-item audit readiness checklist maps directly to common pharmaceutical regulatory requirements, covering batch tracking, QC documentation, storage monitoring, recall procedures, digital audit trails, RBAC, QR traceability, and blockchain verification. This provides actionable gap identification ahead of regulatory inspections.

#### 4. Forecasting Performance

PharmaLink implements two complementary forecasting models. The 3-month SMA provides a stable, interpretable baseline, while EWMA (α=0.3) responds more quickly to recent demand shifts by weighting recent observations exponentially. Both models are computed server-side using MongoDB aggregation pipelines over a 12-month historical window and rendered simultaneously on the forecasting dashboard. This dual-model approach allows production planners to compare conservative (SMA) and responsive (EWMA) forecasts before committing to production schedules. While more sophisticated models (ARIMA, LSTM) may yield higher accuracy on larger datasets, SMA and EWMA offer full interpretability and zero external ML dependencies, making them appropriate for the operational context of small-to-medium pharmaceutical manufacturers.

#### 5. Security Assessment

The multi-layer security architecture — JWT authentication, TOTP 2FA, bcrypt password hashing, RBAC middleware, and comprehensive audit logging — addresses the core security requirements for pharmaceutical data systems. The 2FA implementation using a 5-minute temporary token for the intermediate authentication step prevents token replay attacks during the two-step login flow.

#### 6. Challenges

- **Hash Chain Storage:** The hash chain is stored in MongoDB, not a distributed ledger. A sufficiently privileged database administrator could theoretically modify records. Mitigation requires anchoring hash roots to a public blockchain.
- **Manual Storage Logging:** While bulk CSV import was added to reduce manual effort, fully automated storage monitoring still requires IoT sensor integration via MQTT.
- **Forecasting Seasonality:** Neither SMA nor EWMA accounts for seasonality or external demand drivers such as disease outbreaks or regulatory changes. Future work should explore ARIMA or LSTM models.
- **Role Granularity:** The system now supports four roles (admin, distributor, quality_inspector, warehouse_manager), but real-world deployments may require additional roles such as regulatory officer or logistics coordinator.

---

### *8. CONCLUSION*

PharmaLink successfully demonstrates that modern web technologies can deliver enterprise-grade pharmaceutical supply chain intelligence at a fraction of the cost of traditional ERP systems. By integrating a blockchain-inspired SHA-256 hash chain for batch traceability, QR code-based anti-counterfeiting, formula-driven atomic batch production, FEFO expiry intelligence, weighted GMP compliance scoring with historical trend tracking, dual-model demand forecasting (SMA and EWMA), ABC inventory classification, automated supplier performance rating, recall impact analysis, batch cost tracking with profit margin computation, and real-time WebSocket notifications into a unified MERN stack platform, PharmaLink addresses critical gaps in pharmaceutical supply chain transparency, counterfeit detection, and regulatory audit readiness.

The expanded role-based access control system — now supporting admin, distributor, quality_inspector, and warehouse_manager roles — with JWT authentication and TOTP two-factor authentication ensures that sensitive supply chain operations are protected against unauthorized access. The comprehensive audit logging system provides the immutable action trail required for regulatory inspections, while the compliance snapshot mechanism enables longitudinal tracking of regulatory readiness over time.

The system's web-based interface, built using React 19 and Tailwind CSS with a structured folder architecture (pages/auth, pages/admin, pages/distributor, pages/shared, components/layout, components/common), ensures maintainability and scalability. The modular RESTful API architecture with 20 route groups provides a clean separation of concerns and a foundation for future enhancements.

In conclusion, PharmaLink contributes to the advancement of pharmaceutical supply chain digitization by providing a practical, accessible, and analytically rich platform that makes traceability, compliance, and intelligent analytics available to organizations that cannot afford traditional enterprise pharmaceutical ERP systems. Future work will focus on distributed blockchain integration, IoT sensor connectivity for automated storage monitoring, advanced ML-based forecasting (ARIMA, LSTM), and a mobile companion application for field operations.

---

### *9. REFERENCES*

[1] World Health Organization, "A Study on the Public Health and Socioeconomic Impact of Substandard and Falsified Medical Products," WHO Press, 2017.

[2] P. Sylim, F. Liu, A. Marcelo, and P. Fontelo, "Blockchain technology for detecting falsified and substandard drugs in distribution: Pharmaceutical supply chain intervention," *JMIR Research Protocols*, vol. 7, no. 9, p. e10163, 2018.

[3] MediLedger Network, "MediLedger Project 2019 Progress Report," Chronicled Inc., 2019.

[4] H. R. Hasan, K. Salah, R. Jayaraman, R. W. Ahmad, I. Yaqoob, M. Omar, and S. Ellahham, "Blockchain-based solution for COVID-19 digital medical passports and immunity certificates," *IEEE Access*, vol. 8, pp. 222093–222108, 2020.

[5] S. Chopra and P. Meindl, *Supply Chain Management: Strategy, Planning, and Operation*, 6th ed. Pearson, 2016.

[6] S. Makridakis, S. C. Wheelwright, and R. J. Hyndman, *Forecasting: Methods and Applications*, 3rd ed. Wiley, 1998.

[7] T. Wild, *Best Practice in Inventory Management*, 3rd ed. Routledge, 2017.

[8] R. Kumar, S. Singh, and A. Sharma, "Integrated compliance management in pharmaceutical supply chains: A framework for GMP audit readiness," *J. Pharm. Policy Pract.*, 2022.

[9] D. Ivanov, A. Dolgui, and B. Sokolov, "The impact of digital technology and Industry 4.0 on the ripple effect and supply chain risk analytics," *Int. J. Prod. Res.*, vol. 57, no. 3, pp. 829–846, 2019.

[10] MongoDB Inc., "MongoDB Manual: Multi-Document ACID Transactions," MongoDB Documentation, 2023.

[11] R. G. Brown, *Smoothing, Forecasting and Prediction of Discrete Time Series*. Prentice-Hall, 1963. (Foundation reference for Exponential Weighted Moving Average)

[12] C. Colicchia and F. Strozzi, "Supply chain risk management: A new methodology for a systematic literature review," *Supply Chain Management: An International Journal*, vol. 17, no. 4, pp. 403–418, 2012.

[13] A. Dolgui, D. Ivanov, and M. Rozhkov, "Does the ripple effect influence the bullwhip effect? An integrated analysis of structural and operational dynamics in the supply chain," *Int. J. Prod. Res.*, vol. 58, no. 5, pp. 1285–1301, 2020.
