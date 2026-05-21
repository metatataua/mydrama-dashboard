// netlify/functions/claude-proxy.js
// Proxy для Anthropic Claude API — вирішує CORS проблему

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        // API ключ береться з Netlify Environment Variables (безпечно)
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return { statusCode: response.status, headers, body: JSON.stringify(data) };

  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
