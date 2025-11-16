import { Module } from '@nestjs/common';
import { DentalChartService } from './dental-chart.service';
import { DentalChartController } from './dental-chart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DentalChart } from './entities/dental-chart.entity';
import { ToothChart } from './entities/tooth.entity';
import { PriceProcedure } from 'src/price-procedure/entities/price-procedure.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([DentalChart, ToothChart, PriceProcedure]),
  ],
  controllers: [DentalChartController],
  providers: [DentalChartService],
})
export class DentalChartModule {}
