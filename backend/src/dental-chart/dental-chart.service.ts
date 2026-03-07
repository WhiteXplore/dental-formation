import { Injectable, NotFoundException } from '@nestjs/common';
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
      tooth_condition_map,
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
      xray_image: xray_image ?? null,

      patient: { patient_id } as Patient,
      user_accounts: { user_id } as User_Accounts,

      priceProcedure: price_procedure_id
        ? ({ price_procedure_id } as any)
        : undefined,
    });

    const savedChart = await this.dentalChartRepo.save(dentalChart);

    /** TEETH */
    if (selected_teeth?.length) {
      const teeth = selected_teeth.map((tooth) =>
        this.toothChartRepo.create({
          tooth_number: tooth,
          tooth_condition: tooth_condition_map?.[tooth],
          priceProcedure: tooth_status_map?.[tooth]
            ? ({ price_procedure_id: tooth_status_map[tooth] } as any)
            : undefined,
          dentalChart: savedChart,
        }),
      );

      await this.toothChartRepo.save(teeth);
    }

    /** ADDITIONAL ITEMS */
    if (additional_items?.length) {
      const addItems = additional_items.map((item: AdditionalItemDto) =>
        this.additionalItemsRepo.create({
          inventory_id: item.inventory_id,
          pcs: item.pcs,
          dentalChart: savedChart,
        }),
      );

      await this.additionalItemsRepo.save(addItems);
    }

    return this.findOne(savedChart.dental_id);
  }

  /** FIND ONE */
  async findOne(dental_id: number) {
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
      tooth_condition_map,
      procedure_notes,
      procedure_date,
      payment_amount,
      additional_items,
      xray_image,
    } = dto;

    const chart = await this.dentalChartRepo.findOne({
      where: { dental_id: id },
      relations: ['teeth', 'addItems'],
    });

    if (!chart) throw new NotFoundException('Dental chart not found');

    /** MAIN DATA */
    chart.procedure_notes = procedure_notes ?? chart.procedure_notes;
    chart.procedure_date = procedure_date ?? chart.procedure_date;
    chart.payment_amount =
      payment_amount !== undefined
        ? Number(payment_amount)
        : chart.payment_amount;

    chart.xray_image = xray_image ?? chart.xray_image;

    if (patient_id) chart.patient = { patient_id } as Patient;

    if (user_id) chart.user_accounts = { user_id } as User_Accounts;

    if (price_procedure_id)
      chart.priceProcedure = { price_procedure_id } as any;

    await this.dentalChartRepo.save(chart);

    /** TEETH UPDATE */
    if (Array.isArray(selected_teeth)) {
      await this.toothChartRepo.delete({ dental_id: id });

      const teeth = selected_teeth.map((tooth) =>
        this.toothChartRepo.create({
          tooth_number: tooth,
          tooth_condition: tooth_condition_map?.[tooth],
          priceProcedure: tooth_status_map?.[tooth]
            ? ({ price_procedure_id: tooth_status_map[tooth] } as any)
            : undefined,
          dentalChart: chart,
        }),
      );

      await this.toothChartRepo.save(teeth);
    }

    /** ADDITIONAL ITEMS UPDATE */
    if (Array.isArray(additional_items)) {
      await this.additionalItemsRepo.delete({ dentalChart: { dental_id: id } });

      const addItems = additional_items.map((item) =>
        this.additionalItemsRepo.create({
          inventory_id: item.inventory_id,
          pcs: item.pcs,
          dentalChart: chart,
        }),
      );

      await this.additionalItemsRepo.save(addItems);
    }

    return this.findOne(id);
  }

  /** FIND ALL */
  async findAll() {
    return this.dentalChartRepo.find({
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
  }

  /** DELETE */
  async remove(id: number) {
    await this.dentalChartRepo.delete(id);
    return { message: 'Deleted successfully' };
  }

  /** PATIENT HISTORY */
  async getHistoryByPatientId(patientId: number) {
    return this.dentalChartRepo.find({
      where: { patient: { patient_id: patientId } },
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
  }

  /** MARK INVENTORY */
  async markInventoryDeducted(dentalId: number) {
    const chart = await this.dentalChartRepo.findOne({
      where: { dental_id: dentalId },
    });

    if (!chart) throw new NotFoundException('Dental chart not found');

    chart.inventoryDeducted = true;

    await this.dentalChartRepo.save(chart);

    return {
      message: `Inventory for dental chart ${dentalId} marked as deducted.`,
    };
  }
}
