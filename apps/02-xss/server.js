// VULNERABLE BY DESIGN — Reflected & Stored XSS (CWE-79).
// User input is written into HTML responses without escaping.
const express = require('express');

const PORT = process.env.PORT || 3002;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const guestbook = [
  { name: 'demo', message: 'Welcome to the guestbook!' },
];

app.get('/', (req, res) => {
  const entries = guestbook
    .map((e) => `<li><b>${e.name}</b>: ${e.message}</li>`) // stored XSS: not escaped
    .join('\n');

  res.type('html').send(`
    <h1>02 — XSS demo</h1>

    <h2>Reflected XSS</h2>
    <form method="GET" action="/search">
      <input name="q" placeholder="search" value="<script>alert('reflected-xss')</script>"><br>
      <button type="submit">Search</button>
    </form>

    <h2>Stored XSS — guestbook</h2>
    <form method="POST" action="/messages">
      <input name="name" placeholder="name" value="attacker"><br>
      <input name="message" placeholder="message" value="<img src=x onerror=alert('stored-xss')>"><br>
      <button type="submit">Post</button>
    </form>
    <ul>${entries}</ul>
  `);
});

app.get('/search', (req, res) => {
  const q = req.query.q || '';
  // Reflected XSS: query param echoed back unescaped.
  res.type('html').send(`<h1>Search results for: ${q}</h1><p>No results found.</p>`);
});

app.post('/messages', (req, res) => {
  const { name = 'anonymous', message = '' } = req.body;
  guestbook.push({ name, message });
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`[02-xss] listening on http://localhost:${PORT}`);
});