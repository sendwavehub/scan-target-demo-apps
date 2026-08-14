// VULNERABLE BY DESIGN — Security Misconfiguration (CWE-16).
// Several unrelated misconfigurations bundled into one demo app:
//  - hardcoded secrets shipped in a client-reachable static file
//  - a debug endpoint that dumps environment variables and config
//  - default admin credentials
//  - verbose error responses with stack traces
//  - permissive CORS and no security headers
const express = require('express');
const path = require('node:path');
const config = require('./config');

const PORT = process.env.PORT || 3010;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// BUG: wildcard CORS on every route, including authenticated ones.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// BUG: secrets file served directly to any client.
app.get('/config.js', (req, res) => {
  res.type('application/javascript').sendFile(path.join(__dirname, 'config.js'));
});

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>10 — Security Misconfiguration demo</h1>
    <ul>
      <li><a href="/config.js">/config.js</a> — hardcoded secrets served as a static file</li>
      <li><a href="/debug">/debug</a> — dumps environment variables and internal config</li>
      <li><a href="/admin">/admin</a> — default credentials admin/admin123</li>
      <li><a href="/boom">/boom</a> — triggers an unhandled error with a verbose stack trace</li>
    </ul>
  `);
});

// BUG: unauthenticated debug endpoint exposing environment + secrets.
app.get('/debug', (req, res) => {
  res.json({ env: process.env, config });
});

app.get('/admin', (req, res) => {
  const auth = req.headers.authorization || '';
  const [, encoded] = auth.split(' ');
  if (!encoded) {
    res.setHeader('WWW-Authenticate', 'Basic realm="admin"');
    return res.status(401).send('Login required (try admin / admin123)');
  }
  const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
  // BUG: default credentials still enabled.
  if (user === config.adminUser && pass === config.adminPassword) {
    return res.send('<h1>Welcome, admin</h1><p>You are in.</p>');
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="admin"');
  return res.status(401).send('Invalid credentials');
});

app.get('/boom', (req, res) => {
  throw new Error('Simulated internal failure with a full stack trace');
});

// BUG: verbose error handler leaks stack traces and internals to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    config,
  });
});

app.listen(PORT, () => {
  console.log(`[10-security-misconfiguration] listening on http://localhost:${PORT}`);
});