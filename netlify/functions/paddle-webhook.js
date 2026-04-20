// Receives transaction.completed webhooks from Paddle and emails the
// customer a unique install link via Resend.

const crypto = require('crypto');

const PRICE_TO_THEME = {
  'pri_01kpgxnw6y5q5357mc9vw12amv': 'dark',
  'pri_01kpgxsjn5jxfh0d6zb5tsh0a6': 'light'
};

const SITE_URL = 'https://lifesyncdots.com';
const FROM_ADDRESS = 'LifeSync <orders@send.lifesyncdots.com>';
const REPLY_TO = 'rana.tahaa123@gmail.com';

// Verify Paddle webhook signature: header format is "ts=...;h1=..."
function verifyPaddleSignature(rawBody, header, secret) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(';').map(p => p.split('=')));
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const signed = `${ts}:${rawBody}`;
  const computed = crypto.createHmac('sha256', secret).update(signed).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(h1));
  } catch {
    return false;
  }
}

function buildEmailHtml({ themeLabel, shortcutName, installUrl }) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;color:#fff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="font-size:24px;font-weight:700;letter-spacing:-0.5px;">LifeSync</div>
        </td></tr>

        <tr><td align="center" style="padding-bottom:8px;">
          <div style="width:56px;height:56px;border-radius:50%;background:rgba(34,197,94,0.15);display:inline-block;line-height:56px;font-size:28px;">✓</div>
        </td></tr>

        <tr><td align="center" style="padding-bottom:12px;">
          <h1 style="margin:0;font-size:24px;font-weight:600;">You're all set.</h1>
        </td></tr>

        <tr><td align="center" style="padding-bottom:32px;">
          <p style="margin:0;color:rgba(255,255,255,0.65);font-size:15px;line-height:22px;">
            Your <strong style="color:#fff;">${themeLabel}</strong> LifeSync wallpaper is ready to install.
          </p>
        </td></tr>

        <tr><td align="center" style="padding-bottom:24px;">
          <a href="${installUrl}" style="display:inline-block;background:#fff;color:#000;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:10px;font-size:15px;">
            Install ${shortcutName}
          </a>
        </td></tr>

        <tr><td style="padding:24px 0;border-top:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0 0 12px;color:rgba(255,255,255,0.85);font-size:14px;line-height:22px;">
            <strong>Having trouble?</strong> Copy and paste this link into your browser:
          </p>
          <p style="margin:0;word-break:break-all;font-size:13px;color:rgba(255,255,255,0.5);">
            <a href="${installUrl}" style="color:rgba(255,255,255,0.55);text-decoration:underline;">${installUrl}</a>
          </p>
        </td></tr>

        <tr><td style="padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0;color:rgba(255,255,255,0.45);font-size:12px;line-height:18px;">
            Save this email — the link never expires, so you can reinstall anytime.
            If you didn't purchase LifeSync, reply to this email and we'll help.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildEmailText({ themeLabel, shortcutName, installUrl }) {
  return `You're all set.

Your ${themeLabel} LifeSync wallpaper is ready to install.

Install ${shortcutName}:
${installUrl}

Save this email — the link never expires, so you can reinstall anytime.

If you didn't purchase LifeSync, reply to this email and we'll help.

— LifeSync`;
}

async function sendEmail({ to, themeLabel, shortcutName, installUrl, apiKey }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      reply_to: REPLY_TO,
      subject: `Your LifeSync ${themeLabel} wallpaper is ready`,
      html: buildEmailHtml({ themeLabel, shortcutName, installUrl }),
      text: buildEmailText({ themeLabel, shortcutName, installUrl })
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  return res.json();
}

exports.handler = async (event) => {
  try {
    const rawBody = event.body || '';
    const signatureHeader = event.headers['paddle-signature'] || event.headers['Paddle-Signature'];

    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    const resendKey = process.env.RESEND_API_KEY;

    if (!secret || !resendKey) {
      console.error('Missing env vars');
      return { statusCode: 500, body: 'Server not configured' };
    }

    if (!verifyPaddleSignature(rawBody, signatureHeader, secret)) {
      console.warn('Invalid Paddle signature');
      return { statusCode: 401, body: 'Invalid signature' };
    }

    const payload = JSON.parse(rawBody);

    // Only act on completed transactions
    if (payload.event_type !== 'transaction.completed') {
      return { statusCode: 200, body: 'Ignored' };
    }

    const tx = payload.data || {};
    const txId = tx.id;
    const items = Array.isArray(tx.items) ? tx.items : [];

    // Find the purchased theme
    let theme = null;
    for (const item of items) {
      const priceId = item && item.price && item.price.id;
      if (priceId && PRICE_TO_THEME[priceId]) {
        theme = PRICE_TO_THEME[priceId];
        break;
      }
    }

    if (!theme) {
      console.log('No matching price id on transaction', txId);
      return { statusCode: 200, body: 'No matching product' };
    }

    // Customer email: Paddle puts it on tx.customer.email or tx.details?
    // For transaction.completed the shape is tx.customer.email when included,
    // otherwise we look it up from tx.customer_id. Try both.
    let email = tx.customer && tx.customer.email;
    if (!email && tx.customer_id && process.env.PADDLE_API_KEY) {
      const cRes = await fetch(`https://api.paddle.com/customers/${tx.customer_id}`, {
        headers: { 'Authorization': `Bearer ${process.env.PADDLE_API_KEY}` }
      });
      if (cRes.ok) {
        const cJson = await cRes.json();
        email = cJson.data && cJson.data.email;
      }
    }

    if (!email) {
      console.error('No customer email for transaction', txId);
      return { statusCode: 200, body: 'No email on record' };
    }

    const themeLabel = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    const shortcutName = theme === 'dark' ? 'LifeSync (Dark)' : 'LifeSync (Light)';
    const installUrl = `${SITE_URL}/install?txn=${encodeURIComponent(txId)}`;

    await sendEmail({
      to: email,
      themeLabel,
      shortcutName,
      installUrl,
      apiKey: resendKey
    });

    console.log(`Sent install email to ${email} for ${txId} (${theme})`);
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('Webhook error:', err && err.message ? err.message : err);
    // Return 200 so Paddle doesn't retry on our bugs; we log and investigate.
    // Use 500 only for transient infra issues where retry helps.
    return { statusCode: 500, body: 'Internal error' };
  }
};
