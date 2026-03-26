# OpenAI Application Fill Guide

Updated: 2026-03-26

Primary repo to submit:

- `https://github.com/a77ming/clipscript`

Forms:

- `https://openai.com/zh-Hans-CN/form/codex-for-oss/`
- `https://openai.com/form/codex-open-source-fund/`

## Positioning

This application should be positioned as:

- a real OSS maintainer application
- a creator-tool OSS project with clear maintainer ownership
- an active repository with release, CI, docs, contribution workflow, and roadmap

Do not position it as:

- a growth-hack project
- a fake “top GitHub” play
- a repo with invented usage metrics

If a field asks for stars or downloads, do not invent numbers. Say the project is early but actively maintained, and explain why it matters.

## Before submitting

Prepare these first:

- GitHub username: `a77ming`
- Repo URL: `https://github.com/a77ming/clipscript`
- Role: `Primary maintainer`
- Email: use the email tied to your ChatGPT/OpenAI account
- OpenAI organization ID: copy it from `https://platform.openai.com/settings/organization/general`

Optional supporting links you can mention in notes:

- `https://github.com/microsoft/vscode/pull/305007`
- `https://github.com/microsoft/vscode/pull/305000`
- `https://github.com/microsoft/vscode/pull/304731`
- `https://github.com/microsoft/vscode/pull/304686`

## Codex For OSS

Recommended repo:

- `https://github.com/a77ming/clipscript`

Recommended selections:

- role: `Primary maintainer`
- interests: `Codex Security`
- interests: `Project API credits`

### Field-by-field copy

Surname:

```text
[Your family name]
```

First name:

```text
[Your given name]
```

Email:

```text
[Your OpenAI account email]
```

GitHub username:

```text
a77ming
```

GitHub repository URL:

```text
https://github.com/a77ming/clipscript
```

Role:

```text
Primary maintainer
```

Why does this repository qualify:

```text
ClipScript is an MIT-licensed open-source tool for turning transcript and subtitle files into short-form video clips with AI-generated hooks, captions, and edit briefs. I actively maintain the repo, release process, CI, docs, issue triage, and contributor workflow. It solves a real workflow for creators and small media teams, and contributors can improve evaluation, transcript import, export reliability, and prompt quality.
```

OpenAI organization ID:

```text
org-...
```

How will you use API credits:

```text
I would use API credits to build evaluation fixtures for clip quality, run prompt regression checks, compare cost and latency across model setups, and improve transcript support beyond .srt. The goal is to make ClipScript a more reliable OSS maintainer project with reproducible examples, clearer contributor workflows, and better default settings for creators shipping short-form video.
```

Anything else:

```text
I am building ClipScript as a maintained OSS creator tool and also contributing upstream to major open-source projects, including recent pull requests to microsoft/vscode. My focus is maintainer work that compounds over time: issue triage, release hygiene, CI, contributor guidance, and quality improvements backed by repeatable fixtures instead of demo-only features.
```

### Short fallback versions

If the form behaves oddly or you need a tighter answer, use these.

Why does this repository qualify:

```text
ClipScript is an MIT-licensed OSS tool that turns transcripts and subtitles into short-form clip ideas with AI-generated hooks, captions, and edit briefs. I am the primary maintainer and actively handle releases, CI, docs, roadmap, and issue triage. The repo is public, contributor-ready, and solves a real workflow for creators and small media teams.
```

How will you use API credits:

```text
I will use API credits for evaluation fixtures, prompt regression checks, model cost/latency comparisons, and better transcript support. The goal is to improve reliability, contributor onboarding, and release quality for the open-source project.
```

## Codex Open Source Fund

This form is also worth submitting. It is a good fit for an actively maintained OSS repo even if adoption is still early.

### Field-by-field copy

First name:

```text
[Your given name]
```

Last name:

```text
[Your family name]
```

Email address:

```text
[Your OpenAI account email]
```

LinkedIn URL:

```text
[Your LinkedIn URL or leave blank]
```

GitHub (personal):

```text
https://github.com/a77ming
```

Is there anything else you'd like us to know:

```text
I am the primary maintainer of ClipScript and I am trying to grow it as a durable open-source project, not a one-off demo. In parallel, I am contributing upstream to major OSS repositories including microsoft/vscode, which reflects the kind of maintainer and review work I want to keep doing with stronger tooling support.
```

Which open source project are you representing:

```text
ClipScript
```

Brief description of the project:

```text
ClipScript is an open-source, subtitle-first workflow for turning transcripts into short-form highlight clips. Users can upload subtitle files, generate AI-assisted clip ranges, hooks, captions, and editor-ready notes, then export with a local ffmpeg-based workflow.
```

GitHub repository:

```text
https://github.com/a77ming/clipscript
```

If there are other people working with you on this project, please list their names here, and what role they will play in the project:

```text
Currently the project is maintained primarily by me. As the repo grows, I expect contributors to help with evaluation fixtures, transcript import support, documentation, and QA, but the project direction, releases, and maintainer workflow are currently owned by me.
```

How would you use API credits for your project:

```text
I would use API credits to build a versioned evaluation set for clip selection and caption quality, run regression checks across prompt and model changes, compare cost and latency tradeoffs, and improve transcript handling for messy real-world subtitle files. The credits would directly support maintainership work that improves reliability, contributor onboarding, and release quality for the open-source project.
```

## What not to say

Avoid these mistakes:

- do not claim fake stars, fake downloads, or fake users
- do not say you will use credits for personal experimentation only
- do not describe the repo as just a demo
- do not oversell current adoption if it is still early

## Best narrative

If you need one clean angle for both forms, use this:

```text
I maintain an open-source creator tool that turns transcript-first workflows into short-form video outputs. I want credits and tooling support to improve evaluation, regression testing, release quality, and contributor workflows so the project becomes more useful and more maintainable over time.
```
