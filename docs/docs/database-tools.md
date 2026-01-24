# 数据库工具参考

MCP 数据库服务器提供了一组 Claude 可用于与数据库交互的工具。本页面描述了每个工具、其参数以及如何有效地使用它。

## 可用工具

| 工具 | 描述 | 必需参数 |
|------|-------------|---------------------|
| `read_query` | 执行 SELECT 查询以读取数据 | `query`: SQL SELECT 语句 |
| `write_query` | 执行 INSERT、UPDATE 或 DELETE 查询 | `query`: SQL 修改语句 |
| `create_table` | 在数据库中创建新表 | `query`: CREATE TABLE 语句 |
| `alter_table` | 修改现有表架构 | `query`: ALTER TABLE 语句 |
| `drop_table` | 从数据库中删除表 | `table_name`: 表名<br/>`confirm`: 安全标志(必须为 true) |
| `list_tables` | 获取所有表的列表 | 无 |
| `describe_table` | 查看表的架构信息 | `table_name`: 表名 |
| `export_query` | 将查询结果导出为 CSV/JSON | `query`: SQL SELECT 语句<br/>`format`: "csv" 或 "json" |
| `append_insight` | 将业务洞察添加到备忘录 | `insight`: 洞察文本 |
| `list_insights` | 列出所有业务洞察 | 无 |

## 工具使用示例

### 读取数据

要从数据库检索数据:

```
上个月花费超过 1000 美元的客户有哪些?
```

Claude 将使用带有适当 SQL 查询的 `read_query` 工具。

### 写入数据

要插入、更新或删除数据:

```
添加一个名为 "Deluxe Widget" 的新产品,价格为 29.99 美元,到 Products 表中。
```

Claude 将使用 `write_query` 工具执行 INSERT 操作。

### 架构管理

要创建或修改表:

```
创建一个名为 "CustomerFeedback" 的新表,包含客户 ID、评分(1-5)和评论文本列。
```

Claude 将使用 `create_table` 工具定义新表。

### 导出数据

要导出查询结果:

```
将上一季度的所有销售导出为 CSV。
```

Claude 将使用 `export_query` 工具,并将 format 参数设置为 "csv"。

### 使用洞察

Claude 可以在您的数据库分析过程中跟踪重要观察:

```
添加一个洞察,"与工作日相比,周末的销售额高出 15%"
```

Claude 将使用 `append_insight` 工具记录此信息。

## 最佳实践

1. **在请求中具体说明**: 提供关于要检索或修改哪些数据的清晰细节。

2. **使用自然语言**: 像向人类分析师提问一样提问。Claude 会将您的请求转换为适当的 SQL。

3. **提交前审查**: 对于数据修改,请始终在确认之前审查 Claude 提出的建议。

4. **考虑数据量**: 对于大表,使用过滤来限制结果集。

5. **考虑性能**: 对大表的复杂查询可能需要一些时间来执行。

## 限制

1. 服务器不支持某些数据库特定的功能,如存储过程或触发器。

2. 出于安全原因,文件操作和系统命令不可用。

3. SQLite、SQL Server 和 PostgreSQL 之间可能存在轻微的语法差异。Claude 会尝试相应地调整查询。

4. 大结果集可能会被截断以防止内存问题。
