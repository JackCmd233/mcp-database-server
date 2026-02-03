import {formatErrorResponse} from '../utils/formatUtils.js';

// 导入所有工具实现
import {readQuery, writeQuery, exportQuery} from '../tools/queryTools.js';
import {createTable, alterTable, dropTable, listTables, describeTable} from '../tools/schemaTools.js';
import {appendInsight, listInsights} from '../tools/insightTools.js';

/**
 * 处理列出可用工具的请求
 * @returns 可用工具列表
 */
export function handleListTools() {
    return {
        tools: [
            {
                name: "read_query",
                description: "执行 SELECT 查询以从数据库读取数据",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {type: "string"},
                    },
                    required: ["query"],
                },
            },
            {
                name: "write_query",
                description: "执行 INSERT、UPDATE 或 DELETE 查询",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {type: "string"},
                    },
                    required: ["query"],
                },
            },
            {
                name: "create_table",
                description: "在数据库中创建新表",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {type: "string"},
                    },
                    required: ["query"],
                },
            },
            {
                name: "alter_table",
                description: "修改现有表结构（添加列、重命名表等）",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {type: "string"},
                    },
                    required: ["query"],
                },
            },
            {
                name: "drop_table",
                description: "从数据库中删除表（需要安全确认）",
                inputSchema: {
                    type: "object",
                    properties: {
                        table_name: {type: "string"},
                        confirm: {type: "boolean"},
                    },
                    required: ["table_name", "confirm"],
                },
            },
            {
                name: "export_query",
                description: "将查询结果导出为各种格式（CSV、JSON）",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {type: "string"},
                        format: {type: "string", enum: ["csv", "json"]},
                    },
                    required: ["query", "format"],
                },
            },
            {
                name: "list_tables",
                description: "获取数据库中所有表的列表",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "describe_table",
                description: "查看特定表的结构信息",
                inputSchema: {
                    type: "object",
                    properties: {
                        table_name: {type: "string"},
                    },
                    required: ["table_name"],
                },
            },
            {
                name: "append_insight",
                description: "添加业务洞察到备忘录",
                inputSchema: {
                    type: "object",
                    properties: {
                        insight: {type: "string"},
                    },
                    required: ["insight"],
                },
            },
            {
                name: "list_insights",
                description: "列出备忘录中的所有业务洞察",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    };
}

/**
 * 处理工具调用请求
 * @param name 要调用的工具名称
 * @param args 工具参数
 * @returns 工具执行结果
 */
export async function handleToolCall(name: string, args: any) {
    try {
        switch (name) {
            case "read_query":
                return await readQuery(args.query);

            case "write_query":
                return await writeQuery(args.query);

            case "create_table":
                return await createTable(args.query);

            case "alter_table":
                return await alterTable(args.query);

            case "drop_table":
                return await dropTable(args.table_name, args.confirm);

            case "export_query":
                return await exportQuery(args.query, args.format);

            case "list_tables":
                return await listTables();

            case "describe_table":
                return await describeTable(args.table_name);

            case "append_insight":
                return await appendInsight(args.insight);

            case "list_insights":
                return await listInsights();

            default:
                throw new Error(`未知的工具: ${name}`);
        }
    } catch (error: any) {
        return formatErrorResponse(error);
    }
} 