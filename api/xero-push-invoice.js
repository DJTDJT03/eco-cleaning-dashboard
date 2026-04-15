import { xeroApi } from './_xero.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { invoice, client } = req.body || {};
  if (!invoice) return res.status(400).json({ error: 'Missing invoice' });

  try {
    const lineItems = (invoice.items || []).map((it) => ({
      Description: String(it.desc || 'Item').slice(0, 4000),
      Quantity: Number(it.qty) || 1,
      UnitAmount: Number(it.rate) || 0,
      AccountCode: '200',
    }));

    const payload = {
      Invoices: [
        {
          Type: 'ACCREC',
          Contact: { Name: (client && client.name) || invoice.clientName || 'Unknown Customer' },
          Date: invoice.date || new Date().toISOString().slice(0, 10),
          DueDate: invoice.dueDate || undefined,
          InvoiceNumber: invoice.number || undefined,
          Reference: (invoice.notes || '').slice(0, 500),
          Status: 'DRAFT',
          LineAmountTypes: 'Exclusive',
          LineItems: lineItems,
        },
      ],
    };

    const data = await xeroApi('Invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const xinv = (data.Invoices || [])[0];
    return res.status(200).json({
      ok: true,
      xero_invoice_id: xinv && xinv.InvoiceID,
      xero_number: xinv && xinv.InvoiceNumber,
      status: xinv && xinv.Status,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
