import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PrescribeMedication } from './entities/prescribe-medication.entity';
import { CreatePrescribeMedicationDto } from './dto/create-prescribe-medication.dto';
import { UpdatePrescribeMedicationDto } from './dto/update-prescribe-medication.dto';

import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';

@Injectable()
export class PrescribeMedicationService {
  constructor(
    @InjectRepository(PrescribeMedication)
    private readonly prescribeMedicationRepo: Repository<PrescribeMedication>,
  ) {}

  // CREATE
  async create(dto: CreatePrescribeMedicationDto) {
    const medication = this.prescribeMedicationRepo.create({
      name: dto.name,
      type: dto.type,
      dosage: dto.dosage,
      med_instruction: dto.med_instruction,
      pcs: dto.pcs,
      issued_date: new Date(dto.issued_date),

      dental_chart: { dental_id: dto.dental_chart } as DentalChart,
      prescription: { prescription_id: dto.prescription } as Prescription,
    });

    return await this.prescribeMedicationRepo.save(medication);
  }

  // UPDATE
  async update(id: number, dto: UpdatePrescribeMedicationDto) {
    const medication = await this.prescribeMedicationRepo.findOne({
      where: { prescribe_medication_id: id },
    });

    if (!medication) {
      throw new NotFoundException('Prescribed medication not found');
    }

    if (dto.name !== undefined) medication.name = dto.name;
    if (dto.type !== undefined) medication.type = dto.type;
    if (dto.dosage !== undefined) medication.dosage = dto.dosage;
    if (dto.med_instruction !== undefined)
      medication.med_instruction = dto.med_instruction;
    if (dto.pcs !== undefined) medication.pcs = dto.pcs;

    if (dto.issued_date) {
      medication.issued_date = new Date(dto.issued_date);
    }

    if (dto.dental_chart) {
      medication.dental_chart = { dental_id: dto.dental_chart } as DentalChart;
    }

    if (dto.prescription) {
      medication.prescription = {
        prescription_id: dto.prescription,
      } as Prescription;
    }

    return await this.prescribeMedicationRepo.save(medication);
  }

  // FIND BY DENTAL CHART
  async findByDentalChartId(dentalId: number) {
    return await this.prescribeMedicationRepo.find({
      where: {
        dental_chart: { dental_id: dentalId },
      },
      relations: ['dental_chart', 'prescription'],
    });
  }

  // FIND BY PRESCRIPTION
  async findByPrescriptionId(prescriptionId: number) {
    return await this.prescribeMedicationRepo.find({
      where: {
        prescription: { prescription_id: prescriptionId },
      },
      relations: ['dental_chart', 'prescription'],
    });
  }

  // FIND ALL
  async findAll() {
    return await this.prescribeMedicationRepo.find({
      relations: ['dental_chart', 'prescription'],
    });
  }

  // FIND ONE
  async findOne(id: number) {
    const medication = await this.prescribeMedicationRepo.findOne({
      where: { prescribe_medication_id: id },
      relations: ['dental_chart', 'prescription'],
    });

    if (!medication) {
      throw new NotFoundException('Prescribed medication not found');
    }

    return medication;
  }

  // DELETE
  async remove(id: number) {
    const medication = await this.findOne(id);
    return await this.prescribeMedicationRepo.remove(medication);
  }
}
