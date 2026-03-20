use client;

import { useState } from 'react';
import { useTheme } from '../context/theme';
import { useSettings } from '../context/settings';
import { AiOutlineMoon, AiOutlineSun } from 'react-icons/ai';

export default function Page() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [darkMode, setDarkMode] = useState(settings.darkMode);

  const handleDarkModeChange = () => {
    setDarkMode(!darkMode);
    updateSettings({ darkMode: !darkMode });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className="flex flex-col mb-4">
        <label className="text-lg font-medium mb-2">Dark Mode</label>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={handleDarkModeChange}
            className="mr-2"
          />
          {darkMode ? (
            <AiOutlineMoon size={24} className="text-gray-500" />
          ) : (
            <AiOutlineSun size={24} className="text-gray-500" />
          )}
        </div>
      </div>
      <div className="flex flex-col mb-4">
        <label className="text-lg font-medium mb-2">Notification Preferences</label>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={() =>
                updateSettings({
                  notifications: { ...settings.notifications, email: !settings.notifications.email },
                })
              }
              className="mr-2"
            />
            Email Notifications
          </label>
          <label className="text-sm font-medium mb-1">
            <input
              type="checkbox"
              checked={settings.notifications.inApp}
              onChange={() =>
                updateSettings({
                  notifications: { ...settings.notifications, inApp: !settings.notifications.inApp },
                })
              }
              className="mr-2"
            />
            In-App Notifications
          </label>
        </div>
      </div>
    </div>
  );
}