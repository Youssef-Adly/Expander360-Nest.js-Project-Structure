#!/usr/bin/env ts-node

import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Database configuration
const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'expander360',
  synchronize: false,
});

async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...');

    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Read and execute the migration file
    const migrationPath = path.join(__dirname, '../src/database/migrations/create-projects-vendors-schema.sql');

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await dataSource.query(statement);
          console.log('✓ Executed statement successfully');
        } catch (error) {
          // Ignore "table already exists" errors
          if (error.message.includes('already exists')) {
            console.log('ℹ️ Table already exists, skipping...');
          } else {
            throw error;
          }
        }
      }
    }

    console.log('🎉 Migrations completed successfully!');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
