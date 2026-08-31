export interface SigninPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface UserRole {
  _id: string;
  name: string;
}

export interface UserAddress {
  _id?: string;
  full_name?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  address_detail?: string;
  is_default?: boolean;
}

export interface UserProfile {
  _id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  provider: string;
  provider_id?: string | null;
  isOTPEmail: boolean;
  isActive: boolean;
  role: UserRole | string;
  lastLogin?: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  wishlist?: string[];
  accumulated_points?: number;
  membership_tier?: string;
  addresses?: UserAddress[];
  createdAt?: string;
  updatedAt?: string;
  isOnline?: boolean;
}

export interface ProfileResponse {
  message: string;
  profile: UserProfile;
}

