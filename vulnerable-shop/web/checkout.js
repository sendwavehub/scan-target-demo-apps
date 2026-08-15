// Hardcoded secret (CWE-798) and a DOM-based code-execution sink.
const STRIPE_KEY = "FAKE_DEMO_STRIPE_KEY_NOT_A_REAL_SECRET_0123456789";

app.post('/discount', (req, res) => {
  // Reflected code injection (CWE-95): request input reaches eval.
  const rule = req.body.rule;
  const result = eval(rule);
  res.send(String(result));
});
