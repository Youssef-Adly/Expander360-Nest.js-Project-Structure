# Database Migrations

This directory contains SQL migration files for the Expander360 database schema.

## Migration Files

The migrations are numbered and should be executed in order:

1. **001-create-users-table.sql** - Creates the users table with all necessary fields and indexes
2. **002-create-projects-table.sql** - Creates the projects table with relationships to users
3. **003-create-vendors-table.sql** - Creates the vendors table with all service provider information
4. **004-create-matches-table.sql** - Creates the matches table linking projects to vendors
5. **005-seed-sample-data.sql** - Inserts sample data for testing

## Running Migrations

To run all migrations:

```bash
npm run migration:run
```

Or using ts-node directly:

```bash
npx ts-node scripts/run-migrations.ts
```

## Database Schema Overview

The schema supports a matching system between client projects and service vendors:

### Users Table

- Stores client companies and admin users
- Fields: id, company_name, contact_email, password, IsAdmin, timestamps

### Projects Table

- Stores client project requirements
- Fields: id, user_id, country, services_needed (JSON), budget, status, timestamps
- Status enum: draft, active, paused, completed, cancelled

### Vendors Table

- Stores service provider information
- Fields: id, name, countries_supported (JSON), services_offered (JSON), rating, SLA info, timestamps

### Matches Table

- Links projects to vendors with compatibility scores
- Fields: id, project_id, vendor_id, score, created_at
- Unique constraint on project_id + vendor_id

## Service Types

The system supports the following service types (stored in JSON arrays):

- web_development
- mobile_development
- ui_ux_design
- digital_marketing
- data_analytics
- cloud_services
- cybersecurity
- ai_ml
- blockchain
- consulting

## Notes

- The Reports entity uses MongoDB (Mongoose) and doesn't require MySQL migrations
- All tables use InnoDB engine with utf8mb4 charset
- Foreign key constraints ensure referential integrity
- Indexes are optimized for common query patterns
