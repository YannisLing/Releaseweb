# Cloudflare Pages + D1 迁移方案

## Context
项目当前是 React+Vite 前端 + Express+better-sqlite3 后端，需要迁移到 Cloudflare 全栈部署（Pages 前端 + Pages Functions 后端 + D1 数据库），实现单一域名、全球 CDN、免费额度。

## 后端现状
- 5 个路由文件：auth、practice-progress、events、feelings、records
- 共 22 个 endpoint（详见 server/src/routes/*.js）
- 认证：JWT（jsonwebtoken）+ bcrypt 密码哈希
- 数据库：better-sqlite3，5 张表（users/practice_progress/events/feelings/release_records）
- schema.sql 已有，D1 兼容

## 迁移策略

### 1. 创建 Pages Functions 目录结构
在 `client/functions/api/` 下按文件路径映射路由：

```
client/functions/
  api/
    _middleware.ts          # 全局认证（排除 /api/auth/*）
    auth/
      register.ts           # POST
      login.ts              # POST
      logout.ts             # POST
    practice-progress/
      index.ts              # GET / DELETE
      [practiceId].ts       # GET / PUT
    events/
      index.ts              # GET / POST
      [id].ts               # PUT / DELETE
      practice/[practiceId].ts  # GET
    feelings/
      index.ts              # POST
      [id].ts               # PUT / DELETE
      event/[eventId].ts    # GET
    records/
      index.ts              # GET / POST / DELETE
      [id].ts               # DELETE
      import.ts             # POST
      reset-practice.ts     # POST
```

### 2. 依赖替换
| 原 Node 模块 | Workers 替代 | 安装到 client/ |
|---|---|---|
| express | Pages Functions（onRequest*） | 无需 |
| better-sqlite3 | D1 binding（env.DB） | 无需 |
| jsonwebtoken | jose | `npm i jose` |
| bcrypt | bcryptjs | `npm i bcryptjs` |
| fs/path | 不需要 | 无需 |

### 3. 代码改写模式

**认证中间件** `functions/api/_middleware.ts`：
- 检查 URL 是否包含 `/api/auth/`，是则跳过
- 否则从 `Authorization: Bearer` 提取 token，用 jose 验证
- 设置 `context.data.userId`，后续处理函数通过 `context.data.userId` 读取

**数据库操作模式**：
```ts
// 原 better-sqlite3
const db = getDatabase()
const rows = db.prepare('SELECT * FROM events WHERE user_id = ?').all(userId)
const result = db.prepare('INSERT ...').run(userId, ...)
const id = Number(result.lastInsertRowid)

// D1
const db = context.env.DB
const { results } = await db.prepare('SELECT * FROM events WHERE user_id = ?').bind(userId).all()
const result = await db.prepare('INSERT ...').bind(userId, ...).run()
const id = result.meta.last_row_id
```

**批量导入**（records/import）：D1 不支持 `db.transaction()`，改用 `db.batch()` 一次性执行多条 prepared 语句。

### 4. 配置文件
在 `client/` 下创建 `wrangler.toml`：
```toml
name = "sedona-release"
compatibility_date = "2024-09-01"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "sedona-db"
database_id = "<创建后填入>"

[vars]
JWT_SECRET = "<部署后通过 dashboard 设置>"
```

### 5. 前端改动
- `client/src/services/api.ts` 的 `API_BASE_URL` 已是 `/api`，**无需修改**
- 前端代码完全不动，只改构建产物部署目标

## 执行步骤

1. **安装依赖**：`cd client && npm i jose bcryptjs && npm i -D @types/bcryptjs`
2. **创建 functions/ 目录**：按上述结构创建所有 Pages Function 文件
3. **创建 wrangler.toml**：放在 client/ 下
4. **用户手动操作**（需要 Cloudflare 账号）：
   - `npm i -g wrangler`
   - `wrangler login`（浏览器授权）
   - `wrangler d1 create sedona-db`（获取 database_id）
   - 把 database_id 填入 wrangler.toml
   - `wrangler d1 execute sedona-db --remote --file=../server/src/schema.sql`
   - 在 Cloudflare Dashboard 设置 JWT_SECRET 环境变量
   - `wrangler pages deploy dist`

## 验证方式
1. 本地预览：`npx wrangler pages dev dist --local`（含 D1 本地模拟）
2. 测试注册/登录流程
3. 测试练习 CRUD、事件 CRUD、感受 CRUD
4. 测试释放记录导入/导出/重置
5. 部署后访问 `https://<project>.pages.dev` 验证全流程

## 关键文件清单
- 新建：`client/functions/api/**/*.ts`（约 15 个文件）
- 新建：`client/wrangler.toml`
- 修改：`client/package.json`（加依赖）
- 不动：`client/src/**`（前端代码零修改）
- 不动：`server/**`（原后端保留，不再使用）

## 注意事项
- D1 的 `meta.last_row_id` 返回 number，与 better-sqlite3 的 `lastInsertRowid`（BigInt）不同，需注意类型
- D1 的 `prepare().get()` 返回 `{ results: [...] }`，不是直接返回行
- bcryptjs 比 bcrypt 慢约 30%，但 Workers 有 CPU 时间限制（免费版 10ms/请求），建议 rounds 设为 10
- 现有用户的 bcrypt 哈希可直接用 bcryptjs 验证（兼容）
