# COVER PAGE

---

**PharmaLink — Advanced Inventory & Supply Chain Management**

**A PROJECT REPORT**

*Submitted by*

**ADITYA RAJ**
**2203051050671**

*In fulfillment for the award of the degree of*

**BACHELOR OF ENGINEERING**

*In*

**Computer Science and Engineering**

**Parul Institute of Technology**

**Parul University, Limda**

Session: AY 2025-2026

---

---

# CERTIFICATE

**Parul Institute of Technology**

**Parul University**

---

This is to certify that the project report submitted along with the project entitled **PharmaLink — Advanced Inventory & Supply Chain Management** has been carried out by **ADITYA RAJ** under my guidance in fulfillment for the degree of Bachelor of Engineering in **Computer Science and Engineering**, 8th Semester of Parul University, Vadodara during the AY 2025-26.

---

**[Internal Guide Name]** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **[Head of Department Name]**

Internal Guide &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Head of the Department

Dept. of Computer Science & Engineering &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Dept. of Computer Science & Engineering

Parul Institute of Technology &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Parul Institute of Technology

Parul University &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Parul University

---

---

# DECLARATION

**Parul Institute of Technology**

**Parul University**

---

I hereby declare that the Project report submitted along with the project entitled **PharmaLink — Advanced Inventory & Supply Chain Management** submitted in partial fulfillment for the degree of Bachelor of Engineering in **Computer Science and Engineering** to Parul University, Vadodara, is a bonafide record of original project work carried out by me under the supervision of my Internal Guide and that no part of this report has been directly copied from any students' reports or taken from any other source, without providing due reference.

Name of the Student: **Aditya Raj**

Enrollment Number: **2203051050671**

Sign of Student: _______________

---

---

# ACKNOWLEDGEMENT

I would like to express my sincere gratitude to everyone who has contributed to the successful completion of my project, PharmaLink — Advanced Inventory & Supply Chain Management.

Firstly, I extend my deepest appreciation to my Internal Guide and professors at Parul Institute of Technology, whose guidance, encouragement, and technical expertise have been invaluable throughout this project. Their insightful feedback and continuous support helped me refine my approach, resolve technical challenges, and improve the overall quality of my work at every stage of development.

I would also like to thank the Department of Computer Science and Engineering and the faculty members of Parul Institute of Technology for providing me with the necessary resources, knowledge, and a conducive learning environment. The strong foundation in software engineering, database systems, web development, and system design provided through the curriculum directly enabled me to design and implement a complex, multi-module full-stack application.

A special thanks to my friends and colleagues for their continuous motivation, constructive discussions, and collaborative problem-solving sessions. Their shared enthusiasm for technology and their willingness to review and test the application contributed meaningfully to the quality of the final system.

I am also grateful to the open-source community behind the technologies used in this project — React.js, Node.js, Express.js, MongoDB, Socket.IO, Tailwind CSS, and the many npm packages that form the backbone of PharmaLink. The comprehensive documentation, community forums, and open-source contributions made it possible to build a production-quality system within an academic timeline.

Lastly, I am deeply grateful to my family for their unwavering support, patience, and encouragement throughout this journey. Their belief in my abilities has been a constant driving force behind my dedication and commitment to this project.

This project has been an extraordinary learning experience, allowing me to apply full-stack web development, real-time systems, database design, and security architecture to a real-world pharmaceutical supply chain problem. I hope that PharmaLink will serve as a meaningful contribution to the digitization of pharmaceutical operations and demonstrate the practical value of modern web technologies in solving complex industry challenges.

---

---

# ABSTRACT

This report presents PharmaLink — Advanced Inventory & Supply Chain Management, a comprehensive full-stack web application designed to digitize and automate pharmaceutical inventory and supply chain operations. The system addresses the critical limitations of traditional pharmaceutical management methods — manual inventory tracking, disconnected procurement workflows, absence of batch-level traceability, weak compliance monitoring, and lack of real-time visibility — by providing a single integrated platform that manages the complete lifecycle of pharmaceutical products from raw material procurement through batch manufacturing, quality control, warehouse storage, distribution, and compliance reporting.

