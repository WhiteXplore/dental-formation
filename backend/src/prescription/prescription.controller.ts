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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionService.findOne(+id);
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

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.prescriptionService.remove(+id);
  }
}
