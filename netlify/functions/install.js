// Validates a Paddle transaction ID and returns the corresponding install link.
// Called from install.html via /api/install?txn=<transaction_id>

const PRICE_TO_THEME = {
  'pri_01kpgxnw6y5q5357mc9vw12amv': 'dark',
  'pri_01kpgxsjn5jxfh0d6zb5tsh0a6': 'light'
};

const DOWNLOAD_LINKS = {
  dark: 'https://www.icloud.com/shortcuts/397d7a86ce1947ca9201bf18d2ed4bee',
  light: 'https://www.icloud.com/shortcuts/af637c2810c240bfac643ee4ed93d733'
};

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  };

  try {
    const txn = (event.queryStringParameters && event.queryStringParameters.txn) || '';

    if (!txn || !/^txn_[a-z0-9]+$/i.test(txn)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing or invalid transaction ID.' })
      };
    }

    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server not configured.' })
      };
    }

    // Look up the transaction on Paddle
    const res = await fetch(`https://api.paddle.com/transactions/${encodeURIComponent(txn)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Transaction not found.' })
      };
    }

    const payload = await res.json();
    const tx = payload.data || {};

    // Only completed/paid transactions grant access
    const okStatuses = ['completed', 'paid', 'billed'];
    if (!okStatuses.includes(tx.status)) {
      return {
        statusCode: 402,
        headers,
        body: JSON.stringify({ error: 'This order is not completed yet.' })
      };
    }

    // Find the purchased price ID
    const items = Array.isArray(tx.items) ? tx.items : [];
    let theme = null;
    for (const item of items) {
      const priceId = item && item.price && item.price.id;
      if (priceId && PRICE_TO_THEME[priceId]) {
        theme = PRICE_TO_THEME[priceId];
        break;
      }
    }

    if (!theme) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No LifeSync product found on this order.' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        theme,
        themeLabel: theme === 'dark' ? 'Dark Mode' : 'Light Mode',
        shortcutName: theme === 'dark' ? 'LifeSync (Dark)' : 'LifeSync (Light)',
        downloadLink: DOWNLOAD_LINKS[theme]
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Something went wrong validating your order.' })
    };
  }
};
