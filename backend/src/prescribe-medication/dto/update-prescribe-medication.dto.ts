import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdatePrescribeMedicationDto {
  @IsOptional()
  @IsNumber()
  dental_chart?: number;

  @IsOptional()
  @IsNumber()
  prescription?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  frequencies?: string;

  @IsOptional()
  @IsString()
  preparation?: string;

  @IsOptional()
  @IsNumber()
  pcs?: number;

  @IsOptional()
  @IsDateString()
  issued_date?: Date;
}
