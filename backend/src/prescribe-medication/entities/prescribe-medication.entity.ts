import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';

@Entity()
export class PrescribeMedication {
  @PrimaryGeneratedColumn()
  prescribe_medication_id: number;

  @Column({ type: 'int' })
  pcs: number;

  @Column({ type: 'date' })
  issued_date: Date;

  @ManyToOne(() => Inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @ManyToOne(() => DentalChart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dental_chart_id' })
  dental_chart: DentalChart;

  @ManyToOne(
    () => Prescription,
    (prescription) => prescription.prescribedMedications,
    {
      onDelete: 'CASCADE', // or 'RESTRICT'
    },
  )
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  update_at: Date;
}
