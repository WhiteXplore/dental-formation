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
import { Inventory } from 'src/inventory/entities/inventory.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,

    @InjectRepository(PrescribeMedication)
    private readonly prescribedMedRepo: Repository<PrescribeMedication>,

    @InjectRepository(DentalChart)
    private readonly dentalChartRepo: Repository<DentalChart>,

    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
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
      const { inventory_id, pcs } = med;

      const inventory = await this.inventoryRepo.findOne({
        where: { inventory_id },
      });

      if (!inventory) {
        throw new NotFoundException(
          `Inventory with ID ${inventory_id} not found.`,
        );
      }

      const pcsNumber = Number(pcs);
      if (isNaN(pcsNumber) || pcsNumber <= 0) {
        throw new BadRequestException(`Invalid number of pcs: ${pcs}`);
      }

      if (inventory.quantity < pcsNumber) {
        throw new BadRequestException(
          `Insufficient stock for "${inventory.name}". Only ${inventory.quantity} left.`,
        );
      }

      inventory.quantity -= pcsNumber;
      await this.inventoryRepo.save(inventory);

      const prescribedMed = this.prescribedMedRepo.create({
        prescription,
        inventory,
        pcs: pcsNumber,
        issued_date,
        dental_chart: dentalChart,
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
        'dentalChart.teeth.priceProcedure', // ✅ this is what you're missing
        'prescribedMedications',
        'prescribedMedications.inventory',
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
        'prescribedMedications.inventory',
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
        await this.prescribedMedRepo.delete({
          prescription: { prescription_id },
        });

        for (const med of updateDto.medications) {
          const inventory = await this.inventoryRepo.findOneBy({
            inventory_id: med.inventory_id,
          });

          if (!inventory) {
            throw new NotFoundException(
              `Inventory item with ID ${med.inventory_id} not found.`,
            );
          }

          const pcs = Number(med.pcs);
          if (isNaN(pcs) || pcs <= 0) {
            throw new BadRequestException(
              `Invalid pcs value for inventory ID ${med.inventory_id}.`,
            );
          }

          const newMedication = this.prescribedMedRepo.create({
            prescription,
            inventory,
            pcs,
            issued_date: prescription.issued_date,
            dental_chart: prescription.dentalChart,
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

    // Delete related prescribed medications first
    if (prescription.prescribedMedications?.length > 0) {
      await this.prescribedMedRepo.delete({
        prescription: { prescription_id },
      });
    }

    // Then delete the prescription itself
    await this.prescriptionRepo.remove(prescription);

    return {
      message: `Prescription ID ${prescription_id} successfully deleted.`,
    };
  }
}
