// app/admin/doctors/types.ts
export type DoctorStatus = "ACTIVE" | "INACTIVE";

export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
  status: DoctorStatus;
  avatar?: string;
}

export interface DoctorFormData {
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
}
