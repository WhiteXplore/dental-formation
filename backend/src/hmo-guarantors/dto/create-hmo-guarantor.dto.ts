import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateHmoGuarantorDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  company: string;

  @IsNotEmpty()
  @IsString()
  active_status: string;
}
