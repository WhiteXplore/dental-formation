import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import { User_Accounts } from 'src/user/entities/user.entity';
import { PriceProcedure } from 'src/price-procedure/entities/price-procedure.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  appointment_id: number;

  @Column({ type: 'int', nullable: true })
  patient_id: number;

  @Column({ type: 'int', nullable: true })
  user_id: number; // dentist_id

  @Column({ type: 'int', nullable: true })
  price_procedure_id: number; // procedure ID

  @Column({ type: 'datetime' })
  scheduled_date: Date;

  @Column({ type: 'varchar', length: 155, nullable: true })
  appointment_time: string;

  @Column({ type: 'varchar', length: 155, nullable: true })
  appointment_status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  medical_history: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  call_type: string; // Cash or HMO

  @Column({ type: 'varchar', length: 100, nullable: true })
  contact_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  birthdate: string; // for HMO

  @Column({ type: 'varchar', length: 100, nullable: true })
  hmo_account_no: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  valid_id: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  notif_status: string;

  @Column({ type: 'timestamp', nullable: true })
  notif_viewed_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  update_at: Date;

  // Relations
  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(
    () => User_Accounts,
    (user_accounts) => user_accounts.appointments,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'user_id' })
  user_accounts: User_Accounts;

  @ManyToOne(() => PriceProcedure, (procedure) => procedure.appointments, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'price_procedure_id' })
  priceProcedure: PriceProcedure;
}
