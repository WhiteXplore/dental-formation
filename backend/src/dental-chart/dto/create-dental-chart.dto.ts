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
import { Type, Transform } from 'class-transformer';

export class AdditionalItemDto {
  @IsInt()
  @Type(() => Number)
  inventory_id: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pcs?: number;
}

export class ToothDto {
  @IsInt()
  @Type(() => Number)
  tooth_number: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  price_procedure_id?: number;

  @IsOptional()
  @IsString()
  tooth_condition?: string;
}

export class CreateDentalChartDto {
  @IsInt()
  @Type(() => Number)
  patient_id: number;

  @IsInt()
  @Type(() => Number)
  user_id: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  price_procedure_id?: number;

  @IsOptional()
  @IsString()
  procedure_notes?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  procedure_date?: Date;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  payment_amount?: number;

  /** Selected teeth */
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @Type(() => Number)
  selected_teeth?: number[];

  /** Procedure per tooth */
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsObject()
  tooth_status_map?: Record<string, number>;

  /** Tooth condition per tooth */
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsObject()
  tooth_condition_map?: Record<string, string>;

  /** Additional inventory items */
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalItemDto)
  additional_items?: AdditionalItemDto[];

  /** Optional teeth object array */
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ToothDto)
  teeth?: ToothDto[];
}
