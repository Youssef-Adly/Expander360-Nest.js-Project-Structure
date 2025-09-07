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

    // Get all migration files in order
    const migrationsDir = path.join(__dirname, '../src/database/migrations');

    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found: ${migrationsDir}`);
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Files are named with numeric prefixes, so sorting works

    console.log(`📁 Found ${migrationFiles.length} migration files:`);
    migrationFiles.forEach(file => console.log(`   - ${file}`));

    // Execute each migration file
    for (const migrationFile of migrationFiles) {
      console.log(`\n🔄 Running migration: ${migrationFile}`);

      const migrationPath = path.join(migrationsDir, migrationFile);
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      // Split the SQL into individual statements
      const statements = migrationSql
        .split(';')
        .map(stmt => {
          // Remove comments from each statement but keep the SQL
          const cleanStmt = stmt
            .replace(/--.*$/gm, '') // Remove line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .trim();
          return cleanStmt;
        })
        .filter(stmt => stmt.length > 0);

      console.log(`   📝 Executing ${statements.length} SQL statements...`);
      if (statements.length === 0) {
        console.log(`   ⚠️ No statements found in ${migrationFile}`);
      }

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await dataSource.query(statement);
            console.log('   ✓ Statement executed successfully');
          } catch (error) {
            // Ignore common non-critical errors when running migrations multiple times
            if (error.message.includes('already exists') ||
              error.message.includes('Duplicate key name') ||
              error.message.includes('Duplicate entry') ||
              error.message.includes('Duplicate column name') ||
              error.message.includes('Multiple primary key defined') ||
              error.message.includes('Key column') && error.message.includes("doesn't exist in table")) {
              console.log('   ℹ️ Resource already exists or constraint issue, skipping...');
            } else {
              console.error(`   ❌ Error in ${migrationFile}:`, error.message);
              throw error;
            }
          }
        }
      }

      console.log(`   ✅ Migration ${migrationFile} completed!`);
    }

    console.log('\n🎉 All migrations completed successfully!');

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
