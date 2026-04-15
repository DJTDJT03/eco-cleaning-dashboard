// Shared Xero helpers - not a public endpoint.

const TOKEN_KEY = 'cb__xeroTokens';

function supabaseHeaders() {
  const key = process.env.SUPABASE_ANON_KEY;
  return {
    apikey: key,
    Authorization: 'Bearer ' + key,
    'Content-Type': 'application/json',
  };
}

export async function readTokens() {
  const url = `${process.env.SUPABASE_URL}/rest/v1/app_data?key=eq.${TOKEN_KEY}&select=*`;
  const res = await fetch(url, { headers: supabaseHeaders() });
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0].value || null;
}

export async function writeTokens(tok) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/app_data`;
  const body = JSON.stringify({
    key: TOKEN_KEY,
    value: tok,
    updated_at: new Date().toISOString(),
  });
  // Upsert
  await fetch(url, {
    method: 'POST',
    headers: { ...supabaseHeaders(), Prefer: 'resolution=merge-duplicates' },
    body,
  });
}

export async function clearTokens() {
  const url = `${process.env.SUPABASE_URL}/rest/v1/app_data?key=eq.${TOKEN_KEY}`;
  await fetch(url, { method: 'DELETE', headers: supabaseHeaders() });
}

export async function getValidAccessToken() {
  const tok = await readTokens();
  if (!tok) throw new Error('Not connected to Xero');
  if (Date.now() < tok.expires_at - 60_000) return tok;

  const basic = Buffer.from(
    process.env.XERO_CLIENT_ID + ':' + process.env.XERO_CLIENT_SECRET
  ).toString('base64');
  const res = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + basic,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tok.refresh_token,
    }),
  });
  const fresh = await res.json();
  if (!res.ok) throw new Error('Xero token refresh failed: ' + JSON.stringify(fresh));

  const next = {
    ...tok,
    access_token: fresh.access_token,
    refresh_token: fresh.refresh_token,
    expires_at: Date.now() + (fresh.expires_in || 1800) * 1000,
  };
  await writeTokens(next);
  return next;
}

export async function xeroApi(path, opts = {}) {
  const tok = await getValidAccessToken();
  const res = await fetch('https://api.xero.com/api.xro/2.0/' + path, {
    ...opts,
    headers: {
      Authorization: 'Bearer ' + tok.access_token,
      'Xero-tenant-id': tok.tenant_id,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.Detail || data.Message || data.Title || JSON.stringify(data);
    throw new Error('Xero API ' + res.status + ': ' + msg);
  }
  return data;
}
