import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PrescribeMedication } from 'src/prescribe-medication/entities/prescribe-medication.entity';

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

  @Column({ type: 'varchar', length: 100 })
  dosage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_per_unit: number;

  @Column({ type: 'date', nullable: true })
  expiration: Date;

  @Column({ type: 'longblob', nullable: true })
  image: Buffer;

  @UpdateDateColumn({ type: 'timestamp' })
  last_updated: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => PrescribeMedication, (med) => med.inventory, {
    cascade: true,
  })
  prescribedMedications: PrescribeMedication[];
}
