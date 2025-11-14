import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class MedicationDto {
  @IsNotEmpty()
  @Type(() => Number) // ✅ Ensures inventory_id is transformed to number
  @IsNumber()
  inventory_id: number;

  @IsOptional()
  @IsString()
  prescribe_medication?: string;

  @IsNotEmpty()
  @Type(() => Number) // ✅ Ensures pcs is transformed to number
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

  @IsNotEmpty()
  @IsDateString()
  issued_date: Date;

  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];

  // ✅ ADDED:
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  prescribedMedications?: MedicationDto[];
}
