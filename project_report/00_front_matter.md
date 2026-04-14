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

Firstly, I extend my deepest appreciation to my Internal Guide and professors at Parul Institute of Technology, whose guidance, encouragement, and technical expertise have been invaluable throughout this project. Their insightful feedback and continuous support helped me refine my approach, resolve technical challenges, and improve the overall quality of my work at every stage of development.

I would also like to thank the Department of Computer Science and Engineering and the faculty members of Parul Institute of Technology for providing me with the necessary resources, knowledge, and a conducive learning environment. The strong foundation in software engineering, database systems, web development, and system design provided through the curriculum directly enabled me to design and implement a complex, multi-module full-stack application.

A special thanks to my friends and colleagues for their continuous motivation, constructive discussions, and collaborative problem-solving sessions. Their shared enthusiasm for technology and their willingness to review and test the application contributed meaningfully to the quality of the final system.

I am also grateful to the open-source community behind the technologies used in this project — React.js, Node.js, Express.js, MongoDB, Socket.IO, Tailwind CSS, and the many npm packages that form the backbone of PharmaLink. The comprehensive documentation, community forums, and open-source contributions made it possible to build a production-quality system within an academic timeline.

Lastly, I am deeply grateful to my family for their unwavering support, patience, and encouragement throughout this journey. Their belief in my abilities has been a constant driving force behind my dedication and commitment to this project.

This project has been an extraordinary learning experience, allowing me to apply full-stack web development, real-time systems, database design, and security architecture to a real-world pharmaceutical supply chain problem. I hope that PharmaLink will serve as a meaningful contribution to the digitization of pharmaceutical operations and demonstrate the practical value of modern web technologies in solving complex industry challenges.

Aditya Raj
Enrollment No: 2203051050671
B.E. Computer Science and Engineering
Parul Institute of Technology, Parul University
AY 2025-26

---

# PAGE v — PAPER PUBLICATION / PARTICIPATION CERTIFICATE

[Attach any paper publication certificate, Tech Expo participation certificate, or any other achievement certificate here if applicable]

---

# PAGE vi — ABSTRACT

This report presents PharmaLink — Advanced Inventory & Supply Chain Management, a comprehensive full-stack web application designed to digitize and automate pharmaceutical inventory and supply chain operations. The system addresses the critical limitations of traditional pharmaceutical management methods — manual inventory tracking, disconnected procurement workflows, absence of batch-level traceability, weak compliance monitoring, and lack of real-time visibility — by providing a single integrated platform that manages the complete lifecycle of pharmaceutical products from raw material procurement through batch manufacturing, quality control, warehouse storage, distribution, and compliance reporting.

The project employs React.js v19 with Vite and Tailwind CSS v4 for the frontend, Node.js and Express.js for the RESTful API backend, and MongoDB with Mongoose for data persistence. Real-time communication is implemented via Socket.IO, enabling instant messaging between users and automated notification delivery for critical supply chain events. The system implements multi-layer security through JWT-based authentication, bcrypt password hashing, and Time-based One-Time Password (TOTP) Two-Factor Authentication via Speakeasy. Role-based access control enforces distinct permissions for Admin and Distributor user roles at both the frontend routing and backend API middleware levels.

The platform comprises 17 functional modules including Product & Batch Management, Purchase Order Processing, Supplier Management, Quality Control, Product Recall Management, Returns Processing, Expiry Intelligence, Demand Forecasting, Storage Compliance, Compliance Snapshot generation, Audit Logging, Real-Time Messaging, Notifications, and interactive Dashboard Analytics. Data visualization is implemented using Recharts, providing interactive bar charts, pie charts, and area charts for KPI monitoring. Exportable PDF reports (via PDFKit) and CSV exports (via json2csv) support offline analysis and regulatory submissions. QR code generation (server-side via the qrcode library) and browser-based QR scanning (via html5-qrcode) enable hardware-free batch traceability throughout the supply chain.

The automated daily compliance snapshot system calculates a composite compliance score across five weighted metrics — Batch Testing Rate (25%), Expiry Score (20%), Storage Score (25%), Recall Completion Rate (15%), and Order Fulfillment Rate (15%) — ensuring continuous, audit-ready compliance documentation without manual effort. All 17 modules were successfully implemented and verified through comprehensive end-to-end testing, with all 12 formal test cases passing without critical failures.

Keywords: Pharmaceutical Supply Chain Management, Inventory Management, Full-Stack Web Application, React.js, Node.js, MongoDB, Socket.IO, Role-Based Access Control, JWT Authentication, Two-Factor Authentication, Real-Time Notifications, Compliance Monitoring, Batch Traceability, QR Code, Demand Forecasting, Expiry Intelligence, Audit Log, REST API

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
