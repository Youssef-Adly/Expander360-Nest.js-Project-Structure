import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { ServiceType } from '../common/enums/service-type.enum';

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);

  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>
  ) { }

  async create(createVendorDto: CreateVendorDto) {
    try {
      this.logger.log(`Creating vendor: ${createVendorDto.name}`);

      // Validate input data
      // this.validateVendorData(createVendorDto);

      // Check if vendor with same name already exists
      const existingVendor = await this.vendorRepository.findOne({
        where: { name: createVendorDto.name }
      });

      if (existingVendor) {
        throw new ConflictException(`Vendor with name '${createVendorDto.name}' already exists`);
      }

      // Create vendor entity
      const vendor = this.vendorRepository.create({
        ...createVendorDto,
        rating: createVendorDto.rating || 0,
        response_sla_hours: createVendorDto.response_sla_hours || 24
      });

      const savedVendor = await this.vendorRepository.save(vendor);
      this.logger.log(`Vendor created successfully with ID: ${savedVendor.id}`);

      return { message: "Vendor created successfully", vendor: savedVendor };
    } catch (error) {
      this.logger.error(`Failed to create vendor: ${error.message}`, error.stack);

      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException(
        'Failed to create vendor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll() {
    try {
      this.logger.log('Fetching all vendors');

      const vendors = await this.vendorRepository.find({
        relations: ['matches'],
        order: { created_at: 'DESC' }
      });

      this.logger.log(`Found ${vendors.length} vendors`);
      return { message: "vendors fetched sucessfuly", vendors };
    } catch (error) {
      this.logger.error(`Failed to fetch vendors: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to fetch vendors',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: number) {
    try {
      this.logger.log(`Fetching vendor with ID: ${id}`);

      // if (!id || id <= 0) {
      //   throw new BadRequestException('Invalid vendor ID provided');
      // }

      const vendor = await this.vendorRepository.findOne({
        where: { id },
        relations: ['matches', 'matches.project', 'matches.project.user']
      });

      if (!vendor) {
        throw new NotFoundException(`Vendor with ID ${id} not found`);
      }

      this.logger.log(`Vendor found: ${vendor.name}`);
      return { message: "Vendor fetched successfully", vendor };
    } catch (error) {
      this.logger.error(`Failed to fetch vendor ${id}: ${error.message}`, error.stack);

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch vendor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByCountryAndServices(country: string, services: ServiceType[]) {
    try {
      this.logger.log(`Searching vendors for country: ${country}, services: ${services.join(', ')}`);

      // Validate input parameters
      if (!country || country.trim().length === 0) {
        throw new BadRequestException('Country parameter is required');
      }

      if (!services || services.length === 0) {
        throw new BadRequestException('At least one service must be specified');
      }

      // Validate service types
      const validServiceTypes = Object.values(ServiceType);
      const invalidServices = services.filter(service => !validServiceTypes.includes(service));
      if (invalidServices.length > 0) {
        throw new BadRequestException(`Invalid service types: ${invalidServices.join(', ')}`);
      }

      const vendors = await this.vendorRepository
        .createQueryBuilder('vendor')
        .where('JSON_CONTAINS(vendor.countries_supported, :country)', {
          country: JSON.stringify(country.trim())
        })
        .getMany();

      // Filter vendors that offer at least one of the required services
      const matchingVendors = vendors.filter(vendor =>
        services.some(service => vendor.services_offered.includes(service))
      );

      this.logger.log(`Found ${matchingVendors.length} matching vendors`);
      return { message: "Vendors search completed successfully", vendors: matchingVendors };
    } catch (error) {
      this.logger.error(`Failed to search vendors: ${error.message}`, error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException(
        'Failed to search vendors',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: number, updateVendorDto: UpdateVendorDto) {
    try {
      this.logger.log(`Updating vendor with ID: ${id}`);

      // if (!id || id <= 0) {
      //   throw new BadRequestException('Invalid vendor ID provided');
      // }

      // Validate update data if provided
      if (Object.keys(updateVendorDto).length === 0) {
        // this.validateVendorData(updateVendorDto);
        throw new BadRequestException('At least one field must be provided');
      }

      const vendor = await this.vendorRepository.findOne({
        where: { id },
        relations: ['matches', 'matches.project', 'matches.project.user']
      });

      if (!vendor) {
        throw new NotFoundException(`Vendor with ID ${id} not found`);
      }

      // Check for name conflicts if name is being updated
      if (updateVendorDto.name && updateVendorDto.name !== vendor.name) {
        const existingVendor = await this.vendorRepository.findOne({
          where: { name: updateVendorDto.name }
        });

        if (existingVendor) {
          throw new ConflictException(`Vendor with name '${updateVendorDto.name}' already exists`);
        }
      }

      Object.assign(vendor, updateVendorDto);
      const updatedVendor = await this.vendorRepository.save(vendor);

      this.logger.log(`Vendor updated successfully: ${updatedVendor.name}`);
      return { message: "Vendor updated successfully", vendor: updatedVendor };
    } catch (error) {
      this.logger.error(`Failed to update vendor ${id}: ${error.message}`, error.stack);

      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }

      throw new HttpException(
        'Failed to update vendor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async remove(id: number) {
    try {
      this.logger.log(`Removing vendor with ID: ${id}`);

      // if (!id || id <= 0) {
      //   throw new BadRequestException('Invalid vendor ID provided');
      // }

      const vendor = await this.vendorRepository.findOne({
        where: { id },
        // relations: ['matches']
      });

      if (!vendor) {
        throw new NotFoundException(`Vendor with ID ${id} not found`);
      }

      // Check if vendor has active matches
      // const activeMatches = await this.vendorRepository
      //   .createQueryBuilder('vendor')
      //   .leftJoin('vendor.matches', 'match')
      //   .where('vendor.id = :id', { id })
      //   .andWhere('match.id IS NOT NULL')
      //   .getCount();

      // if (activeMatches > 0) {
      //   throw new ConflictException(
      //     `Cannot delete vendor with active matches. Please remove all matches first.`
      //   );
      // }

      await this.vendorRepository.remove(vendor);
      this.logger.log(`Vendor removed successfully: ${vendor.name}`);
      return { message: "Vendor removed successfully", vendor };
    } catch (error) {
      this.logger.error(`Failed to remove vendor ${id}: ${error.message}`, error.stack);

      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }

      throw new HttpException(
        'Failed to remove vendor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Validates vendor data for business logic constraints
   */
  // private validateVendorData(vendorData: CreateVendorDto | UpdateVendorDto): void {
  //   // Validate countries_supported
  //   if (vendorData.countries_supported) {
  //     if (!Array.isArray(vendorData.countries_supported) || vendorData.countries_supported.length === 0) {
  //       throw new BadRequestException('At least one country must be supported');
  //     }

  //     const invalidCountries = vendorData.countries_supported.filter(
  //       country => typeof country !== 'string' || country.trim().length === 0
  //     );
  //     if (invalidCountries.length > 0) {
  //       throw new BadRequestException('All countries must be non-empty strings');
  //     }
  //   }

  //   // Validate services_offered
  //   if (vendorData.services_offered) {
  //     if (!Array.isArray(vendorData.services_offered) || vendorData.services_offered.length === 0) {
  //       throw new BadRequestException('At least one service must be offered');
  //     }

  //     const validServiceTypes = Object.values(ServiceType);
  //     const invalidServices = vendorData.services_offered.filter(
  //       service => !validServiceTypes.includes(service)
  //     );
  //     if (invalidServices.length > 0) {
  //       throw new BadRequestException(`Invalid service types: ${invalidServices.join(', ')}`);
  //     }
  //   }

  //   // Validate rating
  //   if (vendorData.rating !== undefined) {
  //     if (vendorData.rating < 0 || vendorData.rating > 5) {
  //       throw new BadRequestException('Rating must be between 0 and 5');
  //     }
  //   }

  //   // Validate response_sla_hours
  //   if (vendorData.response_sla_hours !== undefined) {
  //     if (vendorData.response_sla_hours < 1 || vendorData.response_sla_hours > 168) { // Max 1 week
  //       throw new BadRequestException('Response SLA must be between 1 and 168 hours');
  //     }
  //   }
  // }
}
