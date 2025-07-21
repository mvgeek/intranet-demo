# Intranet Demo API Documentation

This document describes the REST API endpoints available in the Intranet Demo application.

## Base URL

All API endpoints are prefixed with `/api/`

## Response Format

All API responses follow a consistent format:

```json
{
  "data": [...], // The actual data
  "meta": {...}, // Pagination metadata (for paginated responses)
  "success": true, // Boolean indicating success
  "message": "Optional message", // Optional success message
  "error": {...} // Error object (only present when success is false)
}
```

## Error Format

Error responses include an error object:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {} // Optional additional details
  }
}
```

## Pagination

Paginated endpoints include metadata:

```json
{
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Endpoints

### Users

#### GET /api/users

Retrieve a list of users with optional filtering and pagination.

**Query Parameters:**
- `department` (string, optional): Filter by department
- `search` (string, optional): Search in user names and emails
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `sortBy` (string, optional): Sort field - `name`, `email`, `department` (default: `name`)
- `sortOrder` (string, optional): Sort order - `asc`, `desc` (default: `asc`)

**Example Request:**
```
GET /api/users?department=Engineering&page=1&limit=5&sortBy=name&sortOrder=asc
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john.doe@company.com",
      "department": "Engineering",
      "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "success": true
}
```

### Content

#### GET /api/content

Retrieve content items with optional filtering and pagination.

**Query Parameters:**
- `type` (string, optional): Filter by content type - `announcement`, `news`, `policy`, `event`
- `author` (string, optional): Filter by author name or email
- `tags` (string, optional): Comma-separated list of tags to filter by
- `dateFrom` (string, optional): Filter content created after this date (ISO format)
- `dateTo` (string, optional): Filter content created before this date (ISO format)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `sortBy` (string, optional): Sort field - `createdAt`, `updatedAt`, `title` (default: `createdAt`)
- `sortOrder` (string, optional): Sort order - `asc`, `desc` (default: `desc`)

**Example Request:**
```
GET /api/content?type=announcement&tags=platform,launch&page=1&limit=10
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "1",
      "title": "Welcome to the New Intranet",
      "content": "We are excited to announce...",
      "author": {
        "id": "1",
        "name": "John Doe",
        "email": "john.doe@company.com",
        "department": "Engineering"
      },
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z",
      "tags": ["announcement", "platform", "launch"],
      "type": "announcement"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "success": true
}
```

### Content Search

#### GET /api/content/search

Advanced search functionality for content with relevance scoring.

**Query Parameters:**
- `q` (string, optional): Search query text
- `type` (string, optional): Filter by content type
- `author` (string, optional): Filter by author
- `department` (string, optional): Filter by author's department
- `tags` (string, optional): Comma-separated list of tags
- `dateFrom` (string, optional): Filter content created after this date
- `dateTo` (string, optional): Filter content created before this date
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `sortBy` (string, optional): Sort field - `relevance`, `createdAt`, `updatedAt`, `title` (default: `relevance`)
- `sortOrder` (string, optional): Sort order - `asc`, `desc` (default: `desc`)

**Example Request:**
```
GET /api/content/search?q=meeting&type=event&sortBy=relevance
```

**Example Response:**
```json
{
  "data": [
    {
      "item": {
        "id": "2",
        "title": "Q1 Company Meeting",
        "content": "Join us for our quarterly company meeting...",
        "author": {...},
        "createdAt": "2024-01-20T00:00:00.000Z",
        "updatedAt": "2024-01-20T00:00:00.000Z",
        "tags": ["meeting", "quarterly", "results"],
        "type": "event"
      },
      "score": 15,
      "highlights": {
        "title": ["Q1 Company Meeting"],
        "content": ["...quarterly company meeting on March 15th..."],
        "tags": ["meeting"]
      }
    }
  ],
  "meta": {...},
  "query": {
    "q": "meeting",
    "type": "event",
    "sortBy": "relevance"
  },
  "executionTime": 5,
  "success": true
}
```

### Departments

#### GET /api/departments

Retrieve a list of all departments with statistics.

**Query Parameters:** None

**Example Request:**
```
GET /api/departments
```

**Example Response:**
```json
{
  "data": [
    {
      "name": "Engineering",
      "userCount": 2,
      "contentCount": 1
    },
    {
      "name": "HR",
      "userCount": 1,
      "contentCount": 3
    },
    {
      "name": "Marketing",
      "userCount": 1,
      "contentCount": 1
    }
  ],
  "success": true
}
```

### Tags

#### GET /api/tags

Retrieve a list of all content tags with usage statistics.

**Query Parameters:** None

**Example Request:**
```
GET /api/tags
```

**Example Response:**
```json
{
  "data": [
    {
      "name": "announcement",
      "count": 2,
      "category": "general"
    },
    {
      "name": "meeting",
      "count": 2,
      "category": "event"
    },
    {
      "name": "policy",
      "count": 2,
      "category": "policy"
    }
  ],
  "success": true
}
```

## Error Codes

Common error codes returned by the API:

- `INVALID_PAGE`: Page number must be greater than 0
- `INVALID_LIMIT`: Limit must be between 1 and 100
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting

Currently, no rate limiting is implemented in this demo API.

## Authentication

This demo API does not require authentication. In a production environment, you would typically need to include authentication headers.

## Content Types

The API supports the following content types:

- `announcement`: Company announcements and important notices
- `news`: Company news and updates
- `policy`: Policy documents and guidelines
- `event`: Events, meetings, and scheduled activities

## Search Scoring

The search endpoint uses a simple scoring algorithm:

- Title matches: 10 points
- Content matches: 5 points
- Tag matches: 2 points each
- Author name matches: 3 points

Results are ranked by total score when sorting by relevance.

## Examples

### Get all engineering users
```bash
curl "http://localhost:3000/api/users?department=Engineering"
```

### Search for policy content
```bash
curl "http://localhost:3000/api/content/search?q=policy&type=policy"
```

### Get recent announcements
```bash
curl "http://localhost:3000/api/content?type=announcement&sortBy=createdAt&sortOrder=desc&limit=5"
```

### Get content by specific author
```bash
curl "http://localhost:3000/api/content?author=Jane%20Smith"
```
