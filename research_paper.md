# PharmaLink: A Blockchain-Inspired Pharmaceutical Supply Chain Management System with Real-Time Traceability and Compliance Intelligence

---

**Abstract**

The pharmaceutical supply chain is one of the most regulation-intensive domains in modern industry, demanding end-to-end traceability, quality assurance, and rapid response to safety events such as product recalls. Existing systems are often fragmented, paper-based, or lack real-time visibility across stakeholders. This paper presents PharmaLink, a full-stack web application designed to digitize and intelligently manage the pharmaceutical supply chain — from raw material procurement to final product delivery. PharmaLink integrates a blockchain-inspired hash chain for batch traceability, QR code-based product verification, role-based access control, demand forecasting using Simple Moving Average (SMA), ABC inventory classification, real-time notifications via WebSockets, and a weighted compliance scoring engine. The system is built on a MERN stack (MongoDB, Express.js, React, Node.js) with a RESTful API architecture. Evaluation demonstrates that PharmaLink addresses critical gaps in pharmaceutical supply chain transparency, counterfeit detection, and regulatory audit readiness.

**Keywords:** Pharmaceutical Supply Chain, Blockchain Traceability, Inventory Management, Demand Forecasting, Compliance Monitoring, MERN Stack, QR Code Verification, Real-Time Notifications

---

## 1. Introduction

The global pharmaceutical supply chain is a complex, multi-stakeholder ecosystem involving manufacturers, raw material suppliers, quality inspectors, warehouse operators, and distributors. According to the World Health Organization (WHO), approximately 10% of medicines in low- and middle-income countries are substandard or falsified [1]. Counterfeit drugs, improper storage, expired products reaching consumers, and delayed recall responses are persistent challenges that cost lives and erode public trust.

Traditional supply chain management in the pharmaceutical sector relies heavily on manual record-keeping, siloed ERP systems, and reactive quality control. These approaches fail to provide the real-time visibility and audit trails required by regulatory bodies such as the U.S. Food and Drug Administration (FDA), the European Medicines Agency (EMA), and India's Central Drugs Standard Control Organisation (CDSCO).

Recent advances in web technologies, distributed ledger concepts, and data analytics offer an opportunity to build integrated, intelligent supply chain platforms. This paper presents PharmaLink, a web-based pharmaceutical supply chain management system that addresses these challenges through:

- A blockchain-inspired immutable hash chain for batch lifecycle tracking
- QR code generation and verification for anti-counterfeiting
- Automated demand forecasting using Simple Moving Average
- ABC analysis for inventory prioritization
- A weighted compliance scoring engine
- Real-time notifications using WebSocket (Socket.io)
- Role-based access control (RBAC) with JWT authentication and Two-Factor Authentication (2FA)
- Comprehensive audit logging for regulatory readiness

The remainder of this paper is organized as follows: Section 2 reviews related work. Section 3 describes the system architecture. Section 4 details the key modules and algorithms. Section 5 presents the implementation. Section 6 discusses results and evaluation. Section 7 concludes with future directions.

---

## 2. Related Work

### 2.1 Blockchain in Pharmaceutical Supply Chains

Numerous studies have explored blockchain for pharmaceutical traceability. Sylim et al. [2] proposed a blockchain-based drug traceability system using Ethereum smart contracts, demonstrating improved transparency but noting high computational overhead. MediLedger [3], an industry consortium, uses a permissioned blockchain for prescription drug verification. However, full blockchain deployment requires significant infrastructure and consensus mechanisms that may be impractical for small-to-medium pharmaceutical manufacturers.

PharmaLink adopts a blockchain-inspired approach — using SHA-256 cryptographic hash chains stored in a document database — achieving tamper-evidence and auditability without the overhead of a distributed consensus network. This design is consistent with the "lightweight blockchain" pattern described by Hasan et al. [4].

### 2.2 Demand Forecasting in Supply Chains

