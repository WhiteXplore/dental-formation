import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PriceProcedure } from './entities/price-procedure.entity';
import { ProcedureInventory } from './entities/price-procedure-inventory.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { CreatePriceProcedureDto } from './dto/create-price-procedure.dto';
import { UpdatePriceProcedureDto } from './dto/update-price-procedure.dto';

@Injectable()
export class PriceProcedureService {
  constructor(
    @InjectRepository(PriceProcedure)
    private readonly priceProcedureRepo: Repository<PriceProcedure>,
    @InjectRepository(ProcedureInventory)
    private readonly procedureInventoryRepo: Repository<ProcedureInventory>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  // Create a new procedure
  async create(dto: CreatePriceProcedureDto): Promise<PriceProcedure> {
    // Step 1: create main procedure
    const procedure = this.priceProcedureRepo.create({
      procedure_name: dto.procedure_name,
      procedure_type: dto.procedure_type,
      price: dto.price,
      is_active: dto.is_active ?? true,
      status_color: dto.status_color ?? 'bg-gray-400',
    });

    const savedProcedure = await this.priceProcedureRepo.save(procedure);

    // Step 2: create ProcedureInventory if any
    if (dto.inventory_ids?.length) {
      const inventoryEntities = await this.inventoryRepo.find({
        where: {
          inventory_id: In(dto.inventory_ids.map((i) => i.inventory_id)),
        },
      });

      const procedureInventories = dto.inventory_ids.map((inv) => {
        const inventoryEntity = inventoryEntities.find(
          (i) => i.inventory_id === inv.inventory_id,
        );
        return this.procedureInventoryRepo.create({
          priceProcedure: savedProcedure,
          inventory: inventoryEntity,
          quantity: inv.quantity || 1,
        });
      });

      await this.procedureInventoryRepo.save(procedureInventories);
      savedProcedure.procedureInventories = procedureInventories;
    }

    return savedProcedure;
  }

  // Get all procedures with inventories
  async findAll(): Promise<PriceProcedure[]> {
    return this.priceProcedureRepo.find({
      relations: ['procedureInventories', 'procedureInventories.inventory'],
    });
  }

  // Get one procedure by ID
  async findOne(price_procedure_id: number): Promise<PriceProcedure> {
    const record = await this.priceProcedureRepo.findOne({
      where: { price_procedure_id },
      relations: ['procedureInventories', 'procedureInventories.inventory'],
    });
    if (!record)
      throw new NotFoundException(`Procedure #${price_procedure_id} not found`);
    return record;
  }

  // Update procedure
  async update(
    price_procedure_id: number,
    dto: UpdatePriceProcedureDto,
  ): Promise<PriceProcedure> {
    const record = await this.findOne(price_procedure_id);

    Object.assign(record, {
      procedure_name: dto.procedure_name ?? record.procedure_name,
      procedure_type: dto.procedure_type ?? record.procedure_type,
      price: dto.price ?? record.price,
      is_active: dto.is_active ?? record.is_active,
      status_color: dto.status_color ?? record.status_color,
    });

    const updatedProcedure = await this.priceProcedureRepo.save(record);

    // Update inventories if provided
    if (dto.inventory_ids) {
      // Remove old inventories
      await this.procedureInventoryRepo.delete({
        priceProcedure: { price_procedure_id },
      });

      // Create new inventories
      const inventoryEntities = await this.inventoryRepo.find({
        where: {
          inventory_id: In(dto.inventory_ids.map((i) => i.inventory_id)),
        },
      });

      const procedureInventories = dto.inventory_ids.map((inv) => {
        const inventoryEntity = inventoryEntities.find(
          (i) => i.inventory_id === inv.inventory_id,
        );
        return this.procedureInventoryRepo.create({
          priceProcedure: updatedProcedure,
          inventory: inventoryEntity,
          quantity: inv.quantity || 1,
        });
      });

      await this.procedureInventoryRepo.save(procedureInventories);
      updatedProcedure.procedureInventories = procedureInventories;
    }

    return updatedProcedure;
  }

  // Remove procedure
  async remove(price_procedure_id: number): Promise<void> {
    const record = await this.findOne(price_procedure_id);
    await this.priceProcedureRepo.remove(record);
  }
}