The project employs React.js v19 with Vite and Tailwind CSS v4 for the frontend, Node.js and Express.js for the RESTful API backend, and MongoDB with Mongoose for data persistence. Real-time communication is implemented via Socket.IO, enabling instant messaging between users and automated notification delivery for critical supply chain events. The system implements multi-layer security through JWT-based authentication, bcrypt password hashing, and Time-based One-Time Password (TOTP) Two-Factor Authentication via Speakeasy. Role-based access control enforces distinct permissions for Admin and Distributor user roles at both the frontend routing and backend API middleware levels.

The platform comprises 17 functional modules including Product & Batch Management, Purchase Order Processing, Supplier Management, Quality Control, Product Recall Management, Returns Processing, Expiry Intelligence, Demand Forecasting, Storage Compliance, Compliance Snapshot generation, Audit Logging, Real-Time Messaging, Notifications, and interactive Dashboard Analytics. Data visualization is implemented using Recharts, providing interactive bar charts, pie charts, and area charts for KPI monitoring. Exportable PDF reports (via PDFKit) and CSV exports (via json2csv) support offline analysis and regulatory submissions. QR code generation (server-side via the `qrcode` library) and browser-based QR scanning (via `html5-qrcode`) enable hardware-free batch traceability throughout the supply chain.

The automated daily compliance snapshot system calculates a composite compliance score across five weighted metrics — Batch Testing Rate, Expiry Score, Storage Score, Recall Completion Rate, and Order Fulfillment Rate — ensuring continuous, audit-ready compliance documentation without manual effort. All 17 modules were successfully implemented and verified through comprehensive end-to-end testing, with all 12 formal test cases passing without critical failures.

**Keywords** — Pharmaceutical Supply Chain Management, Inventory Management, Full-Stack Web Application, React.js, Node.js, MongoDB, Socket.IO, Role-Based Access Control, JWT Authentication, Two-Factor Authentication, Real-Time Notifications, Compliance Monitoring, Batch Traceability, QR Code, Demand Forecasting, Expiry Intelligence, Audit Log, REST API

---

---

# LIST OF FIGURES

| Figure No. | Figure Title | Page No. |
|---|---|---|
| Figure 1.0 | PharmaLink System Architecture Overview | — |
| Figure 2.0 | PharmaLink Project Gantt Chart (August – November 2025) | — |
| Figure 3.0 | PharmaLink Use Case Diagram | — |
| Figure 4.0 | PharmaLink Activity Diagram | — |
| Figure 5.0 | PharmaLink Sequence Diagram | — |
| Figure 6.0 | PharmaLink Data Flow Diagram (Level 0 & Level 1) | — |
| Figure 7.0 | PharmaLink Entity-Relationship (ER) Diagram | — |
| Figure 8.0 | Admin Dashboard — KPI Cards and Recharts Visualizations | — |
| Figure 9.0 | JWT Authentication Middleware (auth.js) | — |
| Figure 10.0 | Dashboard Data Loading and Chart Aggregation (Dashboard.jsx) | — |
| Figure 11.0 | Automated Compliance Snapshot Calculation (server.js) | — |
| Figure 12.0 | Admin Dashboard Screenshot | — |
| Figure 13.0 | Inventory Management Module Screenshot | — |
| Figure 14.0 | Batch Management & QR Traceability Screenshot | — |
| Figure 15.0 | Real-Time Messaging Interface Screenshot | — |

---

# LIST OF TABLES

| Table No. | Table Title | Page No. |
|---|---|---|
| Table 1.0 | PharmaLink Project Development Plan | — |
| Table 2.0 | PharmaLink Module Implementation Status | — |
| Table 3.0 | Compliance Score Calculation Formula | — |
| Table 4.0 | PharmaLink Test Case Summary | — |
| Table 5.0 | PharmaLink REST API Endpoint Reference | — |
| Table 6.0 | PharmaLink System Performance Metrics | — |
| Table 7.0 | User Data Structure | — |
| Table 8.0 | Product Data Structure | — |
| Table 9.0 | Batch Data Structure | — |
| Table 10.0 | Order Data Structure | — |
| Table 11.0 | Purchase Order Data Structure | — |
| Table 12.0 | Quality Check Data Structure | — |
| Table 13.0 | Supplier Data Structure | — |
| Table 14.0 | Warehouse & WarehouseStock Data Structures | — |
| Table 15.0 | Audit Log Data Structure | — |
| Table 16.0 | Notification Data Structure | — |
| Table 17.0 | Software Selection Summary | — |

