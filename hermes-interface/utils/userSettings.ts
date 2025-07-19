import { UserSettings } from '@/types/types';

const USER_SETTINGS_KEY = 'hermes_user_settings';

const defaultSettings: UserSettings = {
  name: 'Evan',
  phone: '705-606-0865',
  address: '123 Your Street, Your City',
};

export function getUserSettings(): UserSettings {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const saved = localStorage.getItem(USER_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all required fields exist
      return {
        name: parsed.name || defaultSettings.name,
        phone: parsed.phone || defaultSettings.phone,
        address: parsed.address || defaultSettings.address,
      };
    }
  } catch (error) {
    console.error('Error loading user settings:', error);
  }

  return defaultSettings;
}

export function saveUserSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving user settings:', error);
  }
}

export function resetUserSettings(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(USER_SETTINGS_KEY);
  } catch (error) {
    console.error('Error resetting user settings:', error);
  }
}