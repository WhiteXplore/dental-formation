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
import { HmoGuarantor } from 'src/hmo-guarantors/entities/hmo-guarantor.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn()
  prescription_id: number;

  // Link to Dental Chart
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

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_type: string;

  @ManyToOne(() => HmoGuarantor, (guarantor) => guarantor.prescriptions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'hmo_guarantor_id' })
  hmoGuarantor: HmoGuarantor | null; // <-- Add '| null'

  @Column({ type: 'date' })
  issued_date: Date;

  @Column({ default: false, nullable: true })
  is_discharged: boolean;

  @OneToMany(() => PrescribeMedication, (med) => med.prescription, {
    cascade: true,
  })
  prescribedMedications: PrescribeMedication[];

  @Column('int', { nullable: true })
  prescribedMedicationIds?: number[];

  @OneToMany(() => Payment, (payment) => payment.prescription)
  payments: Payment[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
