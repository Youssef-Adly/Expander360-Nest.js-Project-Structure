#!/usr/bin/env ts-node

import { seedDatabase } from './seed-database';
import { seedMongoDB } from './seed-mongodb';

async function seedAll() {
  console.log('🌱 Starting complete database seeding...');
  console.log('=====================================');

  try {
    // Seed MySQL database
    console.log('\n📊 MYSQL SEEDING');
    console.log('================');
    await seedDatabase();

    // Seed MongoDB
    console.log('\n📈 MONGODB SEEDING');
    console.log('==================');
    await seedMongoDB();

    console.log('\n🎉 ALL DATABASES SEEDED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('');
    console.log('📋 Summary:');
    console.log('• MySQL: Users, Projects, Vendors, Matches');
    console.log('• MongoDB: Analytics events, Reports');
    console.log('');
    console.log('🚀 You can now start your application with: npm run start:dev');
    console.log('');

  } catch (error) {
    console.error('\n❌ SEEDING FAILED');
    console.error('==================');
    console.error(error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🌱 Database Seeding Tool for Expander360
=========================================

Usage:
  npm run seed              # Seed all databases
  npm run seed:mysql        # Seed MySQL only  
  npm run seed:mongodb      # Seed MongoDB only
  
Options:
  --help, -h               # Show this help message

Environment Variables:
  DB_HOST                  # MySQL host (default: localhost)
  DB_PORT                  # MySQL port (default: 3306)
  DB_USERNAME              # MySQL username (default: root)
  DB_PASSWORD              # MySQL password (default: admin)
  DB_NAME                  # MySQL database name (default: expander360)
  MONGODB_URI              # MongoDB connection string (default: mongodb://localhost:27017)
  MONGODB_DATABASE         # MongoDB database name (default: expander360_analytics)

Examples:
  # Seed with custom MySQL credentials
  DB_USERNAME=myuser DB_PASSWORD=mypass npm run seed

  # Seed with custom MongoDB URI
  MONGODB_URI=mongodb://localhost:27017 npm run seed

Note: This will clear existing data in the databases. Make sure to backup any important data before running.
  `);
  process.exit(0);
}

// Run the seeding
seedAll();
