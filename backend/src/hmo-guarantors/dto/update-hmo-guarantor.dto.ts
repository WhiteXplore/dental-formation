import { PartialType } from '@nestjs/swagger';
import { CreateHmoGuarantorDto } from './create-hmo-guarantor.dto';

export class UpdateHmoGuarantorDto extends PartialType(CreateHmoGuarantorDto) {}