Demand forecasting is critical for pharmaceutical inventory management to prevent stockouts and overstock. Simple Moving Average (SMA) and Exponential Smoothing are widely used baseline methods [5]. While machine learning approaches (LSTM, ARIMA) offer higher accuracy, they require large historical datasets. For systems with limited historical data, SMA provides a practical, interpretable baseline [6]. PharmaLink implements a 3-month window SMA with a 3-month forward forecast, appropriate for the data volumes typical of small-to-medium manufacturers.

### 2.3 ABC Inventory Classification

ABC analysis, derived from the Pareto principle, classifies inventory items by their contribution to total revenue: Category A (top 80%), B (next 15%), C (remaining 5%) [7]. This classification guides procurement priorities and safety stock policies. PharmaLink integrates ABC analysis directly into its analytics dashboard, enabling data-driven inventory decisions.

### 2.4 Compliance and Quality Management Systems

Regulatory compliance in pharmaceuticals requires documented quality control, storage condition monitoring, and recall management. Existing Quality Management Systems (QMS) such as MasterControl and Veeva Vault are enterprise-grade but expensive and not tailored for integrated supply chain visibility. PharmaLink provides an open, integrated compliance scoring engine that quantifies regulatory readiness across five dimensions.

---

## 3. System Architecture

### 3.1 Overview

PharmaLink follows a three-tier client-server architecture:

1. **Presentation Layer** — React.js (v19) single-page application with Tailwind CSS, Recharts for data visualization, and Socket.io client for real-time updates.
2. **Application Layer** — Node.js with Express.js RESTful API server, handling business logic, authentication, and data processing.
3. **Data Layer** — MongoDB (via Mongoose ODM) for flexible document storage of supply chain entities.

```
┌─────────────────────────────────────────────────────┐
│                  React Frontend (SPA)                │
│   Vite + Tailwind CSS + Recharts + Socket.io Client  │
└────────────────────────┬────────────────────────────┘
                         │ HTTP REST / WebSocket
┌────────────────────────▼────────────────────────────┐
│              Node.js + Express.js API Server         │
│   JWT Auth │ RBAC │ Socket.io │ PDFKit │ QRCode      │
└────────────────────────┬────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────┐
│                    MongoDB Atlas                      │
│  Products │ Batches │ Orders │ Users │ AuditLogs ...  │
└─────────────────────────────────────────────────────┘
```

### 3.2 User Roles

The system defines two primary roles:

- **Admin (Manufacturer):** Full access to all modules — production, quality control, inventory, analytics, compliance, and user management.
- **Distributor:** Access to order placement, shipment tracking, returns, and product verification.

### 3.3 Data Models

PharmaLink defines 16 MongoDB collections:

| Collection | Purpose |
|---|---|
| User | Authentication, roles, 2FA |
| Product | Product catalog with formula and storage conditions |
| RawMaterial | Raw material inventory with threshold alerts |
| Batch | Production batches with hash chain and QR code |
| Order | Distributor orders with shipment tracking |
| PurchaseOrder | Supplier procurement orders |
| Supplier | Supplier registry with ratings |
| QualityCheck | QC test results per batch |
| StorageLog | Temperature/humidity readings with violation flags |
| Warehouse | Warehouse registry |
| WarehouseStock | Per-warehouse material stock levels |
| Recall | Product recall management |
| Return | Order return and recall processing |
| AuditLog | Immutable action log for all system events |
| Notification | Real-time user notifications |
| Message | Inter-user messaging |

---

## 4. Key Modules and Algorithms

### 4.1 Blockchain-Inspired Batch Traceability

Each pharmaceutical batch in PharmaLink is assigned a cryptographic hash chain that records every lifecycle event — creation, quality check, status transitions, and shipment. This provides tamper-evident traceability without requiring a distributed blockchain network.

**Hash Generation Algorithm:**

For each event in the batch lifecycle, a SHA-256 hash is computed over the event data and the previous block's hash:

