import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';
import { PriceProcedure } from 'src/price-procedure/entities/price-procedure.entity';

@Entity('tooth_chart')
export class ToothChart {
  @PrimaryGeneratedColumn()
  tooth_id: number;

  @Column()
  tooth_number: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  status: string;

  @Column({ type: 'int' })
  dental_id: number;

  @ManyToOne(() => DentalChart, (chart) => chart.teeth, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dental_id' })
  dentalChart: DentalChart;

  @ManyToOne(() => PriceProcedure, { eager: false })
  @JoinColumn({ name: 'price_procedure_id' })
  priceProcedure: PriceProcedure;

  @Column({ nullable: true })
  price_procedure_id?: number;

  // @Column({ type: 'varchar', length: 50, nullable: true })
  // tooth_inventory_status: string | null;
}
