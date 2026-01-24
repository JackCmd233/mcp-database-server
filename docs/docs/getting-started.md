# 快速入门

本指南将帮助您快速启动并运行 MCP 数据库服务器和 Claude。

## 安装

使用 NPM 安装 MCP 数据库服务器:

```bash
npm install -g @executeautomation/database-server
```

## 配置步骤

1. **选择您的数据库类型**: MCP 数据库服务器支持 SQLite、SQL Server 和 PostgreSQL
2. **配置 Claude Desktop**: 更新您的 Claude 配置文件以连接到数据库
3. **重启 Claude Desktop**: 应用配置更改
4. **开始对话**: 通过 Claude 开始与数据库交互

## 示例配置

以下是每种支持的数据库类型的示例配置:

### SQLite

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

### SQL Server

```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/database-server",
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

### PostgreSQL

```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/database-server",
        "--postgresql",
        "--host", "your-host-name",
        "--database", "your-database-name",
        "--user", "your-username",
        "--password", "your-password"
      ]
    }
  }
}
```

## 第一次对话

一旦设置了 MCP 数据库服务器,您就可以通过 Claude 开始与数据库交互。以下是一个示例对话:

**您**: "数据库中有哪些表?"

**Claude**: *使用 list_tables 工具并显示数据库中的表*

**您**: "显示 Customers 表的结构"

**Claude**: *使用 describe_table 工具显示 Customers 表的架构*

**您**: "查找上个月下订单的所有客户"

**Claude**: *使用 read_query 工具执行 SQL 查询并显示结果*

## 工作流程模式

数据库交互的典型工作流程包括:

1. **探索**: 发现有的表和数据可用
2. **分析**: 运行查询以从数据中提取洞察
3. **修改**: 根据需要更改数据或架构
4. **迭代**: 根据初步结果优化查询

## 后续步骤

熟悉基础知识后,探索以下主题:

- 查看 [数据库工具参考](database-tools.md) 了解所有可用工具的详细信息
- 访问 [使用示例](usage-examples.md) 了解更复杂的场景
- 查看特定数据库的设置指南:
  - [SQLite 设置](sqlite-setup.md)
  - [SQL Server 设置](sql-server-setup.md)
  - [PostgreSQL 设置](postgresql-setup.md)
