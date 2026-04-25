# Security Policy

Thanks for helping keep this project safe.

## Supported versions

Right now, security fixes are applied on `main` (the active development branch).

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead:

1. Open a private security advisory through GitHub (preferred), or
2. If advisory tooling isn’t available, open an issue with minimal details and request a private contact path.

When reporting, include:

- What part of the system is affected (backend/frontend/auth/etc.)
- Steps to reproduce
- Expected vs actual behavior
- Potential impact
- Suggested fix (if you have one)

## What to expect from me

I’ll acknowledge valid reports as soon as I can, investigate, and prioritize fixes based on impact.

Because this is currently a solo-maintained project, response times may vary—but I do take security reports seriously.

## Secrets and local config

- Never commit real secrets to the repo.
- Keep local API/base URL config in local env files.
- If you think a secret was leaked, report it immediately so it can be rotated.

## Scope notes

This app is currently in active build-out (Phase 1/2). Some areas are still evolving, but responsible disclosure is still expected and appreciated.