import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user information from request (set by AuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User information not found. Please ensure AuthGuard is applied before RolesGuard.');
    }

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => {
      switch (role) {
        case Role.Admin:
          return user.IsAdmin === true;
        case Role.Client:
          return user.IsAdmin === false || user.IsAdmin === undefined;
        default:
          return false;
      }
    });

    if (!hasRequiredRole) {
      throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role}`);
    }

    return true;
  }
}