import { IsInt, IsOptional, IsString, IsDate, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @IsOptional()
  patient_id?: number; // Patient selection

    @IsInt()
  @IsOptional()
  user_id?: number; 

  @IsInt()
  @IsOptional()
  dentist_id?: number; // user_id / dentist

  @IsInt()
  @IsOptional()
  price_procedure_id?: number; // Selected procedure ID

  @IsDateString()
  @IsOptional()
  scheduled_date?: string; // Date of appointment

  @IsString()
  @IsOptional()
  appointment_time?: string; // Time of appointment

  @IsString()
  @IsOptional()
  appointment_status?: string; // Call / Walk-In / No-Show

  @IsString()
  @IsOptional()
  call_type?: string; // Cash / HMO

  @IsString()
  @IsOptional()
  contact_number?: string; // Patient contact

  @IsDateString()
  @IsOptional()
  birthdate?: string; // Only for HMO

  @IsString()
  @IsOptional()
  hmo_account_no?: string; // Only for HMO

  @IsString()
  @IsOptional()
  valid_id?: string; // Only for HMO

  @IsString()
  @IsOptional()
  medical_history?: string; // Notes

  @IsString()
  @IsOptional()
  notif_status?: string; // Notification status

  @IsDate()
  @IsOptional()
  notif_viewed_at?: Date; // Notification viewed time
}
