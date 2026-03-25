'use client';

import Link from 'next/link';

export default function DemoProjectButton() {
  return (
    <div className="flex flex-col gap-3 rounded-[1.25rem] border border-black/10 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
          No API key needed
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Open a fully prepared demo project to review generated clips before configuring your own model provider.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/preview?demo=1"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Open demo project
        </Link>
        <a
          href="/examples/founder-confession-demo.srt"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
        >
          Download sample .srt
        </a>
      </div>
    </div>
  );
}
