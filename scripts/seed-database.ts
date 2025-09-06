#!/usr/bin/env ts-node

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../src/users/entities/user.entity';
import { Project } from '../src/projects/entities/project.entity';
import { Vendor } from '../src/vendors/entities/vendor.entity';
import { Match } from '../src/matches/entities/match.entity';
import { ServiceType } from '../src/common/enums/service-type.enum';
import { ProjectStatus } from '../src/common/enums/project-status.enum';

// Database configuration
const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'expander360',
  entities: [User, Project, Vendor, Match],
  synchronize: false,
});

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');

    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Clear existing data (optional - comment out if you want to preserve existing data)
    await clearExistingData();

    // Seed data in order (due to foreign key constraints)
    const users = await seedUsers();
    const vendors = await seedVendors();
    const projects = await seedProjects(users);
    await seedMatches(projects, vendors);

    console.log('🎉 Database seeding completed successfully!');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  await dataSource.query('TRUNCATE TABLE matches');
  await dataSource.query('TRUNCATE TABLE projects');
  await dataSource.query('TRUNCATE TABLE vendors');
  await dataSource.query('TRUNCATE TABLE users');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('✅ Existing data cleared');
}

async function seedUsers(): Promise<User[]> {
  console.log('👥 Seeding users...');

  const userRepository = dataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      company_name: 'TechCorp Solutions',
      contact_email: 'contact@techcorp.com',
      password: hashedPassword,
      IsAdmin: false,
    },
    {
      company_name: 'Digital Innovations Ltd',
      contact_email: 'hello@digitalinnovations.com',
      password: hashedPassword,
      IsAdmin: false,
    },
    {
      company_name: 'StartupX',
      contact_email: 'team@startupx.io',
      password: hashedPassword,
      IsAdmin: false,
    },
    {
      company_name: 'Global Enterprise Inc',
      contact_email: 'projects@globalenterprise.com',
      password: hashedPassword,
      IsAdmin: false,
    },
    {
      company_name: 'FinTech Revolution',
      contact_email: 'dev@fintechrevolution.com',
      password: hashedPassword,
      IsAdmin: false,
    },
    {
      company_name: 'HealthTech Solutions',
      contact_email: 'contact@healthtechsolutions.com',
      password: hashedPassword,
      IsAdmin: false,
    },
    {
      company_name: 'Admin User',
      contact_email: 'admin@expander360.com',
      password: hashedPassword,
      IsAdmin: true,
    },
  ];

  const users = userRepository.create(usersData);
  const savedUsers = await userRepository.save(users);

  console.log(`✅ Created ${savedUsers.length} users`);
  return savedUsers;
}

async function seedVendors(): Promise<Vendor[]> {
  console.log('🏢 Seeding vendors...');

  const vendorRepository = dataSource.getRepository(Vendor);

  // Create vendors with overlapping countries to test matching logic
  const vendorsData = [
    {
      name: 'WebDev Masters',
      countries_supported: ['USA', 'Canada', 'UK', 'Australia'],
      services_offered: [ServiceType.WEB_DEVELOPMENT, ServiceType.UI_UX_DESIGN],
      rating: 4.8,
      response_sla_hours: 12,
    },
    {
      name: 'Mobile First Agency',
      countries_supported: ['USA', 'Germany', 'Australia', 'Singapore'],
      services_offered: [ServiceType.MOBILE_DEVELOPMENT, ServiceType.UI_UX_DESIGN],
      rating: 4.5,
      response_sla_hours: 24,
    },
    {
      name: 'Data Analytics Pro',
      countries_supported: ['USA', 'India', 'Singapore', 'UK'],
      services_offered: [ServiceType.DATA_ANALYTICS, ServiceType.AI_ML],
      rating: 4.9,
      response_sla_hours: 8,
    },
    {
      name: 'Cloud Solutions Inc',
      countries_supported: ['USA', 'UK', 'Germany', 'Canada', 'Australia'],
      services_offered: [ServiceType.CLOUD_SERVICES, ServiceType.CYBERSECURITY],
      rating: 4.6,
      response_sla_hours: 16,
    },
    {
      name: 'Digital Marketing Experts',
      countries_supported: ['USA', 'Canada', 'UK', 'Germany', 'France'],
      services_offered: [ServiceType.DIGITAL_MARKETING, ServiceType.UI_UX_DESIGN],
      rating: 4.3,
      response_sla_hours: 48,
    },
    {
      name: 'Blockchain Pioneers',
      countries_supported: ['USA', 'Singapore', 'Switzerland', 'Germany'],
      services_offered: [ServiceType.BLOCKCHAIN, ServiceType.CYBERSECURITY, ServiceType.CONSULTING],
      rating: 4.7,
      response_sla_hours: 6,
    },
    {
      name: 'Full Stack Solutions',
      countries_supported: ['India', 'USA', 'UK', 'Canada'],
      services_offered: [ServiceType.WEB_DEVELOPMENT, ServiceType.MOBILE_DEVELOPMENT, ServiceType.CLOUD_SERVICES],
      rating: 4.4,
      response_sla_hours: 20,
    },
    {
      name: 'AI Innovation Labs',
      countries_supported: ['USA', 'Germany', 'Singapore', 'India', 'UK'],
      services_offered: [ServiceType.AI_ML, ServiceType.DATA_ANALYTICS, ServiceType.CONSULTING],
      rating: 4.9,
      response_sla_hours: 4,
    },
    {
      name: 'Security Shield Corp',
      countries_supported: ['USA', 'UK', 'Australia', 'Canada', 'Germany'],
      services_offered: [ServiceType.CYBERSECURITY, ServiceType.CLOUD_SERVICES],
      rating: 4.8,
      response_sla_hours: 2,
    },
    {
      name: 'Design Studio Plus',
      countries_supported: ['USA', 'UK', 'France', 'Germany', 'Australia'],
      services_offered: [ServiceType.UI_UX_DESIGN, ServiceType.WEB_DEVELOPMENT, ServiceType.DIGITAL_MARKETING],
      rating: 4.5,
      response_sla_hours: 18,
    },
  ];

  const vendors = vendorRepository.create(vendorsData);
  const savedVendors = await vendorRepository.save(vendors);

  console.log(`✅ Created ${savedVendors.length} vendors`);
  return savedVendors;
}

