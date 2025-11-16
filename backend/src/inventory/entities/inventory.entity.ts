import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProcedureInventory } from 'src/price-procedure/entities/price-procedure-inventory.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  inventory_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  type: string;

  @Column('int')
  quantity: number;

  @Column({ type: 'varchar', length: 100 })
  unit: string;

  @Column({ type: 'longblob', nullable: true })
  image: Buffer;

  @UpdateDateColumn({ type: 'timestamp' })
  last_updated: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => ProcedureInventory, (ppi) => ppi.inventory)
  procedureInventories: ProcedureInventory[];
}
