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

  // Create a new prescribed medication
  async create(dto: CreatePrescribeMedicationDto) {
    const newPrescribed = this.prescribeMedicationRepo.create({
      ...dto,
      dental_chart: { dental_id: dto.dental_chart },
      prescription: { prescription_id: dto.prescription },
    });

    return await this.prescribeMedicationRepo.save(newPrescribed);
  }

  // Update existing prescribed medication
  async update(id: number, dto: UpdatePrescribeMedicationDto) {
    const preload = await this.prescribeMedicationRepo.preload({
      prescribe_medication_id: id,
      ...dto,
      dental_chart: dto.dental_chart
        ? { dental_id: dto.dental_chart }
        : undefined,
      prescription: dto.prescription
        ? { prescription_id: dto.prescription }
        : undefined,
      // ensure empty strings are saved instead of null
      duration: dto.duration ?? '',
      frequencies: dto.frequencies ?? '',
      preparation: dto.preparation ?? '',
    });

    if (!preload) throw new NotFoundException('Prescribed medication not found');

    return this.prescribeMedicationRepo.save(preload);
  }

  // Find by dental chart ID
  async findByDentalChartId(dentalId: number) {
    return await this.prescribeMedicationRepo.find({
      where: { dental_chart: { dental_id: dentalId } },
      relations: ['dental_chart', 'prescription'],
    });
  }

  // Find by prescription ID
  async findByPrescriptionId(prescriptionId: number) {
    return await this.prescribeMedicationRepo.find({
      where: { prescription: { prescription_id: prescriptionId } },
      relations: ['dental_chart', 'prescription'],
    });
  }

  // Find all
  async findAll() {
    return await this.prescribeMedicationRepo.find({
      relations: ['dental_chart', 'prescription'],
    });
  }

  // Find one by ID
  async findOne(id: number) {
    const found = await this.prescribeMedicationRepo.findOne({
      where: { prescribe_medication_id: id },
      relations: ['dental_chart', 'prescription'],
    });
    if (!found) throw new NotFoundException('Prescribed medication not found');
    return found;
  }

  // Remove by ID
  async remove(id: number) {
    const found = await this.findOne(id);
    return this.prescribeMedicationRepo.remove(found);
  }
}
