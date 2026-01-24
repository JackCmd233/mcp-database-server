# SQL Server 设置指南

本指南提供了设置和使用 SQL Server 适配器的说明。

## 前置条件

1. 访问 SQL Server 实例(2012 或更高版本)
2. Node.js 18 或更高版本
3. 连接到 SQL Server 数据库所需的相关权限

## 安装

1. 按照 README.md 文件中的主要安装步骤进行操作
2. 确保已安装 mssql 包:
```bash
npm install mssql
npm install @types/mssql --save-dev
```

## 身份验证选项

SQL Server 适配器支持多种身份验证方法:

### SQL Server 身份验证

使用 `--user` 和 `--password` 参数通过 SQL Server 凭据进行身份验证:

```bash
node dist/src/index.js --sqlserver --server myserver --database mydatabase --user myuser --password mypassword
```

### Windows 身份验证

省略 `--user` 和 `--password` 参数以使用 Windows 身份验证(可信连接):

```bash
node dist/src/index.js --sqlserver --server myserver --database mydatabase
```

### Azure Active Directory

对于使用 Azure AD 身份验证的 Azure SQL 数据库,您需要设置连接选项:

```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "node",
      "args": [
        "/path/to/mcp-database-server/dist/src/index.js",
        "--sqlserver",
        "--server", "myserver.database.windows.net",
        "--database", "mydatabase",
        "--user", "myuser@mydomain.com",
        "--password", "mypassword"
      ]
    }
  }
}
```

## 配置 Claude

更新您的 Claude 配置文件以添加 SQL Server 支持:

```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "node",
      "args": [
        "/path/to/mcp-database-server/dist/src/index.js",
        "--sqlserver",
        "--server", "your-server-name",
        "--database", "your-database-name",
        "--user", "your-username",
        "--password", "your-password"
      ]
    }
  }
}
```

对于使用 Windows 身份验证的本地 SQL Server:

```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "node",
      "args": [
        "/path/to/mcp-database-server/dist/src/index.js",
        "--sqlserver",
        "--server", "localhost\\SQLEXPRESS",
        "--database", "your-database-name"
      ]
    }
  }
}
```

## 连接选项

其他连接选项包括:

- `--port`: 指定非默认端口(默认为 1433)
- 如果连接到具有自签名证书的开发/测试服务器,添加 `--trustServerCertificate true`

## 故障排除

### 常见连接问题

1. **用户登录失败**
   - 验证用户名和密码
   - 检查 SQL Server 账户是否已启用且未锁定

2. **无法连接到服务器**
   - 确保 SQL Server 正在运行
   - 检查防火墙设置
   - 验证服务器名称是否正确(包括实例名称(如果适用))

3. **SSL 错误**
   - 对于开发环境,添加 `--trustServerCertificate true`

### 验证连接

您可以使用标准的 SQL Server 工具测试 SQL Server 连接:

1. 使用 SQL Server Management Studio (SSMS)
2. 使用 `sqlcmd` 实用工具:
   ```
   sqlcmd -S server_name -d database_name -U username -P password
   ```

## SQL 语法差异

请注意 SQLite 和 SQL Server 之间可能存在语法差异。以下是一些常见差异:

1. **字符串连接**
   - SQLite: `||`
   - SQL Server: `+`

2. **Limit/Offset**
   - SQLite: `LIMIT x OFFSET y`
   - SQL Server: `OFFSET y ROWS FETCH NEXT x ROWS ONLY`

3. **日期格式化**
   - SQLite: `strftime()`
   - SQL Server: `FORMAT()` 或 `CONVERT()`

4. **自增列**
   - SQLite: `INTEGER PRIMARY KEY AUTOINCREMENT`
   - SQL Server: `INT IDENTITY(1,1)`

使用 Claude 时,在编写 SQL 查询时请注意这些语法差异。
