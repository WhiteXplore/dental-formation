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

@Entity('price_procedures')
export class PriceProcedure {
  @PrimaryGeneratedColumn()
  price_procedure_id: number;

  // Allow null so TypeScript is happy
  @Column({ type: 'int', nullable: true })
  inventory_id: number | null;

  @Column()
  procedure_name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
