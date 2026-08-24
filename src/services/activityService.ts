import type { ActivityLog, ActivityType, UserProfile } from '../types/auth';

const LOCAL_LOGS_KEY = 'urban_mapper_activity_logs';

export function getStoredActivityLogs(): ActivityLog[] {
  try {
    const data = localStorage.getItem(LOCAL_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function logUserActivity(
  user: UserProfile | null,
  activityType: ActivityType,
  description: string
): ActivityLog {
  const newLog: ActivityLog = {
    id: `LOG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    userId: user?.uid || 'GUEST',
    username: user?.username || 'Guest User',
    activityType,
    description,
    timestamp: new Date().toISOString()
  };

  try {
    const logs = getStoredActivityLogs();
    const updated = [newLog, ...logs.slice(0, 199)];
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Local log save error:', e);
  }

  return newLog;
}

export function isUserActiveNow(lastActiveIso: string): boolean {
  if (!lastActiveIso) return false;
  try {
    const lastActiveTime = new Date(lastActiveIso).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - lastActiveTime) / (1000 * 60);
    return diffMinutes <= 2.0; // Active within 2 minutes
  } catch (e) {
    return false;
  }
}