```
H_n = SHA256(event_n || previousHash_{n-1} || timestamp_n)
```

The genesis block uses `previousHash = "0"`. Chain integrity is verified by re-computing each hash and confirming the `previousHash` linkage:

```javascript
for (let i = 1; i < chain.length; i++) {
    if (chain[i].previousHash !== chain[i-1].hash) {
        isValid = false; break;
    }
}
```

This design ensures that any tampering with a historical event invalidates all subsequent hashes, making unauthorized modifications detectable.

**Atomic Batch Creation with Raw Material Deduction:**

Batch creation uses MongoDB transactions to atomically deduct raw materials according to the product formula:

```
totalRequired = ingredient.quantityRequired × quantityProduced
```

If any material has insufficient stock, the entire transaction is rolled back, maintaining inventory consistency.

### 4.2 QR Code-Based Anti-Counterfeiting

Each batch is assigned a QR code encoding the batch ID, product name, type, manufacturing date, expiry date, and a manufacturer identifier. Distributors and end-users can scan the QR code to verify authenticity via a public endpoint (`/api/batches/verify/:batchId`) that does not require authentication, enabling field verification without system access.

### 4.3 Demand Forecasting (Simple Moving Average)

PharmaLink implements a 3-month window Simple Moving Average for demand prediction:

```
SMA_t = (D_{t-1} + D_{t-2} + D_{t-3}) / 3
```

Where `D_t` is the actual demand (order quantity) in month `t`. The system generates a 3-month forward forecast by iteratively applying SMA, using predicted values as inputs for subsequent months. Historical data is aggregated from the Orders collection using MongoDB aggregation pipelines, grouping by product and calendar month.

This approach provides interpretable, low-latency forecasts suitable for operational planning without requiring external ML infrastructure.

### 4.4 ABC Inventory Classification

The ABC analysis module classifies products by their cumulative revenue contribution using the Pareto principle:

1. Aggregate total revenue per product from all fulfilled orders: `Revenue_p = Σ (quantity × pricePerUnit)`
2. Sort products by revenue in descending order.
3. Compute cumulative revenue percentage.
4. Assign categories: A (≤ 80%), B (≤ 95%), C (> 95%).

This classification is computed on-demand via MongoDB aggregation pipelines with `$lookup` joins across Orders and Products collections.

### 4.5 Compliance Scoring Engine

PharmaLink computes a weighted compliance score across five regulatory dimensions:

| Metric | Formula | Weight |
|---|---|---|
| Batch Testing Rate | (Tested Batches / Total Batches) × 100 | 25% |
| Expiry Management | (Non-expired Released Batches / Released Batches) × 100 | 20% |
| Storage Compliance | (Non-violation Logs / Total Logs) × 100 | 25% |
| Recall Response Rate | (Completed Recalls / Total Recalls) × 100 | 15% |
| Order Fulfillment Rate | (Delivered Orders / (Total − Cancelled)) × 100 | 15% |

```
Overall Score = 0.25×TestingRate + 0.20×ExpiryScore + 0.25×StorageScore
              + 0.15×RecallScore + 0.15×FulfillmentRate
```

The compliance module also generates an audit readiness checklist with 10 items covering batch tracking, QC documentation, storage monitoring, recall procedures, digital audit trails, RBAC, QR traceability, and blockchain verification.

### 4.6 Expiry Intelligence (FEFO)

PharmaLink implements First-Expired-First-Out (FEFO) batch suggestion, returning available batches for a product sorted by earliest expiry date. An expiry heatmap categorizes batches into four urgency windows: Expired, Critical (≤30 days), Warning (31–60 days), and Caution (61–90 days).

### 4.7 Real-Time Notifications

Socket.io is used to push real-time notifications to connected users. Each user registers their socket connection by user ID upon login. Server-side events (e.g., order status changes, low stock alerts, recall initiations) emit targeted notifications to the relevant user's socket room, enabling immediate awareness without polling.

### 4.8 Security Architecture

