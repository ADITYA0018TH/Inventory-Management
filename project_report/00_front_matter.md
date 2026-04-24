# PAGE i — COVER PAGE

PharmaLink — Advanced Inventory & Supply Chain Management

A PROJECT REPORT

Submitted by

ADITYA RAJ
2203051050671

In fulfillment for the award of the degree of

BACHELOR OF ENGINEERING

In

Computer Science and Engineering

Parul Institute of Technology

Parul University, Limda

Session: AY 2025-2026

---

# PAGE ii — CERTIFICATE OF PROJECT

Parul Institute of Technology
Parul University

CERTIFICATE

This is to certify that the project report submitted along with the project entitled PharmaLink — Advanced Inventory & Supply Chain Management has been carried out by ADITYA RAJ under my guidance in fulfillment for the degree of Bachelor of Engineering in Computer Science and Engineering, 8th Semester of Parul University, Vadodara during the AY 2025-26.

[Internal Guide Name]                          [Head of Department Name]
Internal Guide                                 Head of the Department
Dept. of Computer Science & Engineering        Dept. of Computer Science & Engineering
Parul Institute of Technology                  Parul Institute of Technology
Parul University                               Parul University

---

# PAGE iii — PROJECT COMPLETION CERTIFICATE

Parul Institute of Technology
Parul University

TO WHOM IT MAY CONCERN

This is to certify that ADITYA RAJ, Enrollment No. 2203051050671, a student of Parul Institute of Technology, Department of Computer Science and Engineering, has successfully completed the Final Year Project entitled PharmaLink — Advanced Inventory & Supply Chain Management during the Academic Year 2025-26.

The project activities include Requirements Analysis & System Design, Database Schema Design, Backend API Development, Frontend UI Implementation, Real-Time Feature Integration, Compliance Automation, Testing & Validation, and Final Documentation.

During the course of the project, the student demonstrated diligence, technical competence, and a strong commitment to delivering a production-quality full-stack web application.

We wish the student every success in their academic and professional career.

[Internal Guide Signature]
[Internal Guide Name]
Department of Computer Science and Engineering
Parul Institute of Technology, Parul University

---

# PAGE iv — ACKNOWLEDGEMENT

I would like to express my sincere gratitude to everyone who has contributed to the successful completion of my project, PharmaLink — Advanced Inventory & Supply Chain Management.

First and foremost, I extend my deepest appreciation to my Internal Guide at Parul Institute of Technology, whose guidance, encouragement, and technical expertise were invaluable throughout this project. Their insightful feedback and continuous support helped me refine my approach, overcome technical challenges, and significantly improve the overall quality of my work at every stage of development.

I would also like to thank the Department of Computer Science and Engineering and the faculty members of Parul Institute of Technology for providing the necessary resources, knowledge, and a conducive learning environment. The strong academic foundation in software engineering, database systems, web development, and system design provided through the curriculum directly enabled me to design and implement this complex, multi-module full-stack application.

A special thanks to my friends and colleagues for their continuous motivation, constructive discussions, and collaborative problem-solving. Their enthusiasm and willingness to review and test the application contributed meaningfully to the quality of the final system. I am also deeply grateful to my family for their unwavering support, patience, and encouragement throughout this journey — their belief in me has been a constant driving force behind my dedication to this project.

This project has been an incredible learning experience, allowing me to apply full-stack web development, real-time systems, database design, and security architecture to a real-world pharmaceutical supply chain problem. I hope PharmaLink serves as a meaningful contribution toward the digitization of pharmaceutical operations.

Aditya Raj
Enrollment No: 2203051050671
B.Tech. Computer Science and Engineering
Parul Institute of Technology, Parul University
AY 2025-26

---

# PAGE v — PAPER PUBLICATION / PARTICIPATION CERTIFICATE

[Attach any paper publication certificate, Tech Expo participation certificate, or any other achievement certificate here if applicable]

---

# PAGE vi — ABSTRACT

PharmaLink — Advanced Inventory & Supply Chain Management is a full-stack web application that digitizes and automates pharmaceutical supply chain operations. It replaces manual, disconnected systems with a single integrated platform covering the complete product lifecycle — from raw material procurement and batch manufacturing through quality control, warehouse storage, distribution, and compliance reporting.

The system is built using React.js v19, Node.js, Express.js, and MongoDB, with Socket.IO for real-time messaging and notifications. Security is implemented through JWT authentication, bcrypt password hashing, and TOTP-based Two-Factor Authentication via Speakeasy. Role-based access control supports four user roles: Admin, Distributor, Quality Inspector, and Warehouse Manager.

The platform includes 17 functional modules covering inventory management, purchase orders, supplier management, quality control, product recalls, expiry intelligence, demand forecasting, storage compliance, audit logging, and dashboard analytics. PDF and CSV report exports, QR code generation, and browser-based QR scanning are also supported. An automated daily compliance snapshot calculates a weighted composite score across five metrics to ensure continuous audit readiness. All 17 modules were successfully implemented and all 12 formal test cases passed.

