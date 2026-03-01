# Security Policy

## Supported Versions

This project tracks the latest code on `main` for security updates.

## Reporting a Vulnerability

Please do not open public issues for sensitive vulnerabilities.

Report security concerns privately via GitHub security advisories for this repository:
- Repository `Security` tab
- `Report a vulnerability`

Include:
- Clear reproduction steps
- Potential impact
- Affected files/paths

## Security Notes

- No application secrets are required for normal operation.
- `.streamlit/secrets.toml` is ignored by git for local secret storage if needed later.
- Keep dependencies up to date and review CI results before merging.
