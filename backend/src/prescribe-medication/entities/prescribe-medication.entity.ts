import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';

@Entity('prescribed_medications')
export class PrescribeMedication {
  @PrimaryGeneratedColumn()
  prescribe_medication_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Medication name

  @Column({ type: 'varchar', length: 255, nullable: true })
  type: string; // Medication type

  @Column({ type: 'varchar', length: 255, nullable: true })
  dosage: string; // Medication dosage

  @Column({ type: 'varchar', length: 255, nullable: true })
  med_instruction: string; // Medication duration

  @Column({ type: 'int' })
  pcs: number; // Quantity

  @Column({ type: 'date' })
  issued_date: Date;

  @ManyToOne(() => DentalChart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dental_chart_id' })
  dental_chart: DentalChart;

  @ManyToOne(
    () => Prescription,
    (prescription) => prescription.prescribedMedications,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  update_at: Date;
}
