# 6.4 RESULT ANALYSIS

PharmaLink — Advanced Inventory & Supply Chain Management was evaluated based on key performance indicators including system functionality, operational efficiency, security robustness, real-time responsiveness, and compliance automation effectiveness. The system's performance was assessed across all 17 functional modules through end-to-end testing, API validation via Postman, and UI responsiveness testing across multiple device breakpoints.

All 17 modules were successfully implemented and verified as fully functional. The system demonstrated consistent performance across core workflows — from user authentication and inventory management through purchase order processing, quality control, compliance monitoring, and report generation. Every module met its defined functional requirements without critical failures during testing.

A comparative analysis between PharmaLink and traditional pharmaceutical inventory management methods highlights significant efficiency and accessibility advantages. Traditional methods — relying on spreadsheets, paper-based records, and disconnected ERP systems — require manual data entry for every transaction, lack real-time visibility, and produce no automated compliance documentation. In contrast, PharmaLink provides instant, automated inventory updates, real-time dashboards, and automated daily compliance snapshots — eliminating the manual overhead that characterizes conventional pharmaceutical supply chain management.

The security architecture was validated through authentication testing. JWT token generation, bcrypt password hashing, and TOTP-based Two-Factor Authentication via Speakeasy all performed as expected. Unauthorized API access attempts were correctly rejected with 401/403 HTTP responses. Role-based access control was verified to correctly restrict Admin-only routes from Distributor users at both the React Router level and the Express.js middleware level.

Real-time features were stress-tested for concurrent user scenarios. Socket.IO-powered messaging delivered messages between users with sub-second latency under normal network conditions. The automated notification system correctly triggered and delivered in-platform notifications for all configured events — low stock alerts, expiry warnings, order status changes, and quality check results — without requiring manual intervention.

The automated compliance snapshot system, running on a daily `setInterval` scheduler in `server.js`, correctly calculated composite compliance scores across five weighted metrics: Batch Testing Rate (25%), Expiry Score (20%), Storage Score (25%), Recall Completion Rate (15%), and Order Fulfillment Rate (15%). The weighted formula produced accurate overall compliance scores that reflected the true operational state of the system during testing.

Report generation was validated for both PDF (PDFKit) and CSV (json2csv) export formats. All report types — inventory status, order history, quality metrics, compliance summaries, and audit logs — generated correctly formatted, downloadable files. QR code generation (server-side via `qrcode`) and browser-based scanning (via `html5-qrcode`) were tested on multiple mobile devices and confirmed to work reliably without dedicated scanning hardware.

The Recharts-based dashboard visualizations — Production Volume bar chart, Order Status donut pie chart, Low Stock Alerts panel, and Expiring in 30 Days panel — all rendered correctly with live data and responded accurately to the configurable date filter (Last 30/90/365 days / All time).

A cost-benefit analysis further demonstrates the system's value. PharmaLink is built entirely on open-source technologies — React.js, Node.js, Express.js, MongoDB, Socket.IO — resulting in zero framework licensing costs. The backend is deployable on affordable cloud platforms (Render, Railway, DigitalOcean) and MongoDB Atlas provides a managed database tier suitable for production use. The primary investment is development time, which is substantially offset by the operational savings from automating manual inventory, procurement, compliance, and reporting workflows.

Looking ahead, several enhancements can be integrated to further improve the system. Future iterations could incorporate IoT-based cold chain temperature monitoring for real-time pharmaceutical storage compliance, AI-powered demand forecasting using deep learning models trained on larger historical datasets, blockchain-based batch traceability for regulatory submissions, and a React Native mobile application sharing the same backend REST API. By continuously evolving with technological advancements, PharmaLink has the potential to become a comprehensive, enterprise-grade pharmaceutical supply chain management platform.

---

# 7. TESTING

Testing is a crucial phase in the development of PharmaLink — Advanced Inventory & Supply Chain Management. The goal of testing is to ensure the accuracy, reliability, security, and performance of all system modules while validating that the full-stack web application meets its defined functional and non-functional requirements. Various testing methodologies were implemented to evaluate the system under different conditions and usage scenarios.

---

## 7.1 TESTING PLAN

The testing plan for PharmaLink involves multiple stages covering all layers of the full-stack application — from individual API endpoints and React components through end-to-end workflow validation and security verification.

