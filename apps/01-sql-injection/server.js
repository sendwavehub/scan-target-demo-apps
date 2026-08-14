// VULNERABLE BY DESIGN — SQL Injection (CWE-89).
// User input is concatenated directly into SQL strings. Do not copy this
// pattern into real code; use parameterized queries instead.
const express = require('express');
const initSqlJs = require('sql.js');

const PORT = process.env.PORT || 3001;

async function main() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT, is_admin INTEGER);
    CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, description TEXT, price REAL);
  `);
  db.run(
    `INSERT INTO users (username, password, email, is_admin) VALUES
      ('alice', 'password123', 'alice@example.test', 0),
      ('bob', 'letmein', 'bob@example.test', 0),
      ('admin', 'S3cretAdminPass!', 'admin@example.test', 1);`
  );
  db.run(
    `INSERT INTO products (name, description, price) VALUES
      ('Widget', 'A basic widget', 9.99),
      ('Gadget', 'A fancy gadget', 24.5),
      ('Gizmo', 'Does gizmo things', 14.0);`
  );

  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.type('html').send(`
      <h1>01 — SQL Injection demo</h1>
      <p>Two endpoints build SQL queries by string concatenation.</p>
      <h2>1. Login bypass</h2>
      <form method="POST" action="/login">
        <input name="username" placeholder="username" value="admin' -- "><br>
        <input name="password" placeholder="password" value="anything"><br>
        <button type="submit">Login</button>
      </form>
      <p>Example curl:<br>
      <code>curl -X POST -d "username=admin' -- &password=x" http://localhost:${PORT}/login</code></p>
      <h2>2. Product search (UNION-based)</h2>
      <form method="GET" action="/search">
        <input name="q" placeholder="search" value="' UNION SELECT id,username,password,email FROM users -- "><br>
        <button type="submit">Search</button>
      </form>
    `);
  });

  app.post('/login', (req, res) => {
    const { username = '', password = '' } = req.body;
    const query = `SELECT id, username, email, is_admin FROM users WHERE username = '${username}' AND password = '${password}'`;
    try {
      const result = db.exec(query);
      if (result.length === 0) {
        return res.status(401).json({ ok: false, message: 'Invalid credentials', query });
      }
      const [row] = result[0].values;
      return res.json({ ok: true, user: row, query });
    } catch (err) {
      return res.status(500).json({ error: err.message, query });
    }
  });

  app.get('/search', (req, res) => {
    const q = req.query.q || '';
    const query = `SELECT id, name, description, price FROM products WHERE name LIKE '%${q}%'`;
    try {
      const result = db.exec(query);
      const rows = result.length ? result[0].values : [];
      return res.json({ query, rows });
    } catch (err) {
      return res.status(500).json({ error: err.message, query });
    }
  });

  app.listen(PORT, () => {
    console.log(`[01-sql-injection] listening on http://localhost:${PORT}`);
  });
}

main();