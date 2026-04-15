import { xeroApi } from './_xero.js';

// Pull last 24 months of ACCREC (customer) invoices from Xero with full line items.
export default async function handler(req, res) {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 24);
    const whereClause =
      'Type=="ACCREC" AND Date>=DateTime(' +
      since.getFullYear() + ',' + (since.getMonth() + 1) + ',' + since.getDate() + ')';

    // Iterate pages (Xero returns up to 100 per page when using ?page=)
    const collected = [];
    let page = 1;
    for (;;) {
      const data = await xeroApi(
        'Invoices?where=' + encodeURIComponent(whereClause) + '&page=' + page,
        { method: 'GET' }
      );
      const batch = data.Invoices || [];
      collected.push(...batch);
      if (batch.length < 100) break; // last page
      page += 1;
      if (page > 50) break; // safety
    }

    const invoices = collected.map((i) => ({
      xero_id: i.InvoiceID,
      xero_number: i.InvoiceNumber,
      xero_contact_id: i.Contact && i.Contact.ContactID,
      xero_contact_name: i.Contact && i.Contact.Name,
      date: i.Date ? i.Date.slice(0, 10) : null,
      due_date: i.DueDate ? i.DueDate.slice(0, 10) : null,
      status: i.Status,
      reference: i.Reference || '',
      total: i.Total,
      amount_paid: i.AmountPaid,
      amount_due: i.AmountDue,
      sub_total: i.SubTotal,
      total_tax: i.TotalTax,
      currency: i.CurrencyCode,
      line_items: (i.LineItems || []).map((li) => ({
        desc: li.Description,
        qty: li.Quantity,
        rate: li.UnitAmount,
        account: li.AccountCode,
      })),
    }));

    return res.status(200).json({ ok: true, count: invoices.length, invoices });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
