import {
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  IsNumber,
  IsArray,
  IsObject,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdditionalItemDto {
  @IsInt()
  inventory_id: number;
  
  @IsOptional()
  @IsNumber()
  pcs: number;
}

export class CreateDentalChartDto {
  @IsInt()
  patient_id: number;

  @IsInt()
  user_id: number;

  @IsInt()
  price_procedure_id: number;

  @IsOptional()
  @IsString()
  procedure_notes?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  procedure_date?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  payment_amount?: number;

  @IsArray()
  @IsInt({ each: true })
  selected_teeth: number[];

  @IsObject()
  tooth_status_map: { [key: number]: string };

  // NEW: optional additional items
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalItemDto)
  additional_items?: AdditionalItemDto[];
}
