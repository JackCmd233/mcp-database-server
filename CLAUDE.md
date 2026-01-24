# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 MCP (Model Context Protocol) 服务器,为 Claude AI 提供多数据库访问能力。支持 SQLite、SQL Server、PostgreSQL 和 MySQL。

## 核心架构

项目使用**适配器模式**实现多数据库支持:

```
src/index.ts (主入口)
    ↓
src/handlers/ (请求路由层)
    ↓
src/tools/ (工具实现层)
    ↓
src/db/ (数据库适配器层)
```

### 关键接口

所有数据库适配器必须实现 `src/db/adapter.ts` 中定义的 `DbAdapter` 接口:
- `init()` - 初始化连接
- `close()` - 关闭连接
- `all(query, params?)` - 执行查询返回所有结果
- `run(query, params?)` - 执行修改操作
- `exec(query)` - 执行多条 SQL 语句
- `getMetadata()` - 获取数据库元数据
- `getListTablesQuery()` - 获取列出表的查询
- `getDescribeTableQuery(tableName)` - 获取表结构查询

### 数据库适配器

- `src/db/sqlite-adapter.ts` - 使用 `sqlite3` 包,参数占位符 `?`
- `src/db/sqlserver-adapter.ts` - 使用 `mssql` 包,参数占位符自动转换为 `@param0`
- `src/db/postgresql-adapter.ts` - 使用 `pg` 包,参数占位符自动转换为 `$1, $2`
- `src/db/mysql-adapter.ts` - 使用 `mysql2` 包,支持 AWS IAM 认证

## 开发命令

```bash
# 构建
npm run build

# 开发模式(构建+运行)
npm run dev

# 监视模式
npm run watch

# 清理构建目录
npm run clean

# 运行示例
npm run example

# 直接运行已构建的服务器
npm run start
```

## 项目结构

```
src/
├── index.ts              # 主入口,参数解析,服务器初始化
├── db/
│   ├── adapter.ts        # DbAdapter 接口定义和工厂函数
│   ├── index.ts          # 数据库连接管理和导出
│   ├── sqlite-adapter.ts
│   ├── sqlserver-adapter.ts
│   ├── postgresql-adapter.ts
│   └── mysql-adapter.ts
├── handlers/
│   ├── toolHandlers.ts   # 工具调用处理和路由
│   └── resourceHandlers.ts
├── tools/
│   ├── queryTools.ts     # 查询工具(read/write/export)
│   ├── schemaTools.ts    # 架构管理(create/alter/drop/list/describe)
│   └── insightTools.ts   # 业务洞察备忘录
└── utils/
    └── formatUtils.ts    # 响应格式化(CSV/JSON/错误/成功)
```

## 运行服务器

```bash
# SQLite(默认)
node dist/src/index.js /path/to/database.db

# SQL Server
node dist/src/index.js --sqlserver --server <server> --database <db> [--user] [--password]

# PostgreSQL
node dist/src/index.js --postgresql --host <host> --database <db> [--user] [--password] [--port]

# MySQL
node dist/src/index.js --mysql --host <host> --database <db> --port <port> [--user] [--password]

# MySQL with AWS IAM
node dist/src/index.js --mysql --aws-iam-auth --host <rds> --database <db> --user <user> --aws-region <region>
```

## MCP 工具列表

| 工具 | 功能 |
|------|------|
| `read_query` | 执行 SELECT 查询 |
| `write_query` | 执行 INSERT/UPDATE/DELETE |
| `create_table` | 创建新表 |
| `alter_table` | 修改表结构 |
| `drop_table` | 删除表(需要 confirm=true) |
| `list_tables` | 列出所有表 |
| `describe_table` | 获取表结构 |
| `export_query` | 导出查询结果(CSV/JSON) |
| `append_insight` | 添加业务洞察到备忘录 |
| `list_insights` | 列出所有业务洞察 |

## 重要约定

### 日志记录
使用 `stderr` 而不是 `stdout` 进行日志记录,避免干扰 MCP 通信:
```typescript
const logger = {
  log: (...args: any[]) => console.error('[INFO]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  warn: (...args: any[]) => console.error('[WARN]', ...args),
};
```

### 错误处理
- 所有数据库操作使用 `try-catch` 包装
- 错误通过 `stderr` 记录
- 使用 `formatErrorResponse()` 格式化错误响应

### 参数化查询
所有适配器都支持参数化查询以防止 SQL 注入,各数据库使用不同的占位符格式(适配器会自动转换)。

### 添加新数据库支持
如需添加新的数据库支持:
1. 在 `src/db/` 下创建新的适配器文件实现 `DbAdapter` 接口
2. 在 `src/db/adapter.ts` 的 `createAdapter()` 函数中添加新数据库类型
3. 在 `src/index.ts` 中添加相应的命令行参数解析
4. 安装对应的数据库驱动包

## 参数占位符转换

不同数据库使用不同的参数占位符,适配器会自动将通用的 `?` 占位符转换为各数据库特定的格式:

| 数据库 | 占位符格式 | 示例 |
|--------|------------|------|
| SQLite | `?` | `SELECT * FROM users WHERE id = ?` |
| SQL Server | `@param0, @param1...` | `SELECT * FROM users WHERE id = @param0` |
| PostgreSQL | `$1, $2...` | `SELECT * FROM users WHERE id = $1` |
| MySQL | `?` | `SELECT * FROM users WHERE id = ?` |