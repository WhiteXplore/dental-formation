import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('status')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  status_name: string;
}
