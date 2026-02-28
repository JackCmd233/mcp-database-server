# SQL Server 存储过程查询功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 SQL Server 数据库添加存储过程查询功能（列出、查看参数、获取定义）

**Architecture:** 遵循现有视图功能的适配器模式，在 DbAdapter 接口添加可选方法，仅在 SqlServerAdapter 中实现，通过 db/index.ts 统一导出，在 schemaTools.ts 实现工具函数，最后在 toolHandlers.ts 注册 MCP 工具。

**Tech Stack:** TypeScript, mssql 包, MCP SDK

---

## Task 1: 修改适配器接口

**Files:**
- Modify: `src/db/adapter.ts`

**Step 1: 在 DbAdapter 接口中添加存储过程相关方法**

在 `src/db/adapter.ts` 的 `DbAdapter` 接口中，在 `supportsViews?()` 方法之后添加：

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

**Step 2: 验证 TypeScript 编译**

Run: `cd D:/Code/mcp-database-server && npm run build`
Expected: 编译成功，无类型错误

**Step 3: Commit**

```bash
git add src/db/adapter.ts
git commit -m "feat(adapter): 添加存储过程查询接口方法定义"
```

---

## Task 2: 实现 SQL Server 适配器方法

**Files:**
- Modify: `src/db/sqlserver-adapter.ts`

**Step 1: 在 SqlServerAdapter 类中添加 supportsProcedures 方法**

在 `supportsViews()` 方法之后添加：

```typescript
    /**
     * 检查数据库是否支持存储过程功能
     */
    supportsProcedures(): boolean {
        return true;
    }
```

**Step 2: 添加 getListProceduresQuery 方法**

```typescript
    /**
     * 获取列出存储过程的数据库特定查询
     */
    getListProceduresQuery(): string {
        return "SELECT ROUTINE_NAME as name FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' ORDER BY ROUTINE_NAME";
    }
```

**Step 3: 添加 getDescribeProcedureQuery 方法**

```typescript
    /**
     * 获取存储过程参数信息的查询
     * @param procedureName 存储过程名
     */
    getDescribeProcedureQuery(procedureName: string): string {
        return `
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
    `;
    }
```

**Step 4: 添加 getProcedureDefinitionQuery 方法**

```typescript
    /**
     * 获取存储过程定义的查询
     * @param procedureName 存储过程名
     * 注意: 使用 WITH ENCRYPTION 创建的存储过程无法获取定义
     */
    getProcedureDefinitionQuery(procedureName: string): string {
        return `SELECT ROUTINE_DEFINITION as definition FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_NAME = '${procedureName}'`;
    }
```

**Step 5: 验证 TypeScript 编译**

Run: `cd D:/Code/mcp-database-server && npm run build`
Expected: 编译成功，无类型错误

**Step 6: Commit**

```bash
git add src/db/sqlserver-adapter.ts
git commit -m "feat(sqlserver): 实现存储过程查询方法"
```

---

## Task 3: 导出数据库管理层函数

**Files:**
- Modify: `src/db/index.ts`

**Step 1: 查看当前 db/index.ts 的导出结构**

Run: `cd D:/Code/mcp-database-server && cat src/db/index.ts`
Expected: 看到现有的导出函数如 `getListViewsQuery`, `getViewDefinitionQuery`, `supportsViews`

**Step 2: 添加存储过程相关导出函数**

在现有视图相关函数之后，添加以下函数：

```typescript
/**
 * 获取列出存储过程的查询
 * 仅 SQL Server 支持
 */
export function getListProceduresQuery(): string {
    if (!adapter) {
        throw new Error('数据库未初始化');
    }
    if (!adapter.getListProceduresQuery) {
        throw new Error('当前数据库不支持存储过程功能');
    }
    return adapter.getListProceduresQuery();
}

/**
 * 获取存储过程参数信息的查询
 * 仅 SQL Server 支持
 */
export function getDescribeProcedureQuery(procedureName: string): string {
    if (!adapter) {
        throw new Error('数据库未初始化');
    }
    if (!adapter.getDescribeProcedureQuery) {
        throw new Error('当前数据库不支持存储过程功能');
    }
    return adapter.getDescribeProcedureQuery(procedureName);
}

/**
 * 获取存储过程定义的查询
 * 仅 SQL Server 支持
 */
export function getProcedureDefinitionQuery(procedureName: string): string {
    if (!adapter) {
        throw new Error('数据库未初始化');
    }
    if (!adapter.getProcedureDefinitionQuery) {
        throw new Error('当前数据库不支持存储过程功能');
    }
    return adapter.getProcedureDefinitionQuery(procedureName);
}

/**
 * 检查数据库是否支持存储过程功能
 */
export function supportsProcedures(): boolean {
    if (!adapter) {
        return false;
    }
    return adapter.supportsProcedures ? adapter.supportsProcedures() : false;
}
```

**Step 3: 验证 TypeScript 编译**

