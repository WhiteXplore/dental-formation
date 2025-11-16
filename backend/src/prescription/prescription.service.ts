import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { PrescribeMedication } from 'src/prescribe-medication/entities/prescribe-medication.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,

    @InjectRepository(PrescribeMedication)
    private readonly prescribedMedRepo: Repository<PrescribeMedication>,

    @InjectRepository(DentalChart)
    private readonly dentalChartRepo: Repository<DentalChart>,
  ) {}

  async create(createDto: CreatePrescriptionDto) {
    const {
      dental_chart_id,
      medications,
      payment_status,
      issued_date,
      instruction,
    } = createDto;

    const dentalChart = await this.dentalChartRepo.findOne({
      where: { dental_id: dental_chart_id },
    });

    if (!dentalChart) {
      throw new NotFoundException(
        `Dental chart with ID ${dental_chart_id} not found.`,
      );
    }

    const prescription = this.prescriptionRepo.create({
      dentalChart,
      payment_status,
      issued_date,
      instruction,
    });

    await this.prescriptionRepo.save(prescription);

    for (const med of medications) {
      const { name, type, dosage, pcs } = med;

      if (!name) {
        throw new BadRequestException('Medication name is required.');
      }

      const pcsNumber = Number(pcs);
      if (isNaN(pcsNumber) || pcsNumber <= 0) {
        throw new BadRequestException(`Invalid number of pcs: ${pcs}`);
      }

      const prescribedMed = this.prescribedMedRepo.create({
        prescription,
        dental_chart: dentalChart,
        name,
        type,
        dosage,
        pcs: pcsNumber,
        issued_date,
      });

      await this.prescribedMedRepo.save(prescribedMed);
    }

    return this.findOne(prescription.prescription_id);
  }

  async findAll() {
    return this.prescriptionRepo.find({
      relations: [
        'dentalChart',
        'dentalChart.patient',
        'dentalChart.teeth',
        'dentalChart.teeth.priceProcedure',
        'prescribedMedications',
        'payments',
      ],
      order: { issued_date: 'DESC' },
    });
  }

  async findOne(prescription_id: number) {
    const prescription = await this.prescriptionRepo.findOne({
      where: { prescription_id },
      relations: [
        'dentalChart',
        'dentalChart.patient',
        'prescribedMedications',
        'payments',
      ],
    });

    if (!prescription) {
      throw new NotFoundException(
        `Prescription with ID ${prescription_id} not found.`,
      );
    }

    return prescription;
  }

  async findByChartId(dental_chart_id: number) {
    return this.prescriptionRepo.findOne({
      where: { dentalChart: { dental_id: dental_chart_id } },
      relations: ['dentalChart'],
    });
  }

  async update(prescription_id: number, updateDto: UpdatePrescriptionDto) {
    try {
      const prescription = await this.prescriptionRepo.findOne({
        where: { prescription_id },
        relations: ['dentalChart'],
      });

      if (!prescription) {
        throw new NotFoundException(
          `Prescription with ID ${prescription_id} not found.`,
        );
      }

      if (
        updateDto.dental_chart_id &&
        updateDto.dental_chart_id !== prescription.dentalChart?.dental_id
      ) {
        const dentalChart = await this.dentalChartRepo.findOne({
          where: { dental_id: updateDto.dental_chart_id },
        });

        if (!dentalChart) {
          throw new NotFoundException(
            `Dental chart with ID ${updateDto.dental_chart_id} not found.`,
          );
        }

        prescription.dentalChart = dentalChart;
      }

      prescription.payment_status =
        updateDto.payment_status ?? prescription.payment_status;
      prescription.issued_date =
        updateDto.issued_date ?? prescription.issued_date;
      prescription.instruction =
        updateDto.instruction ?? prescription.instruction;
      prescription.patient_payment =
        updateDto.patient_payment ?? prescription.patient_payment;

      await this.prescriptionRepo.save(prescription);

      if (Array.isArray(updateDto.medications)) {
        // Delete old medications
        await this.prescribedMedRepo.delete({
          prescription: { prescription_id },
        });

        // Insert new medications
        for (const med of updateDto.medications) {
          const { name, type, dosage, pcs } = med;

          if (!name) {
            throw new BadRequestException('Medication name is required.');
          }

          const pcsNumber = Number(pcs);
          if (isNaN(pcsNumber) || pcsNumber <= 0) {
            throw new BadRequestException(
              `Invalid pcs value for medication "${name}".`,
            );
          }

          const newMedication = this.prescribedMedRepo.create({
            prescription,
            dental_chart: prescription.dentalChart,
            name,
            type,
            dosage,
            pcs: pcsNumber,
            issued_date: prescription.issued_date,
          });

          await this.prescribedMedRepo.save(newMedication);
        }
      }

      return this.findOne(prescription_id);
    } catch (error) {
      console.error('Update failed:', error);
      throw new InternalServerErrorException('Prescription update failed.');
    }
  }

  async remove(prescription_id: number) {
    const prescription = await this.prescriptionRepo.findOne({
      where: { prescription_id },
      relations: ['prescribedMedications'],
    });

    if (!prescription) {
      throw new NotFoundException(
        `Prescription with ID ${prescription_id} not found.`,
      );
    }

    if (prescription.prescribedMedications?.length > 0) {
      await this.prescribedMedRepo.delete({
        prescription: { prescription_id },
      });
    }

    await this.prescriptionRepo.remove(prescription);

    return {
      message: `Prescription ID ${prescription_id} successfully deleted.`,
    };
  }
}
