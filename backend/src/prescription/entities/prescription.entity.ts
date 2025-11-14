// prescription.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';
import { PrescribeMedication } from 'src/prescribe-medication/entities/prescribe-medication.entity';
import { Payment } from 'src/payment/entities/payment.entity';
@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn()
  prescription_id: number;

  @ManyToOne(() => DentalChart, (dentalChart) => dentalChart.prescriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dental_chart_id' })
  dentalChart: DentalChart;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  instruction: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  patient_payment: number;

  @Column({ type: 'date' })
  issued_date: Date;

  @OneToMany(() => PrescribeMedication, (prescribe) => prescribe.prescription, {
    cascade: true,
  })
  prescribedMedications: PrescribeMedication[];

  @OneToMany(() => Payment, (payment) => payment.prescription)
  payments: Payment[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  update_at: Date;
}
