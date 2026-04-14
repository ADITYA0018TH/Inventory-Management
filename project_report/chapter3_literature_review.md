# CHAPTER 3: REVIEW OF LITERATURE / INDUSTRY RELATED INFORMATION
Pages 08–24

---

## 3.1 TECHNOLOGY REVIEW

PharmaLink is built using a modern full-stack web technology architecture. Each technology was carefully selected to ensure high performance, scalability, real-time capabilities, and a rich user experience.

---

### React.js (v19)
React.js is a declarative, component-based JavaScript library for building interactive user interfaces, developed and maintained by Meta. It uses a virtual DOM for efficient rendering, enabling smooth user experiences even with large, frequently updating datasets. PharmaLink uses React.js v19 as the primary frontend framework, enabling the development of reusable UI components across all 17 modules — Dashboard, Inventory, Orders, Compliance, and more.

### Vite (v7)
Vite is a next-generation frontend build tool that provides extremely fast development server startup and Hot Module Replacement (HMR). It replaces traditional bundlers like Webpack with a significantly faster development experience. PharmaLink uses Vite v7 as the build tool, reducing frontend build times and improving development velocity.

### Tailwind CSS (v4)
Tailwind CSS is a utility-first CSS framework that enables rapid UI development through composable class-based styling. Rather than writing custom CSS, developers compose styles directly in HTML/JSX using utility classes. PharmaLink uses Tailwind CSS v4 to implement a consistent, responsive design system across all modules without writing custom stylesheets.

### Radix UI & shadcn/ui
Radix UI provides a set of unstyled, accessible component primitives — Dialog, Dropdown, Select, Popover, Tooltip, Calendar, and more — that form the foundation of PharmaLink's UI component library. Combined with shadcn/ui patterns, these components ensure accessibility compliance (ARIA attributes, keyboard navigation, focus management) and consistent interaction behavior across all modules.

### Node.js & Express.js
Node.js is a JavaScript runtime built on Chrome's V8 engine, enabling server-side JavaScript execution with a non-blocking, event-driven I/O model ideal for high-concurrency web applications. Express.js is a minimal and flexible Node.js web framework used to build PharmaLink's RESTful API. Together, they handle all backend business logic — routing, middleware processing, authentication, and data operations — with high throughput and low latency.

### MongoDB & Mongoose
MongoDB is a NoSQL document database that stores data in flexible JSON-like documents (BSON), making it ideal for the varied and evolving data structures of a supply chain system. Unlike relational databases, MongoDB's schema-less nature allows fields to be added or modified without migrations. Mongoose is an ODM (Object Data Modeling) library for MongoDB that provides schema validation, query building, and relationship management via ObjectId references. PharmaLink uses MongoDB to store all 17 entity collections.

### Socket.IO (v4)
Socket.IO enables real-time, bidirectional communication between the server and connected clients using WebSockets with automatic fallback to HTTP long-polling. It supports room-based event delivery, enabling targeted notifications to specific users. PharmaLink uses Socket.IO v4 to power the real-time messaging module and instant notification delivery for critical supply chain events.

### JWT (JSON Web Tokens) & bcryptjs
JWT is an open standard (RFC 7519) for creating compact, self-contained tokens for securely transmitting information between parties as a JSON object. PharmaLink uses JWT for stateless user authentication — the server issues a signed token on login that the client includes in all subsequent API requests. bcryptjs implements the bcrypt password hashing algorithm, storing passwords as irreversible hashes with a configurable salt factor (PharmaLink uses salt rounds: 10).

### Speakeasy (TOTP 2FA)
Speakeasy is a Node.js library implementing the TOTP (Time-based One-Time Password) algorithm defined in RFC 6238. It generates time-sensitive 6-digit codes compatible with Google Authenticator, Authy, and similar apps. PharmaLink uses Speakeasy to add an additional authentication layer, requiring users to verify a TOTP code alongside their password during login.

### Recharts
Recharts is a composable charting library built on React and D3.js. It provides a declarative API for building interactive charts as React components. PharmaLink uses Recharts to render the Admin Dashboard's Production Volume bar chart, Order Status donut pie chart, and various analytics visualizations across the Forecasting and Compliance modules.

### Axios
Axios is a promise-based HTTP client for JavaScript that works in both browser and Node.js environments. PharmaLink uses Axios on the frontend to communicate with the backend REST API, with request interceptors automatically injecting the JWT token into the Authorization header of every authenticated request.

