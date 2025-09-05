import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class ProjectOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private projectsService: ProjectsService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User information not found. Please ensure AuthGuard is applied first.');
    }

    // Only apply to clients (admins can access all projects)
    if (user.IsAdmin === true) {
      return true;
    }

    // Get project ID from request parameters
    const projectId = request.params.id || request.params.project_id;

    if (!projectId) {
      // If no project ID, allow access (for listing projects)
      return true;
    }

    try {
      // Get the project to check ownership
      const projectResponse = await this.projectsService.findOne(parseInt(projectId));

      if (!projectResponse || !projectResponse.project) {
        throw new NotFoundException('Project not found');
      }

      // Check if the project belongs to the current user
      if (projectResponse.project.user_id !== user.id) {
        throw new ForbiddenException('You can only access your own projects');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new ForbiddenException('Unable to verify project ownership');
    }
  }
}
