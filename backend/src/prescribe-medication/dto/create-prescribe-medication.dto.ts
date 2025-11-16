import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePrescribeMedicationDto {
  @IsNumber()
  dental_chart: number;

  @IsNumber()
  prescription: number;

  @IsString()
  name: string; // Medication name

  @IsString()
  @IsOptional()
  type?: string; // Medication type (optional)

  @IsString()
  @IsOptional()
  dosage?: string; // Medication dosage (optional)

  @IsNumber()
  pcs: number; // Quantity

  @IsDateString()
  issued_date: Date;
}
