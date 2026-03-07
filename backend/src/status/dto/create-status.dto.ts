import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStatusDto {
  @IsString()
  @IsNotEmpty()
  status_name: string;
}
