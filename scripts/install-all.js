const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const appsDir = path.join(__dirname, '..', 'apps');
const apps = fs.readdirSync(appsDir).filter((name) =>
  fs.existsSync(path.join(appsDir, name, 'package.json'))
);

for (const app of apps) {
  const cwd = path.join(appsDir, app);
  console.log(`\n=== npm install: ${app} ===`);
  execSync('npm install', { cwd, stdio: 'inherit' });
}

console.log(`\nInstalled dependencies for ${apps.length} apps.`);