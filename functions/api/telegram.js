export async function onRequest(context) {
  const { request, env } = context;

  // Только POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Можно ограничить по Origin (по желанию)
  const origin = request.headers.get('Origin') || '';
  const allowed = [
    'https://gazelufa-d61.pages.dev',
    // добавь свой кастомный домен, если есть
  ];
  if (origin && !allowed.some(o => origin.startsWith(o))) {
    return new Response('Forbidden', { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { name, phone } = body;

  if (!name || !phone) {
    return new Response(JSON.stringify({ ok: false, error: 'Name and phone required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const text = `🚚 Новая заявка с сайта!\nИмя: ${name}\nТелефон: ${phone}`;

  const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const tgResponse = await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: text
    })
  });

  const data = await tgResponse.json();

  return new Response(JSON.stringify(data), {
    status: tgResponse.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// Обработка preflight (CORS)
export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '*';
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
