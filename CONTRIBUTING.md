# Contributing

Thanks for considering a contribution to ClipScript.

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Quality checks

```bash
npm run lint
npm run build
```

## Scope

Good contribution areas:

- subtitle parsing and transcript ingestion
- clip selection quality
- export workflow polish
- ffmpeg reliability
- UI clarity for creator workflows

## Before opening a PR

1. Keep changes focused.
2. Explain the user-facing impact.
3. Include reproduction steps for bug fixes.
4. Run `npm run lint` and `npm run build`.

## Product direction

ClipScript is intentionally narrow:

> turn subtitles into short-form clips

Changes that strengthen that promise are preferred over broad feature creep.
