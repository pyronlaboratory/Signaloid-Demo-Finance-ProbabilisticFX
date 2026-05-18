import https from 'https';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = process.env['SIGNALOID_API_BASE'] ?? 'api.signaloid.io';
const API_KEY = process.env['SIGNALOID_API_KEY'] ?? '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Fail fast if configuration is missing
  if (!API_KEY) {
    return res.status(500).json({ error: 'Server misconfiguration: Missing or Expired API Key' });
  }

  const upstreamPath = req.url?.replace(/^\/api\/signaloid/, '') ?? '/';

  let method = req.method ?? 'GET';

  if (method === 'POST' && upstreamPath.includes('samples')) {
    method = 'GET';
  }

  const body = req.body ? JSON.stringify(req.body) : undefined;

  try {
    const data = await new Promise<{ status: number; body: string }>((resolve, reject) => {
      const options = {
        hostname: API_BASE,
        path: upstreamPath,
        method,
        headers: {
          Authorization: API_KEY,
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        },
      };

      const request = https.request(options, (upstream) => {
        let responseBody = '';
        upstream.on('data', (chunk) => (responseBody += chunk));
        upstream.on('end', () =>
          resolve({ status: upstream.statusCode ?? 200, body: responseBody }),
        );
      });

      request.on('error', reject);
      if (body) request.write(body);
      request.end();
    });

    // Safely respond back to the client
    res.status(data.status);
    try {
      return res.json(JSON.parse(data.body));
    } catch {
      return res.send(data.body);
    }
  } catch (error: any) {
    // Handles upstream connection drops or timeouts
    return res.status(502).json({
      error: 'Bad Gateway',
      message: error?.message || 'Failed to communicate with upstream Signaloid API.',
    });
  }
}
