import { xeroApi } from './_xero.js';

// Pulls customer contacts from Xero. Returns a lean array the client can merge into its clients list.
export default async function handler(req, res) {
  try {
    const data = await xeroApi('Contacts?where=IsCustomer==true&order=Name', { method: 'GET' });
    const contacts = (data.Contacts || []).map((c) => {
      const phones = (c.Phones || []).filter((p) => p.PhoneNumber);
      const addr = (c.Addresses || []).find((a) => a.AddressLine1) || {};
      const addrLines = [addr.AddressLine1, addr.AddressLine2, addr.City, addr.Region, addr.PostalCode]
        .filter(Boolean)
        .join(', ');
      const phone = phones[0] ? [phones[0].PhoneCountryCode, phones[0].PhoneAreaCode, phones[0].PhoneNumber].filter(Boolean).join(' ') : '';
      return {
        xero_id: c.ContactID,
        name: c.Name,
        first_name: c.FirstName || '',
        last_name: c.LastName || '',
        email: c.EmailAddress || '',
        phone: phone,
        address: addrLines,
      };
    });
    return res.status(200).json({ ok: true, contacts });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