Run: `cd D:/Code/mcp-database-server && npm run build`
Expected: 编译成功，无类型错误

**Step 4: Commit**

```bash
git add src/db/index.ts
git commit -m "feat(db): 导出存储过程查询函数"
```

---

## Task 4: 实现工具函数

**Files:**
- Modify: `src/tools/schemaTools.ts`

**Step 1: 更新 import 导入**

将第 1 行的导入修改为：

```typescript
import {dbAll, dbExec, getListTablesQuery, getDescribeTableQuery, getListViewsQuery, getViewDefinitionQuery, supportsViews, getListProceduresQuery, getDescribeProcedureQuery, getProcedureDefinitionQuery, supportsProcedures} from '../db/index.js';
```

**Step 2: 添加检查存储过程是否存在的辅助函数**

在 `checkObjectExists` 函数之后添加：

```typescript
/**
 * 检查存储过程是否存在
 * @param procedureName 存储过程名
 * @returns 如果存在返回 true，否则返回 false
 */
async function checkProcedureExists(procedureName: string): Promise<boolean> {
    if (!supportsProcedures()) {
        return false;
    }
    const query = getListProceduresQuery();
    const procedures = await dbAll(query);
    return procedures.some(proc => proc.name === procedureName);
}
```

**Step 3: 添加 listProcedures 函数**

在 `getViewDefinition` 函数之后添加：

```typescript
/**
 * 列出数据库中的所有存储过程
 * 仅支持 SQL Server
 * @returns 存储过程名数组
 */
export async function listProcedures() {
    try {
        if (!supportsProcedures()) {
            throw new Error("存储过程功能仅支持 SQL Server 数据库");
        }

        const query = getListProceduresQuery();
        const procedures = await dbAll(query);
        return formatSuccessResponse(procedures.map((p) => p.name));
    } catch (error: any) {
        throw new Error(`列出存储过程失败: ${error.message}`);
    }
}
```

**Step 4: 添加 describeProcedure 函数**

```typescript
/**
 * 获取存储过程的参数信息
 * 仅支持 SQL Server
 * @param procedureName 存储过程名
 * @returns 存储过程的参数定义
 */
export async function describeProcedure(procedureName: string) {
    try {
        if (!procedureName) {
            throw new Error("存储过程名不能为空");
        }

        if (!supportsProcedures()) {
            throw new Error("存储过程功能仅支持 SQL Server 数据库");
        }

        // 检查存储过程是否存在
        if (!(await checkProcedureExists(procedureName))) {
            throw new Error(`存储过程 '${procedureName}' 不存在`);
        }

        // 获取参数信息
        const descQuery = getDescribeProcedureQuery(procedureName);
        const params = await dbAll(descQuery);

        // 格式化参数信息
        const parameters = params.map((param) => ({
            name: param.name,
            type: param.type,
            direction: param.direction,
            default_value: param.default_value,
            is_output: !!param.is_output
        }));

        return formatSuccessResponse({
            name: procedureName,
            type: 'procedure',
            parameters: parameters
        });
    } catch (error: any) {
        throw new Error(`描述存储过程失败: ${error.message}`);
    }
}
```

**Step 5: 添加 getProcedureDefinition 函数**

```typescript
/**
 * 获取存储过程的定义 SQL
 * 仅支持 SQL Server
 * 注意: 使用 WITH ENCRYPTION 创建的存储过程无法获取定义
 * @param procedureName 存储过程名
 * @returns 存储过程定义 SQL
 */
export async function getProcedureDefinition(procedureName: string) {
    try {
        if (!procedureName) {
            throw new Error("存储过程名不能为空");
        }

        if (!supportsProcedures()) {
            throw new Error("存储过程功能仅支持 SQL Server 数据库");
        }

        // 检查存储过程是否存在
        if (!(await checkProcedureExists(procedureName))) {
            throw new Error(`存储过程 '${procedureName}' 不存在`);
        }

        // 获取存储过程定义
        const defQuery = getProcedureDefinitionQuery(procedureName);
        const result = await dbAll(defQuery);

        if (result.length === 0 || !result[0].definition) {
            return formatSuccessResponse({
                name: procedureName,
                definition: null,
                message: "存储过程定义不可用（可能使用 WITH ENCRYPTION 创建）"
            });
        }

        return formatSuccessResponse({
            name: procedureName,
            definition: result[0].definition
        });
    } catch (error: any) {
        throw new Error(`获取存储过程定义失败: ${error.message}`);
    }
}
```

**Step 6: 验证 TypeScript 编译**

Run: `cd D:/Code/mcp-database-server && npm run build`
Expected: 编译成功，无类型错误

**Step 7: Commit**

```bash
git add src/tools/schemaTools.ts
git commit -m "feat(tools): 添加存储过程查询工具函数"
```

---

## Task 5: 注册 MCP 工具

**Files:**
- Modify: `src/handlers/toolHandlers.ts`

**Step 1: 更新 import 导入**

