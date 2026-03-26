# OpenAI OSS Application Draft

This file is a working draft for applications such as Codex for OSS and the Open Source Fund.

## Project summary

ClipScript is an open-source, subtitle-first editing tool that helps creators turn transcripts into short-form clips. A user uploads an `.srt` file, chooses clip constraints, and gets AI-generated clip ranges, hooks, captions, voiceover angles, and editor-ready execution notes. The project is useful for podcast teams, interview channels, educators, and operators who already work from transcripts and need a faster path from raw footage to publishable short-form edits.

## Why this project matters

- It lowers the barrier to short-form video production for small creator teams.
- It treats subtitles and transcripts as the primary input, which matches real editorial workflows.
- It combines AI generation with local `ffmpeg` export so users keep control over their media workflow.
- It is open source and designed so contributors can improve prompt quality, evaluation coverage, export reliability, and format support.

## Why OpenAI credits would help

OpenAI credits would be used for development and maintenance work that directly benefits the open-source project:

1. Building an evaluation dataset for clip selection quality, hooks, captions, and edit-brief usefulness.
2. Running regression tests across prompt and model changes so output quality does not drift silently.
3. Comparing cost, latency, and quality tradeoffs across OpenAI-compatible model setups.
4. Prototyping transcript support beyond `.srt`, including messy real-world subtitle files and long-form transcripts.
5. Improving contributor workflows by shipping reproducible example jobs and benchmark outputs.

## Maintainer role

I am the primary maintainer of ClipScript. I handle product direction, issue triage, roadmap planning, releases, documentation, and implementation.

## Current public evidence

- Public GitHub repository with MIT license
- Public release: `v0.1.0`
- CI workflow for lint and build
- Contribution guide, code of conduct, security policy, issue templates, and PR template
- English and Simplified Chinese documentation
- Demo assets and screenshots for fast evaluation

## Near-term roadmap

- Add `.vtt` and plain text transcript import
- Add evaluation fixtures for clip-quality comparisons
- Improve preview and approval workflow before export
- Strengthen batch workflows for creator libraries
- Improve desktop packaging for macOS and Windows

## Short application version

ClipScript is an open-source subtitle-first tool for turning transcripts into short-form clips with AI-generated hooks, captions, and editor-ready ranges. It helps creators and small media teams go from subtitles to Shorts/Reels/TikTok outputs with a local-first workflow built around OpenAI-compatible APIs and `ffmpeg`. I maintain the project and would use OpenAI credits to build evaluation coverage, regression testing, and better transcript support so the OSS project becomes more reliable for contributors and end users.
