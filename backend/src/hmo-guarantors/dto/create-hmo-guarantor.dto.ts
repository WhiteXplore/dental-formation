import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHmoGuarantorDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  company: string;
}
