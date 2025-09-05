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
import { RolesGuard } from '../users/roles.guard';
import { ProjectOwnershipGuard } from '../users/ownership.guard';
import { MatchesService } from '../matches/matches.service';
import { UserRoles } from 'src/users/roles.decorator';
import { Role } from 'src/users/role.enum';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/users/current-user.decorator';

@Controller('projects')
@UseGuards(AuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly matchesService: MatchesService
  ) { }

  // Clients can create projects (automatically assigned to their user_id)
  @UserRoles(Role.Client, Role.Admin)
  @UsePipes(new ValidationPipe())
  @Post()
  create(@CurrentUser() user: User, @Body() createProjectDto: CreateProjectDto) {
    // Automatically set the user_id to the current user
    createProjectDto.user_id = user.id;
    return this.projectsService.create(createProjectDto);
  }

  // Clients can only see their own projects, Admins can see all
  @UserRoles(Role.Client, Role.Admin)
  @UsePipes(new ValidationPipe())
  @Get()
  findAll(@CurrentUser() user: User, @Query('user_id') userId?: number) {
    // If user is admin, they can query any user's projects
    if (user.IsAdmin && userId) {
      return this.projectsService.findByUser(userId);
    }
    // If user is admin and no userId specified, show all projects
    if (user.IsAdmin && !userId) {
      return this.projectsService.findAll();
    }
    // If user is client, only show their own projects
    return this.projectsService.findByUser(user.id);
  }

  // Both clients and admins can view projects, but clients only their own
  @UserRoles(Role.Client, Role.Admin)
  @UseGuards(ProjectOwnershipGuard)
  @UsePipes(new ValidationPipe())
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  // Only clients can update projects (and only their own)
  @UserRoles(Role.Client)
  @UseGuards(ProjectOwnershipGuard)
  @UsePipes(new ValidationPipe())
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  // Only clients can delete projects (and only their own)
  @UserRoles(Role.Client)
  @UseGuards(ProjectOwnershipGuard)
  @UsePipes(new ValidationPipe())
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }

  // Both clients and admins can rebuild matches for projects
  @UserRoles(Role.Client, Role.Admin)
  @UseGuards(ProjectOwnershipGuard)
  @UsePipes(new ValidationPipe())
  @Post(':id/matches/rebuild')
  rebuildMatches(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.rebuildMatchesForProject(id);
  }
}
