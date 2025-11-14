import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  patient_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  middle_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_name: string;

  @Column({ type: 'date' })
  birthdate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  age: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  religion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nationality: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  marital_status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  occupation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  dental_insurance: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  has_insurance: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  parent_fullname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  update_at: Date;

  @OneToMany(() => DentalChart, (chart) => chart.patient)
  dentalCharts: DentalChart[];

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];
}
