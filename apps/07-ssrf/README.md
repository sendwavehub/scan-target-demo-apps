# 07 — Server-Side Request Forgery (SSRF)

Port: `3007`

## Vulnerable endpoint

- `POST /preview` — fetches any `url` you provide, server-side, with no
  allowlist on scheme or destination host.

## Example payload

Reach the "internal-only" endpoint that isn't linked from any page and
shouldn't be reachable except from inside the server process:

```bash
curl -X POST http://localhost:3007/preview -d "url=http://localhost:3007/internal/admin-status"
```

## What the fix would look like

Maintain an allowlist of permitted destination hosts/schemes, resolve and
check the destination IP isn't loopback/link-local/private before
connecting, and never let a single service reach its own internal-only
routes over the network without additional auth.