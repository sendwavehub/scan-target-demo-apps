// VULNERABLE BY DESIGN — Path Traversal (CWE-22).
// The requested file name is joined onto a base directory without
// validating that the result stays inside that directory.
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3006;
const app = express();

const docsDir = path.join(__dirname, 'docs');

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>06 — Path Traversal demo</h1>
    <p>Serves files out of ./docs by filename.</p>
    <p><a href="/files?name=welcome.txt">/files?name=welcome.txt</a> (intended use)</p>
    <p><a href="/files?name=../secret.txt">/files?name=../secret.txt</a> (escapes ./docs)</p>
  `);
});

app.get('/files', (req, res) => {
  const name = req.query.name || 'welcome.txt';
  const filePath = path.join(docsDir, name); // BUG: no check that filePath stays under docsDir
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ error: 'file not found', path: filePath });
    res.type('text/plain').send(data);
  });
});

app.listen(PORT, () => {
  console.log(`[06-path-traversal] listening on http://localhost:${PORT}`);
});