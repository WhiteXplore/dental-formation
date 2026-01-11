import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PriceProcedure } from './price-procedure.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';

@Entity('procedure_inventories')
export class ProcedureInventory {
  @PrimaryGeneratedColumn()
  procedure_inventory_id: number;

  @ManyToOne(
    () => PriceProcedure,
    (procedure) => procedure.procedureInventories,
    {
      onDelete: 'CASCADE',
      eager: true,
    },
  )
  @JoinColumn({ name: 'price_procedure_id' })
  priceProcedure: PriceProcedure;

  @ManyToOne(() => Inventory, (inventory) => inventory.procedureInventories, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
