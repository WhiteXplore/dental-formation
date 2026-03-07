import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePrescribeMedicationDto {
  @IsNumber()
  dental_chart: number;

  @IsNumber()
  prescription: number;

  @IsString()
  name: string; // Medication name

  @IsOptional()
  @IsString()
  type?: string; // Medication type

  @IsOptional()
  @IsString()
  dosage?: string; // Medication dosage

  @IsOptional()
  @IsString()
  med_instruction?: string;

  @IsNumber()
  pcs: number; // Quantity

  @IsDateString()
  issued_date: string; // ✅ must be string
}
