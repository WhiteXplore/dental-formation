import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DentalChart } from './entities/dental-chart.entity';
import { ToothChart } from './entities/tooth.entity';
import { Repository } from 'typeorm';
import { CreateDentalChartDto } from './dto/create-dental-chart.dto';
import { Patient } from 'src/patient/entities/patient.entity';
import { User_Accounts } from 'src/user/entities/user.entity';

@Injectable()
export class DentalChartService {
  constructor(
    @InjectRepository(DentalChart)
    private readonly dentalChartRepo: Repository<DentalChart>,

    @InjectRepository(ToothChart)
    private readonly toothChartRepo: Repository<ToothChart>,
  ) {}

  async create(
    dto: CreateDentalChartDto & {
      xray_image?: Buffer;
      xray_mime_type?: string | null;
    },
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
      xray_image,
      xray_mime_type,
    } = dto;

    const dentalChart = this.dentalChartRepo.create({
      procedure_notes: procedure_notes || '',
      procedure_date: procedure_date ? new Date(procedure_date) : new Date(),
      payment_amount: Number(payment_amount) || 0,
      xray_image: xray_image ?? undefined,
      xray_mime_type: xray_mime_type ?? undefined,
      patient: { patient_id: Number(patient_id) } as Patient,
      user_accounts: { user_id: Number(user_id) } as User_Accounts,
      priceProcedure: price_procedure_id
        ? ({ price_procedure_id: Number(price_procedure_id) } as any)
        : undefined,
    });

    const savedChart = await this.dentalChartRepo.save(dentalChart);

    const toothEntities = selected_teeth.map((toothNum) =>
      this.toothChartRepo.create({
        tooth_number: toothNum,
        status: tooth_status_map[toothNum] ?? null,
        priceProcedure: tooth_status_map[toothNum]
          ? { price_procedure_id: Number(tooth_status_map[toothNum]) }
          : undefined,
        dentalChart: savedChart,
      }),
    );

    await this.toothChartRepo.save(toothEntities);

    return {
      ...savedChart,
      toothEntities,
    };
  }

  async findAll() {
    const charts = await this.dentalChartRepo.find({
      relations: ['patient', 'user_accounts', 'teeth', 'teeth.priceProcedure'],
      order: { created_at: 'DESC' },
    });

    return charts.map(({ xray_image, ...rest }) => rest);
  }

  findOne(dental_id: number) {
    return this.dentalChartRepo.findOne({
      where: { dental_id },
      relations: ['patient', 'user_accounts', 'teeth', 'teeth.priceProcedure'],
    });
  }

  async update(id: number, dto: any) {
    const {
      patient_id,
      user_id,
      price_procedure_id,
      selected_teeth,
      tooth_status_map,
      procedure_notes,
      procedure_date,
      payment_amount,
      xray_image,
      xray_mime_type,
    } = dto;

    const existingChart = await this.dentalChartRepo.findOne({
      where: { dental_id: id },
      relations: ['teeth'],
    });

    if (!existingChart) {
      throw new Error('Dental chart not found');
    }

    existingChart.procedure_notes =
      procedure_notes ?? existingChart.procedure_notes;
    existingChart.procedure_date = procedure_date
      ? new Date(procedure_date)
      : existingChart.procedure_date;
    existingChart.payment_amount =
      payment_amount !== undefined
        ? Number(payment_amount)
        : existingChart.payment_amount;

    if (xray_image) {
      existingChart.xray_image = xray_image;
    }

    if (xray_mime_type) {
      existingChart.xray_mime_type = xray_mime_type;
    }

    if (patient_id) {
      existingChart.patient = { patient_id: Number(patient_id) } as Patient;
    }

    if (user_id) {
      existingChart.user_accounts = {
        user_id: Number(user_id),
      } as User_Accounts;
    }

    if (price_procedure_id) {
      existingChart.priceProcedure = {
        price_procedure_id: Number(price_procedure_id),
      } as any;
    }

    await this.dentalChartRepo.save(existingChart);

    if (Array.isArray(selected_teeth) && selected_teeth.length > 0) {
      await this.toothChartRepo.delete({ dentalChart: { dental_id: id } });

      const newToothEntities = selected_teeth.map((toothNum) =>
        this.toothChartRepo.create({
          tooth_number: toothNum,
          status: tooth_status_map[toothNum] ?? null,
          priceProcedure: tooth_status_map[toothNum]
            ? { price_procedure_id: Number(tooth_status_map[toothNum]) }
            : undefined,
          dentalChart: existingChart,
        }),
      );

      await this.toothChartRepo.save(newToothEntities);
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.dentalChartRepo.delete(id);
    return { message: 'Deleted successfully' };
  }

  async getHistoryByPatientId(patientId: number) {
    return this.dentalChartRepo.find({
      where: {
        patient: { patient_id: patientId },
      },
      relations: ['patient', 'user_accounts', 'teeth', 'teeth.priceProcedure'],
      order: {
        created_at: 'DESC',
      },
    });
  }
}
