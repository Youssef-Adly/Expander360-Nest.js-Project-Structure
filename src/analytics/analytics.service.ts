import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Match } from '../matches/entities/match.entity';
import { Project } from '../projects/entities/project.entity';
import { ReportSchema } from '../reports/entities/report.model';
import { NotFoundError } from 'rxjs';

export interface CountryAnalytics {
  country: string;
  topVendors: {
    vendorId: number;
    vendorName: string;
    vendorRating: number;
    responseSlaHours: number;
    avgMatchScore: number;
    totalMatches: number;
  }[];
  researchDocumentsCount: number;
  expansionProjectsCount: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectModel('report')
    private reportModel: Model<any>,
  ) {}

  async getTopVendorsPerCountry() {
    try {
      this.logger.log('Fetching top vendors per country analytics');

      // Get date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get all unique countries from vendors
      const countries = await this.vendorRepository
        .createQueryBuilder('vendor')
        .select(
          'DISTINCT JSON_UNQUOTE(JSON_EXTRACT(vendor.countries_supported, "$[*]")) as country',
        )
        .getRawMany();

      const result: CountryAnalytics[] = [];

      for (const countryData of countries) {
        const countryString = countryData.country;
        if (!countryString) continue;

        // Parse the JSON string to get array of countries
        const countryArray = JSON.parse(countryString);

        // Loop through each country in the array
        for (const country of countryArray) {
          this.logger.log(`Processing analytics for country: ${country}`);

          // Get top 3 vendors for this country based on average match score in last 30 days
          const topVendors = await this.matchRepository
            .createQueryBuilder('match')
            .leftJoin('match.vendor', 'vendor')
            .leftJoin('match.project', 'project')
            .where('JSON_CONTAINS(vendor.countries_supported, :country)', {
              country: JSON.stringify(country),
            })
            .andWhere('match.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
            .select([
              'vendor.id as vendorId',
              'vendor.name as vendorName',
              'vendor.rating as vendorRating',
              'vendor.response_sla_hours as responseSlaHours',
              'AVG(match.score) as avgMatchScore',
              'COUNT(match.id) as totalMatches',
            ])
            .groupBy(
              'vendor.id, vendor.name, vendor.rating, vendor.response_sla_hours',
            )
            .having('COUNT(match.id) > 0')
            .orderBy('avgMatchScore', 'DESC')
            .limit(3)
            .getRawMany();

          // Get count of research documents (reports) linked to expansion projects in this country
          const expansionProjects = await this.projectRepository
            .createQueryBuilder('project')
            .where('project.country = :country', { country })
            .andWhere('project.status = :status', { status: 'expansion' })
            .getMany();

          const expansionProjectIds = expansionProjects.map((p) => p.id);

          let researchDocumentsCount = 0;
          if (expansionProjectIds.length > 0) {
            researchDocumentsCount = await this.reportModel
              .countDocuments({ projectId: { $in: expansionProjectIds } })
              .exec();
          }

          result.push({
            country,
            topVendors: topVendors.map((vendor) => ({
              vendorId: parseInt(vendor.vendorId),
              vendorName: vendor.vendorName,
              vendorRating: parseFloat(vendor.vendorRating),
              responseSlaHours: parseInt(vendor.responseSlaHours),
              avgMatchScore: parseFloat(vendor.avgMatchScore),
              totalMatches: parseInt(vendor.totalMatches),
            })),
            researchDocumentsCount,
            expansionProjectsCount: expansionProjectIds.length,
          });
        }
      }

      this.logger.log(`Analytics completed for ${result.length} countries`);
      return {
        message: 'Top vendors per country analytics fetched successfully',
        data: result,
        summary: {
          totalCountries: result.length,
          totalVendors: result.reduce(
            (sum, country) => sum + country.topVendors.length,
            0,
          ),
          totalResearchDocuments: result.reduce(
            (sum, country) => sum + country.researchDocumentsCount,
            0,
          ),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch top vendors analytics: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getVendorPerformanceMetrics(vendorId: number) {
    try {
      this.logger.log(`Fetching performance metrics for vendor ${vendorId}`);

      let thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get vendor details
      const vendor = await this.vendorRepository.findOne({
        where: { id: vendorId },
      });

      if (!vendor) {
        throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
      }

      // Get match statistics for last 30 days
      const matchStats = await this.matchRepository
        .createQueryBuilder('match')
        .leftJoin('match.project', 'project')
        .where('match.vendor_id = :vendorId', { vendorId })
        .andWhere('match.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
        .select([
          'AVG(match.score) as avgScore',
          'COUNT(match.id) as totalMatches',
          'MAX(match.score) as maxScore',
          'MIN(match.score) as minScore',
        ])
        .getRawOne();

      // Get country-wise performance
      const countryPerformance = await this.matchRepository
        .createQueryBuilder('match')
        .leftJoin('match.project', 'project')
        .where('match.vendor_id = :vendorId', { vendorId })
        .andWhere('match.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
        .select([
          'project.country as country',
          'AVG(match.score) as avgScore',
          'COUNT(match.id) as totalMatches',
        ])
        .groupBy('project.country')
        .orderBy('avgScore', 'DESC')
        .getRawMany();

      return {
        message: 'Vendor performance metrics fetched successfully',
        vendor: {
          id: vendor.id,
          name: vendor.name,
          rating: vendor.rating,
          responseSlaHours: vendor.response_sla_hours,
          countriesSupported: vendor.countries_supported,
        },
        metrics: {
          avgScore: matchStats ? parseFloat(matchStats.avgScore) : 0,
          totalMatches: matchStats ? parseInt(matchStats.totalMatches) : 0,
          maxScore: matchStats ? parseFloat(matchStats.maxScore) : 0,
          minScore: matchStats ? parseFloat(matchStats.minScore) : 0,
        },
        countryPerformance: countryPerformance.map((cp) => ({
          country: cp.country,
          avgScore: parseFloat(cp.avgScore),
          totalMatches: parseInt(cp.totalMatches),
        })),
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch vendor performance metrics: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
