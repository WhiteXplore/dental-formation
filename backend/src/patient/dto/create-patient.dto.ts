import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreatePatientDto {
  /* BASIC INFO */

  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  middle_name: string;

  @IsOptional()
  @IsString()
  last_name: string;

  @IsOptional()
  birthdate: Date;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsNumber()
  age: number;

  @IsOptional()
  @IsString()
  religion: string;

  @IsOptional()
  @IsString()
  other_religion: string;

  @IsOptional()
  @IsString()
  nationality: string;

  @IsOptional()
  @IsString()
  marital_status: string;

  @IsOptional()
  @IsString()
  occupation: string;

  @IsOptional()
  @IsString()
  contact_number: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  parent_fullname: string;

  /* INSURANCE */

  @IsOptional()
  @IsString()
  has_insurance: string;

  @IsOptional()
  @IsString()
  dental_insurance: string;

  @IsOptional()
  @IsString()
  other_insurance: string;

  /* HEALTH */

  @IsOptional()
  @IsString()
  good_health: string;

  @IsOptional()
  @IsString()
  health_details: string;

  @IsOptional()
  @IsString()
  medical_treatment: string;

  @IsOptional()
  @IsString()
  medical_treatment_details: string;

  @IsOptional()
  @IsString()
  serious_illness: string;

  @IsOptional()
  @IsString()
  serious_illness_details: string;

  @IsOptional()
  @IsString()
  hospitalized: string;

  @IsOptional()
  @IsString()
  hospitalized_details: string;

  @IsOptional()
  @IsString()
  taking_medication: string;

  @IsOptional()
  @IsString()
  taking_medication_details: string;

  @IsOptional()
  @IsString()
  use_tobacco: string;

  @IsOptional()
  @IsString()
  use_alcohol: string;

  @IsOptional()
  @IsString()
  allergies: string;

  @IsOptional()
  @IsString()
  allergies_details: string;

  @IsOptional()
  @IsString()
  bleeding_time_details: string;

  /* WOMEN */

  @IsOptional()
  @IsString()
  pregnant: string;

  @IsOptional()
  @IsString()
  nursing: string;

  @IsOptional()
  @IsString()
  control_pills: string;

  /* VITAL SIGNS */

  @IsOptional()
  @IsString()
  blood_type: string;

  @IsOptional()
  @IsString()
  blood_pressure: string;

  /* MEDICAL CONDITIONS */

  @IsOptional()
  @IsArray()
  medical_conditions: string[];

  @IsOptional()
  @IsString()
  other_condition_details: string;
}