### React Router DOM (v7)
React Router DOM v7 implements client-side routing for the PharmaLink SPA, enabling navigation between modules without full page reloads. It supports protected routes (redirecting unauthenticated users to login), role-based route guards (restricting Admin routes from Distributor users), and nested layouts for consistent sidebar and header rendering.

### PDFKit & json2csv
PDFKit is a Node.js library for programmatic PDF document generation, supporting text, tables, images, and custom styling. json2csv converts JavaScript objects/arrays to CSV format with configurable field mapping. Both are used in PharmaLink's reporting module to generate downloadable inventory reports, compliance summaries, audit logs, and purchase order documents.

### QRCode & html5-qrcode
The qrcode npm library generates QR codes server-side as data URLs or PNG buffers, which are stored in batch records for physical labeling. html5-qrcode is a frontend library that accesses the device camera via the browser's MediaDevices API to scan and decode QR codes in real-time — enabling hardware-free batch identification on any smartphone.

### Nodemailer
Nodemailer is a Node.js module for sending emails via SMTP. PharmaLink uses it to deliver automated email notifications for purchase order approvals, recall alerts, user registration confirmations, and compliance deadline reminders — configured via environment variables for SMTP provider flexibility.

### GSAP & Motion (Framer Motion)
GSAP (GreenSock Animation Platform) and the Motion library implement smooth UI animations and transitions throughout the PharmaLink frontend — including page transitions, dashboard widget entrance animations, staggered list rendering, and micro-interactions on interactive elements.

### Visual Studio Code
Visual Studio Code is the primary IDE used for developing PharmaLink, providing IntelliSense code completion, integrated Git version control, ESLint linting, Prettier formatting, and a rich extension ecosystem for both JavaScript/React frontend and Node.js backend development.

---

## 3.2 INDUSTRY RELATED INFORMATION

### 3.2.1 Pharmaceutical Supply Chain Overview

The pharmaceutical supply chain is a complex, multi-stage process that begins with raw material sourcing and ends with the delivery of finished medicines to patients. Key stages include:

1. **Raw Material Procurement** — Sourcing active pharmaceutical ingredients (APIs) and excipients from approved suppliers
2. **Batch Manufacturing** — Producing pharmaceutical products in controlled batches with defined quantities and quality parameters
3. **Quality Control** — Testing each batch against defined specifications before release
4. **Warehouse Storage** — Storing products under controlled conditions (temperature, humidity) as specified for each product type
5. **Distribution** — Fulfilling orders from distributors and healthcare providers
6. **Compliance & Traceability** — Maintaining complete records for regulatory audits and product recalls

Each stage generates data that must be recorded, traceable, and auditable. Regulatory bodies such as the Central Drugs Standard Control Organisation (CDSCO) in India and the FDA in the United States require pharmaceutical organizations to maintain comprehensive batch records, quality documentation, and audit trails.

### 3.2.2 Regulatory Requirements

Pharmaceutical organizations must comply with Good Manufacturing Practice (GMP) guidelines, which require:
- Complete batch manufacturing records with raw material traceability
- Quality control test results for every batch before release
- Storage condition monitoring and documentation
- Recall procedures with the ability to identify and isolate all affected stock
- Audit trails for all significant operational actions

PharmaLink's Audit Log, Storage Compliance, Compliance Snapshot, and Batch Management modules are specifically designed to support these regulatory requirements.

### 3.2.3 Existing System Limitations

Traditional pharmaceutical inventory management systems have several critical limitations:

**Manual Inventory Tracking:** Spreadsheet-based systems require manual data entry for every transaction, are prone to formula errors and version conflicts, and provide no real-time visibility across departments.

**Disconnected Procurement:** Purchase orders are raised via email, tracked in separate documents, and manually reconciled against delivery receipts — with no automated link to stock level updates.

**No Batch-Level Traceability:** Most existing systems do not maintain granular batch records linking a product batch to its raw materials, quality check results, storage location, and distribution history.

**Weak Compliance Tools:** Traditional systems do not automatically generate compliance snapshots or maintain tamper-evident audit trails, requiring significant manual effort for regulatory audits.

**No Real-Time Communication:** Existing systems have no built-in mechanism for instant alerts when critical events occur — such as stock falling below minimum threshold or a batch approaching expiry.

---

## 3.3 LITERATURE REVIEW

