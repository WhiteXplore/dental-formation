import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;
}
