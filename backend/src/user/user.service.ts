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

  /* ================= CREATE USER ================= */
  async create(createUserDto: CreateUserDto): Promise<User_Accounts> {
    const { schedules, password, signature, ...userData } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      signature: signature || null, // save uploaded signature filename
    });

    const savedUser = await this.userRepository.save(user);

    /* SAVE DENTIST SCHEDULES */
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

  /* ================= GET ALL USERS ================= */
  async findAll(): Promise<User_Accounts[]> {
    return this.userRepository.find({
      relations: ['schedules'],
      order: {
        user_id: 'ASC',
      },
    });
  }

  /* ================= GET ONE USER ================= */
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

  /* ================= UPDATE USER ================= */
  async update(
    user_id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User_Accounts> {
    const { schedules, password, signature, removeSignature, ...userData } =
      updateUserDto;

    const user = await this.findOne(user_id);

    /* HASH PASSWORD IF UPDATED */
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    /* UPDATE BASIC FIELDS */
    Object.assign(user, userData);

    /* UPDATE SIGNATURE IF NEW FILE UPLOADED */
    if (signature) {
      user.signature = signature;
    }

    /* REMOVE SIGNATURE */
    if (removeSignature === 'true') {
      user.signature = null;
    }

    await this.userRepository.save(user);

    /* UPDATE SCHEDULES */
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

  /* ================= DELETE USER ================= */
  async remove(user_id: number): Promise<void> {
    const result = await this.userRepository.delete(user_id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }
  }
}
