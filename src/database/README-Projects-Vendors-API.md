# Projects & Vendors API Documentation

This document describes the relational schema and API endpoints for the Projects & Vendors matching system.

## Database Schema

### Tables Overview

1. **users** - Registered users who can be clients (IsAdmin=false) or administrators (IsAdmin=true)
2. **projects** - Projects posted by users with requirements
3. **vendors** - Service providers with capabilities and ratings
4. **matches** - Matching scores between projects and vendors

### Relationships

```
users (1) -----> (N) projects
vendors (1) -----> (N) matches
projects (1) -----> (N) matches
```

## API Endpoints

All endpoints require authentication (JWT token in Authorization header).

### Users API (Acting as Clients)

Users are managed through the existing `/users` endpoints. Regular users (IsAdmin=false) act as clients who can create projects.

**User Data Structure:**

```json
{
  "id": 1,
  "company_name": "TechCorp Solutions",
  "contact_email": "contact@techcorp.com",
  "IsAdmin": false,
  "projects": [...]
}
```

**Note:** User registration, login, and management are handled by the existing Users module.

### Projects API

```
GET    /projects                   # Get all projects
GET    /projects?user_id=1         # Get projects by user (client)
POST   /projects                   # Create a new project
GET    /projects/:id               # Get specific project with matches
PATCH  /projects/:id               # Update project
DELETE /projects/:id               # Delete project
```

**Project Data Structure:**

```json
{
  "id": 1,
  "user_id": 1,
  "country": "USA",
  "services_needed": ["web_development", "ui_ux_design"],
  "budget": 50000.00,
  "status": "active",
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T10:00:00Z",
  "user": {...},
  "matches": [...]
}
```

**Project Status Enum:**

- `draft` - Initial state
- `active` - Open for matching
- `paused` - Temporarily suspended
- `completed` - Project finished
- `cancelled` - Project cancelled

### Vendors API

```
GET    /vendors                    # Get all vendors
GET    /vendors/search?country=USA&services=web_development,mobile_development
POST   /vendors                    # Create a new vendor
GET    /vendors/:id                # Get specific vendor with matches
PATCH  /vendors/:id                # Update vendor
DELETE /vendors/:id                # Delete vendor
```

**Vendor Data Structure:**

```json
{
  "id": 1,
  "name": "WebDev Masters",
  "countries_supported": ["USA", "Canada", "UK"],
  "services_offered": ["web_development", "ui_ux_design"],
  "rating": 4.8,
  "response_sla_hours": 12,
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T10:00:00Z",
  "matches": [...]
}
```

### Matches API

```
GET    /matches                    # Get all matches (sorted by score DESC)
GET    /matches?project_id=1       # Get matches for specific project
GET    /matches?vendor_id=1        # Get matches for specific vendor
GET    /matches?top=10             # Get top N matches
POST   /matches                    # Create a new match
GET    /matches/:id                # Get specific match
PATCH  /matches/:id                # Update match score
DELETE /matches/:id                # Delete match
```

**Match Data Structure:**

```json
{
  "id": 1,
  "project_id": 1,
  "vendor_id": 1,
  "score": 95.50,
  "created_at": "2023-12-01T10:00:00Z",
  "project": {...},
  "vendor": {...}
}
```

## Service Types Enum

Available service types for projects and vendors:

- `web_development`
- `mobile_development`
- `ui_ux_design`
- `digital_marketing`
- `data_analytics`
- `cloud_services`
- `cybersecurity`
- `ai_ml`
- `blockchain`
- `consulting`

## Sample API Usage

### Register a User (Client)

```bash
POST /users/register
Content-Type: application/json

{
  "company_name": "TechCorp Solutions",
  "contact_email": "contact@techcorp.com",
  "password": "securePassword123"
}
```

### Create a Project

```bash
POST /projects
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "user_id": 1,
  "country": "USA",
  "services_needed": ["web_development", "ui_ux_design"],
  "budget": 50000.00,
  "status": "active"
}
```

### Find Matching Vendors

```bash
GET /vendors/search?country=USA&services=web_development,ui_ux_design
Authorization: Bearer <jwt_token>
```

### Create a Match

```bash
POST /matches
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "project_id": 1,
  "vendor_id": 1,
  "score": 95.50
}
```

### Get Top Matches

```bash
GET /matches?top=10
Authorization: Bearer <jwt_token>
```

## Database Indexes

The schema includes optimized indexes for:

- Client email lookup
- Project filtering by client, country, status, budget
- Vendor filtering by rating and SLA
- Match scoring and date-based queries
- Unique constraint on project-vendor pairs

## Notes

- All JSON arrays in the database support flexible service types and countries
- Foreign key constraints ensure data integrity
- Cascading deletes remove related matches when projects/vendors are deleted
- Timestamps are automatically managed by TypeORM
- The schema supports efficient querying for the matching algorithm
