# SQL Server 存储过程查询功能设计

**日期**: 2026-02-28
**状态**: 已批准
**目标**: 为 SQL Server 数据库添加存储过程查询功能

## 概述

为 MCP 数据库服务器添加 SQL Server 存储过程查询能力，与现有视图功能保持对称设计。本设计采用最小化实现方案，仅包含查询功能，不包含执行和管理操作。

## 功能范围

| 功能 | 描述 |
|------|------|
| 列出存储过程 | 获取数据库中所有存储过程名称列表 |
| 查看参数信息 | 获取存储过程的参数定义（名称、类型、方向） |
| 获取定义 SQL | 获取存储过程的 CREATE PROCEDURE 语句 |

## MCP 工具设计

### 1. list_procedures

列出当前数据库中所有存储过程。

**输入**: 无参数

**输出**:
```json
{
  "procedures": ["sp_GetUsers", "sp_UpdateOrder", ...]
}
```

**约束**: 仅支持 SQL Server 数据库

---

### 2. describe_procedure

获取存储过程的参数信息。

**输入**:
```json
{
  "procedure_name": "sp_GetUserById"
}
```

**输出**:
```json
{
  "name": "sp_GetUserById",
  "type": "procedure",
  "parameters": [
    {
      "name": "@UserId",
      "type": "int",
      "direction": "IN",
      "default_value": null,
      "is_output": false
    }
  ],
  "return_type": null
}
```

**约束**:
- 仅支持 SQL Server 数据库
- 存储过程必须存在

---

### 3. get_procedure_definition

获取存储过程的定义 SQL。

**输入**:
```json
{
  "procedure_name": "sp_GetUserById"
}
```

**输出**:
```json
{
  "name": "sp_GetUserById",
  "definition": "CREATE PROCEDURE sp_GetUserById @UserId int AS BEGIN ... END",
  "message": null
}
```

**约束**:
- 仅支持 SQL Server 数据库
- 使用 `WITH ENCRYPTION` 创建的存储过程无法获取定义

---

## 架构设计

### 层次结构

```
src/db/adapter.ts           → 添加 4 个可选接口方法
src/db/sqlserver-adapter.ts → 实现 SQL 查询
src/db/index.ts             → 导出查询函数
src/tools/schemaTools.ts    → 添加 3 个工具函数
src/handlers/toolHandlers.ts → 注册工具定义和路由
```

### 与视图功能对称

| 视图功能 | 存储过程功能 |
|---------|-------------|
| `list_views` | `list_procedures` |
| `describe_view` | `describe_procedure` |
| `get_view_definition` | `get_procedure_definition` |
| `supportsViews()` | `supportsProcedures()` |
| `getListViewsQuery()` | `getListProceduresQuery()` |

---

## 适配器接口设计

在 `DbAdapter` 接口中添加以下可选方法：

```typescript
/**
 * 获取列出存储过程的数据库特定查询（可选）
 * 仅 SQL Server 支持
 */
getListProceduresQuery?(): string;

/**
 * 获取存储过程参数信息的查询（可选）
 * 仅 SQL Server 支持
 * @param procedureName 存储过程名
 */
getDescribeProcedureQuery?(procedureName: string): string;

/**
 * 获取存储过程定义的查询（可选）
 * 仅 SQL Server 支持
 * @param procedureName 存储过程名
 */
getProcedureDefinitionQuery?(procedureName: string): string;

/**
 * 检查数据库是否支持存储过程功能（可选）
 * 默认返回 false
 */
supportsProcedures?(): boolean;
```

---

## SQL Server 实现的 SQL 查询

### 列出存储过程

```sql
SELECT ROUTINE_NAME as name
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME
```

### 获取参数信息

```sql
SELECT
    PARAMETER_NAME as name,
    DATA_TYPE +
        CASE
            WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL
            THEN '(' + CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) + ')'
            ELSE ''
        END as type,
    CASE PARAMETER_MODE
        WHEN 'IN' THEN 'IN'
        WHEN 'OUT' THEN 'OUT'
        WHEN 'INOUT' THEN 'INOUT'
    END as direction,
    CASE WHEN PARAMETER_MODE IN ('OUT', 'INOUT') THEN 1 ELSE 0 END as is_output,
    NULL as default_value
FROM INFORMATION_SCHEMA.PARAMETERS
WHERE SPECIFIC_NAME = '${procedureName}'
ORDER BY ORDINAL_POSITION
```

### 获取定义

```sql
SELECT ROUTINE_DEFINITION as definition
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE'
AND ROUTINE_NAME = '${procedureName}'
```

---

## 文件修改清单

| 文件 | 修改内容 |
|------|---------|
| `src/db/adapter.ts` | 添加 4 个可选接口方法 |
| `src/db/sqlserver-adapter.ts` | 实现 4 个方法 |
| `src/db/index.ts` | 导出 4 个函数 |
| `src/tools/schemaTools.ts` | 添加 3 个工具函数 |
| `src/handlers/toolHandlers.ts` | 注册 3 个新工具定义和路由 |

---

## 非目标

以下功能不在本次实现范围内：

- 执行存储过程
- 创建/修改/删除存储过程
- 权限查询
- 支持 PostgreSQL/MySQL 存储过程

---

## 验收标准

1. `list_procedures` 能正确返回 SQL Server 数据库中的所有存储过程
2. `describe_procedure` 能正确返回存储过程的参数信息（名称、类型、方向）
3. `get_procedure_definition` 能正确返回存储过程的定义 SQL
4. 对于非 SQL Server 数据库，工具返回明确的错误提示
5. 工具描述、参数设计与现有视图工具风格一致
