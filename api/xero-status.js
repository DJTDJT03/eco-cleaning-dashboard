import { readTokens, clearTokens } from './_xero.js';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    await clearTokens();
    return res.status(200).json({ ok: true, connected: false });
  }
  try {
    const tok = await readTokens();
    if (!tok) return res.status(200).json({ connected: false });
    return res.status(200).json({
      connected: true,
      tenant_name: tok.tenant_name,
      connected_at: tok.connected_at,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
