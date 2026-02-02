import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryGateway } from './inventory.gateway'; // import gateway

@Module({
  imports: [TypeOrmModule.forFeature([Inventory])],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    InventoryGateway, // 👈 add gateway here
  ],
})
export class InventoryModule {}
