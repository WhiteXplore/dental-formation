import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';
import { ToothChart } from 'src/dental-chart/entities/tooth.entity';
@Entity('price_procedures')
export class PriceProcedure {
  @PrimaryGeneratedColumn()
  price_procedure_id: number;

  @Column({ unique: true })
  procedure_name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  status_color: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => DentalChart, (dentalChart) => dentalChart.priceProcedure, {
    cascade: true,
  })
  dentalCharts: DentalChart[];

  @OneToMany(() => ToothChart, (toothChart) => toothChart.priceProcedure, {
    cascade: true,
  })
  toothChart: ToothChart[];
}
