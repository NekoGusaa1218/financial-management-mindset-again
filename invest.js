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

    const { project } = req.body;

    if (!project) {
      return res.status(400).json({ error: '请选择投资项目' });
    }

    const store = getStore();
    const user = store.getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    if (user.investedProject) {
      return res.status(400).json({ error: '您已投资项目，请等待结算' });
    }

    if (!store.projectExists(project)) {
      return res.status(400).json({ error: '投资项目不存在' });
    }

    // 更新用户投资状态
    store.updateUser(user.username, { investedProject: project });

    // 记录历史
    store.addHistory(user.id, {
      action: '确认投资',
      project
    });

    res.json({ success: true, message: '投资成功', project });
  } catch (error) {
    console.error('投资错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
