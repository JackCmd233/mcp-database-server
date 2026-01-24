# MCP 数据库服务器使用示例

本文档提供了如何在 Claude Desktop 中使用 MCP 数据库服务器提供的数据库工具的实用示例。

## Claude 提示词示例

以下是一些可以使用 MCP 数据库服务器工具让 Claude 执行的任务示例。

### 基本数据库操作

#### 列出表

```
数据库中有哪些表?
```

#### 描述表结构

```
显示 Products 表的结构。
```

#### 读取数据

```
显示 Customers 表中的所有记录。
```

```
查找价格大于 50 的所有产品。
```

#### 写入数据

```
插入一个新产品,名称为"New Widget",价格 29.99,类别为"Accessories"。
```

```
将"Electronics"类别中所有产品的价格提高 10%。
```

```
删除超过 5 年的所有订单。
```

### 架构管理

#### 创建表

```
创建一个名为"Feedback"的新表,包含以下列:ID(自增主键)、
CustomerID(整数)、Rating(1-5 的整数)和 Comment(文本)。
```

#### 修改表

```
在 Products 表中添加"DateCreated"日期时间列。
```

```
将 Customers 表中的"Phone"列重命名为"ContactNumber"。
```

#### 删除表

```
如果存在 temporary_logs 表,则将其删除。
```

### 高级查询

#### 复杂连接

```
显示客户列表及其订单总金额,
按总金额从高到低排序。
```

#### 导出数据

```
将所有客户数据导出为 CSV 格式。
```

```
将按月汇总的销售数据导出为 JSON 格式。
```

## SQL 语法示例

### SQLite 示例

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

### SQL Server 示例

```sql
-- 在 SQL Server 中创建表
CREATE TABLE Products (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  price DECIMAL(10,2),
  category NVARCHAR(50)
);

-- 使用 OFFSET-FETCH 查询(SQL Server 的 LIMIT 等效语法)
SELECT * FROM Products ORDER BY id OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;

-- 日期格式化
SELECT FORMAT(GETDATE(), 'yyyy-MM-dd') as today;
SELECT CONVERT(VARCHAR(10), date_column, 120) as formatted_date FROM Orders;

-- 字符串连接
SELECT first_name + ' ' + last_name as full_name FROM Customers;
```

## 与 Claude 协作

### 使用 MCP 数据库服务器的技巧

1. **明确指定数据库类型**: 如果同时配置了 SQLite 和 SQL Server,请告诉 Claude 你想使用哪一个。

2. **安全意识**: 避免在对话中暴露敏感的数据库凭证。

3. **SQL 语法差异**: 请记住 SQLite 和 SQL Server 之间的 SQL 语法可能有所不同。

4. **错误处理**: 如果 Claude 遇到错误,它会告诉你出了什么问题,以便你修正查询。

5. **复杂操作**: 对于复杂操作,考虑将其分解为更小的步骤。

### Claude 对话示例

#### 探索数据库

**用户**: "我需要探索我的数据库。我有哪些表?"

**Claude**: *使用 list_tables 显示可用的表*

**用户**: "告诉我 Customers 表的结构。"

**Claude**: *使用 describe_table 显示 Customers 表的架构*

**用户**: "显示 Customers 表的前 5 条记录。"

**Claude**: *使用 read_query 执行 SELECT 查询*

#### 数据分析

**用户**: "查找在过去 6 个月内未下订单的客户。"

**Claude**: *使用 read_query 执行涉及日期和连接的更复杂查询*

**用户**: "创建按产品类别汇总的销售报表。"

**Claude**: *使用 read_query 和 GROUP BY 聚合销售数据*

#### 数据库修改

**用户**: "我需要在 Users 表中添加一个'active'列,默认值为 true。"

**Claude**: *使用 alter_table 修改架构*

**用户**: "将'Discontinued'类别中所有产品的'active'状态更新为 false。"

**Claude**: *使用 write_query 执行 UPDATE 操作*
