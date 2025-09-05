import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Project } from '../projects/entities/project.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { EmailService } from '../notifications/services/email.service';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    private readonly emailService: EmailService,
  ) { }

  async create(createMatchDto: CreateMatchDto) {
    try {
      this.logger.log(`Creating match for project ${createMatchDto.project_id} and vendor ${createMatchDto.vendor_id}`);

      // Validate that project and vendor exist
      const project = await this.projectRepository.findOne({ where: { id: createMatchDto.project_id } });
      if (!project) {
        throw new NotFoundException(`Project with ID ${createMatchDto.project_id} not found`);
      }

      const vendor = await this.vendorRepository.findOne({ where: { id: createMatchDto.vendor_id } });
      if (!vendor) {
        throw new NotFoundException(`Vendor with ID ${createMatchDto.vendor_id} not found`);
      }

      const match = this.matchRepository.create(createMatchDto);
      const savedMatch = await this.matchRepository.save(match);

      this.logger.log(`Match created successfully with ID: ${savedMatch.id}`);
      // Notify project owner by email (mock)
      const projectWithUser = await this.projectRepository.findOne({ where: { id: project.id }, relations: ['user'] });
      if (projectWithUser?.user?.contact_email) {
        await this.emailService.sendEmail({
          to: projectWithUser.user.contact_email,
          subject: 'New vendor match created',
          text: `A new match has been created for your project ${projectWithUser.id} with vendor ${vendor.name}.`,
        });
      }
      return { message: "Match created successfully", match: savedMatch };
    } catch (error) {
      this.logger.error(`Failed to create match: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll() {
    try {
      this.logger.log('Fetching all matches');

      const matches = await this.matchRepository.find({
        relations: ['project', 'vendor', 'project.user'],
        order: { score: 'DESC' }
      });

      this.logger.log(`Found ${matches.length} matches`);
      return { message: "Matches fetched successfully", matches };
    } catch (error) {
      this.logger.error(`Failed to fetch matches: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      this.logger.log(`Fetching match with ID: ${id}`);

      const match = await this.matchRepository.findOne({
        where: { id },
        relations: ['project', 'vendor', 'project.user']
      });

      if (!match) {
        throw new NotFoundException(`Match with ID ${id} not found`);
      }

      this.logger.log(`Match found: Project ${match.project_id} - Vendor ${match.vendor_id}`);
      return { message: "Match fetched successfully", match };
    } catch (error) {
      this.logger.error(`Failed to fetch match ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByProject(projectId: number) {
    try {
      this.logger.log(`Fetching matches for project ${projectId}`);

      const matches = await this.matchRepository.find({
        where: { project_id: projectId },
        relations: ['vendor'],
        order: { score: 'DESC' }
      });

      this.logger.log(`Found ${matches.length} matches for project ${projectId}`);
      return { message: "Project matches fetched successfully", matches };
    } catch (error) {
      this.logger.error(`Failed to fetch matches for project ${projectId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByVendor(vendorId: number) {
    try {
      this.logger.log(`Fetching matches for vendor ${vendorId}`);

      const matches = await this.matchRepository.find({
        where: { vendor_id: vendorId },
        relations: ['project', 'project.user'],
        order: { score: 'DESC' }
      });

      this.logger.log(`Found ${matches.length} matches for vendor ${vendorId}`);
      return { message: "Vendor matches fetched successfully", matches };
    } catch (error) {
      this.logger.error(`Failed to fetch matches for vendor ${vendorId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findTopMatches(limit: number = 10) {
    try {
      this.logger.log(`Fetching top ${limit} matches`);

      const matches = await this.matchRepository.find({
        relations: ['project', 'vendor', 'project.user'],
        order: { score: 'DESC' },
        take: limit
      });

      this.logger.log(`Found ${matches.length} top matches`);
      return { message: `Top ${matches.length} matches fetched successfully`, matches };
    } catch (error) {
      this.logger.error(`Failed to fetch top matches: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, updateMatchDto: UpdateMatchDto) {
    try {
      this.logger.log(`Updating match with ID: ${id}`);

      const match = await this.matchRepository.findOne({
        where: { id },
        relations: ['project', 'vendor', 'project.user']
      });

      if (!match) {
        throw new NotFoundException(`Match with ID ${id} not found`);
      }

      Object.assign(match, updateMatchDto);
      const updatedMatch = await this.matchRepository.save(match);

      this.logger.log(`Match updated successfully: ${updatedMatch.id}`);
      return { message: "Match updated successfully", match: updatedMatch };
    } catch (error) {
      this.logger.error(`Failed to update match ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      this.logger.log(`Removing match with ID: ${id}`);

      const match = await this.matchRepository.findOne({
        where: { id },
        relations: ['project', 'vendor']
      });

      if (!match) {
        throw new NotFoundException(`Match with ID ${id} not found`);
      }

      await this.matchRepository.remove(match);
      this.logger.log(`Match removed successfully: ${match.id}`);
      return { message: "Match removed successfully", match };
    } catch (error) {
      this.logger.error(`Failed to remove match ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Rebuilds vendor matches for a specific project using MySQL queries
   * Matching rules:
   * - Vendors must cover same country
   * - At least one service overlap
   * - Score formula: services_overlap * 2 + rating + SLA_weight
   */
  async rebuildMatchesForProject(projectId: number): Promise<{ message: string; matches: Match[] }> {
    this.logger.log(`Rebuilding matches for project ${projectId}`);

    // First, verify the project exists
    const project = await this.projectRepository.findOne({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Delete existing matches for this project (idempotent)
    await this.matchRepository.delete({ project_id: projectId });
    this.logger.log(`Deleted existing matches for project ${projectId}`);

    // Find matching vendors using TypeORM query builder
    const matchingVendors = await this.vendorRepository
      .createQueryBuilder('vendor')
      .where('JSON_CONTAINS(vendor.countries_supported, :country)', {
        country: JSON.stringify(project.country)
      })
      .andWhere('JSON_OVERLAPS(vendor.services_offered, :services)', {
        services: JSON.stringify(project.services_needed)
      })
      .getMany();

    this.logger.log(`Found ${matchingVendors.length} matching vendors for project ${projectId}`);

    // Create match records with calculated scores
    const matches: Match[] = [];

    for (const vendor of matchingVendors) {
      // Calculate services overlap count
      const servicesOverlap = project.services_needed.filter(service =>
        vendor.services_offered.includes(service)
      ).length;

      // Calculate SLA weight (lower is better, max 100 points)
      const slaWeight = Math.max(0, 100 - (vendor.response_sla_hours * 2));

      // Calculate final score: services_overlap * 2 + rating + SLA_weight
      const score = (servicesOverlap * 2) + vendor.rating + slaWeight;

      const match = this.matchRepository.create({
        project_id: projectId,
        vendor_id: vendor.id,
        score: Math.min(100, Math.max(0, score)) // Ensure score is between 0-100
      });

      const savedMatch = await this.matchRepository.save(match);
      matches.push(savedMatch);
    }

    // Sort matches by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    this.logger.log(`Created ${matches.length} matches for project ${projectId}`);

    return {
      message: `Successfully rebuilt ${matches.length} matches for project ${projectId}`,
      matches
    };
  }
}
