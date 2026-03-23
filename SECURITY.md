# Security Policy

## API Key Safety
- Never commit your `.env` file or API keys to version control
- Your Anytype API key grants access to all your Anytype data
- Rotate your API key if you suspect it has been compromised:
  Anytype Desktop → Settings → API → Revoke and recreate

## Supported Versions
Only the latest release is actively maintained.

## Reporting a Vulnerability
If you discover a security issue, please open a GitHub issue with the
label `security`. Do not include sensitive information in public issues.

## Scope
This MCP server runs locally and communicates only with the Anytype
desktop app API at localhost:31009. It does not make external network
requests except to localhost.
