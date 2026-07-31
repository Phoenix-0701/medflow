export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface VerifyOtpFormData {
  code: string;
}
