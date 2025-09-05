import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  IsArray,
  IsEnum,
  Min,
} from 'class-validator';
import { ProjectStatus } from 'src/common/enums/project-status.enum';
import { ServiceType } from 'src/common/enums/service-type.enum';
import { AtLeastOneField } from 'src/Validators/AtLeastOneField';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  // @IsNotEmpty()
  // @IsNumber()
  // @IsPositive()
  // user_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  country: string;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(ServiceType, { each: true })
  services_needed: ServiceType[];

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  budget: number;

  @IsEnum(ProjectStatus, {
    message: `status must be one of ${Object.values(ProjectStatus).join(', ')}`,
  })
  status?: ProjectStatus = ProjectStatus.DRAFT;

  @AtLeastOneField(['country', 'services_needed', 'budget', 'status'], {
    message: 'At least one field must be provided',
  })
  dummy!: string;
}
