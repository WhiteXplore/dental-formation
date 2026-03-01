import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DentalChart } from './entities/dental-chart.entity';
import { ToothChart } from './entities/tooth.entity';
import { Repository } from 'typeorm';
import {
  CreateDentalChartDto,
  AdditionalItemDto,
} from './dto/create-dental-chart.dto';
import { UpdateDentalChartDto } from './dto/update-dental-chart.dto';
import { Patient } from 'src/patient/entities/patient.entity';
import { User_Accounts } from 'src/user/entities/user.entity';
import { AdditionalItems } from './entities/additional_items.entity';

@Injectable()
export class DentalChartService {
  constructor(
    @InjectRepository(DentalChart)
    private readonly dentalChartRepo: Repository<DentalChart>,

    @InjectRepository(ToothChart)
    private readonly toothChartRepo: Repository<ToothChart>,

    @InjectRepository(AdditionalItems)
    private readonly additionalItemsRepo: Repository<AdditionalItems>,
  ) {}

  /** CREATE */
  async create(dto: CreateDentalChartDto & { xray_image?: string }) {
    const {
      patient_id,
      user_id,
      price_procedure_id,
      selected_teeth,
      tooth_status_map,
      procedure_notes,
      procedure_date,
      payment_amount,
      additional_items,
      xray_image,
    } = dto;

    const dentalChart = this.dentalChartRepo.create({
      procedure_notes: procedure_notes ?? '',
      procedure_date: procedure_date ? new Date(procedure_date) : new Date(),
      payment_amount: Number(payment_amount) || 0,
      xray_image: xray_image ?? undefined,
      patient: { patient_id: Number(patient_id) } as Patient,
      user_accounts: { user_id: Number(user_id) } as User_Accounts,
      priceProcedure: price_procedure_id
        ? ({ price_procedure_id: Number(price_procedure_id) } as any)
        : undefined,
    });

    const savedChart = await this.dentalChartRepo.save(dentalChart);

    // TEETH
    if (selected_teeth && selected_teeth.length > 0) {
      const toothEntities = selected_teeth.map((toothNum) =>
        this.toothChartRepo.create({
          tooth_number: toothNum,
          status: tooth_status_map[toothNum] ?? undefined,
          priceProcedure: tooth_status_map[toothNum]
            ? ({
                price_procedure_id: Number(tooth_status_map[toothNum]),
              } as any)
            : undefined,
          dentalChart: savedChart,
        }),
      );
      await this.toothChartRepo.save(toothEntities);
    }

    // ADDITIONAL ITEMS
    if (additional_items && additional_items.length > 0) {
      const addItemsEntities = additional_items.map((item: AdditionalItemDto) =>
        this.additionalItemsRepo.create({
          inventory_id: item.inventory_id,
          pcs: item.pcs,
          dentalChart: savedChart,
        }),
      );
      await this.additionalItemsRepo.save(addItemsEntities);
    }

    return this.findOne(savedChart.dental_id);
  }

  /** FIND ONE */
  findOne(dental_id: number) {
    return this.dentalChartRepo.findOne({
      where: { dental_id },
      relations: [
        'patient',
        'user_accounts',
        'teeth',
        'teeth.priceProcedure',
        'addItems',
        'addItems.additionalInventory',
      ],
    });
  }

  /** UPDATE */
  async update(
    id: number,
    dto: UpdateDentalChartDto & { xray_image?: string },
  ) {
    const {
      patient_id,
      user_id,
      price_procedure_id,
      selected_teeth,
      tooth_status_map,
      procedure_notes,
      procedure_date,
      payment_amount,
      additional_items,
      xray_image,
    } = dto;

    const existingChart = await this.dentalChartRepo.findOne({
      where: { dental_id: id },
      relations: ['teeth', 'addItems'],
    });

    if (!existingChart) throw new Error('Dental chart not found');

    // MAIN FIELDS
    existingChart.procedure_notes =
      procedure_notes ?? existingChart.procedure_notes;
    existingChart.procedure_date =
      procedure_date ?? existingChart.procedure_date;
    existingChart.payment_amount =
      payment_amount !== undefined
        ? Number(payment_amount)
        : existingChart.payment_amount;
    existingChart.xray_image = xray_image ?? existingChart.xray_image;

    if (patient_id)
      existingChart.patient = { patient_id: Number(patient_id) } as Patient;
    if (user_id)
      existingChart.user_accounts = {
        user_id: Number(user_id),
      } as User_Accounts;
    if (price_procedure_id)
      existingChart.priceProcedure = {
        price_procedure_id: Number(price_procedure_id),
      } as any;

    await this.dentalChartRepo.save(existingChart);

    // TEETH
    if (Array.isArray(selected_teeth)) {
      await this.toothChartRepo.delete({ dentalChart: { dental_id: id } });

      const newToothEntities = selected_teeth.map((toothNum) =>
        this.toothChartRepo.create({
          tooth_number: toothNum,
          status: tooth_status_map?.[toothNum] ?? undefined,
          priceProcedure: tooth_status_map?.[toothNum]
            ? ({
                price_procedure_id: Number(tooth_status_map[toothNum]),
              } as any)
            : undefined,
          dentalChart: existingChart,
        }),
      );
      await this.toothChartRepo.save(newToothEntities);
    }

    // ADDITIONAL ITEMS
    if (Array.isArray(additional_items)) {
      await this.additionalItemsRepo.delete({ dentalChart: { dental_id: id } });

      const addItemsEntities = additional_items.map((item) =>
        this.additionalItemsRepo.create({
          inventory_id: item.inventory_id,
          pcs: item.pcs,
          dentalChart: existingChart,
        }),
      );
      await this.additionalItemsRepo.save(addItemsEntities);
    }

    return this.findOne(id);
  }

  async findAll() {
    const charts = await this.dentalChartRepo.find({
      relations: [
        'patient',
        'user_accounts',
        'teeth',
        'teeth.priceProcedure',
        'teeth.priceProcedure.procedureInventories',
        'teeth.priceProcedure.procedureInventories.inventory',
        'addItems',
        'addItems.additionalInventory',
      ],
      order: { created_at: 'DESC' },
    });

    return charts;
  }

  async remove(id: number) {
    await this.dentalChartRepo.delete(id);
    return { message: 'Deleted successfully' };
  }

  async getHistoryByPatientId(patientId: number) {
    return this.dentalChartRepo.find({
      where: { patient: { patient_id: patientId } },
      relations: ['patient', 'user_accounts', 'teeth', 'teeth.priceProcedure'],
      order: { created_at: 'DESC' },
    });
  }

  async markInventoryDeducted(dentalId: number) {
    const chart = await this.dentalChartRepo.findOne({
      where: { dental_id: dentalId },
    });
    if (!chart) throw new Error('Dental chart not found');

    chart.inventoryDeducted = true;
    await this.dentalChartRepo.save(chart);

    return {
      message: `Inventory for dental chart ${dentalId} marked as deducted.`,
    };
  }
}
