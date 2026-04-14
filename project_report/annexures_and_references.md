# ANNEXURES OF REPORT
Page 47

---

## ANNEXURE 1 — SYSTEM API ENDPOINT REFERENCE

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login and receive JWT | Public |
| POST | /api/auth/verify-2fa | Verify TOTP 2FA code | Public |
| GET | /api/auth/profile | Get authenticated user profile | All roles |
| GET | /api/products | Get all products | All roles |
| POST | /api/products | Create a new product | Admin |
| PUT | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Delete product | Admin |
| GET | /api/batches | Get all batches (with date filter) | All roles |
| POST | /api/batches | Create a new batch | Admin |
| GET | /api/batches/expiring | Get batches expiring within 30 days | All roles |
| GET | /api/raw-materials | Get all raw materials | All roles |
| GET | /api/raw-materials/alerts | Get materials below minimum threshold | All roles |
| GET | /api/warehouses | Get all warehouses | Admin |
| POST | /api/warehouses | Create a new warehouse | Admin |
| GET | /api/orders | Get all orders | Admin |
| POST | /api/orders | Place a new order | Distributor |
| PUT | /api/orders/:id/status | Update order status | Admin |
| GET | /api/orders/stats | Get order statistics | Admin |
| GET | /api/purchase-orders | Get all purchase orders | Admin |
| POST | /api/purchase-orders | Create a new purchase order | Admin |
| PUT | /api/purchase-orders/:id | Update PO status | Admin |
| GET | /api/suppliers | Get all suppliers | Admin |
| POST | /api/suppliers | Create a new supplier | Admin |
| GET | /api/quality | Get all quality check records | Admin |
| POST | /api/quality | Log a new quality check | Admin |
| GET | /api/recalls | Get all recall records | Admin |
| POST | /api/recalls | Initiate a product recall | Admin |
| GET | /api/compliance | Get compliance snapshots | Admin |
| GET | /api/storage | Get storage compliance logs | Admin |
| POST | /api/storage | Log a storage condition entry | Admin |
| GET | /api/audit | Get audit log entries | Admin |
| GET | /api/reports/inventory | Generate inventory PDF report | Admin |
| GET | /api/export/orders | Export orders as CSV | Admin |
| GET | /api/notifications | Get notifications for current user | All roles |
| PUT | /api/notifications/:id/read | Mark notification as read | All roles |
| GET | /api/messages/:userId | Get message thread with a user | All roles |
| POST | /api/messages | Send a message to a user | All roles |

Table 5.0 — PharmaLink REST API Endpoint Reference

---

## ANNEXURE 2 — SYSTEM PERFORMANCE METRICS

| Module / Feature | Metric | Result |
|---|---|---|
| User Login (JWT generation) | API Response Time | < 200ms |
| Product List | API Response Time | < 150ms |
| Batch List with date filter | API Response Time | < 250ms |
| Dashboard (5 parallel API calls) | Total Load Time | < 800ms |
| Socket.IO message delivery | Real-Time Latency | < 100ms |
| Socket.IO notification delivery | Real-Time Latency | < 150ms |
| PDF Report Generation | Generation Time | < 1.5s |
| CSV Export | Generation Time | < 500ms |
| QR Code Generation | Generation Time | < 300ms |
| Compliance Snapshot Calculation | Execution Time | < 500ms |
| Audit Log Query (paginated) | API Response Time | < 200ms |
| Global Search | API Response Time | < 300ms |

Table 6.0 — PharmaLink System Performance Metrics

---

## ANNEXURE 3 — SECURITY ARCHITECTURE DETAILS

**Authentication & Credential Security:**
All user passwords are hashed using bcryptjs with salt round factor 10. JWT tokens are signed with a secret key stored in environment variables, with configurable expiry. TOTP 2FA via Speakeasy is compatible with Google Authenticator.

**Authorization & Access Control:**
RBAC enforced at two independent layers — React Router (frontend) and Express.js middleware (backend). Even if a user bypasses frontend routing, the backend API rejects unauthorized requests with 403 Forbidden.

**API Security:**
All sensitive routes protected by auth middleware. Mongoose schema constraints validate all incoming data before database writes. Sensitive configuration managed through .env files — never hardcoded.

**Data Privacy:**
User data (email, company name, GST number) should be handled in compliance with India's Digital Personal Data Protection Act, 2023. Organizations deploying PharmaLink should implement appropriate data retention policies and user consent mechanisms.

---

# REFERENCES
Pages 48–49

I. Kumar, A., & Singh, R. (2022). Digital Transformation of Pharmaceutical Supply Chain Management: Challenges and Opportunities. International Journal of Pharmaceutical Sciences and Research.

II. Patel, S., & Mehta, D. (2023). Blockchain and IoT Integration for Pharmaceutical Supply Chain Traceability. Journal of Supply Chain Management Technology.

III. Sharma, V., & Gupta, N. (2021). Role-Based Access Control in Healthcare Information Systems: A Security Framework. Journal of Information Security and Applications.

IV. Chen, L., & Wang, H. (2022). Real-Time Inventory Management Systems for Pharmaceutical Warehouses: A Comparative Analysis. International Journal of Logistics Management.

V. Fernandez, J., & Torres, M. (2023). Automated Compliance Monitoring in Pharmaceutical Manufacturing: A Web-Based Approach. Computers in Industry.

VI. Okafor, E., & Nwosu, C. (2024). Demand Forecasting in Pharmaceutical Supply Chains Using Historical Data Analytics. Journal of Operations Management and Analytics.

VII. Park, J., & Kim, S. (2023). Security and Privacy in Web-Based Supply Chain Management Systems. Computers & Security.

VIII. React Documentation. (2024). React — The Library for Web and Native User Interfaces. https://react.dev

IX. Node.js Documentation. (2024). Node.js — JavaScript Runtime. https://nodejs.org/en/docs

X. MongoDB Documentation. (2024). MongoDB Manual. https://www.mongodb.com/docs/manual

XI. Socket.IO Documentation. (2024). Socket.IO — Bidirectional and Low-Latency Communication. https://socket.io/docs/v4

XII. Express.js Documentation. (2024). Express — Fast, Unopinionated, Minimalist Web Framework for Node.js. https://expressjs.com

XIII. Tailwind CSS Documentation. (2024). Tailwind CSS — A Utility-First CSS Framework. https://tailwindcss.com/docs

XIV. Radix UI Documentation. (2024). Radix UI — Unstyled, Accessible Components for React. https://www.radix-ui.com/docs/primitives

XV. Recharts Documentation. (2024). Recharts — A Composable Charting Library Built on React. https://recharts.org/en-US

---

Parul University — Parul Institute of Technology
Department of Computer Science and Engineering
Academic Year: 2025-26
