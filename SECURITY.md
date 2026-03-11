# Security Policy

## Supported Versions

This project currently supports the latest `main` branch for security fixes.

## Reporting a Vulnerability

Please do **not** open a public issue for suspected security vulnerabilities.

Report privately by contacting the maintainers through the repository security reporting channel (GitHub Security Advisories) when available.

When reporting, include:

- A clear description of the issue
- Reproduction steps or proof-of-concept
- Potential impact
- Suggested remediation (if known)

## Response Targets

- Initial acknowledgment: within 72 hours
- Triage and severity assessment: within 7 days
- Remediation timeline: based on severity and exploitability

## Security Scanning in This Repository

The repository uses a GitHub-native security baseline:

- Dependabot for npm dependency update PRs
- GitHub Actions security workflow for:
  - `npm audit` (fails on high/critical findings)
  - CodeQL JavaScript/TypeScript analysis

CI currently enforces dependency audit failures for high/critical findings.
