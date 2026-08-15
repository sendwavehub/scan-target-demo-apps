# vulnerable-shop — intentionally insecure sample

> ⚠️ **This code is deliberately vulnerable.** It exists only as a static scan target — a source tree with
> planted issues, not a runnable app. Do not run, deploy, or copy it into a real application.

A tiny cross-language "shop" with one or more planted vulnerabilities per file, meant to be pointed at a
static analysis / SAST tool to confirm it detects each issue in the table below.

## What each file demonstrates

| File | Language | Planted issue(s) |
| --- | --- | --- |
| `src/Data.cs` | C# | An EF `DbContext`/entity (`Customer`, with a privileged `IsAdmin`) — establishes what counts as an entity for over-posting detection |
| `src/CustomersController.cs` | C# | Mass assignment (entity bound as an action parameter, CWE-915) and SQL injection (CWE-89) |
| `web/checkout.js` | JavaScript | Hardcoded secret (CWE-798) and `eval` of request input (CWE-95) |
| `web/auth.js` | JavaScript | Credentialed reflected-origin CORS (CWE-942), insecure session cookie (CWE-614/1004), JWT `none` algorithm (CWE-347), and a password written to a log (CWE-532) |
| `web/app.js.map` | Source map | Exposed source map with `sourcesContent` (CWE-540) — reveals original TypeScript source, including a second hardcoded secret |
| `api/app.py` | Python | Mass assignment via `**request.json` (CWE-915) and `os.system` command injection (CWE-78) |
| `api/crypto.py` | Python | XXE (CWE-611), timing-unsafe HMAC compare (CWE-208), weak RSA key (CWE-326), `tarfile` traversal (CWE-22), deprecated TLS (CWE-327) |
