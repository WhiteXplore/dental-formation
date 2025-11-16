import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DentalChartService } from './dental-chart.service';
import { CreateDentalChartDto } from './dto/create-dental-chart.dto';
import { Express, Response } from 'express';

@Controller('dental-chart')
export class DentalChartController {
  constructor(private readonly dentalChartService: DentalChartService) {}

  @Post('add-dental-chart')
  @UseInterceptors(
    FileInterceptor('xray_image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    try {
      const dto: CreateDentalChartDto & {
        xray_image?: Buffer;
        xray_mime_type?: string | null;
      } = {
        patient_id: Number(body.patient_id),
        user_id: Number(body.user_id),
        price_procedure_id: Number(body.price_procedure_id), // ✅ This line is REQUIRED
        procedure_notes: body.procedure_notes || '',
        procedure_date:
          body.procedure_date && !isNaN(Date.parse(body.procedure_date))
            ? new Date(body.procedure_date)
            : new Date(),
        payment_amount: body.payment_amount
          ? parseFloat(body.payment_amount)
          : 0,
        selected_teeth: JSON.parse(body.selected_teeth),
        tooth_status_map: JSON.parse(body.tooth_status_map),
        xray_image: file?.buffer || null,
        xray_mime_type: file?.mimetype || null,
      };

      return await this.dentalChartService.create(dto);
    } catch (err) {
      console.error('❌ Failed to parse dental chart DTO:', err);
      throw new BadRequestException('Invalid input data.');
    }
  }

  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('xray_image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    try {
      const updateDto: any = {
        patient_id: body.patient_id ? Number(body.patient_id) : undefined,
        user_id: body.user_id ? Number(body.user_id) : undefined,
        procedure_notes: body.procedure_notes,
        procedure_date: body.procedure_date
          ? new Date(body.procedure_date)
          : undefined,
        payment_amount: body.payment_amount
          ? parseFloat(body.payment_amount)
          : undefined,
        selected_teeth: body.selected_teeth
          ? JSON.parse(body.selected_teeth)
          : [],
        tooth_status_map: body.tooth_status_map
          ? JSON.parse(body.tooth_status_map)
          : {},
        xray_image: file?.buffer || undefined,
        xray_mime_type: file?.mimetype || undefined,
      };

      const result = await this.dentalChartService.update(id, updateDto);
      return { message: 'Dental chart updated', result };
    } catch (err) {
      console.error('❌ Failed to parse update DTO:', err);
      throw new BadRequestException('Invalid input data for update.');
    }
  }

  @Get('get-dental-chart')
  findAll() {
    return this.dentalChartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dentalChartService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dentalChartService.remove(+id);
  }

  @Get('history/:patientId')
  getHistoryByPatient(@Param('patientId') patientId: string) {
    return this.dentalChartService.getHistoryByPatientId(+patientId);
  }

  @Get('xray/:id')
  async serveXrayImage(@Param('id') id: number, @Res() res: Response) {
    const chart = await this.dentalChartService.findOne(id);

    if (!chart || !chart.xray_image) {
      return res.status(404).send('Image not found');
    }

    res.setHeader('Content-Type', chart.xray_mime_type || 'image/jpeg');
    res.send(chart.xray_image);
  }

  @Patch('deduct-inventory/:id')
  async deductInventory(@Param('id') id: number) {
    try {
      return await this.dentalChartService.markInventoryDeducted(id);
    } catch (err) {
      console.error('❌ Failed to mark inventory deducted:', err);
      throw new BadRequestException(
        err.message || 'Failed to mark inventory deducted.',
      );
    }
  }
}
