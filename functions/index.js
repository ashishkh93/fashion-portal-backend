const { app } = require('../src/app'); // Adjust the import according to your project structure

export async function fetch(request) {
  // Create a new request object for your Express app
  const req = {
    url: new URL(request.url).pathname,
    method: request.method,
    headers: request.headers,
    body: await request.text(),
  };

  // Call the handleRequest function defined in app.js
  const response = await handleRequest(req);

  // Return a Cloudflare Worker response
  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
