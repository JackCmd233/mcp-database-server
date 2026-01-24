# MCP 数据库服务器的 PostgreSQL 设置

本文档描述了如何设置和使用 PostgreSQL 适配器与 MCP 数据库服务器。

## 前提条件

1. 您需要在系统或远程服务器上安装并运行 PostgreSQL。
2. 确保安装了 pg 包:

```
npm install pg
npm install @types/pg --save-dev
```

## 使用 PostgreSQL 运行服务器

要连接到 PostgreSQL 数据库,请使用以下命令行参数:

```bash
# 基本连接
node dist/src/index.js --postgresql --host localhost --database yourdb --user postgres --password yourpassword

# 使用自定义端口(默认为 5432)
node dist/src/index.js --postgresql --host localhost --database yourdb --user postgres --password yourpassword --port 5433

# 启用 SSL
node dist/src/index.js --postgresql --host localhost --database yourdb --user postgres --password yourpassword --ssl true

# 使用自定义连接超时(以毫秒为单位)
node dist/src/index.js --postgresql --host localhost --database yourdb --user postgres --password yourpassword --connection-timeout 60000
```

## 命令行参数

- `--postgresql` 或 `--postgres`: 指定要连接到 PostgreSQL 数据库。
- `--host`: PostgreSQL 服务器的主机名或 IP 地址(必需)。
- `--database`: 要连接的数据库名称(必需)。
- `--user`: 要进行身份验证的 PostgreSQL 用户。
- `--password`: PostgreSQL 用户的密码。
- `--port`: PostgreSQL 服务器正在侦听的端口(默认: 5432)。
- `--ssl`: 是否对连接使用 SSL(true/false)。
- `--connection-timeout`: 连接超时(以毫秒为单位)(默认: 30000)。

## 从 MCP 客户端使用

MCP 客户端可以使用与 SQLite 和 SQL Server 可用的相同工具与 PostgreSQL 数据库交互。服务器会自动将通用 SQL 查询转换为 PostgreSQL 特定格式。

## 支持的功能

- 完整的 SQL 查询支持,用于 SELECT、INSERT、UPDATE 和 DELETE 操作。
- 表管理(CREATE TABLE、ALTER TABLE、DROP TABLE)。
- 架构内省。
- 连接池以实现高效的数据库访问。
- SSL 支持以实现安全连接。

## 示例

### 创建表

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 插入数据

```sql
INSERT INTO users (username, email) VALUES ('johndoe', 'john@example.com');
```

### 查询数据

```sql
SELECT * FROM users WHERE username = 'johndoe';
```

## 限制

- 对于带有 INSERT 语句的 `run` 方法,适配器会尝试通过添加 RETURNING 子句来检索最后插入的 ID。这假设您的表具有 'id' 列。
- 复杂的存储过程或 PostgreSQL 特定功能可能需要自定义实现。

## 故障排除

### 连接问题

如果您在连接 PostgreSQL 数据库时遇到问题:

1. 验证 PostgreSQL 正在运行: `pg_isready -h localhost -p 5432`
2. 检查您的凭据是否正确。
3. 确保数据库存在且用户具有适当的权限。
4. 如果连接到远程数据库,请检查防火墙设置。

### 查询错误

如果您的查询失败:

1. 根据 PostgreSQL 的 SQL 方言检查语法。
2. 验证表名和列名。
3. 检查用户是否对操作具有适当的权限。

## 性能考虑

为了获得最佳性能:

1. 使用参数化查询以防止 SQL 注入并提高查询缓存。
2. 考虑为经常查询的列创建索引。
3. 对于大结果集,使用 LIMIT 和 OFFSET 进行分页。
