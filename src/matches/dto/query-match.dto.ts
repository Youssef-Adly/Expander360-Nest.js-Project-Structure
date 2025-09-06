import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMatchDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Project ID must be an integer' })
  @Min(1, { message: 'Project ID must be at least 1' })
  project_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Vendor ID must be an integer' })
  @Min(1, { message: 'Vendor ID must be at least 1' })
  vendor_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Top must be an integer' })
  @Min(1, { message: 'Top must be at least 1' })
  top?: number;
}
