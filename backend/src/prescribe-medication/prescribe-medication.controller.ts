import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PrescribeMedicationService } from './prescribe-medication.service';
import { CreatePrescribeMedicationDto } from './dto/create-prescribe-medication.dto';
import { UpdatePrescribeMedicationDto } from './dto/update-prescribe-medication.dto';

@Controller('prescribe-medication')
export class PrescribeMedicationController {
  constructor(
    private readonly prescribeMedicationService: PrescribeMedicationService,
  ) {}

  @Post()
  create(@Body() createDto: CreatePrescribeMedicationDto) {
    return this.prescribeMedicationService.create(createDto);
  }
  @Get('dental-chart/:id')
  findByDentalChart(@Param('id', ParseIntPipe) id: number) {
    return this.prescribeMedicationService.findByDentalChartId(id);
  }

  @Get('prescription/:id')
  findByPrescription(@Param('id', ParseIntPipe) id: number) {
    return this.prescribeMedicationService.findByPrescriptionId(id);
  }

  @Get()
  findAll() {
    return this.prescribeMedicationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prescribeMedicationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePrescribeMedicationDto,
  ) {
    return this.prescribeMedicationService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.prescribeMedicationService.remove(id);
  }
}
