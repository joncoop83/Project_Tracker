const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keys = await redis.keys('client:*');
  const list = [];

  for (const key of keys) {
    const data = await redis.get(key);
    const id = key.replace('client:', '');
    list.push({ id, name: data?.name || id });
  }

  list.sort((a, b) => a.name.localeCompare(b.name));
  res.json(list);
};
