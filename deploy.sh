#!/bin/bash

SERVER_IP="173.254.201.204"
SERVER_USER="root"
SERVER_PASSWORD="V5w8pmY2pmdA0U3PZ6"
APP_DIR="/root/jianying-highlight-web"
PORT=3000

echo "开始部署到服务器..."

# 1. 打包项目（使用 standalone 模式）
echo "正在构建项目..."
npm run build:standalone

# 2. 压缩项目文件
echo "正在压缩文件..."
tar -czf deploy.tar.gz .next package.json package-lock.json next.config.js public app api components lib utils tsconfig.json postcss.config.mjs tailwind.config.ts

# 3. 上传到服务器
echo "正在上传到服务器..."
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# 4. 在服务器上部署
echo "正在服务器上部署..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
# 安装 Node.js (如果没有)
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# 安装 PM2 (如果没有)
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 创建应用目录
mkdir -p /root/jianying-highlight-web
cd /root/jianying-highlight-web

# 解压文件
tar -xzf /tmp/deploy.tar.gz

# 安装依赖
npm install --production

# 停止旧进程
pm2 delete jianying-highlight || true

# 启动应用
pm2 start npm --name "jianying-highlight" -- start

# 保存 PM2 配置
pm2 save
pm2 startup

echo "部署完成！"
EOF

# 5. 清理本地临时文件
rm deploy.tar.gz

echo "✅ 部署成功！"
echo "访问地址: http://$SERVER_IP:$PORT"