将第 5 行的导入修改为：

```typescript
import {createTable, alterTable, dropTable, listTables, describeTable, listViews, describeView, getViewDefinition, listProcedures, describeProcedure, getProcedureDefinition} from '../tools/schemaTools.js';
```

**Step 2: 在 handleListTools 函数中添加工具定义**

在 `list_insights` 工具定义之后，`],` 之前添加三个新工具：

```typescript
            {
                name: "list_procedures",
                title: "List Procedures",
                description: "Retrieve a list of all stored procedure names in the current database. " +
                    "Only works with SQL Server databases. " +
                    "Returns only procedure names without parameter details. " +
                    "Use describe_procedure to get detailed parameter information for a specific procedure.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        procedures: {
                            type: "array",
                            items: {type: "string"},
                            description: "Array of stored procedure names in the database"
                        }
                    }
                },
                annotations: {
                    readOnlyHint: true,
                    idempotentHint: true
                }
            },
            {
                name: "describe_procedure",
                title: "Describe Procedure",
                description: "Get detailed parameter information about a specific stored procedure. " +
                    "Only works with SQL Server databases. " +
                    "Returns parameter name, data type, direction (IN/OUT/INOUT), and default value. " +
                    "The procedure must exist in the database.",
                inputSchema: {
                    type: "object",
                    properties: {
                        procedure_name: {
                            type: "string",
                            description: "Name of the stored procedure to describe"
                        },
                    },
                    required: ["procedure_name"],
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        name: {type: "string", description: "Procedure name"},
                        type: {type: "string", description: "Always 'procedure'"},
                        parameters: {
                            type: "array",
                            description: "Array of parameter definitions",
                            items: {
                                type: "object",
                                properties: {
                                    name: {type: "string", description: "Parameter name"},
                                    type: {type: "string", description: "Data type"},
                                    direction: {type: "string", enum: ["IN", "OUT", "INOUT"], description: "Parameter direction"},
                                    default_value: {type: "string", description: "Default value"},
                                    is_output: {type: "boolean", description: "Whether this is an output parameter"}
                                }
                            }
                        }
                    }
                },
                annotations: {
                    readOnlyHint: true,
                    idempotentHint: true
                }
            },
            {
                name: "get_procedure_definition",
                title: "Get Procedure Definition",
                description: "Retrieve the SQL definition (CREATE PROCEDURE statement) of a specific stored procedure. " +
                    "Only works with SQL Server databases. " +
                    "Returns the complete CREATE PROCEDURE SQL statement. " +
                    "Note: Procedures created WITH ENCRYPTION cannot have their definition retrieved.",
                inputSchema: {
                    type: "object",
                    properties: {
                        procedure_name: {
                            type: "string",
                            description: "Name of the stored procedure to get definition for"
                        },
                    },
                    required: ["procedure_name"],
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        name: {type: "string", description: "Procedure name"},
                        definition: {type: "string", description: "CREATE PROCEDURE SQL statement"},
                        message: {type: "string", description: "Additional information if definition is unavailable"}
                    }
                },
                annotations: {
                    readOnlyHint: true,
                    idempotentHint: true
                }
            },
```

**Step 3: 在 handleToolCall 函数中添加路由**

在 `case "list_insights":` 之前添加：

```typescript
            case "list_procedures":
                return await listProcedures();

            case "describe_procedure":
                return await describeProcedure(args.procedure_name);

            case "get_procedure_definition":
                return await getProcedureDefinition(args.procedure_name);
```

**Step 4: 验证 TypeScript 编译**

Run: `cd D:/Code/mcp-database-server && npm run build`
Expected: 编译成功，无类型错误

**Step 5: Commit**

```bash
git add src/handlers/toolHandlers.ts
git commit -m "feat(handlers): 注册存储过程查询 MCP 工具"
```

---

## Task 6: 集成测试与最终验证

**Files:**
- 无文件修改，仅验证

**Step 1: 完整构建**

Run: `cd D:/Code/mcp-database-server && npm run build`
Expected: 编译成功，无错误

**Step 2: 验证工具列表**

Run: `cd D:/Code/mcp-database-server && node dist/src/index.js --help`
Expected: 显示帮助信息，无启动错误

**Step 3: 最终 Commit（如有遗漏）**

```bash
git status
# 如果有未提交的更改，提交它们
```

---

## 实现总结

| Task | 描述 | 修改文件 |
|------|------|---------|
| 1 | 修改适配器接口 | `src/db/adapter.ts` |
| 2 | 实现 SQL Server 适配器方法 | `src/db/sqlserver-adapter.ts` |
| 3 | 导出数据库管理层函数 | `src/db/index.ts` |
| 4 | 实现工具函数 | `src/tools/schemaTools.ts` |
| 5 | 注册 MCP 工具 | `src/handlers/toolHandlers.ts` |
| 6 | 集成测试与验证 | 无 |

**预计提交数**: 5-6 个
