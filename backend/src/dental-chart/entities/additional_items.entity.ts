import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';

@Entity('additional_items')
export class AdditionalItems {
  @PrimaryGeneratedColumn()
  additional_item_id: number;

  @Column({ type: 'varchar', length: 255 })
  pcs: string;

  // ✅ Explicit FK column
  @Column({ type: 'int' })
  dental_id: number;

  // ✅ FIXED inverse property (chart.addItems)
  @ManyToOne(() => DentalChart, (chart) => chart.addItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dental_id' })
  dentalChart: DentalChart;

  // ✅ Explicit FK column
  @Column({ type: 'int', nullable: true })
  inventory_id?: number;

  @ManyToOne(() => Inventory, { eager: false })
  @JoinColumn({ name: 'inventory_id' })
  additionalInventory: Inventory;
}
