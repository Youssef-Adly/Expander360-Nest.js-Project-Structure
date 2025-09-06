import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      // Extract token from Authorization header
      const authHeader = request.headers['authorization'];
      if (!authHeader) {
        throw new UnauthorizedException('Authorization header is missing');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Token is missing');
      }
      console.log("token: ", token)

      // Verify and decode the JWT token
      const payload = this.jwtService.verify(token);
      console.log("payload: ", payload)

      // Check if user exists in database
      const user = await this.usersService.findUserByEmailSafe(
        payload.contact_email,
      );
      console.log("user: ", user)

      if (!user) {
        throw new UnauthorizedException(
          'User not found or account has been deleted',
        );
      }

      // Add user information to request object for use in controllers
      request.user = {
        id: user.id,
        contact_email: user.contact_email,
        company_name: user.company_name,
        IsAdmin: user.IsAdmin,
        role: user.IsAdmin ? 'admin' : 'client',
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
