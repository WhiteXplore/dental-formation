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
import { diskStorage } from 'multer';
import { DentalChartService } from './dental-chart.service';
import { CreateDentalChartDto } from './dto/create-dental-chart.dto';
import { UpdateDentalChartDto } from './dto/update-dental-chart.dto';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('dental-chart')
export class DentalChartController {
  constructor(private readonly dentalChartService: DentalChartService) {}

  @Post('add-dental-chart')
  @UseInterceptors(
    FileInterceptor('xray_image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = uniqueSuffix + '-' + file.originalname;
          cb(null, filename);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    try {
      const dto: CreateDentalChartDto & { xray_image_name?: string } = {
        patient_id: Number(body.patient_id),
        user_id: Number(body.user_id),
        price_procedure_id: Number(body.price_procedure_id),
        procedure_notes: body.procedure_notes ?? '',
        procedure_date: body.procedure_date
          ? new Date(body.procedure_date)
          : new Date(),
        payment_amount: body.payment_amount
          ? parseFloat(body.payment_amount)
          : 0,
        selected_teeth: JSON.parse(body.selected_teeth || '[]'),
        tooth_status_map: JSON.parse(body.tooth_status_map || '{}'),
        additional_items: body.additional_items
          ? JSON.parse(body.additional_items)
          : [],
        xray_image_name: file?.filename ?? undefined,
      };

      return await this.dentalChartService.create(dto);
    } catch (err) {
      console.error('❌ Failed to create dental chart:', err);
      throw new BadRequestException('Invalid input data.');
    }
  }

  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('xray_image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = uniqueSuffix + '-' + file.originalname;
          cb(null, filename);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateDentalChartDto,
  ) {
    try {
      // build update DTO safely
      const updateDto: UpdateDentalChartDto & { xray_image_name?: string } = {
        ...body,
        patient_id: body.patient_id ? Number(body.patient_id) : undefined,
        user_id: body.user_id ? Number(body.user_id) : undefined,
        xray_image_name: file?.filename ?? undefined,
        selected_teeth: body.selected_teeth
          ? JSON.parse(body.selected_teeth as unknown as string)
          : undefined,
        tooth_status_map: body.tooth_status_map
          ? JSON.parse(body.tooth_status_map as unknown as string)
          : undefined,
        additional_items: body.additional_items
          ? JSON.parse(body.additional_items as unknown as string)
          : undefined,
        procedure_date: body.procedure_date
          ? new Date(body.procedure_date)
          : undefined,
      };

      const result = await this.dentalChartService.update(id, updateDto);
      return { message: 'Dental chart updated', result };
    } catch (err) {
      console.error('❌ Failed to update dental chart:', err);
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

  @Get('xray/:filename')
  serveXrayImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '..', '..', 'uploads', filename);
    if (!existsSync(filePath)) return res.status(404).send('Image not found');
    return res.sendFile(filePath);
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
