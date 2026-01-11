import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @IsOptional()
  @IsBoolean()
  is_discharged?: boolean;

  @IsString()
  @IsNotEmpty()
  payment_status: string;

  @IsNumber()
  prescription_id: number;
}
