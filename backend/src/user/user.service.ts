import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User_Accounts } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User_Accounts)
    private readonly userRepository: Repository<User_Accounts>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User_Accounts> {
    const saltRounds = 10;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Replace plain password with hashed version
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User_Accounts[]> {
    return this.userRepository.find();
  }

  async findOne(user_id: number): Promise<User_Accounts> {
    const user = await this.userRepository.findOneBy({ user_id });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }
    return user;
  }

  async findById(user_id: number): Promise<User_Accounts> {
    const user = await this.userRepository.findOneBy({ user_id });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }
    return user;
  }

  async update(
    user_id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User_Accounts> {
    // Optionally hash password if it's part of the update
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    await this.userRepository.update(user_id, updateUserDto);
    return this.findOne(user_id);
  }

  async updateAvailability(
    user_id: number,
    availability: 'available' | 'not-available',
  ): Promise<User_Accounts> {
    const user = await this.findOne(user_id);
    user.doctor_availability = availability;
    return this.userRepository.save(user);
  }

  async remove(user_id: number): Promise<void> {
    const result = await this.userRepository.delete(user_id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }
  }
}
