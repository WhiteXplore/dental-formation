import { Module } from '@nestjs/common';
import { PriceProcedureService } from './price-procedure.service';
import { PriceProcedureController } from './price-procedure.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceProcedure } from './entities/price-procedure.entity';
import { ProcedureInventory } from './entities/price-procedure-inventory.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([PriceProcedure, ProcedureInventory, Inventory]),
  ],
  controllers: [PriceProcedureController],
  providers: [PriceProcedureService],
})
export class PriceProcedureModule {}
