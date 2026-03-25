import FileUpload from "@/components/FileUpload";
import { APP_NAME } from "@/lib/config";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel)] shadow-[0_24px_80px_rgba(29,32,40,0.08)] backdrop-blur">
          <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-700">
                Subtitle-first editing
              </div>
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.32em] text-slate-500">
                  {APP_NAME}
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                  Turn subtitles into short-form highlight clips.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Upload an <code>.srt</code> file, let AI identify the strongest story beats,
                  and export a clip plan with hooks, captions, voiceover angles, and
                  one-click video slicing.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-black/10 bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Input
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-900">
                    `.srt` subtitles
                  </p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Output
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-900">
                    Clip briefs + exports
                  </p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Use case
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-900">
                    Shorts, Reels, TikTok
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950 p-5 text-slate-50">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Workflow
                </p>
                <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  <li>1. Upload subtitles and optional context.</li>
                  <li>2. Pick clip count and duration constraints.</li>
                  <li>3. Review AI-selected hooks and editing angles.</li>
                  <li>4. Upload the source video and export deliverables.</li>
                </ol>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-orange-400/15 to-sky-400/15 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Why this direction
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-100">
                  The value proposition is sharp: subtitle-first clip extraction for creators.
                  It is easier to explain than a full editor and easier to ship than a full
                  video generation stack.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_rgba(29,32,40,0.05)] backdrop-blur sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                Start
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Analyze a subtitle file
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Your API key stays in local storage. Configure any OpenAI-compatible provider
              from the settings button in the top-right corner.
            </p>
          </div>

          <FileUpload />
        </section>
      </div>
    </main>
  );
}
