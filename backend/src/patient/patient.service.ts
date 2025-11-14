import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientRepository.create(createPatientDto);
    return this.patientRepository.save(patient);
  }

  async findAll(): Promise<Patient[]> {
    return this.patientRepository.find({
      relations: ['appointments', 'dentalCharts'],
    });
  }

  async findOne(patient_id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { patient_id },
      relations: ['appointments', 'dentalCharts'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patient_id} not found`);
    }

    return patient;
  }

  async update(
    patient_id: number,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findOne(patient_id);
    const updated = this.patientRepository.merge(patient, updatePatientDto);
    return this.patientRepository.save(updated);
  }

  async remove(patient_id: number): Promise<void> {
    const patient = await this.findOne(patient_id);
    await this.patientRepository.remove(patient);
  }
}
