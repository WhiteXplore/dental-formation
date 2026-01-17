import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User_Accounts } from './user.entity';

@Entity('dentist_schedules')
export class DentistSchedule {
  @PrimaryGeneratedColumn()
  schedule_id: number;

  @Column()
  user_id: number;

  @Column()
  day: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @ManyToOne(() => User_Accounts, (u) => u.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' }) // ✅ THIS IS THE KEY
  user: User_Accounts;
}
