'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReelScript } from '@/lib/ai-analyzer';
import { ClipProjectPreviewData, DEMO_PROJECT } from '@/lib/clip-project';
import { APP_NAME } from '@/lib/config';

interface ProcessedResult {
  clipFiles: string[];
  clipUrls: string[];
  downloadUrl: string;
  tableUrl: string;
  fileSize: string;
}

const formatDuration = (seconds: number) => {
  if (!seconds) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

export default function PreviewPage() {
  const router = useRouter();
  const [data, setData] = useState<ClipProjectPreviewData | null>(null);
  const [selectedReels, setSelectedReels] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [processProgress, setProcessProgress] = useState('');
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === '1') {
        setData(DEMO_PROJECT);
        setSelectedReels(new Set(DEMO_PROJECT.reelScripts.map((_, index) => index)));
        return;
      }

      const storedData = localStorage.getItem('previewData');
      if (!storedData) {
        router.push('/');
        return;
      }

      const parsedData = JSON.parse(storedData) as ClipProjectPreviewData;
      setData(parsedData);
      setSelectedReels(new Set(parsedData.reelScripts.map((_, index) => index)));
    } catch (err) {
      console.error('Failed to restore preview data:', err);
      router.push('/');
    }
  }, [router]);

  const toggleReel = (index: number) => {
    const nextSelected = new Set(selectedReels);
    if (nextSelected.has(index)) {
      nextSelected.delete(index);
    } else {
      nextSelected.add(index);
    }
    setSelectedReels(nextSelected);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().split('.').pop();
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    if (!videoExts.includes(ext || '')) {
      setError('Please choose a video file in MP4, MOV, AVI, MKV, or WebM format.');
      return;
    }

    setVideoFile(file);
    setError('');
    setProcessedResult(null);
  };

  const handleUploadAndProcess = async () => {
    if (!videoFile || !data) {
      setError('Choose a source video first.');
      return;
    }

    setUploading(true);
    setError('');
    setProcessedResult(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', videoFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(uploadError.error || 'Video upload failed.');
      }

      const uploadResult = await uploadResponse.json();

      setUploading(false);
      setProcessing(true);
      setProcessProgress('Cutting and merging clips...');

      const selectedScripts = data.reelScripts.filter((_, index) => selectedReels.has(index));
      const processResponse = await fetch('/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoFileName: uploadResult.savedName,
          reelScripts: selectedScripts,
          videoName: data.fileName.replace('.srt', ''),
        }),
      });

      if (!processResponse.ok) {
        const processError = await processResponse.json();
        throw new Error(processError.error || 'Video processing failed.');
      }

      const processResult = await processResponse.json();
      const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      setProcessedResult({
        clipFiles: processResult.clipFiles,
        clipUrls: processResult.clipUrls,
        downloadUrl: processResult.downloadUrl,
        tableUrl: processResult.tableUrl,
        fileSize: formatSize(processResult.finalVideoSize),
      });
    } catch (err: any) {
      setError(err.message || 'Processing failed.');
    } finally {
      setUploading(false);
      setProcessing(false);
      setProcessProgress('');
    }
  };

  const handleBatchDownload = async () => {
    if (!processedResult || processedResult.clipUrls.length === 0) return;

    setDownloadingAll(true);

    try {
      for (let index = 0; index < processedResult.clipUrls.length; index += 1) {
        const url = processedResult.clipUrls[index];
        const fileName = processedResult.clipFiles[index];
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (index < processedResult.clipUrls.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } catch (err) {
      console.error('Batch download failed:', err);
      setError('Batch download failed. Try downloading clips one by one.');
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleExport = () => {
    if (!data) return;

    const selectedScripts = data.reelScripts.filter((_, index) => selectedReels.has(index));
    const csvContent = [
      ['No.', 'Title', 'Start', 'End', 'Voiceover', 'Editing Direction', 'Editorial Value'].join(','),
      ...selectedScripts.map((script, index) => [
        index + 1,
        `"${script.title}"`,
        script.start_time,
        script.end_time,
        `"${(script.voiceover_script || '').replace(/"/g, '""')}"`,
        `"${(script.editing_direction || '').replace(/"/g, '""')}"`,
        `"${(script.originality_elements || []).join('; ').replace(/"/g, '""')}"`,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.fileName.replace('.srt', '')}_clip_plan.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Loading preview...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_rgba(29,32,40,0.05)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                {APP_NAME}
              </p>
              {data.source === 'demo' && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-700">
                  Demo project
                </div>
              )}
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
                  Review the generated clip ideas
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Pick the clips worth exporting, upload the source video, and download a merged cut plus an editor-ready execution table.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Detected</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{data.reelScripts.length}</p>
                <p className="mt-1 text-sm text-slate-600">clip candidates</p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Selected</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{selectedReels.size}</p>
                <p className="mt-1 text-sm text-slate-600">ready to export</p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Transcript</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {data.stats?.subtitleCount ?? 0}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  subtitles · {formatDuration(data.stats?.totalDurationSeconds ?? 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-black/10 bg-slate-950 p-5 text-slate-50">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Source file</p>
              <p className="mt-3 text-lg font-medium">{data.fileName}</p>
              {data.synopsis && (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {data.synopsis}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Next step</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Export the clip plan as CSV, or upload a source video to cut and merge the selected ranges automatically.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_rgba(29,32,40,0.05)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Export</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Cut the source video
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Upload one source file and ClipScript will cut each selected range, merge the clips, and generate an execution table for manual refinement.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {videoFile ? 'Replace source video' : 'Choose source video'}
              </button>

              {videoFile && (
                <div className="rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-slate-700">
                  {videoFile.name} · {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              )}
            </div>

            <p className="text-sm text-slate-500">
              Supported formats: MP4, MOV, AVI, MKV, WebM
            </p>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!processedResult ? (
              <button
                onClick={handleUploadAndProcess}
                disabled={!videoFile || uploading || processing || selectedReels.size === 0}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white transition-all ${
                  !videoFile || selectedReels.size === 0
                    ? 'cursor-not-allowed bg-slate-400'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Uploading source video...
                  </>
                ) : processing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {processProgress || 'Processing clips...'}
                  </>
                ) : (
                  'Cut selected clips'
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Export complete</span>
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                    <h3 className="font-medium text-green-800">Merged video</h3>
                    <a
                      href={processedResult.downloadUrl}
                      download
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download merged video ({processedResult.fileSize})
                    </a>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-medium text-slate-800">
                        Individual clips ({processedResult.clipFiles.length})
                      </h3>
                      <button
                        onClick={handleBatchDownload}
                        disabled={downloadingAll}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-600 disabled:bg-slate-400"
                      >
                        {downloadingAll ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Downloading...
                          </>
                        ) : (
                          'Download all'
                        )}
                      </button>
                    </div>
                    <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
                      {processedResult.clipFiles.map((fileName, index) => (
                        <a
                          key={fileName}
                          href={processedResult.clipUrls[index]}
                          download
                          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors hover:bg-slate-50"
                        >
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span className="truncate">{fileName}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href={processedResult.tableUrl}
                    download
                    className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Download execution table
                  </a>
                  <button
                    onClick={() => {
                      setVideoFile(null);
                      setProcessedResult(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-left text-sm text-slate-600 transition-colors hover:text-slate-950"
                  >
                    Reset export and choose another source file
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_rgba(29,32,40,0.05)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Clip ideas</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Select the clips worth keeping
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Click any card to include or exclude it from the export set.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {data.reelScripts.map((script, index) => (
              <button
                key={`${script.start_time}-${script.end_time}-${index}`}
                type="button"
                className={`w-full rounded-[1.5rem] border-2 bg-white/85 text-left transition-all ${
                  selectedReels.has(index)
                    ? 'border-slate-950 shadow-[0_18px_35px_rgba(15,23,42,0.08)]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => toggleReel(index)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                            selectedReels.has(index)
                              ? 'border-slate-950 bg-slate-950'
                              : 'border-slate-300'
                          }`}
                        >
                          {selectedReels.has(index) && (
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                            {script.start_time} to {script.end_time}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-slate-950">
                            {script.title}
                          </h3>
                        </div>
                      </div>

                      <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
                        {script.voiceover_script && (
                          <div>
                            <p className="font-medium text-slate-900">Voiceover angle</p>
                            <p className="mt-1 leading-6 text-slate-600">{script.voiceover_script}</p>
                          </div>
                        )}

                        {script.subtitle_strategy?.info_captions && script.subtitle_strategy.info_captions.length > 0 && (
                          <div>
                            <p className="font-medium text-slate-900">Context captions</p>
                            <p className="mt-1 leading-6 text-slate-600">
                              {script.subtitle_strategy.info_captions.join('; ')}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-slate-900">Editing direction</p>
                          <p className="mt-1 leading-6 text-slate-600">{script.editing_direction}</p>
                        </div>

                        {script.originality_elements && script.originality_elements.length > 0 && (
                          <div>
                            <p className="font-medium text-slate-900">Editorial value</p>
                            <p className="mt-1 leading-6 text-slate-600">
                              {script.originality_elements.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push('/')}
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Back to upload
          </button>
          <button
            onClick={handleExport}
            disabled={selectedReels.size === 0}
            className={`flex-1 rounded-xl px-6 py-3 text-sm font-medium text-white transition-colors ${
              selectedReels.size === 0
                ? 'cursor-not-allowed bg-slate-400'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            Export clip plan CSV ({selectedReels.size} selected)
          </button>
        </div>
      </div>
    </main>
  );
}
