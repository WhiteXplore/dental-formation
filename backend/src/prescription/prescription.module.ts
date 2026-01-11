import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';
import { PrescriptionService } from './prescription.service';
import { PrescriptionController } from './prescription.controller';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { PrescribeMedication } from 'src/prescribe-medication/entities/prescribe-medication.entity';
import { HmoGuarantor } from 'src/hmo-guarantors/entities/hmo-guarantor.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prescription,
      DentalChart,
      Inventory,
      PrescribeMedication,
      HmoGuarantor,
    ]),
  ],
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
})
export class PrescriptionModule {}
