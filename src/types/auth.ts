export type UserRole = 'USER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserProfile {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin: string;
  lastActive: string;
  ipAddressMasked?: string;
  networkRegion?: string;
  totalSurveys?: number;
  totalParcels?: number;
}

export type ActivityType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PIN_CREATED'
  | 'PARCEL_CREATED'
  | 'AI_ANALYSIS'
  | 'CHANGE_DETECTION'
  | 'EXPORT';

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  activityType: ActivityType;
  description: string;
  timestamp: string;
}

export interface AuthState {
  currentUser: UserProfile | null;
  loading: boolean;
  error: string | null;
}
