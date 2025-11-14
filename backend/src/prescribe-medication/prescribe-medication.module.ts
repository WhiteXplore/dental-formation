import { Module } from '@nestjs/common';
import { PrescribeMedicationService } from './prescribe-medication.service';
import { PrescribeMedicationController } from './prescribe-medication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescribeMedication } from './entities/prescribe-medication.entity';
@Module({
  imports: [TypeOrmModule.forFeature([PrescribeMedication])],
  controllers: [PrescribeMedicationController],
  providers: [PrescribeMedicationService],
})
export class PrescribeMedicationModule {}
