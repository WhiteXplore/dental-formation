import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePrescribeMedicationDto {
  @IsNumber()
  dental_chart: number;

  @IsNumber()
  inventory: number;

  @IsNumber()
  prescription: number;

  @IsString()
  @IsOptional()
  prescribe_medication?: string;

  @IsNumber()
  pcs: number;

  @IsString()
  @IsOptional()
  payment_status?: string;

  @IsDateString()
  issued_date: Date;
}
