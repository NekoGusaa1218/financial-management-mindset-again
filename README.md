# 投资模拟系统 - Vercel 部署版

这是投资模拟系统的 Vercel 无服务器版本，使用内存存储数据。

## 🚀 快速部署到 Vercel

### 方法一：通过 Vercel CLI

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **解压项目**
```bash
# 在您的电脑上创建项目文件夹
mkdir investment-vercel
cd investment-vercel
# 将所有文件放入此文件夹
```

3. **登录 Vercel**
```bash
vercel login
```

4. **部署**
```bash
vercel
```

第一次部署时会询问一些问题，按默认选项即可。

5. **设置环境变量**
```bash
vercel env add JWT_SECRET
# 输入一个安全的密钥，例如: my-super-secret-jwt-key-12345
```

6. **生产部署**
```bash
vercel --prod
```

### 方法二：通过 Vercel 网站

1. 访问 [vercel.com](https://vercel.com)
2. 注册/登录账号
3. 点击 "New Project"
4. 选择 "Import Git Repository" 或直接上传文件夹
5. 在项目设置中添加环境变量：
   - Name: `JWT_SECRET`
   - Value: `your-secret-key-here`
6. 点击 "Deploy"

## 📁 项目结构

```
investment-vercel/
├── api/                    # 无服务器函数
│   ├── _store.js          # 内存数据存储
│   ├── login.js           # 登录API
│   ├── user.js            # 用户信息API
│   ├── history.js         # 历史记录API
│   ├── invest.js          # 投资API
│   ├── projects.js        # 项目管理API
│   ├── admin-users.js     # 管理员-用户列表
│   ├── admin-period.js    # 管理员-期数
│   └── admin-settle.js    # 管理员-结算
├── public/
│   └── index.html         # 前端页面
├── vercel.json            # Vercel配置
├── package.json           # 依赖
└── README.md              # 本文件
```

## 🔌 API 端点

部署后，API将在以下路径可用：

- `POST /api/login` - 登录
- `GET /api/user` - 获取用户信息
- `GET /api/history` - 获取历史记录
- `POST /api/invest` - 确认投资
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 添加项目（管理员）
- `DELETE /api/projects?name=项目名` - 删除项目（管理员）
- `GET /api/admin-users` - 获取所有用户（管理员）
- `GET /api/admin-period` - 获取当前期数（管理员）
- `POST /api/admin-settle` - 执行结算（管理员）

## 🔐 默认账号

- **管理员**: `admin` / `admin`
- **普通用户**: `user1` - `user40` / `1234`

## ⚠️ 重要提示

### 数据持久化限制

**此版本使用内存存储，数据不会永久保存！**

每次 Vercel 函数冷启动时，数据会重置为初始状态。这意味着：

- ✅ 适合演示和测试
- ❌ 不适合生产环境
- ❌ 用户数据会在一段时间不活动后丢失

### 如需数据持久化

如果需要真正的数据持久化，您需要：

1. **使用外部数据库**：
   - MongoDB Atlas（免费层）
   - PostgreSQL（如 Supabase）
   - Firebase Realtime Database
   - PlanetScale（MySQL）

2. **修改 `_store.js`**：
   - 将内存存储替换为数据库连接
   - 所有操作改为异步数据库查询

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run dev
```

本地访问: `http://localhost:3000`

## 📊 功能特性

- ✅ 用户登录认证（JWT）
- ✅ 投资项目选择
- ✅ 投资历史记录
- ✅ 管理员结算系统
- ✅ 收益率计算
- ✅ 无服务器架构
- ✅ 自动扩展

## 🌐 访问您的应用

部署完成后，Vercel 会提供一个 URL，例如：
```
https://your-project-name.vercel.app
```

直接访问这个 URL 即可使用应用！

## 🔧 环境变量

在 Vercel 项目设置中配置：

- `JWT_SECRET`: JWT 签名密钥（必需）

## 📝 更新应用

修改代码后，重新运行：
```bash
vercel --prod
```

或者如果使用 Git：
```bash
git push
```

Vercel 会自动检测更改并重新部署。

## 🐛 故障排查

### 登录失败
- 检查环境变量 `JWT_SECRET` 是否已设置
- 查看 Vercel 控制台的函数日志

### API 错误
- 检查 Vercel 函数日志
- 确认 CORS 设置正确

### 数据丢失
- 这是正常现象（内存存储）
- 考虑升级到数据库存储

## 📦 推荐的数据库升级方案

### MongoDB Atlas（推荐）

1. 注册 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 获取连接字符串
4. 在 Vercel 添加环境变量 `MONGODB_URI`
5. 修改 `_store.js` 使用 MongoDB

### Supabase（PostgreSQL）

1. 注册 [Supabase](https://supabase.com)
2. 创建项目
3. 获取连接信息
4. 使用 Supabase 客户端库

## 📄 许可证

MIT License

---

**开发者**: Claude AI Assistant  
**版本**: 1.0.0 (Vercel)  
**最后更新**: 2026-01-28
