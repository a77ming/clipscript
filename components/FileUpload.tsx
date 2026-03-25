'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DemoProjectButton from '@/components/DemoProjectButton';
import { ClipProjectPreviewData } from '@/lib/clip-project';
import { SRTParser } from '@/lib/srt-parser';

export default function FileUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [synopsis, setSynopsis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [maxHighlights, setMaxHighlights] = useState(5);
  const [minDuration, setMinDuration] = useState(8);
  const [maxDuration, setMaxDuration] = useState(15);

  const getApiConfig = () => {
    if (typeof window === 'undefined') return {};
    return {
      apiKey: localStorage.getItem('openai_api_key') || '',
      baseURL: localStorage.getItem('openai_base_url') || '',
      model: localStorage.getItem('openai_model') || '',
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && !selectedFile.name.endsWith('.srt')) {
      setError('Please choose an `.srt` subtitle file.');
      return;
    }
    setFile(selectedFile || null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a subtitle file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const content = await file.text();

      const srtParser = new SRTParser(content);
      const subtitles = srtParser.getSubtitles();
      const stats = srtParser.getStatistics();

      if (subtitles.length === 0) {
        setError('The subtitle file is empty or could not be parsed.');
        return;
      }

      if (maxDuration < minDuration) {
        setError('Max duration must be greater than or equal to min duration.');
        return;
      }

      if (maxHighlights < 1 || maxHighlights > 20) {
        setError('Clip count must stay between 1 and 20.');
        return;
      }

      const apiConfig = getApiConfig();

      if (!apiConfig.apiKey) {
        setError('Set an API key from the top-right settings button first.');
        return;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiConfig.apiKey,
          baseURL: apiConfig.baseURL,
          model: apiConfig.model,
          subtitles,
          synopsis,
          maxHighlights,
          minDuration,
          maxDuration,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed.');
      }

      const reelScripts = result.reelScripts;

      if (!reelScripts || reelScripts.length === 0) {
        setError('AI did not find strong clip candidates. Try a different brief or tighter duration range.');
        return;
      }

      const data: ClipProjectPreviewData = {
        success: true,
        fileName: file.name,
        stats,
        reelScripts,
        srtContent: content,
        synopsis,
        source: 'upload',
        parameters: {
          maxHighlights,
          minDuration,
          maxDuration,
        },
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem('previewData', JSON.stringify(data));
      router.push('/preview');
    } catch (err: any) {
      console.error('Subtitle analysis failed:', err);
      setError(err.message || 'Something went wrong while analyzing the subtitles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-4">
        <DemoProjectButton />
        <div className="rounded-[1.5rem] border border-black/10 bg-white/80 p-8 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Subtitle file <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".srt"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-600
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-slate-100 file:text-slate-700
                  hover:file:bg-slate-200
                  cursor-pointer
                  border border-slate-300 rounded-lg p-3
                  focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Optional creative brief
            </label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Describe the story, target audience, or angle you want the clips to emphasize."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent
                bg-white text-slate-900
                placeholder:text-slate-400
                transition-colors resize-none"
            />
          </div>

          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Clip constraints
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Clip count
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxHighlights}
                  onChange={(e) => setMaxHighlights(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent
                    bg-white text-slate-900
                    text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Min seconds
                </label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  value={minDuration}
                  onChange={(e) => setMinDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent
                    bg-white text-slate-900
                    text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Max seconds
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent
                    bg-white text-slate-900
                    text-sm"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white
              ${loading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-900'
              }
              transition-all duration-200
              flex items-center justify-center gap-2
            `}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Analyzing...
              </>
            ) : (
              'Generate clip ideas'
            )}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
}