- **JWT Authentication:** Stateless token-based authentication with role claims embedded in the payload.
- **Role-Based Access Control:** Middleware enforces admin-only access on sensitive routes (analytics, compliance, user management, batch creation).
- **Two-Factor Authentication (2FA):** TOTP-based 2FA using the `speakeasy` library for admin accounts.
- **Password Hashing:** bcryptjs with salt rounds for secure credential storage.
- **Audit Logging:** Every significant action (batch creation, order approval, recall initiation, user management) is recorded in the AuditLog collection with user identity, entity, and timestamp.

---

## 5. Implementation

### 5.1 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts, Lucide React |
| State/Routing | React Router v7, React Context API |
| Real-time | Socket.io (client + server) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Authentication | JSON Web Tokens (JWT), bcryptjs, speakeasy (2FA) |
| PDF/Export | PDFKit, json2csv |
| QR Code | qrcode (Node.js) |
| Email | Nodemailer |
| UI Components | Radix UI primitives, shadcn/ui pattern |

### 5.2 API Design

The backend exposes 20 RESTful API route groups:

`/api/auth`, `/api/products`, `/api/raw-materials`, `/api/batches`, `/api/orders`, `/api/purchase-orders`, `/api/suppliers`, `/api/quality`, `/api/storage`, `/api/warehouses`, `/api/recalls`, `/api/returns`, `/api/compliance`, `/api/forecasting`, `/api/analytics`, `/api/reports`, `/api/export`, `/api/audit`, `/api/notifications`, `/api/messages`

All protected routes require a Bearer JWT token. Admin-only routes additionally enforce the `adminOnly` middleware.

### 5.3 Frontend Modules

The admin dashboard includes 19 pages:

- Dashboard (KPI overview, charts)
- Inventory, Products, Raw Materials
- Batches (with hash chain viewer and QR display)
- Orders, Purchase Orders
- Suppliers, Warehouses
- Quality Control
- Storage Compliance (temperature/humidity logs)
- Recalls, Returns
- Forecasting (SMA charts)
- Expiry Intelligence (heatmap)
- Compliance (score dashboard + audit checklist)
- Reports, Audit Log
- User Management

Distributors have a separate portal for order management, shipment tracking, and product verification.

### 5.4 Development Environment

- Node.js v20+, MongoDB Atlas (cloud-hosted)
- Frontend served via Vite dev server; production build via `vite build`
- Environment configuration via `.env` (MongoDB URI, JWT secret, email credentials)

---

## 6. Results and Discussion

### 6.1 Functional Coverage

PharmaLink successfully implements the full pharmaceutical supply chain lifecycle:

- **Procurement:** Raw material management, supplier registry, purchase order workflow (Draft → Approved → Sent → Received)
- **Production:** Formula-based batch creation with atomic raw material deduction, QR code generation, and genesis hash block
- **Quality Assurance:** Multi-test QC records per batch, pass/fail tracking, batch status progression
- **Distribution:** Order management (Pending → Approved → Shipped → Delivered), invoice generation, shipment tracking with location history
- **Post-Market:** Recall management (Class I/II/III severity), return processing, expiry monitoring
- **Analytics:** Demand forecasting, ABC classification, compliance scoring, audit readiness

### 6.2 Traceability and Anti-Counterfeiting

The hash chain mechanism ensures that any modification to a historical batch event is detectable. The chain integrity verification endpoint provides a binary `isValid` result, enabling rapid audit checks. QR code verification is publicly accessible, supporting field-level authenticity checks by distributors and pharmacists without requiring system credentials.

### 6.3 Compliance Readiness

The compliance scoring engine provides a quantitative, real-time measure of regulatory readiness. The audit checklist maps directly to common pharmaceutical regulatory requirements (GMP documentation, storage monitoring, recall procedures, access controls, traceability), providing actionable gap identification.

### 6.4 Forecasting Accuracy

