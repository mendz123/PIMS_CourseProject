// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

// User Types
export interface UserInfo {
  userId: number;
  email: string;
  fullName?: string;
  role?: string;
  isLoginGoogle?: boolean;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
  status?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginResponse {
  user: UserInfo;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface ResetPasswordOtpRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}
