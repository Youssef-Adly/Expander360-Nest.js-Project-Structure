import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AuthGuard } from '../users/auth.guard';
import { RolesGuard } from '../users/roles.guard';
import { UserRoles } from '../users/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @UserRoles(Role.Client, Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @UserRoles(Role.Client, Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @UserRoles(Role.Client, Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Get('stats')
  getStats() {
    return this.reportsService.getReportStats();
  }

  @UserRoles(Role.Client, Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Get('search')
  search(
    @Query('projectId') projectId?: string,
    @Query('title') title?: string,
    @Query('content') content?: string,
    @Query('tags') tags?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const query: any = {};

    if (projectId) query.projectId = +projectId;
    if (title) query.title = title;
    if (content) query.content = content;
    if (tags) query.tags = tags;
    if (limit) query.limit = +limit;
    if (skip) query.skip = +skip;

    return this.reportsService.search(query);
  }

  @UserRoles(Role.Client, Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @UserRoles(Role.Client, Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(id, updateReportDto);
  }

  @UserRoles(Role.Client, Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }
}
