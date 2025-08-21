# UW Date 平台设置指南

## 快速开始

### 方案 1: 纯前端演示（最简单）

适用于快速演示和测试界面功能。

```bash
cd /Users/hujitao/Desktop/uwdate_copilot

# 使用 Python 启动本地服务器
python3 -m http.server 8000

# 或使用 Node.js
npx serve .

# 访问 http://localhost:8000
```

**特点**:
- ✅ 无需后端配置
- ✅ 界面完全可用
- ⚠️ 数据不会真正保存
- ⚠️ 刷新页面后搜索数据丢失

### 方案 2: 完整后端部署（推荐）

包含真实的数据存储和API功能。

#### 步骤 1: 安装依赖

```bash
cd /Users/hujitao/Desktop/uwdate_copilot/backend
npm install
```

#### 步骤 2: 配置环境变量

```bash
# 创建 .env 文件
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
DB_TYPE=file
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
JWT_SECRET=your_development_secret_here
EOF
```

#### 步骤 3: 启动后端服务

```bash
# 开发模式（自动重启）
npm run dev

# 或生产模式
npm start
```

#### 步骤 4: 启动前端服务

在新的终端窗口中：

```bash
cd /Users/hujitao/Desktop/uwdate_copilot
python3 -m http.server 8080
```

#### 步骤 5: 访问应用

- 前端: http://localhost:8080
- API: http://localhost:3001/api/health

## 详细配置说明

### 后端API配置

#### 环境变量详解

```bash
# 基本配置
NODE_ENV=development          # development | production
PORT=3001                     # API服务端口

# 数据库配置
DB_TYPE=file                  # file | sqlite | postgres
DB_HOST=localhost             # 数据库主机（PostgreSQL）
DB_PORT=5432                  # 数据库端口
DB_NAME=uwdate_db            # 数据库名称
DB_USER=uwdate               # 数据库用户名
DB_PASSWORD=your_password    # 数据库密码

# 文件存储
UPLOAD_DIR=uploads           # 文件上传目录
MAX_FILE_SIZE=10485760       # 最大文件大小（10MB）

# 安全配置
JWT_SECRET=your_jwt_secret   # JWT密钥
BCRYPT_ROUNDS=12            # 密码加密轮数

# 邮件配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# CORS配置
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
```

#### 目录结构

```
uwdate_copilot/
├── backend/
│   ├── server.js              # 主服务器文件
│   ├── package.json           # 依赖配置
│   ├── .env                   # 环境变量
│   ├── data/                  # 数据存储目录
│   │   ├── reviews.json       # 已审核评价
│   │   ├── pending-reviews.json # 待审核评价
│   │   └── reports.json       # 举报记录
│   ├── uploads/               # 文件上传目录
│   │   └── evidence/          # 证据文件
│   └── logs/                  # 日志文件
├── frontend files...          # 前端文件
└── api-client.js             # API客户端
```

### 数据库配置

#### 选项 1: 文件存储（默认）

无需额外配置，数据以JSON文件形式存储在 `backend/data/` 目录中。

#### 选项 2: SQLite

```bash
npm install sqlite3

# 更新 .env
DB_TYPE=sqlite
DB_NAME=uwdate.db
```

#### 选项 3: PostgreSQL

```bash
npm install pg

# 安装 PostgreSQL
brew install postgresql  # macOS
# 或参考其他平台安装指南

# 启动 PostgreSQL
brew services start postgresql

# 创建数据库
createdb uwdate_db

# 更新 .env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uwdate_db
DB_USER=your_username
DB_PASSWORD=your_password
```

### 前端配置

#### API端点配置

编辑 `api-client.js` 中的 `baseURL`:

```javascript
// 开发环境
const uwDateAPI = new UWDateAPI('http://localhost:3001/api');

// 生产环境
const uwDateAPI = new UWDateAPI('https://your-domain.com/api');
```

#### 联系邮箱配置

全局替换所有HTML文件中的邮箱地址：

```bash
# 使用 sed 命令批量替换
find . -name "*.html" -type f -exec sed -i '' 's/uwdate@example.com/your-actual-email@domain.com/g' {} \;
```

或手动编辑以下文件：
- `index.html`
- `submit.html`
- `search-results.html`
- `privacy.html`
- `terms.html`
- `appeal.html`

### Logo和品牌配置

#### 添加UW Logo

1. 获取滑铁卢大学官方Logo图片
2. 重命名为 `uw-logo.png`
3. 放置在项目根目录
4. 确保尺寸适当（建议 32x32px 用于导航栏）

