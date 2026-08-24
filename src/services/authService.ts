import type { UserProfile } from '../types/auth';
import { logUserActivity } from './activityService';

const USERS_STORAGE_KEY = 'urban_mapper_users';

// Demo initial users database
const INITIAL_DEMO_USERS: UserProfile[] = [
  {
    uid: 'UID-ADMIN-001',
    fullName: 'Ravi Admin',
    username: 'Ravi',
    email: 'admin@urbanparcel.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-08-24T10:00:00.000Z',
    lastLogin: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    ipAddressMasked: 'IP-7F3A••••',
    networkRegion: 'Chennai, India',
    totalSurveys: 12,
    totalParcels: 148
  },
  {
    uid: 'UID-USER-002',
    fullName: 'Sarah Cadastral Surveyor',
    username: 'sarah_surveyor',
    email: 'sarah@survey.com',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2026-08-20T14:30:00.000Z',
    lastLogin: '2026-08-24T12:10:00.000Z',
    lastActive: '2026-08-24T12:12:00.000Z',
    ipAddressMasked: 'IP-9B2C••••',
    networkRegion: 'New Delhi, India',
    totalSurveys: 8,
    totalParcels: 96
  },
  {
    uid: 'UID-USER-003',
    fullName: 'David Urban Planner',
    username: 'david_planner',
    email: 'david@planning.org',
    role: 'USER',
    status: 'INACTIVE',
    createdAt: '2026-08-15T09:15:00.000Z',
    lastLogin: '2026-08-22T11:00:00.000Z',
    lastActive: '2026-08-22T11:05:00.000Z',
    ipAddressMasked: 'IP-4D8E••••',
    networkRegion: 'Mumbai, India',
    totalSurveys: 3,
    totalParcels: 42
  }
];

export function getAllUsers(): UserProfile[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_USERS));
      return INITIAL_DEMO_USERS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_DEMO_USERS;
  }
}

export function saveUsers(users: UserProfile[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getCurrentUserFromStorage(): UserProfile | null {
  try {
    const data = localStorage.getItem('urban_mapper_current_user');
    return data ? JSON.parse(data) : INITIAL_DEMO_USERS[0]; // Default to Ravi admin demo if empty
  } catch (e) {
    return INITIAL_DEMO_USERS[0];
  }
}

export function setCurrentUserInStorage(user: UserProfile | null) {
  if (user) {
    localStorage.setItem('urban_mapper_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('urban_mapper_current_user');
  }
}

export function updateUserLastActive(uid: string): UserProfile | null {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.uid === uid);
  if (index !== -1) {
    const updated = {
      ...users[index],
      lastActive: new Date().toISOString(),
      status: 'ACTIVE' as const
    };
    users[index] = updated;
    saveUsers(users);
    
    const current = getCurrentUserFromStorage();
    if (current && current.uid === uid) {
      setCurrentUserInStorage(updated);
    }
    return updated;
  }
  return null;
}

export function registerNewUser(data: {
  fullName: string;
  username: string;
  email: string;
}): UserProfile {
  const users = getAllUsers();
  
  // Verify email uniqueness
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const newUser: UserProfile = {
    uid: `UID-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    fullName: data.fullName,
    username: data.username,
    email: data.email,
    role: 'USER', // Always USER role during registration
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    ipAddressMasked: `IP-${Math.random().toString(36).substring(2, 6).toUpperCase()}••••`,
    networkRegion: 'Chennai, India',
    totalSurveys: 0,
    totalParcels: 0
  };

  users.push(newUser);
  saveUsers(users);
  logUserActivity(newUser, 'LOGIN', 'Created new account & logged in.');
  return newUser;
}
