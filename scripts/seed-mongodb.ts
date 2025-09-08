#!/usr/bin/env ts-node

import { MongoClient, Db } from 'mongodb';

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'expander360_analytics';

interface AnalyticsData {
  timestamp: Date;
  event_type: string;
  user_id?: number;
  project_id?: number;
  vendor_id?: number;
  match_id?: number;
  metadata: Record<string, any>;
}

interface ReportData {
  report_id: string;
  title: string;
  type: 'project_performance' | 'vendor_analytics' | 'matching_efficiency' | 'user_activity';
  generated_at: Date;
  generated_by: number;
  data: Record<string, any>;
  filters: Record<string, any>;
}

async function seedMongoDB() {
  let client: MongoClient;

  try {
    console.log('🚀 Starting MongoDB seeding...');

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB connection established');

    const db = client.db(DATABASE_NAME);

    // Clear existing collections (optional)
    await clearExistingData(db);

    // Seed collections
    await seedAnalytics(db);
    await seedReports(db);

    console.log('🎉 MongoDB seeding completed successfully!');

  } catch (error) {
    console.error('❌ MongoDB seeding failed:', error);
    process.exit(1);
  } finally {
    if (client!) {
      await client.close();
    }
  }
}

async function clearExistingData(db: Db) {
  console.log('🧹 Clearing existing MongoDB data...');

  await db.collection('analytics').deleteMany({});
  await db.collection('reports').deleteMany({});
  await db.collection('analytics_reports').deleteMany({});

  console.log('✅ Existing MongoDB data cleared');
}

async function seedAnalytics(db: Db) {
  console.log('📊 Seeding analytics data...');

  const analyticsCollection = db.collection('analytics');

  // Generate analytics data for the last 30 days
  const now = new Date();
  const analyticsData: AnalyticsData[] = [];

  // Generate random events over the last 30 days
  for (let i = 0; i < 500; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    const eventTypes = [
      'user_registration',
      'project_created',
      'project_updated',
      'vendor_viewed',
      'match_generated',
      'match_viewed',
      'project_search',
      'vendor_search',
      'api_call',
      'user_login',
      'project_status_change',
      'vendor_rating_update'
    ];

    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const baseEvent: AnalyticsData = {
      timestamp,
      event_type: eventType,
      metadata: {
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: `session_${Math.random().toString(36).substr(2, 9)}`
      }
    };

    // Add specific data based on event type
    switch (eventType) {
      case 'user_registration':
      case 'user_login':
        baseEvent.user_id = Math.floor(Math.random() * 7) + 1;
        baseEvent.metadata.source = ['web', 'mobile', 'api'][Math.floor(Math.random() * 3)];
        break;

      case 'project_created':
      case 'project_updated':
      case 'project_status_change':
        baseEvent.user_id = Math.floor(Math.random() * 6) + 1; // Exclude admin
        baseEvent.project_id = Math.floor(Math.random() * 12) + 1;
        baseEvent.metadata.country = ['USA', 'UK', 'Germany', 'Australia', 'Singapore', 'Canada', 'India', 'France', 'Switzerland'][Math.floor(Math.random() * 9)];
        break;

      case 'vendor_viewed':
      case 'vendor_rating_update':
        baseEvent.vendor_id = Math.floor(Math.random() * 10) + 1;
        baseEvent.metadata.view_duration = Math.floor(Math.random() * 300) + 10; // 10-310 seconds
        break;

      case 'match_generated':
      case 'match_viewed':
        baseEvent.project_id = Math.floor(Math.random() * 12) + 1;
        baseEvent.vendor_id = Math.floor(Math.random() * 10) + 1;
        baseEvent.match_id = Math.floor(Math.random() * 50) + 1;
        baseEvent.metadata.score = Math.round((Math.random() * 100) * 100) / 100;
        break;

      case 'project_search':
      case 'vendor_search':
        baseEvent.user_id = Math.floor(Math.random() * 7) + 1;
        baseEvent.metadata.search_query = ['web development', 'mobile app', 'AI ML', 'blockchain', 'cybersecurity'][Math.floor(Math.random() * 5)];
        baseEvent.metadata.results_count = Math.floor(Math.random() * 20) + 1;
        break;

      case 'api_call':
        baseEvent.metadata.endpoint = ['/projects', '/vendors', '/matches', '/users'][Math.floor(Math.random() * 4)];
        baseEvent.metadata.method = ['GET', 'POST', 'PATCH', 'DELETE'][Math.floor(Math.random() * 4)];
        baseEvent.metadata.status_code = [200, 201, 400, 404, 500][Math.floor(Math.random() * 5)];
        baseEvent.metadata.response_time = Math.floor(Math.random() * 1000) + 50; // 50-1050ms
        break;
    }

    analyticsData.push(baseEvent);
  }

  await analyticsCollection.insertMany(analyticsData);
  console.log(`✅ Created ${analyticsData.length} analytics events`);
}