**Unit Testing**
Ensures that individual components work correctly in isolation. Backend route handlers were tested independently using Postman to verify that each API endpoint returns the correct HTTP status codes, response structures, and data for valid and invalid inputs. Frontend React components were validated for correct rendering, state management, and prop handling.

**Integration Testing**
Verifies that different modules work together seamlessly. Tests the interaction between the React frontend (user interface), Express.js backend (API processing), MongoDB database (data persistence), and Socket.IO server (real-time communication). Cross-module workflows — such as creating a Purchase Order and verifying the automatic stock update — were validated end-to-end.

**Performance Testing**
Measures the speed and efficiency of the system when processing requests with realistic data volumes. Ensures that API endpoints return responses within acceptable timeframes. Dashboard data loading — which makes 5 parallel API calls via `Promise.all` — was tested to confirm that concurrent requests complete without timeout errors.

**Security Testing**
Validates the multi-layer security architecture. Tests include: attempting to access protected API routes without a JWT token (expected: 401 Unauthorized), attempting to access Admin-only routes with a Distributor JWT token (expected: 403 Forbidden), verifying that passwords are stored as bcrypt hashes (never plaintext), and confirming that 2FA TOTP codes are correctly validated and rejected when expired.

**Real-Time Feature Testing**
Validates Socket.IO-powered messaging and notification delivery. Tests confirm that messages sent between users appear in real-time without page refresh, that notification badges update instantly when new notifications arrive, and that Socket.IO reconnects gracefully after a simulated network interruption.

**User Acceptance Testing (UAT)**
The system was tested with representative users across both roles — Admin and Distributor — to ensure usability and workflow correctness. Feedback was collected on interface clarity, navigation intuitiveness, form validation behavior, and the accuracy of dashboard data. The role-specific sidebar navigation and protected route redirects were validated to ensure each user type sees only their authorized modules.

---

## 7.2 TEST RESULTS AND ANALYSIS

### 7.2.1 Test Cases (Test ID, Test Condition, Expected Output, Actual Output, Remark)

---

