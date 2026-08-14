# 05 — OS Command Injection

Port: `3005`

## Vulnerable endpoint

- `POST /ping` — builds `ping -c 1 <host>` and passes it to `child_process.exec()`.
  Shell metacharacters in `host` (`;`, `&&`, `|`, `` ` ``, `$()`) let you run
  arbitrary commands.

## Example payload

```bash
curl -X POST http://localhost:3005/ping -d "host=127.0.0.1; id"
curl -X POST http://localhost:3005/ping -d "host=127.0.0.1 && whoami"
```

## What the fix would look like

Use `child_process.execFile('ping', ['-c', '1', host])` (no shell
interpretation of the argument) plus strict input validation (e.g. only
allow characters valid in a hostname/IP).