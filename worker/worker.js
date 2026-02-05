// Cloudflare Worker — email proxy for Resend
// API key is stored as a Cloudflare secret (RESEND_API_KEY), NOT in code

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const TO_EMAIL = 'sale@svoemore.com.ua';
const FROM_EMAIL = 'noreply@svoemore.com.ua';

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
      const data = await request.json();
      const { name, phone, email, service, message, source } = data;

      if (!name || !phone) {
        return jsonResponse({ error: 'Name and phone are required' }, 400);
      }

      // Build email body
      const subject = source === 'calculator'
        ? `[Калькулятор] Заявка від ${name}`
        : source === 'popup'
          ? `[Зворотній дзвінок] ${name}`
          : `[Сайт] Заявка від ${name}`;

      const html = `
        <h2>${subject}</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
          <tr><td style="padding:8px;font-weight:bold;">Ім'я:</td><td style="padding:8px;">${esc(name)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Телефон:</td><td style="padding:8px;"><a href="tel:${esc(phone)}">${esc(phone)}</a></td></tr>
          ${email ? `<tr><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;">${esc(email)}</td></tr>` : ''}
          ${service ? `<tr><td style="padding:8px;font-weight:bold;">Послуга:</td><td style="padding:8px;">${esc(service)}</td></tr>` : ''}
          ${message ? `<tr><td style="padding:8px;font-weight:bold;">Повідомлення:</td><td style="padding:8px;">${esc(message)}</td></tr>` : ''}
        </table>
        <p style="color:#888;font-size:12px;margin-top:20px;">Відправлено з сайту svoemore.com.ua</p>
      `;

      // Send via Resend API
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: TO_EMAIL,
          subject: subject,
          html: html,
        }),
      });

      if (!resendResponse.ok) {
        const err = await resendResponse.text();
        console.error('Resend error:', err);
        return jsonResponse({ error: 'Failed to send email' }, 500);
      }

      return jsonResponse({ success: true });
    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ error: 'Internal error' }, 500);
    }
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
