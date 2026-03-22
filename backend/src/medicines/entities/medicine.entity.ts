import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  dosage: string;
}
