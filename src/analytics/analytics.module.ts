import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Match } from '../matches/entities/match.entity';
import { Project } from '../projects/entities/project.entity';
import { ReportSchema } from '../reports/entities/report.model';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor, Match, Project]),
    MongooseModule.forFeature([{ name: 'report', schema: ReportSchema }]),
    UsersModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule { }
