import {
  IsEmail,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

/* -----------------------------------
 * Dentist Schedule DTO
 * ----------------------------------- */
export class CreateDentistScheduleDto {
  @IsNotEmpty()
  @IsString()
  @IsIn([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ])
  day: string;

  @IsNotEmpty()
  @IsString()
  start_time: string; // "09:00"

  @IsNotEmpty()
  @IsString()
  end_time: string; // "17:00"
}

/* -----------------------------------
 * User DTO
 * ----------------------------------- */
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
  @IsIn(['Admin', 'Receptionist', 'Dentist'])
  role?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Active', 'Not Active'])
  status?: string;

  /* 🟦 Dentist schedules (NEW & CORRECT) */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDentistScheduleDto)
  schedules?: CreateDentistScheduleDto[];
}
