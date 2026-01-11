import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HmoGuarantorsService } from './hmo-guarantors.service';
import { HmoGuarantorsController } from './hmo-guarantors.controller';
import { HmoGuarantor } from './entities/hmo-guarantor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HmoGuarantor])],
  controllers: [HmoGuarantorsController],
  providers: [HmoGuarantorsService],
})
export class HmoGuarantorsModule {}
