# 10 — Security Misconfiguration

Port: `3010`

> **Extra warning:** `GET /debug` dumps the *real* `process.env` of whatever
> machine runs this app — not fake demo data. If your shell has real API
> keys, tokens, or credentials set as environment variables, hitting
> `/debug` will print them to whoever calls it. Run this app in a clean/lab
> shell, and rotate any credential you accidentally exposed this way.

## Vulnerable behavior

- `GET /config.js` — serves a config file with hardcoded API keys/secrets/DB password.
- `GET /debug` — unauthenticated endpoint dumping `process.env` and internal config.
- `GET /admin` — HTTP Basic auth with default credentials `admin` / `admin123`.
- `GET /boom` — triggers an error whose full stack trace and internal config are returned to the client.
- Every response includes a wildcard `Access-Control-Allow-Origin: *` with credentials allowed.

## Example

```bash
curl http://localhost:3010/config.js
curl http://localhost:3010/debug
curl -u admin:admin123 http://localhost:3010/admin
curl http://localhost:3010/boom
```

## What the fix would look like

Never ship secrets to the client; load them from environment/secret
manager server-side only. Remove or auth-protect debug endpoints in any
non-development environment. Disable default accounts. Return generic
error messages to clients and log details server-side instead. Scope CORS
to known origins.