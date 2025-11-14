import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescribeMedication } from './entities/prescribe-medication.entity';
import { CreatePrescribeMedicationDto } from './dto/create-prescribe-medication.dto';
import { UpdatePrescribeMedicationDto } from './dto/update-prescribe-medication.dto';

@Injectable()
export class PrescribeMedicationService {
  constructor(
    @InjectRepository(PrescribeMedication)
    private prescribeMedicationRepo: Repository<PrescribeMedication>,
  ) {}

  async create(dto: CreatePrescribeMedicationDto) {
    const newPrescribed = this.prescribeMedicationRepo.create({
      ...dto,
      dental_chart: { dental_id: dto.dental_chart },
      inventory: { inventory_id: dto.inventory },
      prescription: { prescription_id: dto.prescription },
    });

    return await this.prescribeMedicationRepo.save(newPrescribed);
  }

  async update(id: number, dto: UpdatePrescribeMedicationDto) {
    const preload = await this.prescribeMedicationRepo.preload({
      prescribe_medication_id: id,
      ...dto,
      dental_chart: dto.dental_chart
        ? { dental_id: dto.dental_chart }
        : undefined,
      inventory: dto.inventory ? { inventory_id: dto.inventory } : undefined,
      prescription: dto.prescription
        ? { prescription_id: dto.prescription }
        : undefined,
    });

    if (!preload) throw new NotFoundException('Prescription not found');

    return this.prescribeMedicationRepo.save(preload);
  }

  async findAll() {
    return await this.prescribeMedicationRepo.find({
      relations: ['dental_chart', 'inventory', 'prescription'],
    });
  }

  async findOne(id: number) {
    const found = await this.prescribeMedicationRepo.findOne({
      where: { prescribe_medication_id: id },
    });
    if (!found) throw new NotFoundException('Prescription not found');
    return found;
  }

  async remove(id: number) {
    const found = await this.findOne(id);
    return this.prescribeMedicationRepo.remove(found);
  }
}
