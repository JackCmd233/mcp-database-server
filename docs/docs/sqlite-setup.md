# SQLite 设置指南

本指南提供了设置和使用 SQLite 适配器与 MCP 数据库服务器的说明。

## 前提条件

1. 无需额外安装 - SQLite 已包含在 MCP 数据库服务器中
2. Node.js 18 或更高版本
3. 有效的 SQLite 数据库文件或创建新数据库的路径

## 使用 SQLite 运行服务器

要连接到 SQLite 数据库,请使用以下命令:

```bash
node dist/src/index.js /path/to/your/database.db
```

如果数据库文件不存在,它将自动创建。

## 配置 Claude Desktop

更新您的 Claude 配置文件以添加 SQLite 支持:

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/database-server",
        "/path/to/your/database.db"
      ]
    }
  }
}
```

对于本地开发:

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-database-server/dist/src/index.js",
        "/path/to/your/database.db"
      ]
    }
  }
}
```

## SQLite 特定功能

### 内存数据库

对于临时内存数据库,使用特殊的 `:memory:` 路径:

```bash
node dist/src/index.js :memory:
```

### 预写日志(WAL)

默认情况下,服务器启用预写日志模式以获得更好的并发性和性能。

### 数据类型

SQLite 使用动态类型,具有以下存储类:
- NULL
- INTEGER
- REAL
- TEXT
- BLOB

## SQL 语法示例

```sql
-- 在 SQLite 中创建表
CREATE TABLE Products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL,
  category TEXT
);

-- 使用 LIMIT 和 OFFSET 查询
SELECT * FROM Products LIMIT 10 OFFSET 20;

-- 日期格式化
SELECT date('now') as today;
SELECT strftime('%Y-%m-%d', date_column) as formatted_date FROM Orders;

-- 字符串连接
SELECT first_name || ' ' || last_name as full_name FROM Customers;
```

## 故障排除

### 数据库被锁定

如果遇到 "数据库被锁定" 错误:
1. 确保没有其他连接正在使用数据库文件
2. 检查文件权限
3. 等待片刻,然后重试操作

### 文件访问问题

如果无法访问数据库文件:
1. 验证文件路径是否正确
2. 检查目录是否存在且可写
3. 确保 Node.js 进程具有适当的权限

## 性能提示

1. 为经常查询的列创建索引
2. 保持事务简短
3. 使用参数化查询以获得更好的性能和安全性
4. 考虑定期执行 VACUUM 操作以回收空间
