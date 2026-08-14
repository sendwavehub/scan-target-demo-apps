// VULNERABLE BY DESIGN — XML External Entity Injection (CWE-611).
// This is a deliberately tiny, hand-rolled XML entity resolver (not a real
// XML parser) that reproduces the classic XXE pattern: a DOCTYPE declares
// an external SYSTEM entity, its file contents are read from disk with no
// restriction, and substituted wherever &name; appears in the document.
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3008;
const app = express();
app.use(express.text({ type: ['application/xml', 'text/xml'], limit: '100kb' }));

const secretPath = path.join(__dirname, 'secret.txt');

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>08 — XXE demo</h1>
    <p>POST an XML "contact note" to /import. It supports DOCTYPE/ENTITY
    declarations, and reflects the resolved &note; value back in the response.</p>
    <pre>curl -X POST http://localhost:${PORT}/import -H "Content-Type: application/xml" --data-binary @payload.xml</pre>
    <p>Example payload.xml:</p>
    <pre>&lt;?xml version="1.0"?&gt;
&lt;!DOCTYPE root [ &lt;!ENTITY xxe SYSTEM "file://${secretPath}"&gt; ]&gt;
&lt;note&gt;&amp;xxe;&lt;/note&gt;</pre>
  `);
});

function resolveEntities(xml) {
  const entities = {};
  const entityRe = /<!ENTITY\s+(\w+)\s+SYSTEM\s+"([^"]+)"\s*>/g;
  let m;
  while ((m = entityRe.exec(xml))) {
    const [, name, systemId] = m;
    const filePath = systemId.replace(/^file:\/\//, ''); // BUG: no restriction on which file is read
    try {
      entities[name] = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      entities[name] = `[[failed to resolve entity ${name}: ${err.message}]]`;
    }
  }
  let resolved = xml;
  for (const [name, value] of Object.entries(entities)) {
    resolved = resolved.split(`&${name};`).join(value);
  }
  return resolved;
}

app.post('/import', (req, res) => {
  const xml = req.body || '';
  const resolved = resolveEntities(xml);
  const noteMatch = resolved.match(/<note>([\s\S]*?)<\/note>/);
  res.json({ note: noteMatch ? noteMatch[1] : null, resolvedXml: resolved });
});

app.listen(PORT, () => {
  console.log(`[08-xxe] listening on http://localhost:${PORT}`);
});