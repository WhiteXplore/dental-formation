import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';
import { ToothChart } from './tooth.entity';
import { PriceProcedure } from 'src/price-procedure/entities/price-procedure.entity';
import { User_Accounts } from 'src/user/entities/user.entity';
import { AdditionalItems } from './additional_items.entity';

@Entity('dental_charts')
export class DentalChart {
  @PrimaryGeneratedColumn()
  dental_id: number;

  @Column({ type: 'int', nullable: true })
  patient_id: number;

  @ManyToOne(() => Patient, (patient) => patient.dentalCharts, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(
    () => PriceProcedure,
    (priceProcedure) => priceProcedure.dentalCharts,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'price_procedure_id' })
  priceProcedure: PriceProcedure;

  @ManyToOne(
    () => User_Accounts,
    (user_accounts) => user_accounts.dentalCharts,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'user_id' })
  user_accounts: User_Accounts;

  @OneToMany(() => Prescription, (prescription) => prescription.dentalChart, {
    cascade: true,
  })
  prescriptions: Prescription[];

  @OneToMany(() => ToothChart, (tooth) => tooth.dentalChart, {
    cascade: true,
    eager: true,
  })
  teeth: ToothChart[];

  @OneToMany(() => AdditionalItems, (addItems) => addItems.dentalChart, {
    cascade: true,
    eager: true,
  })
  addItems: AdditionalItems[];

  @Column({ type: 'datetime', nullable: true })
  procedure_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  xray_image_name: string; // ✅ store only the file name

  @Column({ type: 'varchar', length: 255, nullable: true })
  procedure_notes: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  payment_amount: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  update_at: Date;

  @Column({ default: false })
  inventoryDeducted: boolean;
}
