export interface UserAddress {
  _id?: string;
  receiverName?: string;
  receiverPhone?: string;
  province?: string;
  district?: string;
  ward?: string;
  detail?: string;
  isDefault?: boolean;
}

export interface UserRole {
  _id: string;
  name: string;
  description?: string;
}

export interface UserItem {
  _id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  provider?: "local" | "facebook" | "google";
  provider_id?: string | null;
  isOTPEmail?: boolean;
  isActive: boolean;
  isOnline?: boolean;
  role?: UserRole | string;
  membership_tier?: string;
  accumulated_points?: number;
  addresses?: UserAddress[];
  lastLogin?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetUsersQueryParams {
  page?: number;
  sizePage?: number;
  search?: string;
  tier?: string;
  fromDate?: string;
  toDate?: string;
  isActive?: boolean;
  isOnline?: boolean;
  isDeleted?: boolean;
}

export interface GetUsersData {
  users: UserItem[];
  totalUser: number;
  totalPage: number;
  currentPage: number;
  sizePage: number;
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  phone?: string | null;
  avatar?: string | null;
  membership_tier?: string;
  role?: string;
  accumulated_points?: number;
  isActive?: boolean;
  addresses?: UserAddress[];
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  phone?: string | null;
  avatar?: string | null;
  membership_tier?: string;
  role?: string;
  accumulated_points?: number;
  isActive?: boolean;
  addresses?: UserAddress[];
}
