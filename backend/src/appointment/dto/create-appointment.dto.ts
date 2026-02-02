export class CreateAppointmentDto {
  patient_id: number; // Patient selection
  dentist_id: number; // user_id / dentist
  price_procedure_id?: number; // Selected procedure ID
  scheduled_date: Date; // Date of appointment
  appointment_time?: string; // Time of appointment
  appointment_status?: string; // Call / Walk-In / No-Show
  call_type?: string; // Cash / HMO
  contact_number?: string; // Patient contact
  birthdate?: string; // Only for HMO
  hmo_account_no?: string; // Only for HMO
  valid_id?: string; // Only for HMO
  medical_history?: string; // Notes
  notif_status?: string; // Notification status
  notif_viewed_at?: Date; // Notification viewed time
}
