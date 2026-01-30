# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 MCP (Model Context Protocol) 服务器,为 Claude AI 提供多数据库访问能力。支持 SQLite、SQL Server、PostgreSQL 和 MySQL。

## 项目信息

- **包名**: `@cmd233/mcp-database-server`
- **版本**: 1.1.1
- **描述**: MCP server for interacting with SQLite, SQL Server, PostgreSQL and MySQL databases (Fixed nullable field detection)

## TypeScript 配置

- 使用 `NodeNext` 模块系统 (需要 `.js` 扩展名导入)
- 输出目录: `dist/`
- 源码目录: `src/`
- 构建命令会自动设置可执行权限 (`shx chmod +x dist/src/index.js`)

## 核心架构

项目使用**适配器模式**实现多数据库支持:

```
src/index.ts (主入口)
    ↓
src/handlers/ (请求路由层)
    ↓
src/tools/ (工具实现层)
    ↓
src/db/index.ts (数据库管理层)
    ↓
src/db/adapter.ts (适配器接口层)
    ↓
具体适配器实现 (sqlite-adapter.ts, sqlserver-adapter.ts 等)
```

**关键说明**:
- `src/index.ts`: MCP 服务器主入口,处理命令行参数,初始化数据库连接
- `src/handlers/`: MCP 协议层的请求路由,处理工具调用和资源访问
- `src/tools/`: 具体工具实现,包含 SQL 验证和业务逻辑
- `src/db/index.ts`: **数据库管理层**,提供统一的数据库操作 API (`dbAll`, `dbRun`, `dbExec`, `getListTablesQuery`, `getDescribeTableQuery`),屏蔽底层适配器差异,管理全局适配器实例
- `src/db/adapter.ts`: 定义 `DbAdapter` 接口和适配器工厂函数
- 具体适配器: 实现各数据库特定的连接和操作逻辑

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

# SQL Server (支持 Windows 集成认证)
node dist/src/index.js --sqlserver --server <server> --database <db> [--user] [--password] [--port]

# PostgreSQL
node dist/src/index.js --postgresql --host <host> --database <db> [--user] [--password] [--port] [--ssl] [--connection-timeout]

# MySQL
node dist/src/index.js --mysql --host <host> --database <db> --port <port> [--user] [--password] [--ssl] [--connection-timeout]

# MySQL with AWS IAM
node dist/src/index.js --mysql --aws-iam-auth --host <rds> --database <db> --user <user> --aws-region <region>
```

**注意**: SQL Server 在未提供用户名和密码时将使用 Windows 集成认证。

## MCP 工具列表

| 工具 | 功能 | 验证规则 |
|------|------|----------|
| `read_query` | 执行 SELECT 查询 | 必须以 "SELECT" 开头 |
| `write_query` | 执行 INSERT/UPDATE/DELETE | 必须以 "INSERT"、"UPDATE" 或 "DELETE" 开头,不能是 SELECT |
| `create_table` | 创建新表 | 无特定验证 |
| `alter_table` | 修改表结构 | 无特定验证 |
| `drop_table` | 删除表(需要 confirm=true) | 需要确认参数 `confirm=true` |
| `list_tables` | 列出所有表 | 无特定验证 |
| `describe_table` | 获取表结构 | 需要表名参数 |
| `export_query` | 导出查询结果(CSV/JSON) | 必须以 "SELECT" 开头 |
| `append_insight` | 添加业务洞察到备忘录 | 无特定验证 |
| `list_insights` | 列出所有业务洞察 | 无特定验证 |

## MCP 资源列表

服务器提供动态资源以访问数据库表结构:

| 资源 URI 格式 | 功能 |
|---------------|------|
| `{tableName}/schema` | 获取表的结构信息 (列名和数据类型) |

**资源 URI 格式示例**:
- SQLite: `sqlite:///path/to/db/{tableName}/schema`
- SQL Server: `sqlserver://server/{database}/{tableName}/schema`
- PostgreSQL: `postgresql://host/{database}/{tableName}/schema`
- MySQL: `mysql://host/{database}/{tableName}/schema`

