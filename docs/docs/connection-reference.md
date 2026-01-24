# 连接参考

本页面为每种支持的数据库类型提供所有可用连接选项的综合参考。

## SQLite 连接选项

SQLite 是最简单的连接数据库,因为它只需要数据库文件的路径。

```bash
node dist/src/index.js /path/to/your/database.db
```

### 特殊路径

- `:memory:` - 创建内存数据库(连接关闭时数据丢失)
- `""` (空字符串) - 创建临时磁盘数据库

## SQL Server 连接选项

| 选项 | 描述 | 默认值 | 必需 |
|--------|-------------|---------|----------|
| `--sqlserver` | 指定 SQL Server 模式 | - | 是 |
| `--server` | SQL Server 主机名或 IP | - | 是 |
| `--database` | 数据库名称 | - | 是 |
| `--user` | SQL Server 用户名 | - | 否* |
| `--password` | SQL Server 密码 | - | 否* |
| `--port` | SQL Server 端口 | 1433 | 否 |
| `--trustServerCertificate` | 信任服务器证书(true/false) | false | 否 |
| `--connectionTimeout` | 连接超时(毫秒) | 15000 | 否 |
| `--requestTimeout` | 请求超时(毫秒) | 15000 | 否 |

*如果省略用户和密码,则使用 Windows 身份验证

### Windows 身份验证示例

```bash
node dist/src/index.js --sqlserver --server localhost\\SQLEXPRESS --database Northwind
```

### SQL 身份验证示例

```bash
node dist/src/index.js --sqlserver --server dbserver.example.com --database Northwind --user sa --password P@ssw0rd --port 1433
```

## PostgreSQL 连接选项

| 选项 | 描述 | 默认值 | 必需 |
|--------|-------------|---------|----------|
| `--postgresql` 或 `--postgres` | 指定 PostgreSQL 模式 | - | 是 |
| `--host` | PostgreSQL 主机名或 IP | - | 是 |
| `--database` | 数据库名称 | - | 是 |
| `--user` | PostgreSQL 用户名 | - | 否 |
| `--password` | PostgreSQL 密码 | - | 否 |
| `--port` | PostgreSQL 端口 | 5432 | 否 |
| `--ssl` | 使用 SSL 连接(true/false) | false | 否 |
| `--connection-timeout` | 连接超时(毫秒) | 30000 | 否 |

### 基本示例

```bash
node dist/src/index.js --postgresql --host localhost --database sample_db --user postgres --password secret
```

### 使用 SSL 和自定义端口示例

```bash
node dist/src/index.js --postgresql --host dbserver.example.com --database sample_db --user appuser --password Secure123! --port 5433 --ssl true
```

## MySQL 连接选项

| 选项 | 描述 | 默认值 | 必需 |
|--------|-------------|---------|----------|
| `--mysql` | 指定 MySQL 模式 | - | 是 |
| `--host` | MySQL 主机名或 IP | - | 是 |
| `--database` | 数据库名称 | - | 是 |
| `--user` | MySQL 用户名 | - | 否* |
| `--password` | MySQL 密码 | - | 否* |
| `--port` | MySQL 端口 | 3306 | 否 |
| `--ssl` | 使用 SSL 连接(true/false 或对象) | false | 否 |
| `--connection-timeout` | 连接超时(毫秒) | 30000 | 否 |
| `--aws-iam-auth` | 启用 AWS IAM 身份验证 | false | 否 |
| `--aws-region` | RDS IAM 身份验证的 AWS 区域 | - | 否** |

*标准身份验证必需
**使用 `--aws-iam-auth` 时必需

### 标准身份验证示例

```bash
node dist/src/index.js --mysql --host localhost --database sample_db --port 3306 --user root --password secret
```

### AWS IAM 身份验证示例

**前提条件:** 必须使用默认凭据提供程序链配置 AWS 凭据:
- `aws configure`(默认配置文件)
- `AWS_PROFILE=myprofile` 环境变量
- `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY` 环境变量
- IAM 角色(如果在 EC2 上运行)

```bash
node dist/src/index.js --mysql --aws-iam-auth --host rds-endpoint.region.rds.amazonaws.com --database sample_db --user aws-username --aws-region us-east-1
```

## 环境变量

除了在命令行上指定敏感凭据外,您还可以使用环境变量:

### SQL Server 环境变量

- `MSSQL_SERVER` - SQL Server 主机名
- `MSSQL_DATABASE` - 数据库名称
- `MSSQL_USER` - SQL Server 用户名
- `MSSQL_PASSWORD` - SQL Server 密码

### PostgreSQL 环境变量

- `PGHOST` - PostgreSQL 主机名
- `PGDATABASE` - 数据库名称
- `PGUSER` - PostgreSQL 用户名
- `PGPASSWORD` - PostgreSQL 密码
- `PGPORT` - PostgreSQL 端口

## 连接池

所有数据库连接都使用连接池以获得更好的性能:

- **SQLite**: 使用单个持久连接
- **SQL Server**: 默认连接池为 5 个连接
- **PostgreSQL**: 默认连接池为 10 个连接

## 连接安全

对于安全连接:

1. **SQL Server**: 在生产环境中使用 `--trustServerCertificate false`,并确保在服务器上安装了正确的 SSL 证书。

2. **PostgreSQL**: 使用 `--ssl true` 并确保服务器配置为 SSL 连接。

3. 对于所有数据库类型,考虑使用环境变量而不是在命令行上传递凭据。

4. 使用适当的文件系统权限存储您的 Claude Desktop 配置文件。
