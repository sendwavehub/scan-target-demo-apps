// VULNERABLE BY DESIGN — Server-Side Request Forgery (CWE-918).
// The server fetches an attacker-supplied URL with no allowlist or
// restriction on scheme/host, including internal-only endpoints on itself.
const express = require('express');

const PORT = process.env.PORT || 3007;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>07 — SSRF demo</h1>
    <p>"URL preview" tool fetches any URL you give it, server-side.</p>
    <form method="POST" action="/preview">
      <input name="url" size="60" placeholder="url" value="http://localhost:${PORT}/internal/admin-status"><br>
      <button type="submit">Preview</button>
    </form>
    <p>There's an internal-only endpoint at <code>/internal/admin-status</code> that
    isn't linked anywhere and isn't meant to be reachable from outside this
    server — the /preview endpoint can be used to reach it anyway.</p>
  `);
});

// Simulates an "internal-only" service (e.g. a cloud metadata endpoint or
// internal admin panel) that should never be directly exposed to end users.
app.get('/internal/admin-status', (req, res) => {
  res.json({
    internal: true,
    message: 'This endpoint should only ever be called by trusted internal callers.',
    fakeSecret: 'FLAG{ssrf-reached-internal-endpoint}',
  });
});

app.post('/preview', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });
  try {
    // BUG: no scheme/host allowlist — any URL, including internal/loopback
    // addresses, is fetched on the server's behalf.
    const upstream = await fetch(url, { redirect: 'follow' });
    const text = await upstream.text();
    res.json({ url, status: upstream.status, body: text.slice(0, 2000) });
  } catch (err) {
    res.status(502).json({ url, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[07-ssrf] listening on http://localhost:${PORT}`);
});