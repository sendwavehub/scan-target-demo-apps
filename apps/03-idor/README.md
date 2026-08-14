# 03 — Insecure Direct Object Reference (IDOR)

Port: `3003`

## Vulnerable endpoint

- `GET /invoices/:id` — checks that a user is logged in, but never checks
  that the requested invoice belongs to that user.

## Example

```bash
curl -c cookies.txt "http://localhost:3003/login?user=alice"
curl -b cookies.txt "http://localhost:3003/invoices/1003"   # bob's invoice, readable as alice
```

## What the fix would look like

Load the invoice, then check `invoice.owner === session.user` (or the
equivalent ownership/role check) before returning it — every object access
must be authorized, not just authenticated.