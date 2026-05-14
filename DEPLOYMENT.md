# 圣多娜释放法应用部署指南

## 环境要求

- Node.js >= 18.x
- npm >= 9.x
- PM2 (进程管理器)
- Nginx (反向代理)
- SQLite (已内置)

## 部署步骤

### 1. 克隆项目到服务器

```bash
git clone <your-repo-url>
cd release
```

### 2. 安装依赖

```bash
# 后端依赖
cd server
npm install

# 前端依赖
cd ../client
npm install
```

### 3. 配置环境变量

编辑 `server/.env` 文件：

```env
PORT=4000
JWT_SECRET=your-very-secure-secret-key-here-at-least-32-characters
```

### 4. 构建前端

```bash
cd client
npm run build
```

### 5. 安装 PM2

```bash
npm install -g pm2
```

### 6. 创建日志目录

```bash
mkdir -p logs
```

### 7. 启动后端服务

```bash
pm2 start ecosystem.config.js
```

### 8. 配置 Nginx

复制 nginx.conf 到 Nginx 配置目录：

```bash
sudo cp nginx.conf /etc/nginx/sites-available/sedona
sudo ln -s /etc/nginx/sites-available/sedona /etc/nginx/sites-enabled/
```

编辑 `/etc/nginx/sites-available/sedona`，修改域名：

```nginx
server_name your-domain.com www.your-domain.com;
root /var/www/sedona/client/dist;
```

测试配置并重启 Nginx：

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 9. 配置 HTTPS (推荐)

使用 Let's Encrypt 获取 SSL 证书：

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 10. 设置 PM2 开机自启

```bash
pm2 startup
pm2 save
```

## 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs sedona-server

# 重启服务
pm2 restart sedona-server

# 停止服务
pm2 stop sedona-server
```

## 项目结构

```
release/
├── client/          # 前端 React 应用
│   ├── src/
│   ├── dist/        # 构建产物
│   └── package.json
├── server/          # 后端 Express 服务
│   ├── src/
│   ├── .env         # 环境变量
│   └── package.json
├── logs/            # 日志目录
├── ecosystem.config.js  # PM2 配置
└── nginx.conf       # Nginx 配置
```

## 安全注意事项

1. **务必修改 JWT_SECRET** - 使用至少32位的随机字符串
2. **使用 HTTPS** - 始终在生产环境中使用 SSL/TLS
3. **限制 Nginx 访问** - 配置适当的安全头
4. **定期备份数据库** - SQLite 文件位于 `server/sedona.db`
5. **设置防火墙规则** - 只开放必要的端口(80, 443)

## 数据库备份

```bash
# 备份
cp server/sedona.db server/sedona.db.backup

# 恢复
cp server/sedona.db.backup server/sedona.db
```

## 故障排查

### 服务无法启动

1. 检查端口是否被占用：`netstat -tlnp | grep 4000`
2. 查看 PM2 日志：`pm2 logs sedona-server`
3. 检查 Node.js 版本：`node --version`

### 前端无法访问

1. 检查 Nginx 配置：`sudo nginx -t`
2. 检查 Nginx 日志：`tail -f /var/log/nginx/error.log`
3. 确认前端构建目录存在：`ls -la /var/www/sedona/client/dist`

### API 请求失败

1. 检查后端服务状态：`pm2 status`
2. 测试 API：`curl http://localhost:4000/api/health`
3. 检查 CORS 配置是否正确
