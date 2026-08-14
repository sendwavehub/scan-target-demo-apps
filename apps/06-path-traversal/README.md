# 06 — Path Traversal

Port: `3006`

## Vulnerable endpoint

- `GET /files?name=` — joins `name` onto `./docs` without checking the
  result stays inside that directory, so `../` sequences escape it.

## Example payload

```bash
curl "http://localhost:3006/files?name=../secret.txt"
```

Returns the contents of `secret.txt`, which lives outside `./docs`.

## What the fix would look like

Resolve the final path and verify it starts with the intended base
directory (`path.resolve` + prefix check), or better, look files up by an
opaque id/allowlist instead of a raw filename.