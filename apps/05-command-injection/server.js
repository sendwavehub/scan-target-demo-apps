// VULNERABLE BY DESIGN — OS Command Injection (CWE-78).
// User input is concatenated into a shell command string passed to exec().
// This actually runs shell commands on the host — keep this app off any
// shared or internet-facing machine.
const express = require('express');
const { exec } = require('node:child_process');

const PORT = process.env.PORT || 3005;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>05 — Command Injection demo</h1>
    <p>"Network diagnostics" tool: pings a host you provide.</p>
    <form method="POST" action="/ping">
      <input name="host" placeholder="host" value="127.0.0.1; id"><br>
      <button type="submit">Ping</button>
    </form>
    <p>Example curl:<br>
    <code>curl -X POST -d "host=127.0.0.1; id" http://localhost:${PORT}/ping</code></p>
  `);
});

app.post('/ping', (req, res) => {
  const host = req.body.host || '127.0.0.1';
  const cmd = `ping -c 1 ${host}`; // BUG: unsanitized string concatenation into a shell command
  exec(cmd, { timeout: 5000 }, (err, stdout, stderr) => {
    res.json({ cmd, stdout, stderr, error: err ? err.message : null });
  });
});

app.listen(PORT, () => {
  console.log(`[05-command-injection] listening on http://localhost:${PORT}`);
});