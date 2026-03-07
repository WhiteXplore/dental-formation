import { Module } from '@nestjs/common';
import { PrescribeMedicationService } from './prescribe-medication.service';
import { PrescribeMedicationController } from './prescribe-medication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescribeMedication } from './entities/prescribe-medication.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';
@Module({
  imports: [TypeOrmModule.forFeature([PrescribeMedication, Prescription])],
  controllers: [PrescribeMedicationController],
  providers: [PrescribeMedicationService],
})
export class PrescribeMedicationModule {}
