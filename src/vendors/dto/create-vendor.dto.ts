import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsEnum,
  IsNumber,
  MaxLength,
  Min,
  Max,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
  IsPositive,
  IsInt
} from 'class-validator';
import { ServiceType } from '../../common/enums/service-type.enum';

export class CreateVendorDto {
  @IsNotEmpty({ message: 'Vendor name is required' })
  @IsString({ message: 'Vendor name must be a string' })
  @MaxLength(255, { message: 'Vendor name must not exceed 255 characters' })
  name: string;

  @IsNotEmpty({ message: 'Countries supported is required' })
  @IsArray({ message: 'Countries supported must be an array' })
  @ArrayMinSize(1, { message: 'At least one country must be supported' })
  @ArrayMaxSize(50, { message: 'Cannot support more than 50 countries' })
  @IsString({ each: true, message: 'Each country must be a string' })
  countries_supported: string[];

  @IsNotEmpty({ message: 'Services offered is required' })
  @IsArray({ message: 'Services offered must be an array' })
  @ArrayMinSize(1, { message: 'At least one service must be offered' })
  @ArrayMaxSize(20, { message: 'Cannot offer more than 20 services' })
  @IsEnum(ServiceType, { each: true, message: 'Invalid service type provided' })
  services_offered: ServiceType[];

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Rating must be a number with max 2 decimal places' })
  @Min(0, { message: 'Rating cannot be negative' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating?: number = 0;

  @IsOptional()
  @IsNumber({}, { message: 'Response SLA hours must be a number' })
  @IsInt({ message: 'Response SLA hours must be an integer' })
  @IsPositive({ message: 'Response SLA hours must be positive' })
  @Min(1, { message: 'Response SLA must be at least 1 hour' })
  @Max(168, { message: 'Response SLA cannot exceed 168 hours (1 week)' })
  response_sla_hours?: number = 24;
}
