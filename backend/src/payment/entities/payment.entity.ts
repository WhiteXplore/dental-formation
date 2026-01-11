import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Prescription } from 'src/prescription/entities/prescription.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  payment_method: string;

  @Column()
  payment_status: string;

  @Column()
  total_payment: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  payment_date: Date;

  @Column({ default: false })
  is_discharged: boolean;

  @ManyToOne(() => Prescription, (prescription) => prescription.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @Column()
  prescription_id: number; // must match the FK column
}
