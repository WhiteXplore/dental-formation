import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async create(
    createInventoryDto: CreateInventoryDto,
    imageBuffer?: Buffer,
  ): Promise<Inventory> {
    const item = this.inventoryRepository.create({
      ...createInventoryDto,
      image: imageBuffer,
    });
    return this.inventoryRepository.save(item);
  }

  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepository.find();
  }

  async findOne(inventory_id: number): Promise<Inventory> {
    const item = await this.inventoryRepository.findOne({
      where: { inventory_id },
    });
    if (!item)
      throw new NotFoundException(`Inventory #${inventory_id} not found`);
    return item;
  }

  async update(
    id: number,
    updateInventoryDto: UpdateInventoryDto,
    imageBuffer?: Buffer,
  ): Promise<Inventory> {
    const item = await this.findOne(id);
    Object.assign(item, updateInventoryDto);
    if (imageBuffer) item.image = imageBuffer;
    return this.inventoryRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.inventoryRepository.remove(item);
  }
}
