import { IsOptional, IsString, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePrescribeMedicationDto } from './update-prescribe-medication.dto';

export class UpdatePrescriptionDto {
  @IsOptional()
  @IsString()
  payment_status?: string;

  @IsOptional()
  @IsDateString()
  issued_date?: string;

  @IsOptional()
  @IsString()
  instruction?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePrescribeMedicationDto)
  medications?: UpdatePrescribeMedicationDto[];
}
