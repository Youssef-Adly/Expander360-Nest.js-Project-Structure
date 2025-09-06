# 🌱 Database Seeding Guide

This guide explains how to seed your Expander360 database with realistic test data.

## Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Seed all databases with one command
npm run seed
```

## Individual Seeding Commands

```bash
# Seed MySQL database only (users, projects, vendors, matches)
npm run seed:mysql

# Seed MongoDB only (analytics events, reports)
npm run seed:mongodb

# Run database migrations
npm run migration:run
```

## What Gets Seeded

### MySQL Database

- **7 Users**: 6 client companies + 1 admin
- **10 Vendors**: With overlapping countries and varied services
- **12 Projects**: Diverse requirements across multiple countries
- **47 Matches**: Generated using the real matching algorithm

### MongoDB Database

- **500 Analytics Events**: User activities, API calls, system events
- **4 Sample Reports**: Performance, vendor analytics, matching efficiency, user activity

## Country Overlap Testing

The seed data specifically includes overlapping countries to test your matching logic:

- **USA**: Supported by 8 vendors (maximum overlap)
- **UK**: Supported by 6 vendors
- **Germany**: Supported by 5 vendors
- **Australia**: Supported by 4 vendors
- **Canada**: Supported by 4 vendors

This ensures realistic testing scenarios where multiple vendors compete for the same projects.

## Environment Variables

Create a `.env` file with your database credentials:

```env
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=admin
DB_NAME=expander360

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=expander360_analytics
```

## Test Users

After seeding, you can login with these test accounts:

| Email                        | Password    | Role   | Company                 |
| ---------------------------- | ----------- | ------ | ----------------------- |
| contact@techcorp.com         | password123 | Client | TechCorp Solutions      |
| hello@digitalinnovations.com | password123 | Client | Digital Innovations Ltd |
| team@startupx.io             | password123 | Client | StartupX                |
| admin@expander360.com        | password123 | Admin  | Admin User              |

## Sample API Calls

After seeding, test the API with these examples:

```bash
# Login as a client
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"contact_email":"contact@techcorp.com","password":"password123"}'

# Get all projects (use the JWT token from login response)
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get matches for a specific project
curl -X GET http://localhost:3000/matches?project_id=1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search vendors by country and services
curl -X GET "http://localhost:3000/vendors/search?country=USA&services=web_development" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if MySQL is running
mysql -u root -p

# Check if MongoDB is running
mongo --eval "db.runCommand({ping: 1})"
```

### Clear and Re-seed

The seeding script automatically clears existing data. To manually clear:

```sql
-- MySQL
USE expander360;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE matches;
TRUNCATE TABLE projects;
TRUNCATE TABLE vendors;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;
```

```javascript
// MongoDB
use expander360_analytics
db.analytics.deleteMany({})
db.reports.deleteMany({})
```

## Verifying Seed Data

After seeding, verify the data:

```sql
-- Check record counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'vendors', COUNT(*) FROM vendors
UNION ALL
SELECT 'matches', COUNT(*) FROM matches;

-- Check match score distribution
SELECT
  CASE
    WHEN score >= 90 THEN 'Excellent (90-100)'
    WHEN score >= 70 THEN 'Good (70-89)'
    WHEN score >= 50 THEN 'Fair (50-69)'
    ELSE 'Poor (<50)'
  END as score_range,
  COUNT(*) as count
FROM matches
GROUP BY
  CASE
    WHEN score >= 90 THEN 'Excellent (90-100)'
    WHEN score >= 70 THEN 'Good (70-89)'
    WHEN score >= 50 THEN 'Fair (50-69)'
    ELSE 'Poor (<50)'
  END
ORDER BY MIN(score) DESC;
```

## Next Steps

1. Start the application: `npm run start:dev`
2. Test the API endpoints
3. Explore the matching algorithm with the seeded data
4. Create new projects and see real-time matching in action!

Happy coding! 🚀
