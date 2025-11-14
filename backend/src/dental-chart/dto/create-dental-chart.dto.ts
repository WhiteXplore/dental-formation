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

export class CreateDentalChartDto {
  /** ID of the patient linked to this dental chart */
  @IsInt()
  patient_id: number;

  /** ID of the dentist performing the procedure */
  @IsInt()
  user_id: number;

  /** ID of the selected price/procedure */
  @IsInt()
  price_procedure_id: number;

  /** Optional notes about the procedure */
  @IsOptional()
  @IsString()
  procedure_notes?: string;

  /** Date the procedure was performed (defaults to today if not provided) */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  procedure_date?: Date;

  /** Payment amount charged for the procedure */
  @IsOptional()
  @IsNumber()
  @Min(0)
  payment_amount?: number;

  /** Array of selected tooth numbers involved in the procedure */
  @IsArray()
  @IsInt({ each: true })
  selected_teeth: number[];

  /** Status map per tooth number (e.g. { 11: "filled", 12: "extracted" }) */
  @IsObject()
  tooth_status_map: { [key: number]: string };
}