**Test Cases for PharmaLink — Full-Stack Web Application**

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 1 | 1 | 0 |
| **Description** | User Authentication & JWT Token Generation | | |
| **Procedure** | 1. Submit valid email and password via POST `/api/auth/login`. 2. Verify that a JWT token is returned in the response. 3. Submit invalid credentials and verify 401 Unauthorized response. 4. Submit a valid token in the Authorization header and verify protected route access. | | |
| **Expected Result** | Valid credentials return a JWT token; invalid credentials return 401; protected routes accessible with valid token. | | |
| **Actual Result** | JWT token generated successfully on valid login; 401 returned for invalid credentials; protected routes correctly enforced. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 1: User Authentication & JWT Token Generation*

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 2 | 2 | 0 |
| **Description** | Role-Based Access Control (RBAC) Enforcement | | |
| **Procedure** | 1. Login as a Distributor user and obtain JWT token. 2. Attempt to access Admin-only route (e.g., GET `/api/audit`) using the Distributor token. 3. Verify that a 403 Forbidden response is returned. 4. Login as Admin and verify the same route returns 200 OK with data. | | |
| **Expected Result** | Distributor token rejected on Admin-only routes with 403; Admin token grants access with 200. | | |
| **Actual Result** | RBAC correctly enforced — Distributor received 403 on Admin routes; Admin received 200 with full data. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 2: Role-Based Access Control Enforcement*

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 3 | 3 | 0 |
| **Description** | Product & Batch CRUD Operations | | |
| **Procedure** | 1. Create a new product via POST `/api/products` with all required fields. 2. Verify the product appears in GET `/api/products` response. 3. Update the product via PUT `/api/products/:id` and verify the change. 4. Create a batch linked to the product via POST `/api/batches`. 5. Verify batch appears with correct product reference and QR code data. | | |
| **Expected Result** | Product and batch created, retrieved, and updated correctly; QR code data generated for batch. | | |
| **Actual Result** | All CRUD operations successful; batch correctly linked to product; QR code string generated and stored. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 3: Product & Batch CRUD Operations*

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 4 | 4 | 0 |
| **Description** | Purchase Order Workflow & Automatic Stock Update | | |
| **Procedure** | 1. Create a Purchase Order via POST `/api/purchase-orders` linked to a supplier and raw material. 2. Approve the PO and update status to "Received" via PUT `/api/purchase-orders/:id`. 3. Verify that the WarehouseStock quantity for the relevant material is automatically incremented. 4. Check that an AuditLog entry is created for the PO status change. | | |
| **Expected Result** | PO status updates correctly; WarehouseStock quantity increments on receipt; AuditLog entry created. | | |
| **Actual Result** | PO workflow completed successfully; stock updated automatically on receipt; audit log entry confirmed. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 4: Purchase Order Workflow & Automatic Stock Update*

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 5 | 5 | 0 |
| **Description** | Quality Control & Recall Initiation | | |
| **Procedure** | 1. Create a Quality Check record for a batch via POST `/api/quality` with `overallStatus: "Fail"`. 2. Verify the QC record is stored with correct batch reference and inspector details. 3. Initiate a recall for the failed batch via POST `/api/recalls`. 4. Verify the recall record is created with correct batch and product references. 5. Check that a notification is generated for the recall event. | | |
| **Expected Result** | QC record stored correctly; recall initiated for failed batch; notification generated for recall event. | | |
| **Actual Result** | QC record created with correct data; recall initiated successfully; notification delivered to Admin users. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 5: Quality Control & Recall Initiation*

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 6 | 6 | 0 |
| **Description** | Real-Time Messaging via Socket.IO | | |
| **Procedure** | 1. Open PharmaLink in two separate browser sessions — one as Admin, one as Distributor. 2. Send a message from Admin to Distributor via the Messages module. 3. Verify the message appears in the Distributor's chat thread in real-time without page refresh. 4. Verify the notification bell badge updates on the Distributor's session. 5. Simulate a network interruption and verify Socket.IO reconnects automatically. | | |
| **Expected Result** | Messages delivered in real-time; notification badge updates instantly; Socket.IO reconnects after interruption. | | |
| **Actual Result** | Real-time message delivery confirmed with sub-second latency; notification badge updated correctly; reconnection successful. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 6: Real-Time Messaging via Socket.IO*

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 7 | 7 | 0 |
| **Description** | Compliance Snapshot Calculation & Storage | | |
| **Procedure** | 1. Manually trigger the `saveComplianceSnapshot()` function in `server.js`. 2. Verify that a new ComplianceSnapshot document is created in MongoDB. 3. Check that all five metrics (testingRate, expiryScore, storageScore, recallScore, fulfillmentRate) are calculated and stored as numeric values. 4. Verify the overall composite score is calculated using the correct weighted formula. 5. Retrieve the snapshot via GET `/api/compliance` and verify the response matches the stored document. | | |
| **Expected Result** | Compliance snapshot created with all five metrics and correct overall score; retrievable via API. | | |
| **Actual Result** | Snapshot generated with all metrics correctly calculated; overall score matched manual weighted calculation; API response confirmed. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 7: Compliance Snapshot Calculation & Storage*

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 8 | 8 | 0 |
| **Description** | PDF & CSV Report Generation | | |
| **Procedure** | 1. Request a PDF report via GET `/api/reports/inventory` with appropriate JWT token. 2. Verify the response Content-Type is `application/pdf` and the file downloads correctly. 3. Request a CSV export via GET `/api/export/orders`. 4. Verify the response Content-Type is `text/csv` and the file contains correct column headers and data rows. 5. Open both files and verify data accuracy against the MongoDB collections. | | |
| **Expected Result** | PDF and CSV files generated correctly with accurate data; proper Content-Type headers returned. | | |
| **Actual Result** | PDF report downloaded successfully with correct formatting; CSV export contained accurate headers and data rows matching database records. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 8: PDF & CSV Report Generation*

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 9 | 9 | 0 |
| **Description** | QR Code Generation & Browser-Based Scanning | | |
| **Procedure** | 1. Create a new batch and verify that `qrCodeData` is populated in the response. 2. Display the QR code in the Batch Management UI modal. 3. Use a mobile device camera via the html5-qrcode scanner to scan the displayed QR code. 4. Verify that the scanned data matches the batch's `batchId` and product information. 5. Test scanning on both Android and iOS devices. | | |
| **Expected Result** | QR code generated server-side; scannable via browser camera; decoded data matches batch record. | | |
| **Actual Result** | QR code generated and displayed correctly; successfully scanned on Android and iOS devices; decoded data matched batch record exactly. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 9: QR Code Generation & Browser-Based Scanning*

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 10 | 10 | 0 |
| **Description** | Dashboard Analytics & Date Filter | | |
| **Procedure** | 1. Load the Admin Dashboard and verify all four KPI stat cards display correct values (Products, Batches, Revenue, Pending Orders). 2. Verify the Production Volume bar chart renders with correct product names and quantities. 3. Verify the Order Status donut pie chart displays correct order counts per status. 4. Switch the date filter between "Last 30 days", "Last 90 days", "Last 365 days", and "All time". 5. Verify that chart data updates correctly for each filter selection. | | |
| **Expected Result** | All KPI cards and charts display accurate data; date filter correctly updates all chart data. | | |
| **Actual Result** | KPI cards displayed correct values; charts rendered accurately; date filter correctly filtered batch and order data for all four options. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 10: Dashboard Analytics & Date Filter*

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 11 | 11 | 0 |
| **Description** | Two-Factor Authentication (2FA) via Speakeasy | | |
| **Procedure** | 1. Enable 2FA for a test Admin account via the Profile module. 2. Scan the generated QR code with Google Authenticator. 3. Logout and attempt login — verify that the system prompts for a TOTP code after password validation. 4. Enter a valid TOTP code and verify successful login. 5. Enter an expired/invalid TOTP code and verify login is rejected with an appropriate error message. | | |
| **Expected Result** | 2FA setup successful; valid TOTP grants access; invalid/expired TOTP rejected. | | |
| **Actual Result** | 2FA enabled and QR code scanned successfully; valid TOTP code granted login; expired code correctly rejected with "Invalid 2FA code" error. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 11: Two-Factor Authentication (2FA) via Speakeasy*

