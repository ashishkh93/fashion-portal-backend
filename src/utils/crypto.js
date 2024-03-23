const crypto = require('crypto');
const config = require('../config/config');

// Encryption and decryption key. Should be 32 bytes for AES-256.
const key = crypto.randomBytes(32);
const algo = config.encryptionAlgo;

const encrypt = (text) => {
  const iv = crypto.randomBytes(12); // Initialization vector.
  const cipher = crypto.createCipheriv(algo, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  // Return the IV, the authentication tag, and the encrypted data, concatenated.
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

const decrypt = (ciphertext) => {
  const components = ciphertext.split(':');
  const iv = Buffer.from(components.shift(), 'hex');
  const authTag = Buffer.from(components.shift(), 'hex');
  const encrypted = components.join(':');

  const decipher = crypto.createDecipheriv(algo, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

module.exports = { encrypt, decrypt };
