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
  med_instruction?: string;

  @IsOptional()
  @IsNumber()
  pcs?: number;

  @IsOptional()
  @IsDateString()
  issued_date?: string; // ✅ FIXED (string not Date)
}
