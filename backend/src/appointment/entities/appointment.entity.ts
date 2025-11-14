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

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  appointment_id: number;

  @Column({ type: 'int', nullable: true })
  patient_id: number;

  @Column({ type: 'int', nullable: true })
  user_id: number; // Link to dentist from User_Accounts

  @Column({ type: 'datetime' })
  scheduled_date: Date;

  @Column({ type: 'varchar', length: 155, nullable: true })
  appointment_status: string;

  @Column({ type: 'varchar', length: 155, nullable: true })
  appointment_time: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  medical_history: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  notif_status: string;

  @Column({ type: 'timestamp', nullable: true })
  notif_viewed_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  update_at: Date;

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
  @JoinColumn({ name: 'user_id' }) // This matches the column name above
  user_accounts: User_Accounts;
}
