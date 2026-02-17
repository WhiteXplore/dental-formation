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
  /* ===============================
     PRIMARY
  =============================== */
  @PrimaryGeneratedColumn()
  patient_id: number;

  /* ===============================
     BASIC INFO
  =============================== */
  @Column({ type: 'varchar', length: 255, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  middle_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_name: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gender: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  religion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  other_religion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nationality: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marital_status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  occupation: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contact_number: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  parent_fullname: string;

  /* ===============================
     INSURANCE
  =============================== */
  @Column({ type: 'varchar', length: 50, nullable: true })
  has_insurance: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  dental_insurance: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  other_insurance: string;

  /* ===============================
     HEALTH QUESTIONNAIRE
  =============================== */
  @Column({ type: 'varchar', length: 10, nullable: true })
  good_health: string;

  @Column({ type: 'text', nullable: true })
  health_details: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  medical_treatment: string;

  @Column({ type: 'text', nullable: true })
  medical_treatment_details: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  serious_illness: string;

  @Column({ type: 'text', nullable: true })
  serious_illness_details: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  hospitalized: string;

  @Column({ type: 'text', nullable: true })
  hospitalized_details: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  taking_medication: string;

  @Column({ type: 'text', nullable: true })
  taking_medication_details: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  use_tobacco: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  use_alcohol: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  allergies: string;

  @Column({ type: 'text', nullable: true })
  allergies_details: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bleeding_time_details: string;

  /* ===============================
     WOMEN ONLY
  =============================== */
  @Column({ type: 'varchar', length: 10, nullable: true })
  pregnant: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  nursing: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  control_pills: string;

  /* ===============================
     VITAL SIGNS
  =============================== */
  @Column({ type: 'varchar', length: 10, nullable: true })
  blood_type: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  blood_pressure: string;

  /* ===============================
     MEDICAL CONDITIONS (MULTI)
  =============================== */
  @Column({ type: 'simple-json', nullable: true })
  medical_conditions: string[];

  @Column({ type: 'text', nullable: true })
  other_condition_details: string;

  /* ===============================
     TIMESTAMPS
  =============================== */
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  /* ===============================
     RELATIONS
  =============================== */
  @OneToMany(() => DentalChart, (chart) => chart.patient)
  dentalCharts: DentalChart[];

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];
}
