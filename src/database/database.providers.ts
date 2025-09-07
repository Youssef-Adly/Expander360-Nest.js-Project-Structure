import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
// import * as dotenv from 'dotenv';
// dotenv.config();

const logger = new Logger("DatabaseModule")

export const databaseProviders = [
  {
    provide: DataSource,
    useFactory: async () => {
      try {
        // First, connect without specifying a database to create it
        const tempDataSource = new DataSource({
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306'),
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'admin',
          // Don't specify database here initially
        });

        await tempDataSource.initialize();

        // Create database if it doesn't exist
        try {
          await tempDataSource.query(`CREATE DATABASE IF NOT EXISTS \`expander360\``);
          logger.log("Database created or already exists");
        } catch (err) {
          console.error('Error creating database:', err);
          logger.error('Error creating database:', err);
          throw err;
        }

        // Close the temporary connection
        await tempDataSource.destroy();

        // Now create the actual data source with the database
        const dataSource = new DataSource({
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306'),
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'admin',
          database: process.env.DB_NAME || 'expander360',
          entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
          ],
          synchronize: true,
        });

        await dataSource.initialize();
        console.log('Database connected successfully');
        return dataSource;
      } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
      }
    },
  },
];