**1. Title:** "Digital Transformation of Pharmaceutical Supply Chain Management: Challenges and Opportunities"
**Authors:** Kumar, A., & Singh, R.
**Journal:** International Journal of Pharmaceutical Sciences and Research (2022)
**Summary:** This study examines the shift from manual to digital supply chain management in the pharmaceutical sector. The research highlights that integrated web-based platforms significantly reduce stockouts, improve batch traceability, and enhance regulatory compliance. The findings emphasize the need for real-time inventory visibility and automated procurement workflows — core capabilities addressed by PharmaLink.

---

**2. Title:** "Blockchain and IoT Integration for Pharmaceutical Supply Chain Traceability"
**Authors:** Patel, S., & Mehta, D.
**Journal:** Journal of Supply Chain Management Technology (2023)
**Summary:** The paper explores the use of emerging technologies for end-to-end pharmaceutical product traceability. While blockchain offers immutability, the study notes that web-based systems with QR code traceability and audit logging provide a practical, cost-effective alternative for small to mid-sized pharmaceutical organizations — aligning with PharmaLink's QR-based batch tracking and comprehensive audit log implementation.

---

**3. Title:** "Role-Based Access Control in Healthcare Information Systems: A Security Framework"
**Authors:** Sharma, V., & Gupta, N.
**Journal:** Journal of Information Security and Applications (2021)
**Summary:** This study discusses the importance of RBAC in protecting sensitive healthcare and pharmaceutical data. It emphasizes that granular permission systems, combined with JWT-based authentication and multi-factor authentication, significantly reduce unauthorized access risks — directly informing PharmaLink's security architecture with role-based routing, JWT tokens, and 2FA via Speakeasy.

---

**4. Title:** "Real-Time Inventory Management Systems for Pharmaceutical Warehouses: A Comparative Analysis"
**Authors:** Chen, L., & Wang, H.
**Journal:** International Journal of Logistics Management (2022)
**Summary:** This research compares traditional periodic inventory review systems with real-time digital inventory management platforms. Results demonstrate that real-time systems reduce inventory carrying costs by up to 23% and improve order fulfillment accuracy. The study validates PharmaLink's approach of maintaining live stock levels with automated low-stock notifications and warehouse-level stock tracking.

---

**5. Title:** "Automated Compliance Monitoring in Pharmaceutical Manufacturing: A Web-Based Approach"
**Authors:** Fernandez, J., & Torres, M.
**Journal:** Computers in Industry (2023)
**Summary:** The paper presents a framework for automated compliance monitoring in pharmaceutical operations, covering storage conditions, batch documentation, and regulatory reporting. The research demonstrates that automated compliance snapshots and audit trails reduce manual compliance effort by over 60% — a key motivation for PharmaLink's Storage Compliance and Compliance Snapshot modules.

---

**6. Title:** "Demand Forecasting in Pharmaceutical Supply Chains Using Historical Data Analytics"
**Authors:** Okafor, E., & Nwosu, C.
**Journal:** Journal of Operations Management and Analytics (2024)
**Summary:** This study analyzes the effectiveness of data-driven demand forecasting in reducing pharmaceutical waste and preventing stockouts. The findings suggest that systems incorporating historical order data and trend visualization enable procurement teams to make significantly more accurate purchasing decisions — supporting PharmaLink's Forecasting module design.

---

**7. Title:** "Security and Privacy in Web-Based Supply Chain Management Systems"
**Authors:** Park, J., & Kim, S.
**Journal:** Computers & Security (2023)
**Summary:** This paper discusses major security vulnerabilities in web-based supply chain platforms, including API injection attacks, session hijacking, and unauthorized data access. It recommends bcrypt password hashing, JWT token expiry, HTTPS enforcement, and input validation as essential countermeasures — all of which are implemented in PharmaLink's backend security layer.

---

### Summary of Literature Review

The reviewed studies collectively highlight the growing importance of digital transformation in pharmaceutical supply chain management, emphasizing the need for real-time inventory visibility, automated compliance monitoring, robust security frameworks, and data-driven decision-making. Research findings consistently demonstrate that integrated web-based platforms outperform traditional manual systems in accuracy, efficiency, and regulatory readiness.

Studies on RBAC and authentication security directly informed PharmaLink's JWT + 2FA security architecture. Research on demand forecasting and inventory analytics validated the inclusion of the Forecasting and Expiry Intelligence modules. Literature on compliance automation supported the design of the Storage Compliance and Audit Log features. The comparative analysis of real-time vs. periodic inventory systems confirmed the value of PharmaLink's live stock tracking approach.

---

Parul University — Parul Institute of Technology
Department of Computer Science and Engineering
Academic Year: 2025-26
