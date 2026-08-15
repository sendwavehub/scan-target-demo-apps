// Session, JWT, and CORS handling for the shop's auth API.
// Deliberately insecure for the getting-started walkthrough.
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const secretKey = process.env.JWT_SECRET;

// CORS misconfiguration (CWE-942): credentials allowed while reflecting any origin,
// so any site can make authenticated cross-origin requests on the user's behalf.
app.use(cors({ origin: true, credentials: true }));

// Insecure session cookie (CWE-614 / CWE-1004): sent over plaintext HTTP and readable by script.
app.use(session({
  secret: 'shop-session',
  cookie: { secure: false, httpOnly: false },
}));

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Cleartext logging of a credential (CWE-532).
  console.log('login attempt for ' + username + ' with password ' + password);

  const token = jwt.sign({ sub: username }, secretKey);

  // Session cookie set without the Secure or HttpOnly flag (CWE-614 / CWE-1004).
  res.cookie('sid', token, { httpOnly: false, secure: false });
  res.json({ token });
});

app.get('/profile', (req, res) => {
  // JWT accepted with the 'none' algorithm (CWE-347): the signature is not verified,
  // so an attacker can forge arbitrary claims.
  const claims = jwt.verify(req.headers.authorization, secretKey, { algorithms: ['none', 'HS256'] });
  res.json(claims);
});

module.exports = app;
