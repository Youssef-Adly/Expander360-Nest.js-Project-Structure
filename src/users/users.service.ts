import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  private readonly userRepository: Repository<User>;
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService
  ) {
    // get users table repository to interact with the database
    this.userRepository = this.dataSource.getRepository(User);
  }

  async create(createUserDto: CreateUserDto) {
    try {
      this.logger.log(`Creating user with email: ${createUserDto.contact_email}`);

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { contact_email: createUserDto.contact_email }
      });

      if (existingUser) {
        throw new ConflictException(`User with email ${createUserDto.contact_email} already exists`);
      }

      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword
      });

      const savedUser = await this.userRepository.save(user);
      this.logger.log(`User created successfully with ID: ${savedUser.id}`);

      // Fetch the user back without password
      const userWithoutPassword = await this.userRepository.findOne({
        select: ['id', 'company_name', 'contact_email', 'IsAdmin'],
        where: { id: savedUser.id }
      });

      return { user: userWithoutPassword, message: "User created successfully" };
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException("Failed to create user");
    }
  }

  // Find all users with pagination and filtering
  async findAll(limit?: number, page?: number, isAdmin?: boolean) {
    try {
      // Validate and sanitize input parameters
      const validatedLimit = Math.min(Math.max(limit || 10, 1), 100); // Between 1 and 100
      const validatedPage = Math.max(page || 1, 1); // Minimum 1

      this.logger.log(`Fetching users - Page: ${validatedPage}, Limit: ${validatedLimit}, Admin filter: ${isAdmin}`);

      const [users, total] = await this.userRepository.findAndCount({
        select: ['id', 'company_name', 'contact_email', 'IsAdmin'], // Exclude password
        skip: (validatedPage - 1) * validatedLimit,
        take: validatedLimit,
        where: {
          ...(isAdmin !== undefined ? { IsAdmin: isAdmin } : {})
        },
        order: { id: 'ASC' } // Consistent ordering
      });

      const totalPages = Math.ceil(total / validatedLimit);

      this.logger.log(`Users fetched successfully: ${users.length}/${total} users`);

      return {
        users,
        total,
        page: validatedPage,
        limit: validatedLimit,
        totalPages,
        hasNextPage: validatedPage < totalPages,
        hasPrevPage: validatedPage > 1,
        message: "Users fetched successfully"
      };
    } catch (error) {
      this.logger.error(`Error fetching users: ${error.message}`, error.stack);
      throw new BadRequestException("Failed to fetch users");
    }
  }

  // Find one user by ID
  async findOne(id: number) {
    try {
      // Validate ID
      // if (!id || id <= 0 || !Number.isInteger(id)) {
      //   throw new BadRequestException("Invalid user ID");
      // }

      this.logger.log(`Fetching user with ID: ${id}`);

      const user = await this.userRepository.findOne({
        select: ['id', 'company_name', 'contact_email', 'IsAdmin'], // Exclude password
        where: { id }
      });

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`User found: ${user.contact_email}`);
      return { user, message: "User fetched successfully" };
    } catch (error) {
      this.logger.error(`Error fetching user ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Failed to fetch user");
    }
  }

  // Find one user by email (with password for authentication)
  async findUserByEmail(contact_email: string): Promise<User | null> {
    try {
      if (!contact_email || !contact_email.includes('@')) {
        throw new BadRequestException("Invalid email format");
      }

      this.logger.log(`Looking up user by email: ${contact_email}`);

      const user = await this.userRepository.findOne({
        where: { contact_email: contact_email.toLowerCase().trim() }
      });

      return user;
    } catch (error) {
      this.logger.error(`Error finding user by email ${contact_email}: ${error.message}`);
      throw new BadRequestException("Failed to find user by email");
    }
  }

  // Find one user by email (without password for general use)
  async findUserByEmailSafe(contact_email: string): Promise<Partial<User> | null> {
    try {
      if (!contact_email || !contact_email.includes('@')) {
        throw new BadRequestException("Invalid email format");
      }

      const user = await this.userRepository.findOne({
        select: ['id', 'company_name', 'contact_email', 'IsAdmin'],
        where: { contact_email: contact_email.toLowerCase().trim() }
      });

      return user;
    } catch (error) {
      this.logger.error(`Error finding user by email ${contact_email}: ${error.message}`);
      throw new BadRequestException("Failed to find user by email");
    }
  }

  // Legacy method for backward compatibility
  async FoundUser(contact_email: string): Promise<User | null> {
    return this.findUserByEmail(contact_email);
  }

  // Helper method to get user role from JWT token
  getUserRoleFromToken(token: string): { role: string; isAdmin: boolean } {
    try {
      const payload = this.jwtService.verify(token);
      return {
        role: payload.IsAdmin ? 'admin' : 'client',
        isAdmin: payload.IsAdmin
      };
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  // Helper method to check if user has admin role
  isUserAdmin(token: string): boolean {
    const { isAdmin } = this.getUserRoleFromToken(token);
    return isAdmin;
  }

  // Helper method to check if user has specific role
  hasRole(token: string, requiredRole: string): boolean {
    const { role } = this.getUserRoleFromToken(token);
    return role === requiredRole;
  }

  async register(createUserDto: CreateUserDto) {
    try {
      this.logger.log(`Registering user with email: ${createUserDto.contact_email}`);

      // Check if user already exists
      const existingUser = await this.findUserByEmail(createUserDto.contact_email);
      if (existingUser) {
        throw new ConflictException(`User with email ${createUserDto.contact_email} already exists. Please login instead.`);
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      // Create user
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        contact_email: createUserDto.contact_email.toLowerCase().trim()
      });

      const savedUser = await this.userRepository.save(user);
      this.logger.log(`User registered successfully with ID: ${savedUser.id}`);

      // Fetch the user back without password
      const userWithoutPassword = await this.userRepository.findOne({
        select: ['id', 'company_name', 'contact_email', 'IsAdmin'],
        where: { id: savedUser.id }
      });

      // Generate JWT token
      if (!userWithoutPassword) {
        throw new BadRequestException("Failed to retrieve user data");
      }

      const token = this.jwtService.sign(
        {
          id: userWithoutPassword.id,
          contact_email: userWithoutPassword.contact_email,
          IsAdmin: userWithoutPassword.IsAdmin,
          role: userWithoutPassword.IsAdmin ? 'admin' : 'client'
        },
        { secret: "secret" }
      );

      return {
        token,
        user: userWithoutPassword,
        message: "User registered successfully"
      };
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`, error.stack);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException("Failed to register user");
    }
  }

  async login(loginUserDto: LoginUserDto, res: Response) {
    try {
      this.logger.log(`Login attempt for email: ${loginUserDto.contact_email}`);

      // Find user by email
      const foundUser = await this.findUserByEmail(loginUserDto.contact_email);
      if (!foundUser) {
        this.logger.warn(`Login failed - User not found: ${loginUserDto.contact_email}`);
        throw new BadRequestException("Invalid email or password");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(loginUserDto.password, foundUser.password);
      if (!isValidPassword) {
        this.logger.warn(`Login failed - Invalid password for: ${loginUserDto.contact_email}`);
        throw new BadRequestException("Invalid email or password");
      }

      // Generate JWT token
      const token = this.jwtService.sign(
        {
          id: foundUser.id,
          contact_email: foundUser.contact_email,
          IsAdmin: foundUser.IsAdmin,
          role: foundUser.IsAdmin ? 'admin' : 'client'
        },
        { secret: "secret" }
      );

      // Set token in header
      res.header("x-auth-token", token);

      // Set token in cookie (expires in 1 month)
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);
      res.cookie('x-auth-token', token, {
        expires: expirationDate,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = foundUser;

      this.logger.log(`User logged in successfully: ${foundUser.contact_email}`);

      return {
        message: "Logged in successfully",
        token,
        data: userWithoutPassword
      };
    } catch (error) {
      this.logger.error(`Login error for ${loginUserDto.contact_email}: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Login failed");
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      this.logger.log(`Updating user with ID: ${id}`);

      // Check if user exists
      const existingUser = await this.userRepository.findOne({ where: { id } });
      if (!existingUser) {
        this.logger.warn(`Update failed - User not found: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Check if email is being updated and if it already exists
      if (updateUserDto.contact_email && updateUserDto.contact_email !== existingUser.contact_email) {
        const emailExists = await this.findUserByEmail(updateUserDto.contact_email);
        if (emailExists) {
          throw new ConflictException(`Email ${updateUserDto.contact_email} is already in use`);
        }
        updateUserDto.contact_email = updateUserDto.contact_email.toLowerCase().trim();
      }

      // If password is being updated, hash it
      if (updateUserDto.password) {
        const salt = await bcrypt.genSalt(10);
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
      }

      // Update the user
      await this.userRepository.update(id, updateUserDto);

      // Fetch the updated user without password
      const updatedUser = await this.userRepository.findOne({
        select: ['id', 'company_name', 'contact_email', 'IsAdmin'],
        where: { id }
      });

      if (!updatedUser) {
        throw new BadRequestException("Failed to retrieve updated user data");
      }

      this.logger.log(`User updated successfully: ${updatedUser.contact_email}`);
      return { user: updatedUser, message: "User updated successfully" };
    } catch (error) {
      this.logger.error(`Error updating user ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException("Failed to update user");
    }
  }

  async remove(id: number) {
    try {
      this.logger.log(`Deleting user with ID: ${id}`);

      // Check if user exists
      const existingUser = await this.userRepository.findOne({
        select: ['id', 'contact_email'],
        where: { id }
      });

      if (!existingUser) {
        this.logger.warn(`Delete failed - User not found: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Delete the user
      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`User deleted successfully: ${existingUser.contact_email}`);
      return { message: `User with ID ${id} deleted successfully` };
    } catch (error) {
      this.logger.error(`Error deleting user ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Failed to delete user");
    }
  }
}
