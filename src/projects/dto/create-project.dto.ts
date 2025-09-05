import { IsNotEmpty, IsNumber, IsString, IsArray, IsEnum, IsPositive, MaxLength, Min } from 'class-validator';
import { ServiceType } from '../../common/enums/service-type.enum';
import { ProjectStatus } from '../../common/enums/project-status.enum';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  user_id: number;

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

  @IsEnum(ProjectStatus, { message: `status must be one of ${Object.values(ProjectStatus).join(', ')}` })
  status?: ProjectStatus = ProjectStatus.DRAFT;
}
