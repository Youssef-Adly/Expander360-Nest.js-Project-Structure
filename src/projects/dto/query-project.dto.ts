import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProjectDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'User ID must be an integer' })
  @Min(1, { message: 'User ID must be at least 1' })
  user_id?: number;
}
