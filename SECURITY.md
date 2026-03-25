# Security Policy

## Supported Versions

Security fixes are provided for the latest published release on the `main` branch.

## Reporting a Vulnerability

Please do not open a public issue for security-sensitive problems.

Instead:

1. Contact the repository owner privately on GitHub.
2. Include steps to reproduce, affected files or routes, and any proof-of-concept details.
3. Allow reasonable time for a fix before public disclosure.

## Scope Notes

- API keys are stored in local browser storage by design.
- This project expects users to configure their own OpenAI-compatible API provider.
- Local video processing depends on `ffmpeg` running on the user's machine.
