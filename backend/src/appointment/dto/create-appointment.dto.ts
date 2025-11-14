export class CreateAppointmentDto {
  patient_id: number;
  dentist_id: number;
  scheduled_date: Date;
  appointment_status?: string;
  medical_history?: string;
  notif_status?: string;
}
