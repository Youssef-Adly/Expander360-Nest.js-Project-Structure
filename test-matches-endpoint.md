# Test the /projects/:id/matches/rebuild Endpoint

## Overview

This document describes how to test the newly created `/projects/:id/matches/rebuild` endpoint.

## Endpoint Details

- **URL**: `POST /projects/:id/matches/rebuild`
- **Purpose**: Rebuilds vendor matches for a specific project using MySQL queries
- **Authentication**: Required (uses AuthGuard)

## Matching Rules Implemented

1. **Country Match**: Vendors must support the same country as the project
2. **Service Overlap**: At least one service must overlap between project needs and vendor offerings
3. **Score Formula**: `services_overlap * 2 + rating + SLA_weight`
   - `services_overlap`: Number of overlapping services
   - `rating`: Vendor rating (0-5)
   - `SLA_weight`: Calculated as `max(0, 100 - (response_sla_hours * 2))`

## Test Steps

### 1. Start the Application

```bash
npm run start:dev
```

### 2. Create Test Data (if not already present)

The migration file includes sample data:

- 3 sample users (clients)
- 4 sample vendors with different services and countries
- 3 sample projects

### 3. Test the Endpoint

#### Test Case 1: Rebuild matches for Project ID 1

```bash
curl -X POST http://localhost:3000/projects/1/matches/rebuild \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result**:

- Project 1 needs: `["web_development", "ui_ux_design"]` in `USA`
- Should match with:
  - WebDev Masters (exact match: web_development + ui_ux_design, USA, rating 4.8, SLA 12h)
  - Mobile First Agency (partial match: ui_ux_design, USA, rating 4.5, SLA 24h)

#### Test Case 2: Rebuild matches for Project ID 2

```bash
curl -X POST http://localhost:3000/projects/2/matches/rebuild \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result**:

- Project 2 needs: `["mobile_development"]` in `UK`
- Should match with:
  - Mobile First Agency (exact match: mobile_development, but not UK - should not match)
  - No matches expected due to country mismatch

#### Test Case 3: Rebuild matches for Project ID 3

```bash
curl -X POST http://localhost:3000/projects/3/matches/rebuild \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result**:

- Project 3 needs: `["data_analytics", "ai_ml"]` in `Germany`
- Should match with:
  - Data Analytics Pro (exact match: data_analytics + ai_ml, but not Germany - should not match)
  - No matches expected due to country mismatch

## Expected Response Format

```json
{
  "message": "Successfully rebuilt X matches for project Y",
  "matches": [
    {
      "id": 1,
      "project_id": 1,
      "vendor_id": 1,
      "score": 95.6,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Idempotent Behavior

- The endpoint is idempotent - calling it multiple times will produce the same result
- Existing matches for the project are deleted before creating new ones
- This ensures consistent state regardless of how many times the endpoint is called

## Error Cases

- **404**: Project not found
- **401**: Unauthorized (missing or invalid JWT token)
- **500**: Database or server errors

## Implementation Details

The endpoint uses TypeORM query builder for database filtering and application-level logic for scoring:

1. **Database Filtering**: Uses TypeORM query builder with `JSON_CONTAINS` and `JSON_OVERLAPS` for efficient filtering
2. **Application Logic**: Calculates scores in TypeScript for better maintainability and database independence
3. **Scoring Algorithm**:
   - Service overlap count calculated by filtering arrays
   - SLA weight calculated as `max(0, 100 - (response_sla_hours * 2))`
   - Final score: `services_overlap * 2 + rating + SLA_weight`
4. **Sorting**: Matches are sorted by score in descending order

This approach provides better maintainability while still leveraging database-level JSON operations for filtering.
