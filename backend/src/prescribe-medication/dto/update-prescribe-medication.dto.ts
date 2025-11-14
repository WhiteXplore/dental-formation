import { PartialType } from '@nestjs/mapped-types';
import { CreatePrescribeMedicationDto } from './create-prescribe-medication.dto';

export class UpdatePrescribeMedicationDto extends PartialType(
  CreatePrescribeMedicationDto,
) {}
