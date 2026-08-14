// Spawns every app under ./apps as a child process, each on its documented
// port, and forwards their output to this process's stdout. Ctrl+C stops
// this process and all children together.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const appsDir = path.join(__dirname, 'apps');

const PORTS = {
  '01-sql-injection': 3001,
  '02-xss': 3002,
  '03-idor': 3003,
  '04-broken-auth': 3004,
  '05-command-injection': 3005,
  '06-path-traversal': 3006,
  '07-ssrf': 3007,
  '08-xxe': 3008,
  '09-insecure-deserialization': 3009,
  '10-security-misconfiguration': 3010,
};

const apps = fs
  .readdirSync(appsDir)
  .filter((name) => fs.existsSync(path.join(appsDir, name, 'package.json')));

const children = [];

for (const app of apps) {
  const cwd = path.join(appsDir, app);
  const port = PORTS[app];
  const child = spawn('node', ['server.js'], {
    cwd,
    env: { ...process.env, PORT: String(port) },
    stdio: 'inherit',
  });
  children.push(child);
}

console.log(`\nStarted ${apps.length} apps. Ports: ${Object.values(PORTS).join(', ')}`);
console.log('Press Ctrl+C to stop all of them.\n');

function shutdown() {
  for (const child of children) child.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);