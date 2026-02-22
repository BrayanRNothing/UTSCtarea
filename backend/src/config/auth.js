const crypto = require('crypto');

// Create a unified exported JWT secret so that if process.env.JWT_SECRET is absent,
// all parts of the application use the same randomly generated secret during runtime.
// WARNING: A randomly generated secret will invalidate all tokens upon server restart!
// To establish persistent tokens across restarts, set a JWT_SECRET environment variable.
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

module.exports = {
    JWT_SECRET
};
