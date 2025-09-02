import { AtLeastOneField } from 'src/Validators/AtLeastOneField';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateUserDto {

  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Company name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z0-9\s\-&.,()]+$/, {
    message: 'Company name can only contain letters, numbers, spaces, and basic punctuation'
  })
  company_name?: string;

  @IsOptional()
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  contact_email?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  password?: string;

  @IsOptional()
  @IsBoolean({ message: 'IsAdmin must be a boolean value' })
  IsAdmin?: boolean;

  // 🔥 enforce at least one field required
  @AtLeastOneField([
    'company_name',
    'contact_email',
    'password',
    'IsAdmin',
  ])
  dummy!: any; // just a placeholder
}
