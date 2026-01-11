import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Prescription } from 'src/prescription/entities/prescription.entity';

@Entity('hmo_guarantors')
export class HmoGuarantor {
  @PrimaryGeneratedColumn()
  hmo_guarantor_id: number;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100, nullable: true })
  middle_name: string;

  @Column({ length: 100 })
  last_name: string;

  @Column({ length: 150 })
  company: string;

  // Relationship: One HMO guarantor can have many prescriptions
  @OneToMany(() => Prescription, (prescription) => prescription.hmoGuarantor)
  prescriptions: Prescription[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