---

| Test case Information | | Pass | Fail |
|---|---|---|---|
| **Test No** | 12 | 12 | 0 |
| **Description** | Expiry Intelligence & Low Stock Alert System | | |
| **Procedure** | 1. Create a batch with an expiry date within the next 30 days. 2. Load the Admin Dashboard and verify the batch appears in the "Expiring in 30 Days" panel. 3. Navigate to the Expiry Intelligence module and verify the batch appears with correct expiry date and days remaining. 4. Set a raw material's `currentStock` below its `minimumThreshold`. 5. Verify the material appears in the "Low Stock Alerts" panel on the Dashboard. | | |
| **Expected Result** | Near-expiry batches appear in expiry panels; low-stock materials appear in alert panel. | | |
| **Actual Result** | Near-expiry batch correctly displayed in Dashboard and Expiry Intelligence module; low-stock material appeared in Low Stock Alerts panel with correct remaining quantity. | | |
| **Notes / Evidence of actual results** | Test is passed. | | |

*Test Case 12: Expiry Intelligence & Low Stock Alert System*

---

### 7.2.2 Summary of Test Results

| Test No | Description | Status |
|---|---|---|
| 1 | User Authentication & JWT Token Generation | Pass |
| 2 | Role-Based Access Control (RBAC) Enforcement | Pass |
| 3 | Product & Batch CRUD Operations | Pass |
| 4 | Purchase Order Workflow & Automatic Stock Update | Pass |
| 5 | Quality Control & Recall Initiation | Pass |
| 6 | Real-Time Messaging via Socket.IO | Pass |
| 7 | Compliance Snapshot Calculation & Storage | Pass |
| 8 | PDF & CSV Report Generation | Pass |
| 9 | QR Code Generation & Browser-Based Scanning | Pass |
| 10 | Dashboard Analytics & Date Filter | Pass |
| 11 | Two-Factor Authentication (2FA) via Speakeasy | Pass |
| 12 | Expiry Intelligence & Low Stock Alert System | Pass |

*Table 4.0 — PharmaLink Test Case Summary*

All 12 test cases passed successfully. No critical failures were encountered during the testing phase. The system demonstrated consistent, reliable behavior across all functional modules, security layers, real-time features, and data export capabilities.

---

*Parul University — Parul Institute of Technology*