async function seedReports(db: Db) {
  console.log('📈 Seeding reports data...');

  const reportsCollection = db.collection('reports');

  // First, seed the analytics reports (existing structure for analytics dashboard)
  const now = new Date();
  const analyticsReportsData: ReportData[] = [
    {
      report_id: `report_${Date.now()}_1`,
      title: 'Project Performance Summary - Q4 2024',
      type: 'project_performance',
      generated_at: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)), // 7 days ago
      generated_by: 7, // Admin user
      data: {
        total_projects: 12,
        active_projects: 8,
        completed_projects: 2,
        avg_budget: 95833.33,
        top_countries: [
          { country: 'USA', count: 3 },
          { country: 'UK', count: 2 },
          { country: 'Germany', count: 2 }
        ],
        service_distribution: {
          web_development: 4,
          ui_ux_design: 5,
          cybersecurity: 3,
          ai_ml: 2,
          blockchain: 2
        }
      },
      filters: {
        date_range: '2024-10-01 to 2024-12-31',
        status: 'all'
      }
    },
    {
      report_id: `report_${Date.now()}_2`,
      title: 'Vendor Analytics - Top Performers',
      type: 'vendor_analytics',
      generated_at: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)), // 5 days ago
      generated_by: 7, // Admin user
      data: {
        total_vendors: 10,
        avg_rating: 4.6,
        avg_sla_hours: 15.8,
        top_rated_vendors: [
          { name: 'Data Analytics Pro', rating: 4.9, matches: 15 },
          { name: 'AI Innovation Labs', rating: 4.9, matches: 12 },
          { name: 'WebDev Masters', rating: 4.8, matches: 18 }
        ],
        fastest_response: [
          { name: 'Security Shield Corp', sla_hours: 2 },
          { name: 'AI Innovation Labs', sla_hours: 4 },
          { name: 'Blockchain Pioneers', sla_hours: 6 }
        ],
        service_coverage: {
          web_development: 3,
          ui_ux_design: 4,
          cybersecurity: 3,
          ai_ml: 2,
          data_analytics: 2
        }
      },
      filters: {
        min_rating: 4.0,
        include_inactive: false
      }
    },
    {
      report_id: `report_${Date.now()}_3`,
      title: 'Matching Efficiency Analysis',
      type: 'matching_efficiency',
      generated_at: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)), // 3 days ago
      generated_by: 7, // Admin user
      data: {
        total_matches: 47,
        avg_match_score: 78.5,
        high_quality_matches: 23, // score > 80
        perfect_matches: 8, // score > 95
        match_distribution: {
          excellent: 8, // 90-100
          good: 15, // 70-89
          fair: 18, // 50-69
          poor: 6 // <50
        },
        top_scoring_pairs: [
          { project_id: 3, vendor_id: 3, score: 98.0 },
          { project_id: 5, vendor_id: 6, score: 97.7 },
          { project_id: 1, vendor_id: 1, score: 95.8 }
        ],
        avg_score_by_service: {
          ai_ml: 92.3,
          cybersecurity: 88.7,
          blockchain: 87.2,
          web_development: 82.1,
          ui_ux_design: 76.8
        }
      },
      filters: {
        date_range: 'last_30_days',
        min_score: 0
      }
    },
    {
      report_id: `report_${Date.now()}_4`,
      title: 'User Activity Report - December 2024',
      type: 'user_activity',
      generated_at: new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000)), // 1 day ago
      generated_by: 7, // Admin user
      data: {
        total_users: 7,
        active_users: 6,
        new_registrations: 2,
        avg_projects_per_user: 1.71,
        user_engagement: {
          daily_active: 4,
          weekly_active: 6,
          monthly_active: 7
        },
        top_active_users: [
          { user_id: 1, company: 'TechCorp Solutions', projects: 2, last_login: '2024-12-19' },
          { user_id: 4, company: 'Global Enterprise Inc', projects: 2, last_login: '2024-12-18' },
          { user_id: 5, company: 'FinTech Revolution', projects: 2, last_login: '2024-12-17' }
        ],
        geographic_distribution: {
          USA: 3,
          UK: 2,
          Germany: 2,
          other: 5
        }
      },
      filters: {
        month: '2024-12',
        user_type: 'client'
      }
    }
  ];

  // Create a new collection for analytics reports to avoid confusion
  const analyticsReportsCollection = db.collection('analytics_reports');
  await analyticsReportsCollection.insertMany(analyticsReportsData);
  console.log(`✅ Created ${analyticsReportsData.length} analytics reports`);

  // Now seed the main reports using the endpoint structure (projectId, title, content, tags)
  const mainReportsData = [
    {
      projectId: 4,
      title: "Expenses",
      content: "lorem ipsum",
      tags: "monthly, progress"
    },
    {
      projectId: 1,
      title: "Project Status Update",
      content: "This report contains the latest updates on the web development project progress. We have completed the initial design phase and are moving into development.",
      tags: "status, development, milestone"
    },
    {
      projectId: 2,
      title: "Budget Analysis",
      content: "Detailed analysis of the current budget allocation and spending patterns for the mobile app development project. All expenses are within the allocated budget.",
      tags: "budget, financial, analysis"
    },
    {
      projectId: 3,
      title: "Performance Metrics",
      content: "Monthly performance metrics showing system performance improvements and optimization results for the data analytics platform.",
      tags: "performance, metrics, optimization"
    },
    {
      projectId: 5,
      title: "Security Assessment",
      content: "Comprehensive security assessment report covering vulnerabilities, threats, and recommended security measures for the blockchain project.",
      tags: "security, assessment, blockchain"
    },
    {
      projectId: 1,
      title: "Team Productivity Report",
      content: "Analysis of team productivity and resource allocation efficiency during the current development sprint.",
      tags: "productivity, team, sprint"
    },
    {
      projectId: 2,
      title: "Quality Assurance Summary",
      content: "Summary of quality assurance activities, test results, and bug reports for the current development cycle.",
      tags: "qa, testing, quality"
    },
    {
      projectId: 6,
      title: "Marketing Campaign Results",
      content: "Results and analysis of the latest digital marketing campaign including engagement metrics and conversion rates.",
      tags: "marketing, campaign, results"
    }
  ];

  await reportsCollection.insertMany(mainReportsData);
  console.log(`✅ Created ${mainReportsData.length} main reports`);
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedMongoDB();
}

export { seedMongoDB };
