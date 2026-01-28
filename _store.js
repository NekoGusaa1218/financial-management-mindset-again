const bcrypt = require('bcrypt');

// 内存数据存储
class MemoryStore {
  constructor() {
    this.users = new Map();
    this.history = new Map();
    this.projects = new Set(['黄金', '股票', '债券']);
    this.currentPeriod = 1;
    this.historyIdCounter = 1;
    
    this.initialize();
  }

  initialize() {
    // 创建管理员账户
    const adminPassword = bcrypt.hashSync('admin', 10);
    this.users.set('admin', {
      id: 0,
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      credit: 100,
      initialCredit: 100,
      investedProject: null
    });

    // 创建40个普通用户
    const userPassword = bcrypt.hashSync('1234', 10);
    for (let i = 1; i <= 40; i++) {
      const username = `user${i}`;
      this.users.set(username, {
        id: i,
        username,
        password: userPassword,
        role: 'user',
        credit: 100,
        initialCredit: 100,
        investedProject: null
      });
      this.history.set(i, []);
    }
  }

  // 用户操作
  getUser(username) {
    return this.users.get(username);
  }

  getUserById(id) {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  updateUser(username, updates) {
    const user = this.users.get(username);
    if (user) {
      Object.assign(user, updates);
      this.users.set(username, user);
      return true;
    }
    return false;
  }

  getAllUsers() {
    return Array.from(this.users.values()).filter(u => u.role === 'user');
  }

  // 历史记录操作
  addHistory(userId, record) {
    const userHistory = this.history.get(userId) || [];
    userHistory.push({
      id: this.historyIdCounter++,
      userId,
      period: record.period || this.currentPeriod,
      action: record.action,
      project: record.project,
      percentage: record.percentage,
      creditBefore: record.creditBefore,
      creditAfter: record.creditAfter,
      timestamp: new Date()
    });
    this.history.set(userId, userHistory);
  }

  getUserHistory(userId) {
    return this.history.get(userId) || [];
  }

  // 项目操作
  getProjects() {
    return Array.from(this.projects);
  }

  addProject(name) {
    this.projects.add(name);
  }

  removeProject(name) {
    this.projects.delete(name);
  }

  projectExists(name) {
    return this.projects.has(name);
  }

  // 期数操作
  getCurrentPeriod() {
    return this.currentPeriod;
  }

  incrementPeriod() {
    this.currentPeriod++;
    return this.currentPeriod;
  }

  // 结算操作
  settle(marketPercent) {
    let settledCount = 0;
    
    for (const user of this.users.values()) {
      if (user.role === 'user' && user.investedProject) {
        const percentage = marketPercent[user.investedProject] || 0;
        const creditBefore = user.credit;
        const creditAfter = creditBefore * (1 + percentage / 100);

        // 更新用户资金
        user.credit = creditAfter;
        user.investedProject = null;

        // 添加历史记录
        this.addHistory(user.id, {
          period: this.currentPeriod,
          action: '期结算',
          project: user.investedProject || '未知',
          percentage,
          creditBefore,
          creditAfter
        });

        settledCount++;
      }
    }

    this.incrementPeriod();
    return settledCount;
  }
}

// 创建单例
let store = null;

function getStore() {
  if (!store) {
    store = new MemoryStore();
  }
  return store;
}

module.exports = { getStore };
