import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
  ArrayMinSize,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MedicationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  med_instruction?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pcs: number;
}

export class CreatePrescriptionDto {
  @IsNotEmpty()
  @IsNumber()
  dental_chart_id: number;

  @IsOptional()
  @IsString()
  payment_status?: string;

  @IsOptional()
  @IsString()
  instruction?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  patient_payment?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  excess_payment?: number;

  @IsOptional()
  @IsString()
  payment_type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  hmo_guarantor_id?: number | null;

  @IsNotEmpty()
  @IsDateString()
  issued_date: string; // ✔ fixed

  @IsOptional()
  @IsBoolean()
  is_discharged?: boolean;

  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];
}
