import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryGateway } from './inventory.gateway';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly gateway: InventoryGateway, // WebSocket gateway
  ) {}

  /* ================= CREATE ================= */
  async create(
    createInventoryDto: CreateInventoryDto,
    imageFilename?: string,
  ): Promise<Inventory> {
    const item = this.inventoryRepository.create({
      ...createInventoryDto,
      image: imageFilename, // store filename instead of Buffer
      notif_status: null,
      notif_viewed_at: null,
      cleared_status: null,
    });

    const savedItem = await this.inventoryRepository.save(item);

    // Emit WebSocket event
    this.gateway.emitInventoryUpdate(savedItem);

    return savedItem;
  }

  /* ================= READ ================= */
  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      order: { quantity: 'ASC' },
    });
  }

  async findOne(inventory_id: number): Promise<Inventory> {
    const item = await this.inventoryRepository.findOne({
      where: { inventory_id },
    });

    if (!item) {
      throw new NotFoundException(`Inventory #${inventory_id} not found`);
    }

    return item;
  }

  /* ================= UPDATE ================= */
  async update(
    id: number,
    updateInventoryDto: UpdateInventoryDto,
    imageFilename?: string,
  ): Promise<Inventory> {
    const item = await this.findOne(id);
    Object.assign(item, updateInventoryDto);

    if (imageFilename) {
      item.image = imageFilename;
    }

    // Reset notification if stock safe again
    if (
      updateInventoryDto.quantity !== undefined &&
      updateInventoryDto.quantity > 10
    ) {
      item.notif_status = null;
      item.notif_viewed_at = null;
      item.cleared_status = null;
    }

    const savedItem = await this.inventoryRepository.save(item);

    // Emit WebSocket event
    this.gateway.emitInventoryUpdate(savedItem);

    return savedItem;
  }

  /* ================= DELETE ================= */
  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.inventoryRepository.remove(item);

    // Emit WebSocket event
    this.gateway.emitInventoryUpdate({ ...item, deleted: true });
  }

  /* ================= STOCK ================= */
  async deductInventory(
    inventoryId: number,
    quantity: number,
  ): Promise<Inventory> {
    const item = await this.findOne(inventoryId);

    if (item.quantity < quantity) {
      throw new BadRequestException(
        `Not enough inventory for ID ${inventoryId}. Available: ${item.quantity}, Required: ${quantity}`,
      );
    }

    item.quantity -= quantity;

    // Trigger notification if low/out of stock
    if (item.quantity <= 10 && item.notif_status !== null) {
      item.notif_status = null;
      item.notif_viewed_at = null;
    }

    const savedItem = await this.inventoryRepository.save(item);

    // Emit WebSocket event
    this.gateway.emitInventoryUpdate(savedItem);

    return savedItem;
  }

  /* ================= 🔔 NOTIFICATIONS ================= */
  async markAsViewed(id: number) {
    const item = await this.findOne(id);

    if (item.notif_status === 'Viewed') {
      return item;
    }

    item.notif_status = 'Viewed';
    item.notif_viewed_at = new Date();

    const savedItem = await this.inventoryRepository.save(item);

    this.gateway.emitInventoryUpdate(savedItem);

    return savedItem;
  }

  async markAllAsViewed() {
    await this.inventoryRepository
      .createQueryBuilder()
      .update(Inventory)
      .set({
        notif_status: 'Viewed',
        notif_viewed_at: new Date(),
      })
      .where('quantity <= 10')
      .andWhere('notif_status IS NULL')
      .execute();

    const updatedItems = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('quantity <= 10')
      .getMany();

    updatedItems.forEach((item) => this.gateway.emitInventoryUpdate(item));

    return { message: 'All inventory notifications marked as viewed' };
  }
}