Keywords: Pharmaceutical Supply Chain, Inventory Management, React.js, Node.js, MongoDB, Socket.IO, JWT, Role-Based Access Control, QR Code Traceability, Compliance Monitoring, REST API.

---

# PAGE vii — TABLE OF CONTENTS

| Sr. No | Content | Page Number |
|---|---|---|
| | Cover Page (as per attachment) | i |
| | Certificate of Project | ii |
| | Project Completion Certificate | iii |
| | Acknowledgement | iv |
| | Paper Publication / Participation Certificate (if any) | v |
| | Abstract | vi |
| | Table of Contents | vii |
| | List of Abbreviations | viii |
| | List of Figures | ix |
| | List of Tables | x |
| | Chapter 1: Introduction | 01-03 |
| | Chapter 2: Aim and Objectives of the Project | 04-07 |
| | Chapter 3: Review of Literature / Technology Review | 08-24 |
| | Chapter 4: Methodology: System Design and Implementation | 25-39 |
| | Chapter 5: Observations, Results and Discussion | 40-44 |
| | Conclusions & Summary | 45-46 |
| | Any Annexures of Report | 47 |
| | References | 48-49 |

---

# PAGE viii — LIST OF ABBREVIATIONS

| Abbreviation | Full Form |
|---|---|
| 2FA | Two-Factor Authentication |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| CSS | Cascading Style Sheets |
| CSV | Comma-Separated Values |
| DFD | Data Flow Diagram |
| ER | Entity-Relationship |
| ERP | Enterprise Resource Planning |
| GSAP | GreenSock Animation Platform |
| HMR | Hot Module Replacement |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| HTTPS | HyperText Transfer Protocol Secure |
| IDE | Integrated Development Environment |
| IoT | Internet of Things |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| KPI | Key Performance Indicator |
| MVC | Model-View-Controller |
| NoSQL | Not Only SQL |
| npm | Node Package Manager |
| ODM | Object Data Modeling |
| OTP | One-Time Password |
| PDF | Portable Document Format |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| SKU | Stock Keeping Unit |
| SMTP | Simple Mail Transfer Protocol |
| SPA | Single Page Application |
| SQL | Structured Query Language |
| TOTP | Time-based One-Time Password |
| UI | User Interface |
| URL | Uniform Resource Locator |
| UX | User Experience |

---

# PAGE ix — LIST OF FIGURES

| Figure No. | Figure Title | Page No. |
|---|---|---|
| Figure 1.0 | PharmaLink Three-Tier System Architecture | 02 |
| Figure 2.0 | PharmaLink Project Gantt Chart (Aug – Nov 2025) | 07 |
| Figure 3.0 | PharmaLink Use Case Diagram | 28 |
| Figure 4.0 | PharmaLink Activity Diagram | 29 |
| Figure 5.0 | PharmaLink Sequence Diagram | 30 |
| Figure 6.0 | PharmaLink Data Flow Diagram (Level 0 & Level 1) | 31 |
| Figure 7.0 | PharmaLink Entity-Relationship (ER) Diagram | 33 |
| Figure 8.0 | Admin Dashboard — KPI Cards and Recharts Visualizations | 40 |
| Figure 9.0 | JWT Authentication Middleware Code (auth.js) | 41 |
| Figure 10.0 | Dashboard Data Loading and Chart Aggregation (Dashboard.jsx) | 42 |
| Figure 11.0 | Automated Compliance Snapshot Calculation (server.js) | 43 |
| Figure 12.0 | Admin Dashboard Screenshot | 44 |
| Figure 13.0 | Inventory Management Module Screenshot | 44 |
| Figure 14.0 | Batch Management & QR Traceability Screenshot | 44 |
| Figure 15.0 | Real-Time Messaging Interface Screenshot | 44 |

---

# PAGE x — LIST OF TABLES

| Table No. | Table Title | Page No. |
|---|---|---|
| Table 1.0 | PharmaLink Project Development Plan | 07 |
| Table 2.0 | PharmaLink Module Implementation Status | 38 |
| Table 3.0 | Compliance Score Calculation Formula | 37 |
| Table 4.0 | PharmaLink Test Case Summary | 43 |
| Table 5.0 | PharmaLink REST API Endpoint Reference | 47 |
| Table 6.0 | PharmaLink System Performance Metrics | 43 |
| Table 7.0 | User Collection — Data Structure | 27 |
| Table 8.0 | Product Collection — Data Structure | 27 |
| Table 9.0 | Batch Collection — Data Structure | 28 |
| Table 10.0 | Order Collection — Data Structure | 28 |
| Table 11.0 | Purchase Order Collection — Data Structure | 29 |
| Table 12.0 | Quality Check Collection — Data Structure | 29 |
| Table 13.0 | Supplier Collection — Data Structure | 30 |
| Table 14.0 | Warehouse & WarehouseStock Data Structures | 30 |
| Table 15.0 | Audit Log Collection — Data Structure | 31 |
| Table 16.0 | Notification Collection — Data Structure | 31 |
| Table 17.0 | Software Selection Summary | 35 |

---

Parul University — Parul Institute of Technology
Department of Computer Science and Engineering
Academic Year: 2025-26
