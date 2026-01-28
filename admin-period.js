const jwt = require('jsonwebtoken');
const { getStore } = require('./_store');

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ error: '未授权' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    const store = getStore();
    const period = store.getCurrentPeriod();

    res.json({ period });
  } catch (error) {
    console.error('获取期数错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
