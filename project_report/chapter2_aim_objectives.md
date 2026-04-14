# CHAPTER 2: AIM AND OBJECTIVES OF THE PROJECT
Pages 04–07

---

## 2.1 AIM

The aim of PharmaLink — Advanced Inventory & Supply Chain Management is to design, develop, and deploy a comprehensive full-stack web application that digitizes and automates pharmaceutical inventory and supply chain operations — providing real-time visibility, automated compliance monitoring, and end-to-end traceability across the complete pharmaceutical product lifecycle.

The system aims to replace fragmented, manual pharmaceutical management approaches with a single integrated platform that serves administrators, warehouse managers, distributors, and compliance officers — enabling data-driven decisions, regulatory compliance, and operational efficiency at every level of the supply chain.

---

## 2.2 OBJECTIVES

The specific objectives of PharmaLink are:

**Objective 1: Develop a Centralized Inventory Management System**
Build and deploy a multi-module platform covering Products, Batches, Raw Materials, Warehouses, and Stock management with full CRUD operations and real-time data synchronization across all modules. Every stock transaction must be immediately reflected in dashboards and reports, eliminating the data lag inherent in manual systems.

**Objective 2: Implement Role-Based Access Control (RBAC)**
Design a secure authentication system with distinct roles (Admin, Distributor, quality_inspector, warehouse_manager) using JWT tokens, bcrypt password hashing (salt rounds: 10), and Time-based One-Time Password (TOTP) Two-Factor Authentication via Speakeasy. Role-based access must be enforced at both the React Router frontend level and the Express.js backend middleware level.

**Objective 3: Automate Supply Chain Workflows**
Digitize and automate key processes including Purchase Order management (Draft → Approved → Sent → Received with automatic stock update), Supplier coordination, Quality Control check logging, Product Recall initiation, and Return processing — reducing manual effort and eliminating data entry errors.

**Objective 4: Enable Real-Time Communication and Notifications**
Integrate Socket.IO-based real-time messaging between platform users and an automated notification system for critical events — low stock alerts, expiry warnings, order status updates, quality check failures, and product recalls — with in-platform delivery and email fallback via Nodemailer.

**Objective 5: Build Expiry Intelligence and Demand Forecasting Modules**
Provide proactive expiry tracking with visual timelines showing batches approaching expiry within configurable alert windows. Implement a Demand Forecasting module that analyzes historical order data to identify trends and generate procurement recommendations, helping organizations minimize waste and optimize purchasing decisions.

**Objective 6: Ensure Compliance and Audit Readiness**
Implement Storage Compliance monitoring against product-defined temperature and humidity thresholds, automated daily Compliance Snapshot generation (composite score across 5 weighted metrics), and a comprehensive Audit Log that records all significant system actions with timestamps and user attribution for regulatory traceability.

**Objective 7: Provide Data-Driven Reporting and Visualization**
Integrate Recharts-based interactive dashboards with bar charts, pie charts, and area charts for KPI monitoring. Generate exportable PDF reports (via PDFKit) and CSV exports (via json2csv) covering inventory status, order history, quality metrics, compliance summaries, and audit logs.

**Objective 8: Support QR Code-Based Product Traceability**
Generate QR codes server-side (via the qrcode library) for products and batches to enable physical labeling. Implement browser-based QR scanning (via html5-qrcode) using device camera — enabling hardware-free batch identification during receiving, picking, and dispatch operations.

---

## 2.3 SCOPE OF THE PROJECT

**In Scope:**
- Complete full-stack web application development (React.js frontend + Node.js/Express.js backend + MongoDB database)
- 17 functional modules covering all aspects of pharmaceutical supply chain management
- Multi-layer security: JWT authentication, bcrypt hashing, TOTP 2FA, RBAC
- Real-time features: Socket.IO messaging and notifications
- Automated compliance snapshot scheduling
- PDF and CSV report generation
- QR code generation and browser-based scanning
- Responsive UI supporting desktop and mobile browsers
- End-to-end testing of all modules

**Out of Scope:**
- Mobile native application (React Native / Flutter)
- IoT sensor integration for real-time cold chain monitoring
- Blockchain-based batch traceability
- Integration with government regulatory portals
- AI/ML-based deep learning demand forecasting models
- Payment gateway integration

---

## 2.4 PROJECT PLANNING AND TIMELINE

The project was developed over approximately 15 weeks (August – November 2025), following a modular development approach that delivered core functionality first and progressively added advanced features.

| Task Name | Start Date | End Date | Duration | Status |
|---|---|---|---|---|
| Requirements & DB Schema Design | 01-08-2025 | 07-08-2025 | 7 days | Complete |
| Backend API Development (Core Modules) | 08-08-2025 | 25-08-2025 | 18 days | Complete |
| Frontend UI Development (Core Modules) | 26-08-2025 | 15-09-2025 | 21 days | Complete |
| Advanced Module Development | 16-09-2025 | 05-10-2025 | 20 days | Complete |
| Real-Time Features (Socket.IO, Notifications) | 06-10-2025 | 13-10-2025 | 8 days | Complete |
| Integration & End-to-End Testing | 14-10-2025 | 22-10-2025 | 9 days | Complete |
| Bug Fixes & UI Refinement | 23-10-2025 | 30-10-2025 | 8 days | Complete |
| Final Documentation & Deployment | 01-11-2025 | 10-11-2025 | 10 days | Complete |

Table 1.0 — PharmaLink Project Development Plan

**Project Gantt Chart:**

| Phase | Wk 1-2 | Wk 3-4 | Wk 5-6 | Wk 7-8 | Wk 9-10 | Wk 11-12 | Wk 13-15 |
|---|---|---|---|---|---|---|---|
| Requirements & DB Schema | ████ | | | | | | |
| Backend API (Core) | | ████ | ████ | | | | |
| Frontend UI (Core) | | | ████ | ████ | | | |
| Advanced Modules | | | | ████ | ████ | | |
| Real-Time Features | | | | | ████ | | |
| Integration & Testing | | | | | | ████ | |
| Bug Fixes & Refinement | | | | | | ████ | |
| Documentation & Deployment | | | | | | | ████ |

Figure 2.0 — PharmaLink Project Gantt Chart (August – November 2025)

---

## 2.5 ROLES AND RESPONSIBILITIES

**Project Lead & Full-Stack Developer (Aditya Raj):**
Responsible for overall project architecture, timeline management, and all technical implementation. Designed the MongoDB schema, built all 20 backend API route modules, implemented all 17 frontend module pages, integrated real-time Socket.IO features, automated compliance snapshot scheduling, and conducted end-to-end testing.

**Database Designer:**
Designed and maintained the MongoDB schema for all 17 entities. Defined relationships between collections, implemented Mongoose schema validation, and optimized query performance through compound indexing.

**UI/UX Designer:**
Designed the user interface and experience for all modules, ensuring consistency, accessibility, and responsiveness. Implemented the design system using Tailwind CSS v4, Radix UI components, and Recharts visualizations.

**Stakeholders:**
Academic supervisors and faculty members who provided feedback on system functionality, usability, and alignment with pharmaceutical supply chain requirements.

---

Parul University — Parul Institute of Technology
Department of Computer Science and Engineering
Academic Year: 2025-26
