import { PartialType } from '@nestjs/mapped-types';
import { CreatePriceProcedureDto } from './create-price-procedure.dto';

export class UpdatePriceProcedureDto extends PartialType(
  CreatePriceProcedureDto,
) {}
