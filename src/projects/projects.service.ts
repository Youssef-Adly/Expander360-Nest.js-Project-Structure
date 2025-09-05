import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const user = await this.userRepository.findOne({
      where: { id: createProjectDto.user_id, IsAdmin: false },
    });

    if (!user) {
      throw new NotFoundException(
        `client with ID ${createProjectDto.user_id} not found`,
      );
    }

    const project = this.projectRepository.create(createProjectDto);
    await this.projectRepository.save(project);
    return {
      message: 'Project created successfully',
      project,
    };
  }

  async findAll() {
    const projects = await this.projectRepository.find({
      relations: ['user', 'matches'],
    });
    return { message: 'Projects fetched successfully', projects };
  }

  async findOne(id: number) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['user', 'matches', 'matches.vendor'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return { message: 'Project fetched successfully', project };
  }

  async findByUser(userId: number) {
    const projects = await this.projectRepository.find({
      where: { user_id: userId },
      relations: ['user', 'matches'],
    });

    return { message: 'Projects fetched successfully', projects };
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    await this.projectRepository.update(id, updateProjectDto);
    const UpdatedProject = await this.projectRepository.findOne({
      where: { id },
    });
    return {
      message: 'Project updated successfully',
      project: UpdatedProject,
    };
  }

  async remove(id: number) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    await this.projectRepository.remove(project);
    return {
      message: 'Project deleted successfully',
      project,
    };
  }
}
