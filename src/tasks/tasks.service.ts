import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { ProjectStatus } from '../common/enums/project-status.enum';
import { Vendor } from '../vendors/entities/vendor.entity';
import { MatchesService } from '../matches/matches.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    private readonly matchesService: MatchesService,
  ) { }

  // Daily at 02:00 server time
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async refreshMatchesForActiveProjects(): Promise<void> {
    this.logger.log('Starting daily match refresh for active projects');
    const activeProjects = await this.projectRepository.find({ where: { status: ProjectStatus.ACTIVE } });
    for (const project of activeProjects) {
      try {
        await this.matchesService.rebuildMatchesForProject(project.id);
      } catch (error) {
        this.logger.error(`Failed to refresh matches for project ${project.id}: ${error.message}`);
      }
    }
    this.logger.log(`Completed daily match refresh for ${activeProjects.length} projects`);
  }

  // Daily at 03:00 server time
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async flagVendorsWithExpiredSla(): Promise<void> {
    this.logger.log('Starting SLA expiry check for vendors');
    const now = new Date();
    const vendors = await this.vendorRepository.find();
    let updated = 0;
    for (const vendor of vendors) {
      const isExpired = !!vendor.sla_expires_at && vendor.sla_expires_at < now;
      if (vendor.sla_expired !== isExpired) {
        vendor.sla_expired = isExpired;
        await this.vendorRepository.save(vendor);
        updated += 1;
      }
    }
    this.logger.log(`Completed SLA expiry check. Vendors updated: ${updated}`);
  }
}


