export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, message } = req.body || {};
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing "to" or "message"' });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !token || !from) {
    return res.status(500).json({ error: 'Twilio not configured on the server' });
  }

  const toNum = String(to).startsWith('whatsapp:') ? to : 'whatsapp:' + to;

  const body = new URLSearchParams({
    To: toNum,
    From: from,
    Body: message,
  });

  try {
    const tw = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization:
            'Basic ' + Buffer.from(sid + ':' + token).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    );

    const json = await tw.json();
    if (!tw.ok) {
      return res.status(tw.status).json({
        error: json.message || 'Twilio API error',
        code: json.code,
      });
    }
    return res.status(200).json({ ok: true, sid: json.sid, status: json.status });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
