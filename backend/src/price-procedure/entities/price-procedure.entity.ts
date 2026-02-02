import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProcedureInventory } from './price-procedure-inventory.entity';
import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';
import { ToothChart } from 'src/dental-chart/entities/tooth.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Entity('price_procedures')
export class PriceProcedure {
  @PrimaryGeneratedColumn()
  price_procedure_id: number;

  @Column({ type: 'int', nullable: true })
  inventory_id: number | null;

  @Column()
  procedure_name: string;

  @Column()
  procedure_type: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  procedure_scope: string;

  @Column()
  pricing_scope: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 'bg-gray-400' })
  status_color: string;

  @OneToMany(() => ProcedureInventory, (pi) => pi.priceProcedure, {
    cascade: true,
  })
  procedureInventories: ProcedureInventory[];

  @OneToMany(() => DentalChart, (dentalChart) => dentalChart.priceProcedure, {
    cascade: true,
  })
  dentalCharts: DentalChart[];

  @OneToMany(() => ToothChart, (toothChart) => toothChart.priceProcedure, {
    cascade: true,
  })
  toothChart: ToothChart[];

  // Add relation to appointments
  @OneToMany(() => Appointment, (appointment) => appointment.priceProcedure)
  appointments: Appointment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
