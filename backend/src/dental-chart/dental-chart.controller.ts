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
import { existsSync, mkdirSync } from 'fs';

@Controller('dental-chart')
export class DentalChartController {
  constructor(private readonly dentalChartService: DentalChartService) {}

  // Helper: ensure uploads folder exists
  private ensureUploadPath(path: string) {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
      console.log('Created uploads folder at:', path);
    }
  }

  private getUploadPath() {
    const uploadPath = join(__dirname, '..', '..', 'uploads');
    this.ensureUploadPath(uploadPath);
    return uploadPath;
  }

  @Post('add-dental-chart')
  @UseInterceptors(
    FileInterceptor('xray_image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(__dirname, '..', '..', 'uploads');
          if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = uniqueSuffix + '-' + file.originalname;
          console.log('Uploading file:', filename);
          cb(null, filename);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    try {
      const dto: CreateDentalChartDto & { xray_image?: string } = {
        patient_id: Number(body.patient_id),
        user_id: Number(body.user_id),
        price_procedure_id: Number(body.price_procedure_id),
        procedure_notes: body.procedure_notes ?? '',
        procedure_date: body.procedure_date ? new Date(body.procedure_date) : new Date(),
        payment_amount: body.payment_amount ? parseFloat(body.payment_amount) : 0,
        selected_teeth: JSON.parse(body.selected_teeth || '[]'),
        tooth_status_map: JSON.parse(body.tooth_status_map || '{}'),
        additional_items: body.additional_items ? JSON.parse(body.additional_items) : [],
        xray_image: file?.filename ?? undefined,
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
      destination: (req, file, cb) => {
        const uploadPath = join(__dirname, '..', '..', 'uploads');
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix =
          Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
      },
    }),
  }),
)
async update(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @Body() body: any,
) {
  try {
    console.log('📦 Incoming update body:', body);

    const parseJSON = (value: any) => {
      if (!value) return undefined;
      if (typeof value === 'object') return value;
      if (typeof value === 'string' && value.trim() !== '') {
        return JSON.parse(value);
      }
      return undefined;
    };

    const updateDto: UpdateDentalChartDto & { xray_image?: string } = {
      patient_id: body.patient_id
        ? Number(body.patient_id)
        : undefined,

      user_id: body.user_id
        ? Number(body.user_id)
        : undefined,

      price_procedure_id: body.price_procedure_id
        ? Number(body.price_procedure_id)
        : undefined,

      procedure_notes: body.procedure_notes ?? undefined,

      procedure_date:
        body.procedure_date && body.procedure_date !== ''
          ? new Date(body.procedure_date)
          : undefined,

      payment_amount:
        body.payment_amount && body.payment_amount !== ''
          ? parseFloat(body.payment_amount)
          : undefined,

      selected_teeth: parseJSON(body.selected_teeth),
      tooth_status_map: parseJSON(body.tooth_status_map),
      additional_items: parseJSON(body.additional_items),

      xray_image: file?.filename ?? undefined,
    };

    console.log('✅ Parsed DTO:', updateDto);

    return await this.dentalChartService.update(+id, updateDto);
  } catch (err) {
    console.error('❌ REAL ERROR:', err);
    throw new BadRequestException(err.message);
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
