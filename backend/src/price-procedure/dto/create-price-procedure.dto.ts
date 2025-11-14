import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreatePriceProcedureDto {
  @IsString()
  procedure_name: string;

  @IsNumber({}, { message: 'price must be a number' })
  price: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  status_color?: string; // e.g., "#00FF00" or "green"
}
