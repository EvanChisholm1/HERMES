import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserSettings } from "@/types/types";
import { getUserSettings, saveUserSettings, resetUserSettings } from "@/utils/userSettings";
import { X, User, Phone, MapPin, Save, RotateCcw } from "lucide-react";

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: UserSettings) => void;
}

export function UserSettingsModal({ isOpen, onClose, onSettingsChange }: UserSettingsProps) {
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    phone: '',
    address: '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const userSettings = getUserSettings();
      setSettings(userSettings);
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleChange = (field: keyof UserSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveUserSettings(settings);
    setHasChanges(false);
    onSettingsChange?.(settings);
    
    // Show success feedback
    const button = document.querySelector('[data-save-button]') as HTMLElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Saved!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 1000);
    }
  };

  const handleReset = () => {
    resetUserSettings();
    const defaultSettings = getUserSettings();
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-white">User Settings</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <User className="h-4 w-4" />
              Your Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            />
          </div>

          {/* Address Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <MapPin className="h-4 w-4" />
              Address
            </label>
            <textarea
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter your address"
              rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 resize-none"
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
          <p className="text-blue-200 text-xs">
            This information will be used when the AI assistant makes calls on your behalf. 
            It's stored locally in your browser and never sent to external servers.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            data-save-button
            className="flex-1 flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
          <Button
            onClick={handleReset}
            variant="ghost"
            className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}