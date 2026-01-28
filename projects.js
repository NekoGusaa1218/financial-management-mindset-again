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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ error: '未授权' });
  }

  const store = getStore();

  try {
    if (req.method === 'GET') {
      const projects = store.getProjects().map(name => ({ name }));
      return res.json(projects);
    }

    if (req.method === 'POST') {
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: '项目名称不能为空' });
      }

      if (store.projectExists(name)) {
        return res.status(400).json({ error: '项目已存在' });
      }

      store.addProject(name);
      return res.json({ success: true, message: '项目添加成功' });
    }

    if (req.method === 'DELETE') {
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
      }

      const { name } = req.query;
      if (!name) {
        return res.status(400).json({ error: '项目名称不能为空' });
      }

      store.removeProject(name);
      return res.json({ success: true, message: '项目删除成功' });
    }

    res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('项目操作错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
