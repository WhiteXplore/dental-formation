import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHmoGuarantorDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  middle_name?: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsString()
  company: string;
}
