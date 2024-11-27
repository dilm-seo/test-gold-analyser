import React from 'react';
import { Settings } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export function SettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <Settings className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <select
                value={settings.model}
                onChange={(e) => updateSettings({ model: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Refresh Interval (seconds)
              </label>
              <input
                type="number"
                value={settings.refreshInterval / 1000}
                onChange={(e) => updateSettings({ refreshInterval: Number(e.target.value) * 1000 })}
                min="30"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}