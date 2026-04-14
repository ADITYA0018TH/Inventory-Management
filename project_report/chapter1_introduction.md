# CHAPTER 1: INTRODUCTION
Pages 01–03

---

## 1.1 INTRODUCTION TO THE PROJECT

In the modern pharmaceutical and healthcare supply chain landscape, efficient inventory management and real-time traceability of medicines are critical for ensuring patient safety and regulatory compliance. PharmaLink — Advanced Inventory & Supply Chain Management is a full-stack web-based platform designed to manage the complete lifecycle of pharmaceutical products — from raw material procurement and batch manufacturing to warehouse storage, quality control, distribution, and compliance reporting.

The pharmaceutical industry operates under strict regulatory requirements and faces unique operational challenges: products have expiry dates, batches must be traceable, storage conditions must be monitored, and every transaction must be auditable. Traditional approaches — spreadsheets, paper records, and disconnected legacy systems — are fundamentally inadequate for meeting these demands at scale. They introduce data inconsistencies, create compliance gaps, and leave organizations unable to respond quickly to critical events such as product recalls or stockouts.

PharmaLink addresses these challenges by providing a single, integrated web platform that automates inventory workflows, enforces compliance monitoring, and delivers real-time operational visibility to all stakeholders — administrators, warehouse managers, distributors, and compliance officers.

---

## 1.2 BACKGROUND AND MOTIVATION

The motivation for developing PharmaLink stems from the widespread recognition that pharmaceutical supply chain management remains one of the most under-digitized operational areas in the healthcare sector. Despite the critical nature of pharmaceutical products — where expired or substandard medicines can directly harm patients — many organizations continue to manage their supply chains using manual processes that are error-prone, slow, and difficult to audit.

Key problems observed in existing pharmaceutical management approaches include:

- Manual stock tracking leading to undetected stockouts and overstocking
- No proactive expiry monitoring, resulting in significant financial losses from expired inventory
- Disconnected procurement workflows with no link between purchase orders, supplier records, and stock levels
- Absence of batch-level traceability making product recalls slow and incomplete
- No automated compliance documentation, requiring manual effort for regulatory audits
- Lack of real-time communication between departments for critical supply chain events

PharmaLink was developed to directly address each of these problems through a technology-driven, automated, and fully integrated platform.

---

## 1.3 PROJECT OVERVIEW

PharmaLink is a full-stack web application built using React.js (frontend), Node.js with Express.js (backend), and MongoDB (database). The system comprises 17 functional modules covering every aspect of pharmaceutical supply chain management.

The system architecture follows a three-tier model:

```
┌─────────────────────────────────────────────────────┐
│         React.js Frontend (Vite SPA)                 │
│  Tailwind CSS | Radix UI | Recharts | Socket.IO      │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────┐
│      Node.js + Express.js REST API Server            │
│  JWT Auth | RBAC | Socket.IO | PDFKit | Nodemailer   │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│           MongoDB (17 Collections)                   │
│  Products | Batches | Orders | Users | AuditLogs     │
└─────────────────────────────────────────────────────┘
```

Figure 1.0 — PharmaLink Three-Tier System Architecture

The system supports two primary user roles — Admin and Distributor — with role-based access control enforced at both the frontend routing level and the backend API middleware level. Real-time communication is powered by Socket.IO, enabling instant messaging and automated notification delivery for critical events.

---

## 1.4 ORGANIZATION OF THE REPORT

This report is organized as follows:

- Chapter 1 (Introduction) provides the project background, motivation, and overview.
- Chapter 2 (Aim and Objectives) defines the specific goals and objectives of the project.
- Chapter 3 (Literature Review) reviews existing technologies, related work, and the theoretical foundation.
- Chapter 4 (Methodology) covers the system design, database structure, implementation platform, and all 17 modules.
- Chapter 5 (Observations, Results and Discussion) presents testing results, performance metrics, and result analysis.
- Conclusions & Summary provides the final assessment, limitations, and future enhancements.
- References lists all cited works and documentation sources.

---

Parul University — Parul Institute of Technology
Department of Computer Science and Engineering
Academic Year: 2025-26
