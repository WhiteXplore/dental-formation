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

  // ✅ CREATE FIX
  async create(createMedicineDto: CreateMedicineDto) {
    const medicine = this.medicineRepository.create({
      ...createMedicineDto,

      // ✅ KEY FIX: handle other_type properly
      other_type:
        createMedicineDto.type === 'Other'
          ? createMedicineDto.other_type
          : undefined,
    });

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

  // ✅ UPDATE FIX (IMPORTANT)
  async update(id: number, updateMedicineDto: UpdateMedicineDto) {
    const medicine = await this.medicineRepository.findOne({
      where: { id },
    });

    if (!medicine) {
      throw new Error('Medicine not found');
    }

    const updatedData = {
      ...updateMedicineDto,

      // ✅ KEY FIX: handle switching type
      other_type:
        updateMedicineDto.type === 'Other'
          ? updateMedicineDto.other_type
          : updateMedicineDto.type
            ? undefined
            : medicine.other_type,
    };

    await this.medicineRepository.update(id, updatedData);

    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.medicineRepository.delete(id);
  }
}