---

# LIST OF ABBREVIATIONS

| Abbreviation | Full Form |
|---|---|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| CSS | Cascading Style Sheets |
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
| 2FA | Two-Factor Authentication |

---

# TABLE OF CONTENTS

| Section | Title | Page No. |
|---|---|---|
| — | Cover Page | i |
| — | Certificate | ii |
| — | Declaration | iii |
| — | Acknowledgement | iv |
| — | Abstract | v |
| — | List of Figures | vi |
| — | List of Tables | vii |
| — | List of Abbreviations | viii |
| — | Table of Contents | ix |
| **Chapter 3** | **Introduction to Project** | **1** |
| 3.1 | Project | 1 |
| 3.2 | Purpose | 3 |
| 3.3 | Objective | 4 |
| 3.4 | Scope | 5 |
| 3.4.1 | Existing System | 5 |
| 3.4.2 | Advantages and Limitations | 6 |
| 3.5 | Technology and Literature Review | 8 |
| 3.5.1 | Technology | 8 |
| 3.5.2 | Literature Review | 18 |
| 3.6 | Project Planning | 21 |
| 3.6.1 | Project Development | 21 |
| 3.6.2 | Project Effort, Time and Cost Estimation | 22 |
| 3.6.3 | Roles and Responsibilities | 23 |
| 3.6.4 | Group Dependencies | 24 |
| 3.7 | Project Gantt Chart | 25 |
| **Chapter 4** | **System Analysis** | **26** |
| 4.1 | Study of Current System | 26 |
| 4.2 | Problem and Weaknesses | 31 |
| 4.3 | Requirements of New System | 33 |
| 4.4 | System Feasibility | 35 |
| 4.4.1 | Contribution to Organizational Objectives | 35 |
| 4.4.2 | Implementation Feasibility | 36 |
| 4.4.3 | Integration Capability | 37 |
| 4.5 | Activity | 38 |
| 4.6 | Features of New System / Proposed System | 40 |
| 4.7 | List of Main Modules | 42 |
| 4.8 | Selection of Hardware / Software | 43 |
| **Chapter 5** | **System Design** | **47** |
| 5.1 | System Design & Methodology | 47 |
| 5.2 | Data Structure Design | 51 |
| — | Use Case Diagram | 60 |
| — | Activity Diagram | 61 |
| — | Sequence Diagram | 62 |
| — | Data Flow Diagram | 63 |
| — | Entity-Relationship Diagram | 65 |
| **Chapter 6** | **Implementation** | **67** |
| 6.1 | Implementation Platform | 67 |
| 6.2 | Process / Program / Technology / Modules | 69 |
| 6.3 | Outcomes | 73 |
| 6.4 | Result Analysis | 78 |
| **Chapter 7** | **Testing** | **81** |
| 7.1 | Testing Plan | 81 |
| 7.2 | Test Results and Analysis | 83 |
| 7.2.1 | Test Cases | 83 |
| 7.2.2 | Summary of Test Results | 95 |
| **Chapter 8** | **Conclusion and Discussion** | **96** |
| 8.1 | Overall Analysis of Project | 96 |
| 8.2 | Problems Encountered and Possible Solutions | 98 |
| 8.3 | Summary of Project | 100 |
| 8.4 | Limitation and Future Enhancement | 101 |
| — | Appendix 1 — System API Endpoint Reference | 103 |
| — | Appendix 2 — System Performance Metrics | 107 |
| — | Appendix 3 — Security Considerations and Data Privacy | 109 |
| — | References | 112 |

---

*Parul University — Parul Institute of Technology*
*Department of Computer Science and Engineering*
*Academic Year: 2025-26*
