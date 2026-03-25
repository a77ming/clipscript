'use client';

import { useEffect, useState } from 'react';
import { APP_NAME, DEFAULT_BASE_URL, DEFAULT_MODEL } from '@/lib/config';

interface ApiKeySettingsProps {
  onApiKeyChange?: (apiKey: string) => void;
}

export default function ApiKeySettings({ onApiKeyChange }: ApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [model, setModel] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modelList, setModelList] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState('');

  useEffect(() => {
    if (apiKey && baseURL) {
      const currentModel = model;
      const timer = setTimeout(() => {
        const loadModels = async () => {
          setLoadingModels(true);
          setModelError('');

          try {
            const response = await fetch('/api/models', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ apiKey, baseURL }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Unable to fetch models.');
            }

            const data = await response.json();
            const models = data.models || [];
            setModelList(models);

            if (models.length > 0 && !models.includes(currentModel)) {
              setModel(models[0]);
            }
          } catch (err: any) {
            console.error('Failed to fetch models:', err);
            setModelError(err.message || 'Could not fetch models. Enter one manually.');
            setModelList([]);
          } finally {
            setLoadingModels(false);
          }
        };

        void loadModels();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [apiKey, baseURL, model]);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    const savedBaseURL = localStorage.getItem('openai_base_url') || '';
    const savedModel = localStorage.getItem('openai_model') || '';
    setApiKey(savedApiKey);
    setBaseURL(savedBaseURL || DEFAULT_BASE_URL);
    setModel(savedModel || DEFAULT_MODEL);
    if (savedApiKey && onApiKeyChange) {
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const normalizeBaseURL = (url: string) => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (!trimmed) return '';
    if (trimmed.endsWith('/v1')) return trimmed;
    return `${trimmed}/v1`;
  };

  const handleSave = () => {
    const normalizedBaseURL = baseURL ? normalizeBaseURL(baseURL) : DEFAULT_BASE_URL;
    localStorage.setItem('openai_api_key', apiKey.trim());
    localStorage.setItem('openai_base_url', normalizedBaseURL);
    localStorage.setItem('openai_model', model.trim() || DEFAULT_MODEL);
    if (onApiKeyChange) {
      onApiKeyChange(apiKey.trim());
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setApiKey('');
    setBaseURL(DEFAULT_BASE_URL);
    setModel(DEFAULT_MODEL);
    setModelList([]);
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('openai_base_url');
    localStorage.removeItem('openai_model');
    if (onApiKeyChange) {
      onApiKeyChange('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-black/10 bg-slate-950 px-4 py-2 text-white shadow-lg transition-colors hover:bg-slate-800"
        title="Model API settings"
      >
        <span className="text-sm font-medium">Model API</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {APP_NAME} settings
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your credentials are stored only in this browser.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  API key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Nothing is stored server-side. Requests go only to the provider you configure.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Base URL
                </label>
                <input
                  type="text"
                  value={baseURL}
                  onChange={(e) => setBaseURL(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Any OpenAI-compatible endpoint works. <code>/v1</code> is auto-appended if missing.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Model
                  {loadingModels && <span className="ml-2 text-blue-500">Loading...</span>}
                </label>

                {modelList.length > 0 ? (
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {modelList.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={loadingModels ? 'Loading model list...' : 'gpt-4o-mini'}
                    disabled={loadingModels}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}

                {modelError && (
                  <p className="mt-2 text-xs text-orange-500">{modelError}</p>
                )}
                {modelList.length > 0 && (
                  <p className="mt-2 text-xs text-green-500">
                    Loaded {modelList.length} models
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={!apiKey}
                  className={`flex-1 rounded-lg px-6 py-3 font-medium text-white ${
                    !apiKey
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                  } transition-all duration-200`}
                >
                  Save
                </button>
                <button
                  onClick={handleClear}
                  className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
