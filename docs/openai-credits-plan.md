# OpenAI Credits Plan

## Goal

Use API credits to improve ClipScript as a real open-source creator tool, not just as a demo app.

## Workstreams

### 1. Evaluation dataset

Build a small, versioned test set of subtitle files and expected outcomes:

- strong clip candidates
- weak clip candidates
- expected hook styles
- edge cases for timestamps, punctuation, and fragmented subtitles

### 2. Prompt regression checks

Run the same subtitle fixtures through stable prompts and compare:

- clip relevance
- overlap quality
- hook usefulness
- caption clarity
- latency
- token cost

### 3. Model comparison

Benchmark OpenAI-compatible configurations for:

- quality on creator-facing outputs
- consistency across reruns
- usable speed for interactive review
- cost at small-team usage levels

### 4. Contributor enablement

Publish reusable fixtures and example outputs so contributors can:

- reproduce quality changes
- compare prompt revisions
- understand failure cases
- ship features without guessing what “good output” looks like

## Success criteria

- contributors can run the same fixtures and inspect outputs
- prompt changes are evaluated before release notes claim quality improvements
- the project documents which model settings are good default choices for different budgets
- end users get more stable outputs from the OSS version
