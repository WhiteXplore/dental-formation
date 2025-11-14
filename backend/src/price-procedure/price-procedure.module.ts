import { Module } from '@nestjs/common';
import { PriceProcedureService } from './price-procedure.service';
import { PriceProcedureController } from './price-procedure.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceProcedure } from './entities/price-procedure.entity';
@Module({
  imports: [TypeOrmModule.forFeature([PriceProcedure])],
  controllers: [PriceProcedureController],
  providers: [PriceProcedureService],
})
export class PriceProcedureModule {}
