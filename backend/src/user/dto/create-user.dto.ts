import {
  IsEmail,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  middle_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  license_no?: string;

  @IsOptional()
  @IsString()
  prc_type?: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  status?: string;

  // 🟦 Dentist schedule fields

  @IsOptional()
  @IsString()
  schedule_start?: string; // "09:00"

  @IsOptional()
  @IsString()
  schedule_end?: string; // "17:00"

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  available_days?: string[]; // ["Monday","Friday"]
}
