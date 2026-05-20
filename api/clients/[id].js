const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  const { id } = req.query;
  const key = `client:${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  if (req.method === 'GET') {
    const data = await redis.get(key);
    if (!data) return res.status(404).json({ error: 'not found' });
    return res.json(data);
  }

  if (req.method === 'POST') {
    await redis.set(key, JSON.stringify(req.body));
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    await redis.del(key);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
