import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class InventoryItem {
  @IsNumber({}, { message: 'inventory_id must be a number' })
  inventory_id: number;

  @IsOptional()
  @IsNumber({}, { message: 'quantity must be a number' })
  quantity?: number;
}

export class CreatePriceProcedureDto {
  @IsString()
  procedure_name: string;

  @IsString()
  procedure_type: string;

  @IsNumber({}, { message: 'price must be a number' })
  price: number;

  @IsString()
  procedure_scope: string;

  @IsString()
  pricing_scope: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  status_color?: string; // e.g., "bg-blue-400" or "#00FF00"

  @IsOptional()
  @IsNumber({}, { message: 'inventory_id must be a number' })
  inventory_id?: number; // single inventory_id

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryItem)
  inventory_ids?: InventoryItem[]; // multiple inventories with optional quantity
}
