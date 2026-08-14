// VULNERABLE BY DESIGN — hardcoded secrets that end up shipped to clients (CWE-798/CWE-16).
module.exports = {
  apiKey: 'sk_demo_51H8pAbCdEfGhIjKlMnOpQrStUv',
  dbPassword: 'Sup3rSecretDbPass!',
  jwtSigningSecret: 'this-is-a-hardcoded-jwt-secret',
  adminUser: 'admin',
  adminPassword: 'admin123',
};