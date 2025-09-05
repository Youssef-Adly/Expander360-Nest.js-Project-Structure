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
  ValidationPipe,
  UsePipes,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { AuthGuard } from '../users/auth.guard';
import { RolesGuard } from '../users/roles.guard';
import { UserRoles } from '../users/roles.decorator';
import { Role } from '../users/role.enum';
import { ServiceType } from '../common/enums/service-type.enum';

@Controller('vendors')
@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe())
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) { }

  // Only admins can create vendors
  @UserRoles(Role.Admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createVendorDto: CreateVendorDto) {
    return await this.vendorsService.create(createVendorDto);
  }

  // Only admins can view all vendors
  @UserRoles(Role.Admin)
  @Get()
  async findAll() {
    return await this.vendorsService.findAll();
  }

  // Both clients and admins can search vendors (for matching)
  @UserRoles(Role.Client, Role.Admin)
  @Get('search')
  async findByCountryAndServices(
    @Query('country') country: string,
    @Query('services') services: string,
  ) {
    if (!services) {
      throw new Error('Services parameter is required');
    }

    const serviceTypes = services
      .split(',')
      .map((s) => s.trim()) as ServiceType[];
    return await this.vendorsService.findByCountryAndServices(
      country,
      serviceTypes,
    );
  }

  // Both clients and admins can view individual vendors
  @UserRoles(Role.Client, Role.Admin)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.vendorsService.findOne(id);
  }

  // Only admins can update vendors
  @UserRoles(Role.Admin)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return await this.vendorsService.update(id, updateVendorDto);
  }

  // Only admins can delete vendors
  @UserRoles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.vendorsService.remove(id);
  }
}
