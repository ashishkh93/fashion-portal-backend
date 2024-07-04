import { app, handleRequest } from '../src/app'; // Adjust the import path according to your project structure

export default {
  async fetch(request) {
    const req = {
      url: new URL(request.url).pathname,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body: await request.text(),
    };

    const res = await handleRequest(req);

    return new Response(res.body, {
      status: res.status,
      headers: res.headers,
    });
  },
};
