import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(createAppointmentDto);
    return await this.appointmentRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      relations: ['patient', 'user_accounts'],
      order: { scheduled_date: 'ASC' },
    });
  }

  async findOne(appointment_id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointment_id },
      relations: ['patient', 'user_accounts'],
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with ID ${appointment_id} not found`,
      );
    }

    return appointment;
  }

  async update(
    appointment_id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOneBy({
      appointment_id,
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with ID ${appointment_id} not found`,
      );
    }

    // If marking as viewed, update notif_viewed_at
    if (updateAppointmentDto.notif_status === 'Viewed') {
      appointment.notif_viewed_at = new Date();
    }

    Object.assign(appointment, updateAppointmentDto);
    return await this.appointmentRepository.save(appointment);
  }

  async remove(appointment_id: number): Promise<{ message: string }> {
    const appointment = await this.appointmentRepository.findOneBy({
      appointment_id,
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with ID ${appointment_id} not found`,
      );
    }

    await this.appointmentRepository.remove(appointment);
    return { message: 'Appointment deleted successfully' };
  }
}
