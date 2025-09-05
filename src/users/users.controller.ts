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
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ParamUserDto } from './dto/param-user.dto';
import type { Response } from 'express';
import { UserRoles } from './roles.decorator';
import { Role } from './role.enum';
import { RolesGuard } from './roles.guard';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from './entities/user.entity';

@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(AuthGuard)
  @UserRoles(Role.Admin)
  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  @Post()
  create(@CurrentUser() user: User, @Body() createUserDto: CreateUserDto) {
    // console.log('data: ', user);
    return this.usersService.create(createUserDto);
  }

  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  @Post('login')
  login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersService.login(loginUserDto, res);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @UserRoles(Role.Admin)
  @Get()
  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  findAll(@Query() queryUserDto: QueryUserDto) {
    return this.usersService.findAll(
      queryUserDto.limit,
      queryUserDto.page,
      queryUserDto.isAdmin,
    );
  }

  @UseGuards(AuthGuard)
  @UserRoles(Role.Admin, Role.Client)
  @Get(':id')
  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  findOne(@Param() paramUserDto: ParamUserDto, @CurrentUser() user: any) {
    // Clients can only view their own profile, admins can view any profile
    if (user.role === 'client' && user.id !== paramUserDto.id) {
      throw new Error('You can only view your own profile');
    }
    return this.usersService.findOne(paramUserDto.id);
  }

  @UseGuards(AuthGuard)
  @UserRoles(Role.Admin, Role.Client)
  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  @Patch(':id')
  update(
    @Param() paramUserDto: ParamUserDto,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    // Clients can only update their own profile, admins can update any profile
    if (user.role === 'client' && user.id !== paramUserDto.id) {
      throw new Error('You can only update your own profile');
    }
    return this.usersService.update(paramUserDto.id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @UserRoles(Role.Admin)
  @Delete(':id')
  @UsePipes(new ValidationPipe(/* { stopAtFirstError: true } */))
  remove(@Param() paramUserDto: ParamUserDto) {
    return this.usersService.remove(paramUserDto.id);
  }

  // Get current user's profile
  @UseGuards(AuthGuard)
  @Get('token/test')
  getCurrentUser(@CurrentUser() user: any) {
    return {
      user,
      message: 'Current user profile retrieved successfully',
    };
  }
}
