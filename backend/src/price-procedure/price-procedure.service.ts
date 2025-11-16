import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      price: dto.price,
      is_active: dto.is_active,
      status_color: dto.status_color,
      inventory_id: dto.inventory_ids?.[0]?.inventory_id ?? null,
    });

    const savedProcedure = await this.priceProcedureRepo.save(procedure);

    // Step 2: create ProcedureInventory if any
    if (dto.inventory_ids?.length) {
      const inventoryEntities = await this.inventoryRepo.findBy({
        inventory_id: dto.inventory_ids.map((i) => i.inventory_id) as any,
      });

      const procedureInventories = dto.inventory_ids.map((inv) => {
        const inventoryEntity = inventoryEntities.find(
          (i) => i.inventory_id === inv.inventory_id,
        );
        return this.procedureInventoryRepo.create({
          priceProcedure: savedProcedure, // single entity, not array
          inventory: inventoryEntity,
          quantity: inv.quantity,
        });
      });

      await this.procedureInventoryRepo.save(procedureInventories);
      savedProcedure.procedureInventories =
        procedureInventories as ProcedureInventory[];
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
      price: dto.price ?? record.price,
      is_active: dto.is_active ?? record.is_active,
      status_color: dto.status_color ?? record.status_color,
      inventory_id: dto.inventory_ids?.[0]?.inventory_id ?? record.inventory_id, // update single inventory_id if provided
    });

    const updatedProcedure = await this.priceProcedureRepo.save(record);

    // Update inventories if provided
    if (dto.inventory_ids) {
      await this.procedureInventoryRepo.delete({
        priceProcedure: { price_procedure_id },
      });

      const inventoryEntities = await this.inventoryRepo.findBy({
        inventory_id: dto.inventory_ids.map((i) => i.inventory_id) as any,
      });

      const procedureInventories = dto.inventory_ids.map((inv) => {
        const inventoryEntity = inventoryEntities.find(
          (i) => i.inventory_id === inv.inventory_id,
        );
        return this.procedureInventoryRepo.create({
          priceProcedure: updatedProcedure,
          inventory: inventoryEntity,
          quantity: inv.quantity,
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
