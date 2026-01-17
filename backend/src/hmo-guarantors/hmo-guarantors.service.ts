import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HmoGuarantor } from './entities/hmo-guarantor.entity';
import { CreateHmoGuarantorDto } from './dto/create-hmo-guarantor.dto';
import { UpdateHmoGuarantorDto } from './dto/update-hmo-guarantor.dto';

@Injectable()
export class HmoGuarantorsService {
  constructor(
    @InjectRepository(HmoGuarantor)
    private readonly hmoGuarantorRepo: Repository<HmoGuarantor>,
  ) {}

  create(createHmoGuarantorDto: CreateHmoGuarantorDto) {
    const guarantor = this.hmoGuarantorRepo.create(createHmoGuarantorDto);
    return this.hmoGuarantorRepo.save(guarantor);
  }

  findAll() {
    // Sort by full_name now
    return this.hmoGuarantorRepo.find({ order: { full_name: 'ASC' } });
  }

  async findOne(hmo_guarantor_id: number) {
    const guarantor = await this.hmoGuarantorRepo.findOne({
      where: { hmo_guarantor_id },
    });
    if (!guarantor) throw new NotFoundException('HMO Guarantor not found');
    return guarantor;
  }

  async update(
    hmo_guarantor_id: number,
    updateHmoGuarantorDto: UpdateHmoGuarantorDto,
  ) {
    const guarantor = await this.findOne(hmo_guarantor_id);
    Object.assign(guarantor, updateHmoGuarantorDto);
    return this.hmoGuarantorRepo.save(guarantor);
  }

  async remove(hmo_guarantor_id: number) {
    const guarantor = await this.findOne(hmo_guarantor_id);
    return this.hmoGuarantorRepo.remove(guarantor);
  }
}
