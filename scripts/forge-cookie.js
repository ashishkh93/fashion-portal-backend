const crypto = require('crypto');

const SESSION_SECRET = 's3cr3t'; // your secret
const payload = {
  auth: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRocnV2aXQudmFnaGFzaXlhIiwidXNlcl9pZCI6NjExMjYsImNvbXBhbnlfaWQiOjQ2NiwiZW1haWwiOiJkaHJ1dml0LnZhZ2hhc2l5YUB3ZWVuZ2dzLmluIiwiZnVsbE5hbWUiOiJEaHJ1dml0IFZhZ2hhc2l5YSIsInJvbGVfaWQiOjU0MDcsImNmX3Rva2VuIjoiJDJhJDEyJGM4MGRmNWJiMGYxNGE2NmMyM2ZhZnVOM1JMR2pDR3F5Nk1NbWozM2FtM3lRMWkzS3hGYkp5XzBfMCIsImlhdCI6MTc1MDUyNzA4OCwiZXhwIjoxNzUwNTI3Mzg4fQ.FzzLF0gDH2p6kc3isvm8LelO41EUxqRoj323eNElzXw', // ← this is what session.get('auth') will return
};

// 1. Serialize and base64-encode
const json = JSON.stringify(payload);
const b64 = Buffer.from(json).toString('base64');

// 2. Sign it using HMAC with SHA-256
const signature = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64');

// 3. Combine into the full cookie
const sessionCookie = `${encodeURIComponent(b64)}.${encodeURIComponent(signature)}`;
console.log('\nSet in Burp Suite cookie:');
console.log(`_session__240322=${sessionCookie}`);
