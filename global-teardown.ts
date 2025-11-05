// global-teardown.ts
import fs from 'fs';
import path from 'path';

async function globalTeardown() {
  const authFile = path.join(__dirname, 'auth.json');
  if (fs.existsSync(authFile)) {
    fs.unlinkSync(authFile);
    console.log('Removed auth.json after tests.');
  }
}

export default globalTeardown;
