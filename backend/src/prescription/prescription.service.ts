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
import { HmoGuarantor } from 'src/hmo-guarantors/entities/hmo-guarantor.entity';
@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,

    @InjectRepository(PrescribeMedication)
    private readonly prescribedMedRepo: Repository<PrescribeMedication>,

    @InjectRepository(DentalChart)
    private readonly dentalChartRepo: Repository<DentalChart>,

    @InjectRepository(HmoGuarantor) // ✅ add HMO repo
    private readonly hmoRepo: Repository<HmoGuarantor>,
  ) {}

  async create(createDto: CreatePrescriptionDto) {
    const { dental_chart_id, medications, payment_status, issued_date } =
      createDto;

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
    });

    await this.prescriptionRepo.save(prescription);

    for (const med of medications) {
      const { name, type, dosage, pcs, med_instruction } = med;
      if (!name) {
        throw new BadRequestException('Medication name is required.');
      }

      const pcsNumber = Number(pcs);
      if (isNaN(pcsNumber) || pcsNumber <= 0) {
        throw new BadRequestException(`Invalid number of pcs: ${pcs}`);
      }

      const prescribedMed = this.prescribedMedRepo.create({
        prescription: { prescription_id: prescription.prescription_id },
        dental_chart: { dental_id: dentalChart.dental_id },
        name,
        type,
        dosage,
        med_instruction, // ✅ add this
        pcs: pcsNumber,
        issued_date: issued_date ?? new Date(),
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
        'dentalChart.user_accounts', // ✅ ADD THIS
        'dentalChart.teeth',
        'dentalChart.teeth.priceProcedure',
        'dentalChart.teeth.priceProcedure.procedureInventories',
        'dentalChart.teeth.priceProcedure.procedureInventories.inventory',
        'prescribedMedications',
        'payments',
        'hmoGuarantor',
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
        'dentalChart.user_accounts', // ✅ add
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

  async findAllByPatientId(patient_id: number) {
    const prescriptions = await this.prescriptionRepo.find({
      where: {
        dentalChart: {
          patient: {
            patient_id: patient_id,
          },
        },
      },
      relations: [
        'dentalChart',
        'dentalChart.patient',
        'dentalChart.teeth',
        'dentalChart.teeth.priceProcedure', // 🔥 IMPORTANT
        'prescribedMedications',
        'payments',
        'hmoGuarantor',
      ],
      order: { issued_date: 'DESC' },
    });

    if (!prescriptions.length) {
      throw new NotFoundException(
        `No prescriptions found for patient ID ${patient_id}.`,
      );
    }

    return prescriptions;
  }

  async findByChartId(dental_chart_id: number) {
    const prescription = await this.prescriptionRepo.findOne({
      where: { dentalChart: { dental_id: dental_chart_id } },
      relations: [
        'dentalChart',
        'dentalChart.patient',
        'dentalChart.user_accounts', // ✅ add
        'prescribedMedications',
        'payments',
        'hmoGuarantor',
      ],
      order: { issued_date: 'DESC' },
    });

    if (!prescription) {
      return null; // important: do NOT throw here
    }

    return prescription;
  }
  async update(prescription_id: number, updateDto: UpdatePrescriptionDto) {
    try {
      const prescription = await this.prescriptionRepo.findOne({
        where: { prescription_id },
        relations: ['dentalChart', 'hmoGuarantor'], // include HMO relation
      });

      if (!prescription) {
        throw new NotFoundException(
          `Prescription with ID ${prescription_id} not found.`,
        );
      }

      // Update dental chart if provided
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
      // Update HMO/Guarantor
      if (updateDto.hmo_guarantor_id !== undefined) {
        if (updateDto.hmo_guarantor_id === null) {
          prescription.hmoGuarantor = null; // remove link
        } else {
          // fetch full HMO entity from its repository
          const hmo = await this.hmoRepo.findOne({
            where: { hmo_guarantor_id: updateDto.hmo_guarantor_id },
          });

          if (!hmo) {
            throw new NotFoundException(
              `HMO Guarantor with ID ${updateDto.hmo_guarantor_id} not found.`,
            );
          }

          prescription.hmoGuarantor = hmo; // assign full entity
        }
      }

      // Update main prescription fields
      prescription.payment_status =
        updateDto.payment_status ?? prescription.payment_status;

      prescription.payment_type =
        updateDto.payment_type ?? prescription.payment_type;

      if (updateDto.issued_date) {
        prescription.issued_date = new Date(updateDto.issued_date);
      }

      prescription.instruction =
        updateDto.instruction ?? prescription.instruction;

      prescription.patient_payment =
        updateDto.patient_payment ?? prescription.patient_payment;

      prescription.excess_payment =
        updateDto.excess_payment ?? prescription.excess_payment;

      prescription.is_discharged =
        updateDto.is_discharged ?? prescription.is_discharged;
      await this.prescriptionRepo.save(prescription);

      // Handle medications update if any
      if (Array.isArray(updateDto.medications)) {
        await this.prescribedMedRepo.delete({
          prescription: { prescription_id },
        });

        for (const med of updateDto.medications) {
          const { name, type, dosage, pcs, med_instruction } = med;

          if (!name)
            throw new BadRequestException('Medication name is required.');

          const pcsNumber = Number(pcs);
          if (isNaN(pcsNumber) || pcsNumber <= 0) {
            throw new BadRequestException(
              `Invalid pcs value for medication "${name}".`,
            );
          }

          const newMed = this.prescribedMedRepo.create({
            prescription,
            dental_chart: prescription.dentalChart,
            name,
            type,
            dosage,
            med_instruction, // ✅ add this
            pcs: pcsNumber,
            issued_date: prescription.issued_date,
          });

          await this.prescribedMedRepo.save(newMed);
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