async function seedProjects(users: User[]): Promise<Project[]> {
  console.log('📋 Seeding projects...');

  const projectRepository = dataSource.getRepository(Project);

  // Create projects with various country/service combinations to test overlapping logic
  const projectsData = [
    {
      user_id: users[0].id,
      country: 'USA',
      services_needed: [ServiceType.WEB_DEVELOPMENT, ServiceType.UI_UX_DESIGN],
      budget: 50000.00,
      status: ProjectStatus.ACTIVE,
    },
    {
      user_id: users[1].id,
      country: 'UK',
      services_needed: [ServiceType.MOBILE_DEVELOPMENT, ServiceType.UI_UX_DESIGN],
      budget: 75000.00,
      status: ProjectStatus.ACTIVE,
    },
    {
      user_id: users[2].id,
      country: 'Germany',
      services_needed: [ServiceType.DATA_ANALYTICS, ServiceType.AI_ML],
      budget: 100000.00,
      status: ProjectStatus.ACTIVE,
    },
    {
      user_id: users[3].id,
      country: 'Australia',
      services_needed: [ServiceType.CLOUD_SERVICES, ServiceType.CYBERSECURITY],
      budget: 120000.00,
      status: ProjectStatus.ACTIVE,
    },
    {
      user_id: users[4].id,
      country: 'Singapore',
      services_needed: [ServiceType.BLOCKCHAIN, ServiceType.CYBERSECURITY],
      budget: 200000.00,
      status: ProjectStatus.ACTIVE,
    },
    {
      user_id: users[0].id,
      country: 'Canada',
      services_needed: [ServiceType.DIGITAL_MARKETING, ServiceType.WEB_DEVELOPMENT],
      budget: 30000.00,
      status: ProjectStatus.DRAFT,
    },
    {
      user_id: users[1].id,
      country: 'USA',
      services_needed: [ServiceType.AI_ML, ServiceType.DATA_ANALYTICS, ServiceType.CONSULTING],
      budget: 150000.00,
      status: ProjectStatus.ACTIVE,
    },
    {
      user_id: users[5].id,
      country: 'India',
      services_needed: [ServiceType.WEB_DEVELOPMENT, ServiceType.MOBILE_DEVELOPMENT],
      budget: 80000.00,
      status: ProjectStatus.PAUSED,
    },
    {
      user_id: users[3].id,
      country: 'UK',
      services_needed: [ServiceType.CYBERSECURITY, ServiceType.CLOUD_SERVICES],
      budget: 90000.00,
      status: ProjectStatus.ACTIVE,
    },
    {
      user_id: users[4].id,
      country: 'Germany',
      services_needed: [ServiceType.UI_UX_DESIGN, ServiceType.DIGITAL_MARKETING],
      budget: 45000.00,
      status: ProjectStatus.ACTIVE,
    },
    {
      user_id: users[5].id,
      country: 'France',
      services_needed: [ServiceType.WEB_DEVELOPMENT, ServiceType.UI_UX_DESIGN, ServiceType.DIGITAL_MARKETING],
      budget: 65000.00,
      status: ProjectStatus.ACTIVE,
    },
    {
      user_id: users[2].id,
      country: 'Switzerland',
      services_needed: [ServiceType.BLOCKCHAIN, ServiceType.CONSULTING],
      budget: 300000.00,
      status: ProjectStatus.ACTIVE,
    },
  ];

  const projects = projectRepository.create(projectsData);
  const savedProjects = await projectRepository.save(projects);

  console.log(`✅ Created ${savedProjects.length} projects`);
  return savedProjects;
}

async function seedMatches(projects: Project[], vendors: Vendor[]): Promise<void> {
  console.log('🎯 Seeding matches using the matching algorithm...');

  const matchRepository = dataSource.getRepository(Match);
  const matches: Match[] = [];

  // Calculate matches for each project using the same algorithm as the service
  for (const project of projects) {
    // Find vendors that serve the project's country
    const matchingVendors = vendors.filter(vendor =>
      vendor.countries_supported.includes(project.country)
    );

    for (const vendor of matchingVendors) {
      // Calculate services overlap count
      const servicesOverlap = project.services_needed.filter(service =>
        vendor.services_offered.includes(service)
      ).length;

      // Skip if no service overlap
      if (servicesOverlap === 0) continue;

      // Calculate SLA weight (lower is better, max 100 points)
      const slaWeight = Math.max(0, 100 - (vendor.response_sla_hours * 2));

      // Calculate final score: services_overlap * 2 + rating + SLA_weight
      const rawScore = (servicesOverlap * 2) + vendor.rating + slaWeight;
      const score = Math.min(100, Math.max(0, rawScore)); // Ensure score is between 0-100

      const match = matchRepository.create({
        project_id: project.id,
        vendor_id: vendor.id,
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
      });

      matches.push(match);
    }
  }

  const savedMatches = await matchRepository.save(matches);
  console.log(`✅ Created ${savedMatches.length} matches`);
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
