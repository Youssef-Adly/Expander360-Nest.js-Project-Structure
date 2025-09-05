import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportSchema } from './entities/report.model';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/projects/entities/project.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: `report`, schema: ReportSchema }]),
    UsersModule,
    TypeOrmModule.forFeature([Project]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule { }
