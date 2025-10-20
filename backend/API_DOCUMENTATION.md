# Client Management System API Documentation

## Overview

The Client Management System API provides a RESTful interface for managing client data. It supports full CRUD operations (Create, Read, Update, Delete) with comprehensive validation, pagination, search capabilities, and error handling.

**Base URL:** `http://localhost:3001`
**API Base:** `http://localhost:3001/api`

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Handling](#error-handling)
4. [Endpoints](#endpoints)
   - [Health & Status](#health--status)
   - [Client Management](#client-management)
5. [Data Models](#data-models)
6. [Testing](#testing)

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "meta": {
    // Optional metadata (pagination, etc.)
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional additional error details
    }
  }
}
```

## Error Handling

### HTTP Status Codes

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `204` - No Content: Resource deleted successfully
- `400` - Bad Request: Invalid request data or parameters
- `404` - Not Found: Resource not found
- `409` - Conflict: Resource already exists (duplicate email)
- `500` - Internal Server Error: Unexpected server error

### Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Requested resource not found
- `DUPLICATE_EMAIL` - Email address already exists
- `ENDPOINT_NOT_FOUND` - API endpoint does not exist
- `INTERNAL_ERROR` - Unexpected server error

## Endpoints

### Health & Status

#### GET /health
Check if the server is running.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-10-19T23:30:00.000Z"
}
```

#### GET /api/status
Get detailed API status information.

**Response:**
```json
{
  "success": true,
  "data": {
    "service": "Client Management System API",
    "version": "1.0.0",
    "status": "operational",
    "uptime": 123.456,
    "timestamp": "2025-10-19T23:30:00.000Z",
    "environment": "development"
  }
}
```

### Client Management

#### GET /api/clients
Retrieve all clients with pagination, search, and sorting capabilities.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search term for name or email
- `sortBy` (string, optional): Sort field - `name`, `email`, `created_at`, `updated_at` (default: `created_at`)
- `order` (string, optional): Sort order - `ASC` or `DESC` (default: `DESC`)

**Example Request:**
```
GET /api/clients?page=1&limit=5&search=john&sortBy=name&order=ASC
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "(555) 123-4567",
      "created_at": "2025-10-19T12:00:00.000Z",
      "updated_at": "2025-10-19T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "total": 15,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### GET /api/clients/stats
Get client statistics.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "totalWithPhone": 20,
    "totalWithoutPhone": 5,
    "recentlyAdded": 3
  }
}
```

#### GET /api/clients/:id
Retrieve a specific client by ID.

**Parameters:**
- `id` (number, required): Client ID

**Example Request:**
```
GET /api/clients/1
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "(555) 123-4567",
    "created_at": "2025-10-19T12:00:00.000Z",
    "updated_at": "2025-10-19T12:00:00.000Z"
  }
}
```

**Error Responses:**
```json
// Invalid ID format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid ID: must be a positive integer"
  }
}

// Client not found
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Client not found"
  }
}
```

#### POST /api/clients
Create a new client.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "(555) 987-6543"
}
```

**Field Validation:**
- `name` (string, required): 1-100 characters
- `email` (string, required): Valid email format, unique
- `phone` (string, optional): 10-20 characters, valid phone format

**Example Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 26,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "(555) 987-6543",
    "created_at": "2025-10-19T23:30:00.000Z",
    "updated_at": "2025-10-19T23:30:00.000Z"
  }
}
```

**Error Responses:**
```json
// Missing required fields
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: name, email",
    "details": {
      "missingFields": ["name", "email"]
    }
  }
}

// Duplicate email
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Failed to create client: Email address already exists"
  }
}

// Invalid email format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
```

#### PUT /api/clients/:id
Update an existing client.

**Parameters:**
- `id` (number, required): Client ID

**Request Body (all fields optional):**
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "phone": "(555) 111-2222"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 26,
    "name": "Jane Smith Updated",
    "email": "jane.updated@example.com",
    "phone": "(555) 111-2222",
    "created_at": "2025-10-19T23:30:00.000Z",
    "updated_at": "2025-10-19T23:35:00.000Z"
  }
}
```

**Error Responses:**
```json
// Client not found
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Failed to update client: Client not found"
  }
}

