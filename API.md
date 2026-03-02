# API Documentation – Sudan Government Digital Unified System (SGDUS)

This document provides detailed API specifications for SGDUS modules.  
Current frontend build default API base: `/api` (or `VITE_API_BASE_URL` when provided).  
Authentication requirements vary by endpoint (for example, health is public while session/logout are auth-related).  
Responses are JSON unless explicitly noted otherwise.

---

## Implementation Snapshot (Current Build & Worker Logic)

The production code currently runs a Cloudflare Worker from `/api/index.js` (configured in `workers.toml`) and the frontend calls `import.meta.env.VITE_API_BASE_URL || '/api'`.

- **Frontend build/runtime API base**
  - `VITE_API_BASE_URL` (fallback: `/api`)
  - Used in:
    - `src/pages/LoginPage.jsx`
    - `src/pages/DashboardPage.jsx`
    - `src/utils/cloudflareIntegration.js`
- **Worker route prefix**: `/api/*` (see `api/index.js` and `workers.toml` route pattern)
- **Health endpoint (live in code)**: `GET /api/health` (also supports `GET /health`)

### Live Endpoints in `api/index.js`

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/health` | Returns API status, environment, CF metadata, and binding availability |
| POST | `/api/citizen/search` | Body: `{ "nationalId": "..." }` |
| POST | `/api/documents/upload` | Multipart upload (`file`, `citizenId`, `docType`) to R2 |
| GET | `/api/documents/{key}` | Fetch document object by key |
| POST | `/api/services/request` | Create service request (`ministry`, `serviceType`, optional `citizenId`, `notes`) |
| GET | `/api/analytics/dashboard` | Returns dashboard stats (uses cache + D1 analytics when present) |
| GET | `/api/oid/{oid}` | Resolve OID from KV/D1 |
| POST | `/api/auth/session` | Creates session token (`username`, `password`) |
| POST | `/api/auth/logout` | Deletes current session token |
| Any | `/api/{ministry}` | Ministry datasets (`health`, `education`, `finance`, `agriculture`, `energy`, `infrastructure`, `justice`, `labor`, `social_welfare`, `foreign_affairs`, `mining`) |
| Any | `/api/stream/*` | Durable Object citizen stream proxy (when configured) |

> **Important:** Some sections below describe broader platform target APIs. For implementation and integration with the current deployed build, use the snapshot above as source of truth.

---

## Table of Contents

1. [Authentication & Common Headers](#authentication--common-headers)
2. [Implementation Snapshot (Current Build & Worker Logic)](#implementation-snapshot-current-build--worker-logic)
3. [Error Handling](#error-handling)
4. [Core Modules](#core-modules)
   - [OID Service](#oid-service)
   - [Identity Service](#identity-service)
   - [Agency Integration Service](#agency-integration-service)
   - [USSD Service](#ussd-service)
   - [Audit Service](#audit-service)
   - [Data Quality Engine](#data-quality-engine)
   - [Fraud Detection System](#fraud-detection-system)
   - [Reporting & Analytics Engine](#reporting--analytics-engine)
   - [Compliance & Audit Engine](#compliance--audit-engine)
   - [Backup & Recovery System](#backup--recovery-system)
   - [Notification System](#notification-system)
   - [Access Control Engine](#access-control-engine)
   - [Integration Orchestrator](#integration-orchestrator)
   - [Performance Monitor](#performance-monitor)
5. [Resource Modules](#resource-modules)
   - [Nile Water Management](#nile-water-management)
   - [Farming & Agriculture](#farming--agriculture)
   - [Gold & Treasures Management](#gold--treasures-management)
   - [Red Sea & Ports Management](#red-sea--ports-management)
   - [Education Management](#education-management)
   - [Healthcare Management](#healthcare-management)

---

## Authentication & Common Headers

- **Authentication**: `Authorization: Bearer <JWT_token>`
- **Content-Type**: `application/json`
- **Accept**: `application/json`

Tokens are obtained via the `/auth/login` endpoint (see Identity Service).  
In the current Worker implementation, tokens are issued by `POST /api/auth/session` and expire after 8 hours.

---

## Error Handling

All endpoints return standard HTTP status codes.  
Error responses have the structure:

```json
{
  "error": "Error message",
  "details": "Optional additional information"
}
```

Common status codes:
- `200` – Success
- `400` – Bad request (invalid parameters)
- `401` – Unauthorized (missing or invalid token)
- `403` – Forbidden (insufficient permissions)
- `404` – Resource not found
- `500` – Internal server error

---

## Core Modules

### OID Service

**Base Path**: `/oid`

#### Generate OID
`POST /generate`

Generate a new OID for an entity.

**Request Body**:
```json
{
  "type": "2",            // 1=place,2=citizen,3=business,4=government,5=service,6=document
  "stateCode": "01",      // two-digit Sudanese state code
  "entityId": "1234567890",
  "metadata": {           // optional
    "firstName": "Ahmed",
    "lastName": "Mohamed"
  }
}
```

**Response**:
```json
{
  "success": true,
  "oid": "1.3.6.1.4.1.61026.2.01.00000001",
  "message": "OID generated successfully",
  "timestamp": "2026-03-02T10:00:00Z"
}
```

#### Resolve OID
`GET /{oid}`

Retrieve information about an OID.

**Response**:
```json
{
  "success": true,
  "data": {
    "oid": "1.3.6.1.4.1.61026.2.01.00000001",
    "type": 2,
    "state_code": "01",
    "entity_id": "1234567890",
    "metadata": {...},
    "created_at": "2026-03-02T10:00:00Z",
    "status": "active"
  },
  "timestamp": "..."
}
```

#### Search OIDs
`GET /search?type=2&stateCode=01&status=active&limit=50&offset=0`

Query parameters are optional.

---

### Identity Service

**Base Path**: `/identity`

#### Citizen Registration
`POST /citizen/register`

Registers a new citizen. Requires authentication (user token of an authorised staff member or the citizen themselves).

**Request Body**:
```json
{
  "national_id": "1234567890",
  "first_name": "Ahmed",
  "middle_name": "Hassan",
  "last_name": "Mohamed",
  "date_of_birth": "1990-01-01",
  "gender": "M",
  "phone_number": "+249123456789",
  "email": "ahmed@example.com",
  "address": "Khartoum, Sudan",
  "state_code": "01",
  "biometric_data": "hash..."  // optional
}
```

**Response**:
```json
{
  "success": true,
  "oid": "1.3.6.1.4.1.61026.2.01.00000001",
  "data": {...},
  "message": "Citizen registered successfully"
}
```

#### Business Registration
`POST /business/register`

Registers a new business.

**Request Body**:
```json
{
  "registration_number": "SD-ABCDE",
  "business_name": "Sudan Traders",
  "business_type": "sole_proprietorship",
  "owner_oid": "1.3.6.1.4.1.61026.2.01.00000001",
  "tax_id": "TIN-12345",
  "address": "Khartoum",
  "phone_number": "+249123456789",
  "email": "info@example.com",
  "state_code": "01"
}
```

**Response**:
```json
{
  "success": true,
  "oid": "1.3.6.1.4.1.61026.3.01.00000005",
  "data": {...},
  "message": "Business registered successfully"
}
```

#### Get Citizen by OID
`GET /citizen/{oid}`

#### Verify Identity
`POST /verify`

Used to verify a citizen's identity via biometric or document.

**Request Body**:
```json
{
  "oid": "1.3.6.1.4.1.61026.2.01.00000001",
  "verification_type": "biometric",
  "verification_data": "hash..."
}
```

**Response**:
```json
{
  "success": true,
  "verified": true,
  "verification_details": { "type": "biometric", "match": true }
}
```

---

### Agency Integration Service

**Base Path**: `/integration`

Adapters to Sudanese government agencies.

#### Register Birth (Civil Registry)
`POST /civil-registry/birth`

**Request Body**:
```json
{
  "national_id": "1234567890",
  "first_name": "Baby",
  "last_name": "Mohamed",
  "date_of_birth": "2026-02-01",
  "gender": "M",
  "father_national_id": "1234567891",
  "mother_national_id": "1234567892",
  "place_of_birth": "Khartoum Hospital"
}
```

#### Register Business (Business Registry)
`POST /business/register`

#### Generate Tax ID
`POST /tax-id/generate`

#### Request Export License (Customs)
`POST /customs/export-license`

#### Register Property (Land Registry)
`POST /land/register`

---

### USSD Service

**Base Path**: `/ussd`

#### USSD Handler
`POST /`

Handles USSD sessions. The request body contains sessionId, phoneNumber, and text (user input).  
Returns a plain text response (not JSON). See the USSD service documentation for flow.

---

### Audit Service

**Base Path**: `/audit`

#### Create Audit Entry
`POST /`

**Request Body**:
```json
{
  "event": "citizen_registered",
  "user_oid": "1.3.6.1.4.1.61026.2.01.00000001",
  "data": { "citizen_oid": "..." },
  "timestamp": "2026-03-02T10:00:00Z"
}
```

#### Query Audit Logs
`GET /?entityOid=...&event=...&from=...&to=...&limit=100`

Admin only.

---

### Data Quality Engine

**Base Path**: `/data-quality`

#### Validate Data
`POST /validate`

**Request Body**:
```json
{
  "data": { "national_id": "1234567890", "first_name": "Ahmed" },
  "entityType": "citizen"
}
```

**Response**:
```json
{
  "success": true,
  "validationResults": {...},
  "overallScore": 0.95,
  "badge": "A",
  "issues": [],
  "anomalies": []
}
```

#### Cleanse Data
`POST /cleanse`

Returns cleaned data with a quality report.

#### Enrich Data
`POST /enrich`

Adds enrichment fields (e.g., confidence scores).

---

### Fraud Detection System

**Base Path**: `/fraud`

#### Detect Fraud
`POST /detect`

**Request Body**:
```json
{
  "data": { "national_id": "1234567890", "ip_address": "196.0.0.1" },
  "context": { "user_agent": "Mozilla/5.0" }
}
```

**Response**:
```json
{
  "success": true,
  "fraudDetected": false,
  "riskScore": 0.2,
  "action": { "type": "APPROVE", "message": "..." },
  "detectionResults": []
}
```

#### Batch Detect
`POST /batch-detect`

#### Get Statistics
`GET /statistics`

---

### Reporting & Analytics Engine

**Base Path**: `/reports`

#### Generate Report
`POST /generate`

**Request Body**:
```json
{
  "reportType": "citizen_registration_daily",
  "filters": { "date_range": "2026-02-01 to 2026-02-28", "state": "01" },
  "format": "pdf"
}
```

#### List Report Templates
`GET /templates`

#### Schedule Report
`POST /schedule`

---

### Compliance & Audit Engine

**Base Path**: `/compliance`

#### Check Compliance
`POST /check`

**Request Body**:
```json
{
  "entityData": { "national_id": "1234567890", "entity_type": "citizen" },
  "entityType": "citizen",
  "context": { "operation": "registration" }
}
```

#### Generate Compliance Report
`POST /report`

#### Get Regulatory Report
`POST /regulatory-report`

---

### Backup & Recovery System

**Base Path**: `/backup`

#### Create Backup
`POST /create`

**Request Body**:
```json
{
  "type": "full",
  "options": { "includeFiles": true }
}
```

#### Restore Backup
`POST /restore`

**Request Body**:
```json
{
  "backupId": "uuid",
  "options": { "includeFiles": false }
}
```

#### Get Status
`GET /status`

---

### Notification System

**Base Path**: `/notifications`

#### Send Notification
`POST /send`

**Request Body**:
```json
{
  "eventType": "CITIZEN_REGISTERED",
  "data": { "oid": "...", "first_name": "Ahmed" },
  "recipients": ["+249123456789", "ahmed@example.com"],
  "options": { "channels": ["sms", "email"] }
}
```

#### Update User Preferences
`POST /preferences`

#### Get User Preferences
`GET /preferences/{userOid}`

#### Get Notification History
`GET /history/{userOid}`

---

### Access Control Engine

**Base Path**: `/access`

#### Check Access
`POST /check`

**Request Body**:
```json
{
  "userOid": "1.3.6.1.4.1.61026.2.01.00000001",
  "resource": "citizen",
  "action": "read",
  "context": { "resourceId": "..." }
}
```

**Response**:
```json
{
  "granted": true,
  "role": "citizen",
  "constraints": {...},
  "policies": {...}
}
```

#### Adaptive Security Check
`POST /adaptive-check`

#### Assign Role
`POST /assign-role`

#### Revoke Role
`POST /revoke-role`

#### Create Custom Role
`POST /create-role`

#### Get Access Stats
`GET /stats`

---

### Integration Orchestrator

**Base Path**: `/integration-orchestrator`

#### Execute Integration
`POST /execute`

**Request Body**:
```json
{
  "integration": "civil_registry",
  "action": "register_citizen",
  "data": { "national_id": "1234567890", ... },
  "context": {}
}
```

#### Execute Orchestration
`POST /orchestrate`

**Request Body**:
```json
{
  "orchestration": "citizen_registration_orchestration",
  "data": { ... }
}
```

#### Check Health
`GET /health`

---

### Performance Monitor

**Base Path**: `/performance`

#### Get Current Metrics
`GET /metrics`

#### Get Metric History
`GET /history/{metricName}`

#### Get System Health
`GET /system-health`

#### Get Performance Alerts
`GET /alerts`

---

## Resource Modules

### Nile Water Management

**Base Path**: `/nile-water`

#### Get Water Allocation
`POST /allocation`

**Request Body**:
```json
{
  "farmerOid": "1.3.6.1.4.1.61026.3.01.00000005",
  "farmLocation": "Gezira",
  "cropType": "sorghum",
  "farmArea": 10.5
}
```

**Response**:
```json
{
  "success": true,
  "allocation": { "totalWaterNeeded": 4500, "irrigationSchedule": [...] },
  "timestamp": "..."
}
```

#### Get Nile Monitoring Data
`GET /monitoring?station=khartoum&days=7`

#### Get Irrigation Recommendations
`GET /recommendations?farmerOid=...`

#### Get Water Statistics
`GET /statistics`

---

### Farming & Agriculture

**Base Path**: `/farming`

#### Get Crop Recommendations
`POST /crop-recommendations`

**Request Body**:
```json
{
  "farmerOid": "...",
  "stateCode": "16",
  "farmArea": 5,
  "soilType": "sandy_loam"
}
```

#### Get Livestock Recommendations
`POST /livestock-recommendations`

**Request Body**:
```json
{
  "farmerOid": "...",
  "stateCode": "06",
  "farmArea": 10,
  "existingLivestock": [ { "type": "cattle", "count": 5 } ]
}
```

#### Generate Agricultural Plan
`POST /generate-plan`

#### Get Market Data
`GET /market-data?stateCode=01`

#### Get Agricultural Plans
`GET /plans/{farmerOid}`

---

### Gold & Treasures Management

**Base Path**: `/gold-treasures`

#### Apply for Mining License
`POST /mining-license`

**Request Body**:
```json
{
  "resourceType": "gold",
  "zoneCode": "nubian_shield",
  "companyInfo": {
    "name": "Sudan Gold Co.",
    "capital": 2000000,
    "experience": 5,
    "safetyCertified": true,
    "environmentalCertified": true
  }
}
```

#### Export Resource
`POST /export`

**Request Body**:
```json
{
  "resourceType": "gold",
  "quantity": 100,
  "quality": 99.9,
  "destination": "UAE",
  "companyLicense": "ML-2026-GLD-12345678"
}
```

#### Get Resource Statistics
`GET /statistics`

#### Get Current Prices
`GET /prices`

---

### Red Sea & Ports Management

**Base Path**: `/ports`

#### Check Port Availability
`POST /availability`

**Request Body**:
```json
{
  "portCode": "port_sudan",
  "vesselType": "container",
  "arrivalDate": "2026-03-10"
}
```

#### Calculate Shipping Costs
`POST /shipping-costs`

**Request Body**:
```json
{
  "routeCode": "sudan_uae",
  "vesselType": "container",
  "cargoValue": 500000,
  "cargoWeight": 1000
}
```

#### Schedule Vessel Arrival
`POST /schedule-arrival`

**Request Body**:
```json
{
  "portCode": "port_sudan",
  "vesselInfo": { "name": "Sea Bird", "type": "container", "grossTonnage": 20000 },
  "cargoDetails": { "type": "containerized", "value": 500000 },
  "arrivalDate": "2026-03-10"
}
```

#### Process Customs Clearance
`POST /customs-clearance`

#### Get Port Statistics
`GET /statistics`

---

### Education Management

**Base Path**: `/education`

#### Get Student Recommendations
`POST /student-recommendations`

**Request Body**:
```json
{
  "studentOid": "1.3.6.1.4.1.61026.2.01.00000010",
  "age": 14,
  "currentLevel": "intermediate",
  "stateCode": "16"
}
```

#### Generate Educational Plan
`POST /generate-plan`

**Request Body**:
```json
{
  "studentOid": "...",
  "educationLevel": "secondary",
  "goals": ["become engineer"]
}
```

#### Get Education Statistics
`GET /statistics`

---

### Healthcare Management

**Base Path**: `/healthcare`

#### Get Health Recommendations
`POST /recommendations`

**Request Body**:
```json
{
  "patientOid": "...",
  "age": 45,
  "gender": "F",
  "stateCode": "01",
  "conditions": ["diabetes"]
}
```

#### Generate Health Plan
`POST /generate-plan`

**Request Body**:
```json
{
  "patientOid": "...",
  "age": 45,
  "gender": "F",
  "stateCode": "01",
  "conditions": ["diabetes", "hypertension"]
}
```

#### Get Healthcare Statistics
`GET /statistics`

---

## Notes

- All timestamps are in ISO 8601 format.
- Pagination is available on list endpoints using `limit` and `offset` parameters.
- For batch operations, the request body may contain an array of objects.
- The API is versioned; always use the latest stable version (`/v1`).

For further assistance, contact the SGDUS technical team
---

*Document version: 1.0 – March 2026*
