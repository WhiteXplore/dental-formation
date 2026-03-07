import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User_Accounts } from './entities/user.entity';
import { DentistSchedule } from './entities/dentist.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User_Accounts)
    private readonly userRepository: Repository<User_Accounts>,

    @InjectRepository(DentistSchedule)
    private readonly scheduleRepository: Repository<DentistSchedule>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User_Accounts> {
    const { schedules, password, ...userData } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    if (Array.isArray(schedules) && schedules.length > 0) {
      const scheduleEntities = schedules.map((s) =>
        this.scheduleRepository.create({
          ...s,
          user_id: savedUser.user_id,
        }),
      );

      await this.scheduleRepository.save(scheduleEntities);
    }

    return this.findOne(savedUser.user_id);
  }

  async findAll(): Promise<User_Accounts[]> {
    return this.userRepository.find({
      relations: ['schedules'],
      order: {
        user_id: 'ASC',
      },
    });
  }

  async findOne(user_id: number): Promise<User_Accounts> {
    const user = await this.userRepository.findOne({
      where: { user_id },
      relations: ['schedules'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    return user;
  }

  async update(
    user_id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User_Accounts> {
    const { schedules, password, removeSignature, ...userData } = updateUserDto;

    if (password) {
      userData['password'] = await bcrypt.hash(password, 10);
    }

    // ⭐ remove signature
    if (removeSignature === 'true') {
      await this.userRepository.update(user_id, { signature: null });
    }
    await this.userRepository.update(user_id, userData);

    // ⭐ update schedules
    if (Array.isArray(schedules)) {
      await this.scheduleRepository.delete({ user_id });

      const newSchedules = schedules.map((s) =>
        this.scheduleRepository.create({
          ...s,
          user_id,
        }),
      );

      await this.scheduleRepository.save(newSchedules);
    }

    return this.findOne(user_id);
  }

  async remove(user_id: number): Promise<void> {
    const result = await this.userRepository.delete(user_id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }
  }
}
