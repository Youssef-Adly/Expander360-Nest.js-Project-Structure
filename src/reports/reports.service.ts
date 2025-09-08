import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportSchema } from './entities/report.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from 'src/projects/entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel('report') private reportModel: Model<any>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) { }

  async create(createReportDto: CreateReportDto) {
    try {

      const projectExists = await this.projectRepository.findOne({
        where: {
          id: createReportDto.projectId
        }
      })

      if (!projectExists) {
        throw new NotFoundException(`Project with ID ${createReportDto.projectId} not found`);
      }

      const report = new this.reportModel(createReportDto);
      const savedReport = await report.save();
      return {
        message: 'Report created successfully',
        report: JSON.parse(JSON.stringify(savedReport)),
      };
    } catch (error) {
      throw new BadRequestException('Failed to create report: ' + error.message);
    }
  }

  async findAll() {
    try {
      const reports = await this.reportModel.find().lean().exec();
      return {
        message: 'Reports fetched successfully',
        reports: JSON.parse(JSON.stringify(reports)),
        count: reports.length,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch reports: ' + error.message);
    }
  }

  async findOne(id: string) {
    try {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new BadRequestException('Invalid report ID format');
      }

      const report = await this.reportModel.findById(id).lean().exec();
      if (!report) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }

      return {
        message: 'Report fetched successfully',
        report: JSON.parse(JSON.stringify(report)),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch report: ' + error.message);
    }
  }

  async search(query: {
    projectId?: number;
    title?: string;
    content?: string;
    tags?: string;
    limit?: number;
    skip?: number;
  }) {
    try {
      const { projectId, title, content, tags, limit = 50, skip = 0 } = query;

      // Build the filter object dynamically
      const filter: any = {};

      if (projectId !== undefined) {
        filter.projectId = projectId;
      }

      if (title) {
        filter.title = { $regex: title, $options: 'i' };
      }

      if (content) {
        filter.content = { $regex: content, $options: 'i' };
      }

      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        // Use $regex to find tags that contain any of the provided tag strings
        filter.tags = { $regex: tagArray.join('|'), $options: 'i' };
      }

      const reports = await this.reportModel
        .find(filter)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const total = await this.reportModel.countDocuments(filter).exec();

      return {
        message: 'Reports fetched successfully',
        reports: JSON.parse(JSON.stringify(reports)),
        count: reports.length,
        total,
      };
    } catch (error) {
      throw new BadRequestException('Failed to search reports: ' + error.message);
    }
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    try {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new BadRequestException('Invalid report ID format');
      }

      const report = await this.reportModel.findById(id).exec();
      if (!report) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }

      const updatedReport = await this.reportModel
        .findByIdAndUpdate(id, updateReportDto, { new: true })
        .lean()
        .exec();

      return {
        message: 'Report updated successfully',
        report: JSON.parse(JSON.stringify(updatedReport)),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update report: ' + error.message);
    }
  }

  async remove(id: string) {
    try {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new BadRequestException('Invalid report ID format');
      }

      const report = await this.reportModel.findById(id).lean().exec();
      if (!report) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }

      await this.reportModel.findByIdAndDelete(id).exec();
      return {
        message: 'Report deleted successfully',
        report: JSON.parse(JSON.stringify(report)),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete report: ' + error.message);
    }
  }

  async getReportStats() {
    try {
      const totalReports = await this.reportModel.countDocuments().exec();
      const reportsByProject = await this.reportModel.aggregate([
        {
          $group: {
            _id: '$projectId',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]).exec();

      return {
        message: 'Report statistics fetched successfully',
        stats: {
          totalReports,
          reportsByProject,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch report statistics: ' + error.message);
    }
  }
}
