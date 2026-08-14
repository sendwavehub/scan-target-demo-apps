// VULNERABLE BY DESIGN — Insecure Direct Object Reference (CWE-639).
// The app checks that a session cookie exists, but never checks that the
// resource being requested actually belongs to that session's user.
const express = require('express');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3003;
const app = express();
app.use(cookieParser());

const invoices = [
  { id: 1001, owner: 'alice', total: 42.5, item: 'Consulting hours' },
  { id: 1002, owner: 'alice', total: 12.0, item: 'Widget x2' },
  { id: 1003, owner: 'bob', total: 999.99, item: 'Annual support contract' },
  { id: 1004, owner: 'bob', total: 5.0, item: 'Sticker pack' },
];

app.get('/', (req, res) => {
  const user = req.cookies.user;
  res.type('html').send(`
    <h1>03 — IDOR demo</h1>
    <p>Current session user: <b>${user || '(none — pick one below)'}</b></p>
    <p><a href="/login?user=alice">Login as alice</a> | <a href="/login?user=bob">Login as bob</a></p>
    <p>Alice's own invoices: <a href="/invoices/1001">/invoices/1001</a>, <a href="/invoices/1002">/invoices/1002</a></p>
    <p>Try, while logged in as alice: <a href="/invoices/1003">/invoices/1003</a> (belongs to bob)</p>
  `);
});

app.get('/login', (req, res) => {
  const user = req.query.user === 'bob' ? 'bob' : 'alice';
  res.cookie('user', user);
  res.redirect('/');
});

app.get('/invoices/:id', (req, res) => {
  const user = req.cookies.user;
  if (!user) {
    return res.status(401).json({ error: 'not logged in — visit /login?user=alice first' });
  }
  const invoice = invoices.find((inv) => inv.id === Number(req.params.id));
  if (!invoice) {
    return res.status(404).json({ error: 'not found' });
  }
  // BUG: no check that invoice.owner === user — any logged-in user can read
  // any other user's invoice just by guessing/incrementing the id.
  return res.json(invoice);
});

app.listen(PORT, () => {
  console.log(`[03-idor] listening on http://localhost:${PORT}`);
});