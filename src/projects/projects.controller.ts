import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '../users/auth.guard';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  @Get()
  findAll(@Query('user_id') userId?: number) {
    if (userId) {
      return this.projectsService.findByUser(userId);
    }
    return this.projectsService.findAll();
  }

  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }
}
