// Generate a secure random JWT secret
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('base64');
console.log('Generated JWT Secret:');
console.log(secret);
console.log('\nTo set this in production, run:');
console.log(`echo "${secret}" | npx wrangler secret put JWT_SECRET`);
