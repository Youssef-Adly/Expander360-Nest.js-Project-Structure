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
import { ServiceType } from '../common/enums/service-type.enum';

@Controller('vendors')
@UseGuards(AuthGuard)
@UsePipes(new ValidationPipe())
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createVendorDto: CreateVendorDto) {
    return await this.vendorsService.create(createVendorDto);
  }

  @Get()
  async findAll() {
    return await this.vendorsService.findAll();
  }

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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.vendorsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return await this.vendorsService.update(id, updateVendorDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.vendorsService.remove(id);
  }
}
