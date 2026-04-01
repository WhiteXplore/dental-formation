import { IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  // ✅ ONLY required when type = "Other"
  @ValidateIf((o) => o.type === 'Other')
  @IsString()
  @IsNotEmpty()
  other_type?: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;
}
