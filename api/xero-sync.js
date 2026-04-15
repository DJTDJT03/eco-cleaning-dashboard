import { xeroApi } from './_xero.js';

// Returns a map of InvoiceNumber -> { status, amountPaid, amountDue }
// Client uses it to update local invoices (e.g. sent -> paid).
export default async function handler(req, res) {
  try {
    // Pull the last 12 months of ACCREC invoices that are AUTHORISED or PAID
    const since = new Date();
    since.setMonth(since.getMonth() - 12);
    const sinceStr = since.toISOString();
    const data = await xeroApi(
      'Invoices?where=' + encodeURIComponent('Type=="ACCREC" AND Date>=DateTime(' +
        since.getFullYear() + ',' + (since.getMonth() + 1) + ',' + since.getDate() + ')'),
      {
        method: 'GET',
        headers: { 'If-Modified-Since': sinceStr },
      }
    );

    const map = {};
    (data.Invoices || []).forEach((i) => {
      if (!i.InvoiceNumber) return;
      map[i.InvoiceNumber] = {
        status: i.Status,
        amountPaid: i.AmountPaid,
        amountDue: i.AmountDue,
        total: i.Total,
      };
    });

    return res.status(200).json({ ok: true, invoices: map });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
