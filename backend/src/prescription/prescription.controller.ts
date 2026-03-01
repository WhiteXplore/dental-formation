import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Controller('prescription')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post('add-prescription')
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionService.create(createPrescriptionDto);
  }

  @Get('get-prescription')
  findAll() {
    return this.prescriptionService.findAll();
  }

  @Get('patient/:patient_id')
  findByPatient(@Param('patient_id') patient_id: string) {
    return this.prescriptionService.findAllByPatientId(+patient_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionService.findOne(+id);
  }
  @Get('by-dental/:dental_chart_id')
  async findByDentalChart(@Param('dental_chart_id') dental_chart_id: string) {
    return this.prescriptionService.findByChartId(+dental_chart_id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionService.update(+id, updatePrescriptionDto);
  }

  @Patch('update-by-chart/:dental_chart_id')
  async updateByChart(
    @Param('dental_chart_id') dental_chart_id: string,
    @Body() updateDto: UpdatePrescriptionDto,
  ) {
    const existing =
      await this.prescriptionService.findByChartId(+dental_chart_id);
    if (!existing) {
      throw new NotFoundException(
        `No prescription found for chart ID ${dental_chart_id}`,
      );
    }

    return this.prescriptionService.update(existing.prescription_id, updateDto);
  }

  @Patch('discharge-prescription/:id')
  async dischargePrescription(
    @Param('id') id: string,
    @Body('is_discharged') isDischarged: boolean,
  ) {
    return this.prescriptionService.update(+id, {
      is_discharged: isDischarged,
    });
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.prescriptionService.remove(+id);
  }
}
