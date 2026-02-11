import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
export class CreateInventoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @Type(() => Number) // 🔹 converts incoming string to number
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(0, { message: 'Quantity must not be less than 0' })
  quantity: number;
  @IsString()
  @IsNotEmpty()
  unit: string;

  /* 🔔 notification fields (auto-managed, optional) */

  @IsOptional()
  @IsString()
  notif_status?: string;

  @IsOptional()
  notif_viewed_at?: Date;

  @IsOptional()
  @IsString()
  cleared_status?: string;
  @IsOptional()
  @IsString()
  image?: string;
}
