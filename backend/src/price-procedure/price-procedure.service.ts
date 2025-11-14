import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceProcedure } from './entities/price-procedure.entity';
import { CreatePriceProcedureDto } from './dto/create-price-procedure.dto';
import { UpdatePriceProcedureDto } from './dto/update-price-procedure.dto';

@Injectable()
export class PriceProcedureService {
  constructor(
    @InjectRepository(PriceProcedure)
    private readonly priceProcedureRepo: Repository<PriceProcedure>,
  ) {}

  async create(dto: CreatePriceProcedureDto): Promise<PriceProcedure> {
    const priceProcedure = this.priceProcedureRepo.create(dto);
    return this.priceProcedureRepo.save(priceProcedure);
  }

  async findAll(): Promise<PriceProcedure[]> {
    return this.priceProcedureRepo.find();
  }

  async findOne(price_procedure_id: number): Promise<PriceProcedure> {
    const record = await this.priceProcedureRepo.findOneBy({
      price_procedure_id,
    });
    if (!record)
      throw new NotFoundException(`Procedure #${price_procedure_id} not found`);
    return record;
  }

  async update(
    price_procedure_id: number,
    dto: UpdatePriceProcedureDto,
  ): Promise<PriceProcedure> {
    const record = await this.findOne(price_procedure_id);
    Object.assign(record, dto);
    return this.priceProcedureRepo.save(record);
  }

  async remove(price_procedure_id: number): Promise<void> {
    const record = await this.findOne(price_procedure_id);
    await this.priceProcedureRepo.remove(record);
  }
}