// Email already exists
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Failed to update client: Email address already exists"
  }
}
```

#### DELETE /api/clients/:id
Delete a client.

**Parameters:**
- `id` (number, required): Client ID

**Example Request:**
```
DELETE /api/clients/26
```

**Example Response (204 No Content):**
No response body.

**Error Response:**
```json
// Client not found
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Failed to delete client: Client not found"
  }
}
```

## Data Models

### Client Model

```typescript
interface Client {
  id: number;              // Auto-generated primary key
  name: string;            // Required, 1-100 characters
  email: string;           // Required, unique, valid email format
  phone?: string;          // Optional, 10-20 characters
  created_at: string;      // Auto-generated ISO timestamp
  updated_at: string;      // Auto-updated ISO timestamp
}
```

### Validation Rules

#### Name
- Required field
- String type
- Length: 1-100 characters
- Cannot be only whitespace

#### Email
- Required field
- Must be valid email format
- Must be unique across all clients
- Case-insensitive uniqueness

#### Phone
- Optional field
- String type
- Length: 10-20 characters when provided
- Must match phone number pattern: `^[\\+]?[\\d\\s\\-\\(\\)\\.]{10,20}$`
- Allows formats like: `(555) 123-4567`, `+1-555-123-4567`, `555.123.4567`

## Testing

### Manual Testing with curl

#### Get all clients:
```bash
curl -X GET "http://localhost:3001/api/clients" \\
  -H "Content-Type: application/json"
```

#### Create a new client:
```bash
curl -X POST "http://localhost:3001/api/clients" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "(555) 123-4567"
  }'
```

#### Get client by ID:
```bash
curl -X GET "http://localhost:3001/api/clients/1" \\
  -H "Content-Type: application/json"
```

#### Update a client:
```bash
curl -X PUT "http://localhost:3001/api/clients/1" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated Name",
    "phone": "(555) 987-6543"
  }'
```

#### Delete a client:
```bash
curl -X DELETE "http://localhost:3001/api/clients/1" \\
  -H "Content-Type: application/json"
```

### Automated Testing

The API includes comprehensive test suites:

- **Controller Tests**: `src/controllers/test-controller.js`
- **Route Tests**: `src/routes/test-routes.js`  
- **Model Tests**: `src/models/test-client.js`
- **Route Verification**: `verify-routes.js`

Run tests:
```bash
# Verify route setup
node verify-routes.js

# Test all controllers
node src/controllers/test-controller.js

# Test all models
node src/models/test-client.js

# Test API routes (requires running server)
node src/routes/test-routes.js
```

### Postman Collection

For easy testing, you can import this Postman collection:

```json
{
  "info": {
    "name": "Client Management System API",
    "description": "Complete API test collection"
  },
  "item": [
    {
      "name": "Get All Clients",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/clients"
      }
    },
    {
      "name": "Create Client",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/clients",
        "body": {
          "mode": "raw",
          "raw": "{\\n  \\"name\\": \\"Test User\\",\\n  \\"email\\": \\"test@example.com\\",\\n  \\"phone\\": \\"(555) 123-4567\\"\\n}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001"
    }
  ]
}
```

## Rate Limiting & Performance

Currently, there are no rate limits implemented. The API can handle typical development workloads. For production deployment, consider adding:

- Rate limiting middleware
- Request/response compression
- Connection pooling
- Caching layer
- Load balancing

## Security Considerations

Current security features:
- Input validation and sanitization
- SQL injection prevention (prepared statements)
- CORS configuration
- Error message sanitization

For production, consider adding:
- Authentication & authorization
- HTTPS enforcement  
- Request validation middleware
- API versioning
- Audit logging
- Input rate limiting

---

**API Version:** 1.0.0  
**Last Updated:** October 19, 2025  
**Contact:** Development Team