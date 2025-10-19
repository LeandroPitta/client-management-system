# API Specification

## Overview
This document describes the REST API for the Client Management System. The API follows RESTful principles and returns JSON responses.

## Base Configuration
- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **Authentication**: None (for this learning project)

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": {}, // or []
  "message": "Operation completed successfully",
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## Client Endpoints

### 1. Get All Clients
**GET** `/clients`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10, max: 100) |
| sort | string | No | Sort field (default: 'created_at') |
| order | string | No | Sort order: 'asc' or 'desc' (default: 'desc') |
| search | string | No | Search term for name or email |

#### Example Request
```
GET /api/clients?page=1&limit=10&sort=last_name&order=asc&search=john
```

#### Example Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@email.com",
      "phone": "(555) 123-4567",
      "address": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zip_code": "12345",
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 2. Get Client by ID
**GET** `/clients/:id`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Client ID |

#### Example Request
```
GET /api/clients/1
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com",
    "phone": "(555) 123-4567",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip_code": "12345",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
}
```

#### Error Response (Client Not Found)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Client not found"
  }
}
```

### 3. Create New Client
**POST** `/clients`

#### Request Body
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@email.com",
  "phone": "(555) 987-6543",
  "address": "456 Oak Ave",
  "city": "Springfield",
  "state": "IL",
  "zip_code": "62701"
}
```

#### Field Validation
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| first_name | string | Yes | 1-50 characters, letters only |
| last_name | string | Yes | 1-50 characters, letters only |
| email | string | Yes | Valid email format, unique |
| phone | string | No | 10-20 characters, phone format |
| address | string | No | Max 200 characters |
| city | string | No | Max 50 characters |
| state | string | No | Max 50 characters |
| zip_code | string | No | Max 10 characters |

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@email.com",
    "phone": "(555) 987-6543",
    "address": "456 Oak Ave",
    "city": "Springfield",
    "state": "IL",
    "zip_code": "62701",
    "created_at": "2024-01-01T11:00:00.000Z",
    "updated_at": "2024-01-01T11:00:00.000Z"
  },
  "message": "Client created successfully"
}
```

#### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "first_name",
        "message": "First name must be at least 1 character"
      }
    ]
  }
}
```

### 4. Update Client
**PUT** `/clients/:id`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Client ID |

#### Request Body
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe.updated@email.com",
  "phone": "(555) 123-4567",
  "address": "123 Updated St",
  "city": "New City",
  "state": "NY",
  "zip_code": "54321"
}
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe.updated@email.com",
    "phone": "(555) 123-4567",
    "address": "123 Updated St",
    "city": "New City",
    "state": "NY",
    "zip_code": "54321",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "Client updated successfully"
}
```

### 5. Delete Client
**DELETE** `/clients/:id`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Client ID |

#### Example Response
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| NOT_FOUND | 404 | Resource not found |
| DUPLICATE_EMAIL | 409 | Email already exists |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting
- **Limit**: 100 requests per minute per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Testing Examples

### Using cURL

#### Get all clients
```bash
curl -X GET "http://localhost:3001/api/clients" \
  -H "Content-Type: application/json"
```

#### Create a client
```bash
curl -X POST "http://localhost:3001/api/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com",
    "phone": "(555) 123-4567"
  }'
```

#### Update a client
```bash
curl -X PUT "http://localhost:3001/api/clients/1" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John Updated",
    "last_name": "Doe",
    "email": "john.updated@email.com"
  }'
```

#### Delete a client
```bash
curl -X DELETE "http://localhost:3001/api/clients/1" \
  -H "Content-Type: application/json"
```

## Frontend Integration

### JavaScript Fetch Examples

```javascript
// Get all clients
const getClients = async () => {
  const response = await fetch('/api/clients');
  const data = await response.json();
  return data;
};

// Create client
const createClient = async (clientData) => {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  const data = await response.json();
  return data;
};

// Update client
const updateClient = async (id, clientData) => {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  const data = await response.json();
  return data;
};

// Delete client
const deleteClient = async (id) => {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  return data;
};
```