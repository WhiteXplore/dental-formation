import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { DentalChart } from 'src/dental-chart/entities/dental-chart.entity';
import { DentistSchedule } from './dentist.entity';
@Entity('user_accounts')
export class User_Accounts {
  @PrimaryGeneratedColumn('increment')
  user_id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  middle_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  license_no: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  prc_type: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  role: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string;

  @OneToMany(() => DentistSchedule, (s) => s.user, { cascade: true })
  schedules: DentistSchedule[];

  @OneToMany(() => Appointment, (a) => a.user_accounts)
  appointments: Appointment[];

  @OneToMany(() => DentalChart, (d) => d.user_accounts)
  dentalCharts: DentalChart[];
}
