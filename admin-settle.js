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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
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

    const { marketPercent } = req.body;

    if (!marketPercent || typeof marketPercent !== 'object') {
      return res.status(400).json({ error: '市场数据格式错误' });
    }

    const store = getStore();
    const currentPeriod = store.getCurrentPeriod();
    
    let settledCount = 0;
    const users = store.getAllUsers();

    for (const user of users) {
      if (user.investedProject) {
        const percentage = marketPercent[user.investedProject] || 0;
        const creditBefore = user.credit;
        const creditAfter = creditBefore * (1 + percentage / 100);

        // 更新用户资金
        store.updateUser(user.username, {
          credit: creditAfter,
          investedProject: null
        });

        // 记录历史
        store.addHistory(user.id, {
          period: currentPeriod,
          action: '期结算',
          project: user.investedProject,
          percentage,
          creditBefore,
          creditAfter
        });

        settledCount++;
      }
    }

    const newPeriod = store.incrementPeriod();

    res.json({
      success: true,
      message: '结算完成',
      settledCount,
      newPeriod
    });
  } catch (error) {
    console.error('结算错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
