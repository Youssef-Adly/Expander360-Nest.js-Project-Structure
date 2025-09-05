import { IsNotEmpty, IsNumber, IsPositive, Min, Max } from 'class-validator';

export class CreateMatchDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  project_id: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  vendor_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;
}