#### 自定义样式

编辑 `styles.css` 来自定义：
- 主题颜色
- 字体样式
- 布局样式

```css
/* 自定义主题色 */
:root {
    --primary-color: #1976d2;
    --secondary-color: #ffd700;
    --success-color: #4caf50;
    --error-color: #f44336;
}
```

## 部署选项

### 1. 本地开发部署

```bash
# 同时启动前后端（使用 concurrently）
npm install -g concurrently

# 在项目根目录创建启动脚本
cat > start-dev.sh << 'EOF'
#!/bin/bash
concurrently \
  "cd backend && npm run dev" \
  "python3 -m http.server 8080"
EOF

chmod +x start-dev.sh
./start-dev.sh
```

### 2. 静态网站部署（无后端）

适用于 Netlify, Vercel, GitHub Pages 等：

```bash
# 部署前端文件
# 不包括 backend/ 目录
# 数据将使用 fallback 模式
```

### 3. 完整部署

#### 使用 PM2（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 在 backend/ 目录创建 ecosystem.config.js
cat > backend/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'uwdate-api',
    script: 'server.js',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

# 启动服务
cd backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 使用 Docker

```bash
# 构建镜像
docker build -t uwdate-app .

# 运行容器
docker run -d \
  --name uwdate \
  -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  uwdate-app
```

#### 使用 Docker Compose

```bash
# 启动完整服务栈
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 4. 云平台部署

#### Heroku 部署

```bash
# 安装 Heroku CLI
brew install heroku/brew/heroku

# 登录并创建应用
heroku login
heroku create uwdate-app

# 配置环境变量
heroku config:set NODE_ENV=production
heroku config:set DB_TYPE=postgres
heroku config:set JWT_SECRET=your_production_secret

# 添加 PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 部署
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 设置环境变量
vercel env add NODE_ENV production
vercel env add DB_TYPE postgres
```

### 5. Nginx 配置（生产环境）

```nginx
# /etc/nginx/sites-available/uwdate
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/uwdate;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 故障排除

### 常见问题

#### 1. CORS 错误
```
Access to fetch at 'http://localhost:3001/api/...' from origin 'http://localhost:8080' has been blocked by CORS policy
```

**解决方案**:
- 确保后端服务器运行在 3001 端口
- 检查 `backend/server.js` 中的 CORS 配置
- 在浏览器开发者工具中确认请求URL正确

#### 2. 文件上传失败
```
Error: ENOENT: no such file or directory, open 'uploads/evidence/...'
```

**解决方案**:
```bash
cd backend
mkdir -p uploads/evidence
chmod 755 uploads
```

#### 3. 数据库连接失败
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案**:
- 确保 PostgreSQL 服务运行: `brew services start postgresql`
- 检查数据库配置: `psql -h localhost -U username -d dbname`
- 验证 `.env` 文件中的数据库配置

#### 4. 端口占用
```
Error: listen EADDRINUSE: address already in use :::3001
```

**解决方案**:
```bash
# 查找占用端口的进程
lsof -ti:3001

# 终止进程
kill -9 $(lsof -ti:3001)

# 或更改端口
export PORT=3002
```

### 日志调试

#### 查看API日志
```bash
cd backend
tail -f logs/combined.log
```

#### 浏览器调试
1. 打开浏览器开发者工具（F12）
2. 查看 Console 选项卡的错误信息
3. 查看 Network 选项卡的API请求状态

### 性能监控

#### 基本监控
```bash
# API 健康检查
curl http://localhost:3001/api/health

# 查看系统资源
top
df -h
```

#### 使用 PM2 监控
```bash
pm2 monit
pm2 logs uwdate-api
pm2 restart uwdate-api
```

## 安全配置

### 1. 环境变量安全
- 永远不要将 `.env` 文件提交到版本控制
- 使用强密码和随机JWT密钥
- 定期轮换密钥

### 2. 文件上传安全
- 限制文件类型和大小
- 扫描上传文件的恶意内容
- 存储文件在非Web访问目录

### 3. 数据库安全
- 使用强密码
- 限制数据库访问IP
- 定期备份数据
- 启用SSL连接

### 4. API安全
- 实现请求频率限制
- 验证所有输入数据
- 记录安全相关操作

这个设置指南提供了从简单演示到生产部署的完整路径。选择适合您需求的部署方案即可开始使用 UW Date 平台。
