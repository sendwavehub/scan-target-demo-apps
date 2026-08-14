# scan-target-demo-apps

Ten small, self-contained Node.js/Express web apps. Each one is **intentionally
vulnerable** to a single, classic web vulnerability class. They exist as
*test targets* — something to point a security scanner at (e.g. a scan/DAST
tool you're building or evaluating) so you can confirm it detects real,
reproducible issues.

## ⚠️ Safety notice — read first

- These apps contain **deliberate, exploitable vulnerabilities**. That is the
  whole point — do not "fix" them, and do not reuse this code as a starting
  point for a real product.
- Run them **only on localhost / an isolated lab network**. Do not deploy any
  of these to the public internet or a shared/cloud host.
- Only scan or exploit apps you are authorized to test. If you hand this repo
  to other testers, make sure they understand the same rules.
- The command-injection, deserialization, and path-traversal apps execute
  code / read files on the machine they run on. Treat the whole repo like a
  loaded weapon — convenient for target practice, not for the office.
- No real user data, secrets, or third-party services are involved. All
  "secrets" and credentials in this repo are fake demo values.

## What's included

| # | App | Port | Vulnerability class | OWASP / CWE |
|---|-----|------|----------------------|--------------|
| 01 | [sql-injection](apps/01-sql-injection) | 3001 | SQL Injection | A03:2021, CWE-89 |
| 02 | [xss](apps/02-xss) | 3002 | Reflected + Stored XSS | A03:2021, CWE-79 |
| 03 | [idor](apps/03-idor) | 3003 | Broken Access Control (IDOR) | A01:2021, CWE-639 |
| 04 | [broken-auth](apps/04-broken-auth) | 3004 | Broken Authentication | A07:2021, CWE-307/CWE-330 |
| 05 | [command-injection](apps/05-command-injection) | 3005 | OS Command Injection | A03:2021, CWE-78 |
| 06 | [path-traversal](apps/06-path-traversal) | 3006 | Path Traversal | A01:2021, CWE-22 |
| 07 | [ssrf](apps/07-ssrf) | 3007 | Server-Side Request Forgery | A10:2021, CWE-918 |
| 08 | [xxe](apps/08-xxe) | 3008 | XML External Entity Injection | A05:2021, CWE-611 |
| 09 | [insecure-deserialization](apps/09-insecure-deserialization) | 3009 | Insecure Deserialization | A08:2021, CWE-502 |
| 10 | [security-misconfiguration](apps/10-security-misconfiguration) | 3010 | Security Misconfiguration | A05:2021, CWE-16 |

Each app folder has its own `README.md` describing the vulnerable endpoint,
an example payload that triggers it, and what the "fixed" version would look
like conceptually (without actually fixing it here).

## Quick start

Requires Node.js 18+ (built-in `fetch` is used by the SSRF demo).

Install dependencies for every app:

```bash
node scripts/install-all.js
```

Start every app at once (each on its own port from the table above):

```bash
node start-all.js
```

Or run a single app on its own:

```bash
cd apps/01-sql-injection
npm install
npm start
```

Every app serves a landing page at `/` describing its vulnerable
endpoint(s) and a ready-to-use example request.

## Stopping everything

`start-all.js` runs all ten servers in one foreground process — `Ctrl+C`
stops all of them together.