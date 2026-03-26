import React, { useState } from 'react';
import { GenerationSettings } from '../../types/workflow.types';

interface SettingsFormProps {
  onSubmit: (settings: GenerationSettings) => void;
  isLoading?: boolean;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ onSubmit, isLoading = false }) => {
  const [settings, setSettings] = useState<GenerationSettings>({
    duration: 10,
    modelMovement: 'walking',
    voiceProfile: 'default',
    audioStyle: 'tts',
    scriptText: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Video Duration</label>
          <select
            value={settings.duration}
            onChange={(e) =>
              setSettings({ ...settings, duration: parseInt(e.target.value) as 5 | 10 | 15 })
            }
            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none border"
          >
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
            <option value={15}>15 seconds</option>
          </select>
        </div>

        {/* Model Movement */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Model Movement</label>
          <select
            value={settings.modelMovement}
            onChange={(e) =>
              setSettings({
                ...settings,
                modelMovement: e.target.value as 'walking' | 'posing',
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none border"
          >
            <option value="walking">Walking</option>
            <option value="posing">Posing</option>
          </select>
        </div>

        {/* Voice Profile */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Voice Profile</label>
          <select
            value={settings.voiceProfile}
            onChange={(e) => setSettings({ ...settings, voiceProfile: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none border"
          >
            <option value="default">Default</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        {/* Audio Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Audio Style</label>
          <select
            value={settings.audioStyle}
            onChange={(e) =>
              setSettings({
                ...settings,
                audioStyle: e.target.value as 'tts' | 'background_music',
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none border"
          >
            <option value="tts">Text-to-Speech</option>
            <option value="background_music">Background Music</option>
          </select>
        </div>
      </div>

      {/* Script Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Script (Optional)</label>
        <textarea
          value={settings.scriptText}
          onChange={(e) => setSettings({ ...settings, scriptText: e.target.value })}
          placeholder="Enter narration script for the video..."
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">Used for text-to-speech narration</p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full rounded-lg bg-blue-600 py-2 px-4 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Generating...' : 'Start Generation'}
      </button>
    </form>
  );
};