## MCP 请求流程

完整的 MCP 请求处理流程:

```
Claude AI 请求工具列表
    ↓
MCP Server → handleListTools() → 返回 10 个工具定义
    ↓
Claude AI 调用工具(带参数)
    ↓
MCP Server → handleToolCall(name, args) → 路由到具体工具函数
    ↓
工具函数 → SQL 验证 → db/index.ts 统一 API → 适配器 → 数据库操作
    ↓
结果逐层返回 → formatSuccessResponse() → 发送给 Claude AI
```

**请求处理细节**:
1. **工具列表阶段**: Claude AI 启动时请求可用工具列表
2. **工具调用阶段**: Claude AI 根据用户请求选择合适的工具并传递参数
3. **SQL 验证**: 工具函数验证 SQL 语句类型是否符合预期
4. **统一 API 层**: `db/index.ts` 提供一致的数据库操作接口
5. **适配器层**: 将通用调用转换为各数据库特定的 SQL 和参数格式
6. **响应格式化**: `formatSuccessResponse()` 将结果标准化为 MCP 响应格式

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

### 适配器实现要点

创建新适配器时需注意:

1. **参数占位符转换**
   - 在 `all()` 和 `run()` 方法中将通用的 `?` 占位符转换为目标数据库格式
   - 确保参数索引从 0 或 1 开始正确对应

2. **lastID 返回**
   - INSERT 操作需正确返回最后插入的 ID
   - **SQL Server**: 使用 `SELECT SCOPE_IDENTITY() AS lastID` 查询
   - **PostgreSQL**: 使用 `RETURNING id` 子句
   - **MySQL/SQLite**: 驱动自动提供 `insertId` 或 `lastID`

3. **可空字段检测**
   - `getDescribeTableQuery()` 返回的 `notnull` 字段: 1 表示 NOT NULL,0 表示可空
   - **常见错误**: SQL Server 的 `IS_NULLABLE` 列返回 'YES'(可空)或'NO'(NOT NULL),需要反向映射
   - 推荐使用 `CASE WHEN IS_NULLABLE = 'NO' THEN 1 ELSE 0 END`

4. **连接管理**
   - 推荐使用连接池而非单连接以提高性能
   - 实现 `close()` 方法以正确释放资源

5. **模块导入**
   - 必须使用 `.js` 扩展名导入相对模块 (TypeScript 编译后要求)
   - 示例: `import { createAdapter } from './adapter.js'`

## 参数占位符转换

不同数据库使用不同的参数占位符,适配器会自动将通用的 `?` 占位符转换为各数据库特定的格式:

| 数据库 | 占位符格式 | 示例 |
|--------|------------|------|
| SQLite | `?` | `SELECT * FROM users WHERE id = ?` |
| SQL Server | `@param0, @param1...` | `SELECT * FROM users WHERE id = @param0` |
| PostgreSQL | `$1, $2...` | `SELECT * FROM users WHERE id = $1` |
| MySQL | `?` | `SELECT * FROM users WHERE id = ?` |

## 已知问题修复

### SQL Server 可空字段检测 (Support_SQL_SERVER 分支)

`src/db/sqlserver-adapter.ts:189` 已修复可空字段检测逻辑:

**错误**:
```sql
CASE WHEN c.IS_NULLABLE = 'YES' THEN 1 ELSE 0 END as notnull
```

**正确**:
```sql
CASE WHEN c.IS_NULLABLE = 'NO' THEN 1 ELSE 0 END as notnull
```

SQL Server 的 `INFORMATION_SCHEMA.COLUMNS.IS_NULLABLE` 列返回 'YES'(可空)或'NO'(NOT NULL),而 `notnull` 字段定义为 1=NOT NULL,0=可空。
