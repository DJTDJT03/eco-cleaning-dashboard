export default function handler(req, res) {
  const clientId = process.env.XERO_CLIENT_ID;
  const redirectUri = process.env.XERO_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return res.status(500).send('Xero not configured on server');
  }
  const scope =
    'offline_access accounting.transactions accounting.contacts.read';
  const state = Math.random().toString(36).slice(2, 10);
  const url =
    'https://login.xero.com/identity/connect/authorize' +
    '?response_type=code' +
    '&client_id=' + encodeURIComponent(clientId) +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&scope=' + encodeURIComponent(scope) +
    '&state=' + state;
  res.setHeader('Location', url);
  res.status(302).end();
}
