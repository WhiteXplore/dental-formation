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

  @Column({ type: 'int' })
  tooth_number: number;

  // RF / OB / NR
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  tooth_condition: string;

  /** Dental Chart Relation */
  @ManyToOne(() => DentalChart, (chart) => chart.teeth, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dental_id' })
  dentalChart: DentalChart;

  @Column()
  dental_id: number;

  /** Procedure Relation */
  @ManyToOne(() => PriceProcedure, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'price_procedure_id' })
  priceProcedure: PriceProcedure;

  @Column({ type: 'int', nullable: true })
  price_procedure_id: number;
}
