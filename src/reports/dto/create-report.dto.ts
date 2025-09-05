import { IsString, IsNumber, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content: string;

  @IsString()
  @IsOptional()
  tags?: string;
}
