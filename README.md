# 圣多娜释放法 | Sedona Method

一个帮助用户练习圣多娜释放法（Sedona Method）的情绪释放网站。

An emotion release website to help users practice the Sedona Method.

## 功能特性 | Features

- 📋 完整的圣多娜情绪表（9大类，300+情绪） | Complete Sedona Emotion Chart (9 categories, 300+ emotions)
- 🧘 四步释放法练习流程 | 4-step release practice process
- 🌟 释放法黄金六步骤 | Golden Six Steps of Release Method
- 🔄 呼吸动画辅助练习 | Breathing animation for practice
- 👆 直接从情绪表进入释放流程 | Directly start release from emotion chart
- ✅ 用户可手动切换"所有感受已释放"状态 | Users can manually toggle "all feelings released" status
- 📊 释放记录统计与历史 | Release record statistics and history
- 📱 响应式设计，适配手机/平板/桌面 | Responsive design for mobile/tablet/desktop

## 技术栈 | Tech Stack

- **前端 | Frontend**: React + TypeScript + Vite
- **后端 | Backend**: Node.js + Express
- **数据库 | Database**: SQLite
- **样式 | Styling**: CSS3 (响应式 responsive)

## 项目结构 | Project Structure

```
release/
├── client/                 # React前端 | React frontend
│   ├── src/
│   │   ├── components/   # React组件 | React components
│   │   ├── pages/        # 页面组件 | Page components
│   │   ├── data/        # 静态数据 | Static data
│   │   └── services/    # API服务 | API services
│   └── package.json
├── server/                # Node.js后端 | Node.js backend
│   ├── src/
│   │   ├── routes/      # API路由 | API routes
│   │   └── database.js  # 数据库配置 | Database config
│   └── package.json
└── README.md
```

## 快速开始 | Quick Start

### 1. 启动后端服务 | Start backend service

```bash
cd server
npm install
npm start
```

后端服务将运行在 http://localhost:4000 | Backend service will run on http://localhost:4000

### 2. 启动前端开发服务器 | Start frontend dev server

```bash
cd client
npm install
npm run dev
```

前端服务将运行在 http://localhost:5173 | Frontend service will run on http://localhost:5173

### 3. 访问应用 | Access the app

打开浏览器访问 http://localhost:5173 | Open browser and visit http://localhost:5173

## 圣多娜释放法四步流程 | Sedona Method 4-Step Process

1. **感受情绪** - 感受你现在的情绪 | Feel the emotion - Feel your current emotion
2. **"你能让这种感觉离开吗？"** - 无论是"能"还是"不能"，继续下一步 | "Could you let this feeling go?" - Continue whether "yes" or "no"
3. **"如果能，你愿意让它离开吗？"** - 放手意味着给自己自由 | "Would you let it go?" - Letting go means giving yourself freedom
4. **"你什么时候让它离开呢？"** - 现在就让它离开 | "When?" - Let it go now

## 释放法黄金六步骤 | Golden Six Steps of Release Method

1. 想要不受限制的自由超过想要其它的一切 | Want freedom more than anything else
2. 下一个决定，让自己通过这个方法获得无拘无束，轻松自在 | Decide you can do the method and be free
3. 看到您所有的感受都是三大基本欲望的表现形式：想要被认同/被爱、想要控制、想要安全/生存 | See all your feelings as expressions of three basic wants: approval, control, and survival
4. 随时随地、持续不断地释放 | Release continuously
5. 如果您觉得被困住了，放下想要改变困境的欲望 | If you are stuck, let go of wanting to change the stuckness
6. 随着您释放得越来越多，您变得更轻松愉快、更有活力，直到超越幸福状态，进入不可动摇的宁静和不受限制的自由 | Release more and more and become happier and lighter, until you move beyond happiness into imperturbability and freedom

## API接口 | API Endpoints

| 方法 Method | 路径 Path | 描述 Description |
|-------------|-----------|------------------|
| GET | /api/health | 健康检查 | Health check
| GET | /api/records | 获取所有记录和统计数据 | Get all records and statistics
| POST | /api/records | 创建新记录 | Create new record
| DELETE | /api/records/:id | 删除指定记录 | Delete record by id
| DELETE | /api/records | 清空所有记录 | Clear all records
| GET | /api/events | 获取所有事件 | Get all events
| POST | /api/events | 创建新事件 | Create new event
| PUT | /api/events/:id | 更新事件 | Update event
| DELETE | /api/events/:id | 删除事件 | Delete event
| GET | /api/feelings | 获取所有感受 | Get all feelings
| POST | /api/feelings | 创建新感受 | Create new feeling
| PUT | /api/feelings/:id | 更新感受 | Update feeling
| DELETE | /api/feelings/:id | 删除感受 | Delete feeling
| GET | /api/practice-progress | 获取练习进度 | Get practice progress
| POST | /api/practice-progress | 创建或更新练习进度 | Create or update practice progress

## 情绪分类 | Emotion Categories

- 😶 万念俱灰 | Apathy
- 😢 悲苦 | Grief
- 😨 恐惧 | Fear
- 🤑 贪求 | Greed
- 😠 愤怒 | Anger
- 😏 自尊自傲 | Pride
- 💪 无畏 | Courage
- 🤗 接纳 | Acceptance
- 😌 平和 | Peace

## 三大想要 | Three Basic Wants

- 想要认同/被爱 | Want of approval/love
- 想要控制 | Want of control
- 想要安全/生存 | Want of safety/survival

## 许可证 | License

MIT