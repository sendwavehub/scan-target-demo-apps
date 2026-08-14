// VULNERABLE BY DESIGN — Broken Authentication.
// 1) Session tokens are sequential and predictable (CWE-330).
// 2) /login has no rate limiting or lockout, so it's brute-forceable (CWE-307).
// 3) Password-reset tokens are deterministic (md5 of username) instead of random.
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('node:crypto');

const PORT = process.env.PORT || 3004;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const users = {
  alice: { password: 'sunshine1' },
  bob: { password: 'football' },
  admin: { password: 'admin' },
};

// BUG: sequential/predictable session identifiers instead of random tokens.
let nextSessionId = 1000;
const sessions = new Map(); // token -> username

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>04 — Broken Authentication demo</h1>
    <h2>1. No brute-force protection</h2>
    <p>POST /login repeatedly with different passwords — there is no lockout or delay.</p>
    <h2>2. Predictable session tokens</h2>
    <p>Session tokens are issued as sequential integers starting near 1000. Log in twice and compare.</p>
    <h2>3. Guessable password reset token</h2>
    <p>GET /reset-token?username=alice returns a token derived only from the username (md5), not a random secret.</p>
    <form method="POST" action="/login">
      <input name="username" placeholder="username" value="alice"><br>
      <input name="password" placeholder="password" value="sunshine1"><br>
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) {
    // No delay, no attempt counter, no lockout — brute-forceable.
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  }
  const token = String(nextSessionId++); // predictable
  sessions.set(token, username);
  res.cookie('session', token);
  return res.json({ ok: true, token });
});

app.get('/whoami', (req, res) => {
  const token = req.cookies.session || req.query.session;
  const username = sessions.get(token);
  if (!username) return res.status(401).json({ error: 'not authenticated' });
  return res.json({ username, token });
});

app.get('/reset-token', (req, res) => {
  const { username = '' } = req.query;
  // BUG: deterministic, guessable reset token — anyone can compute it for
  // any username without ever proving control of that account.
  const token = crypto.createHash('md5').update(username).digest('hex');
  res.json({ username, resetToken: token });
});

app.listen(PORT, () => {
  console.log(`[04-broken-auth] listening on http://localhost:${PORT}`);
});