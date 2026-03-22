import { Injectable } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from './entities/medicine.entity';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private medicineRepository: Repository<Medicine>,
  ) {}

  async create(createMedicineDto: CreateMedicineDto) {
    const medicine = this.medicineRepository.create(createMedicineDto);
    return await this.medicineRepository.save(medicine);
  }

  async findAll() {
    return await this.medicineRepository.find();
  }

  async findOne(id: number) {
    return await this.medicineRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateMedicineDto: UpdateMedicineDto) {
    await this.medicineRepository.update(id, updateMedicineDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.medicineRepository.delete(id);
  }
}
