// netlify/functions/apify-proxy.js
// Proxy для Apify API — вирішує CORS проблему
// Netlify викликає цю функцію як /.netlify/functions/apify-proxy

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action, token, runId, datasetId, hashtags } = JSON.parse(event.body || '{}');

    if (!token) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No Apify token' }) };
    }

    // ACTION 1: Запустити Actor
    if (action === 'start') {
      const res = await fetch(
        `https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/runs?token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hashtags: hashtags || [],
            resultsPerPage: 20,
            shouldDownloadVideos: false,
          }),
        }
      );
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // ACTION 2: Перевірити статус run
    if (action === 'status') {
      const res = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`
      );
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // ACTION 3: Отримати результати
    if (action === 'results') {
      const res = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&limit=20`
      );
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
