import { writeTokens } from './_xero.js';

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing authorization code');

  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;

  const basic = Buffer.from(clientId + ':' + clientSecret).toString('base64');

  try {
    const tokRes = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + basic,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokens = await tokRes.json();
    if (!tokRes.ok) {
      return res.status(400).send('Token exchange failed: ' + JSON.stringify(tokens));
    }

    // Fetch tenants (Xero organisations this connection has access to)
    const connRes = await fetch('https://api.xero.com/connections', {
      headers: { Authorization: 'Bearer ' + tokens.access_token },
    });
    const connections = await connRes.json();
    if (!Array.isArray(connections) || connections.length === 0) {
      return res.status(400).send('No Xero tenants connected');
    }
    const tenant = connections[0];

    await writeTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in || 1800) * 1000,
      tenant_id: tenant.tenantId,
      tenant_name: tenant.tenantName,
      connected_at: new Date().toISOString(),
    });

    res.setHeader('Location', '/?xero=connected');
    res.status(302).end();
  } catch (e) {
    res.status(500).send('Xero callback error: ' + e.message);
  }
}
