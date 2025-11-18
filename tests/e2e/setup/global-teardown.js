const fs = require('fs');
const path = require('path');

async function globalTeardown() {
  const authFile = path.resolve(__dirname, '../../../.auth/user.json');

  try {
    if (fs.existsSync(authFile)) {
      fs.unlinkSync(authFile);
    }
  } catch (error) {
  }
}

module.exports = globalTeardown;