The 3-month SMA provides a practical baseline for demand planning. While more sophisticated models (ARIMA, LSTM) may yield higher accuracy on larger datasets, SMA offers interpretability and zero external dependencies, making it appropriate for the operational context of small-to-medium pharmaceutical manufacturers.

### 6.5 Limitations

- The hash chain is stored in MongoDB, not a distributed ledger. A sufficiently privileged database administrator could theoretically modify records. Mitigation would require anchoring hash roots to a public blockchain.
- The SMA forecasting model does not account for seasonality or external demand drivers. Future work should explore ARIMA or ML-based forecasting.
- The system currently supports two roles (admin, distributor). Real-world deployments may require additional roles (warehouse manager, quality inspector, regulatory officer).
- Storage condition monitoring relies on manual data entry; integration with IoT sensors would enable automated, continuous monitoring.

---

## 7. Conclusion and Future Work

This paper presented PharmaLink, a comprehensive pharmaceutical supply chain management system that integrates blockchain-inspired traceability, QR-based anti-counterfeiting, demand forecasting, ABC inventory analysis, compliance scoring, and real-time notifications into a unified MERN stack web application. The system addresses critical gaps in pharmaceutical supply chain transparency, counterfeit detection, and regulatory audit readiness.

Future work will focus on:

1. **Distributed Blockchain Integration:** Anchoring batch hash roots to a public or permissioned blockchain (e.g., Hyperledger Fabric) for stronger tamper-evidence guarantees.
2. **IoT Sensor Integration:** Automated temperature and humidity logging from warehouse sensors via MQTT or HTTP endpoints.
3. **Advanced Forecasting:** Replacing SMA with ARIMA or LSTM models, incorporating seasonality and external demand signals.
4. **Mobile Application:** A React Native companion app for distributors and field inspectors, enabling QR scanning and order management on mobile devices.
5. **Regulatory API Integration:** Direct integration with national drug regulatory authority APIs for automated compliance reporting.
6. **Multi-Tenant Architecture:** Supporting multiple pharmaceutical manufacturers on a shared platform with strict data isolation.

PharmaLink demonstrates that modern web technologies can deliver enterprise-grade supply chain intelligence at a fraction of the cost of traditional pharmaceutical ERP systems, making advanced traceability and compliance tools accessible to small and medium pharmaceutical manufacturers.

---

## References

[1] World Health Organization. (2017). *A Study on the Public Health and Socioeconomic Impact of Substandard and Falsified Medical Products*. WHO Press.

[2] Sylim, P., Liu, F., Marcelo, A., & Fontelo, P. (2018). Blockchain technology for detecting falsified and substandard drugs in distribution: Pharmaceutical supply chain intervention. *JMIR Research Protocols*, 7(9), e10163.

[3] MediLedger Network. (2019). *MediLedger Project 2019 Progress Report*. Chronicled Inc.

[4] Hasan, H. R., Salah, K., Jayaraman, R., Ahmad, R. W., Yaqoob, I., Omar, M., & Ellahham, S. (2020). Blockchain-based solution for COVID-19 digital medical passports and immunity certificates. *IEEE Access*, 8, 222093–222108.

[5] Chopra, S., & Meindl, P. (2016). *Supply Chain Management: Strategy, Planning, and Operation* (6th ed.). Pearson.

[6] Makridakis, S., Wheelwright, S. C., & Hyndman, R. J. (1998). *Forecasting: Methods and Applications* (3rd ed.). Wiley.

[7] Wild, T. (2017). *Best Practice in Inventory Management* (3rd ed.). Routledge.

[8] Nakamoto, S. (2008). Bitcoin: A peer-to-peer electronic cash system. *Bitcoin.org*.

[9] Hyperledger Foundation. (2021). *Hyperledger Fabric: A Distributed Operating System for Permissioned Blockchains*. Linux Foundation.

[10] MongoDB Inc. (2023). *MongoDB Manual: Transactions*. MongoDB Documentation.
