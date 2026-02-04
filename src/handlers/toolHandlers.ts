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
                title: "Read Query",
                description: "Execute a SELECT query to read data from the database. " +
                    "Returns the complete result set with all matching rows and columns. " +
                    "Only SELECT statements are allowed - use write_query for data modifications. " +
                    "Supports all database types: SQLite, SQL Server, PostgreSQL, MySQL.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The SQL SELECT query to execute (e.g., 'SELECT * FROM users WHERE active = 1')"
                        },
                    },
                    required: ["query"],
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        rows: {
                            type: "array",
                            description: "Array of result rows from the query"
                        },
                        columns: {
                            type: "array",
                            description: "Array of column names in the result set"
                        }
                    }
                },
                annotations: {
                    readOnlyHint: true,
                    idempotentHint: true
                }
            },
            {
                name: "write_query",
                title: "Write Query",
                description: "Execute INSERT, UPDATE, or DELETE queries to modify database data. " +
                    "Returns the number of affected rows. " +
                    "Cannot be used for SELECT queries - use read_query instead. " +
                    "Supports all database types: SQLite, SQL Server, PostgreSQL, MySQL.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The SQL INSERT/UPDATE/DELETE query to execute"
                        },
                    },
                    required: ["query"],
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        affected_rows: {
                            type: "number",
                            description: "Number of rows affected by the operation"
                        },
                        last_id: {
                            type: "number",
                            description: "ID of the last inserted row (for INSERT operations)"
                        }
                    }
                },
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: true
                }
            },
            {
                name: "create_table",
                title: "Create Table",
                description: "Create a new table in the database using a CREATE TABLE statement. " +
                    "Supports all standard SQL table creation syntax including column definitions, " +
                    "constraints, indexes, and relationships. " +
                    "Works with SQLite, SQL Server, PostgreSQL, and MySQL.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The complete CREATE TABLE SQL statement"
                        },
                    },
                    required: ["query"],
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            description: "True if the table was created successfully"
                        },
                        message: {
                            type: "string",
                            description: "Success message with table name"
                        }
                    }
                },
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: true
                }
            },
            {
                name: "alter_table",
                title: "Alter Table",
                description: "Modify an existing table's structure using ALTER TABLE statements. " +
                    "Supports adding columns, dropping columns, renaming columns, changing data types, " +
                    "and other table modifications. " +
                    "The table must exist before alterations can be made.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The ALTER TABLE SQL statement to modify table structure"
                        },
                    },
                    required: ["query"],
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            description: "True if the table was altered successfully"
                        },
                        message: {
                            type: "string",
                            description: "Success message confirming the alteration"
                        }
                    }
                },
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: true
                }
            },
            {
                name: "drop_table",
                title: "Drop Table",
                description: "Permanently delete a table from the database. " +
                    "This operation cannot be undone - all data and structure will be lost. " +
                    "Requires confirm=true to execute as a safety measure. " +
                    "Validates that the table exists before attempting deletion.",
                inputSchema: {
                    type: "object",
                    properties: {
                        table_name: {
                            type: "string",
                            description: "Name of the table to delete"
                        },
                        confirm: {
                            type: "boolean",
                            description: "Must be set to true to confirm table deletion"
                        },
                    },
                    required: ["table_name", "confirm"],
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            description: "True if the table was dropped successfully"
                        },
                        message: {
                            type: "string",
                            description: "Success message with the dropped table name"
                        }
                    }
                },
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: true
                }
            },
            {
                name: "export_query",
                title: "Export Query",
                description: "Execute a SELECT query and export the results in CSV or JSON format. " +
                    "Only SELECT queries are allowed. " +
                    "CSV format returns comma-separated values with headers. " +
                    "JSON format returns the raw result array. " +
                    "Useful for data analysis, reporting, or data transfer.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The SQL SELECT query to execute and export"
                        },
                        format: {
                            type: "string",
                            enum: ["csv", "json"],
                            description: "Output format: 'csv' for comma-separated values, 'json' for raw JSON array"
                        },
                    },
                    required: ["query", "format"],
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        data: {
                            type: "string",
                            description: "Exported data in the requested format"
                        },
                        format: {
                            type: "string",
                            description: "The format of the exported data"
                        }
                    }
                },
                annotations: {
                    readOnlyHint: true,
                    idempotentHint: true
                }
            },
            {
                name: "list_tables",
                title: "List Tables",
                description: "Retrieve a list of all table names in the current database. " +
                    "Returns only table names without structure details. " +
                    "Use describe_table to get detailed column information for a specific table.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        tables: {
                            type: "array",
                            items: {type: "string"},
                            description: "Array of table names in the database"
                        }
                    }
                },
                annotations: {
                    readOnlyHint: true,
                    idempotentHint: true
                }
            },
            {
                name: "describe_table",
                title: "Describe Table",
                description: "Get detailed structural information about a specific table. " +
                    "Returns column name, data type, nullable status, default value, " +
                    "primary key status, and column comment (if supported). " +
                    "The table must exist in the database.",
                inputSchema: {
                    type: "object",
                    properties: {
                        table_name: {
                            type: "string",
                            description: "Name of the table to describe"
                        },
                    },
                    required: ["table_name"],
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        columns: {
                            type: "array",
                            description: "Array of column definitions",
                            items: {
                                type: "object",
                                properties: {
                                    name: {type: "string", description: "Column name"},
                                    type: {type: "string", description: "Data type"},
                                    notnull: {type: "boolean", description: "Whether the column is NOT NULL"},
                                    default_value: {type: "string", description: "Default value"},
                                    primary_key: {type: "boolean", description: "Whether the column is a primary key"},
                                    comment: {type: "string", description: "Column comment"}
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
                name: "append_insight",
                title: "Append Insight",
                description: "Add a business insight to the SQLite insights memo. " +
                    "Only works with SQLite databases - creates and uses an mcp_insights table. " +
                    "Each insight is stored with a timestamp for tracking. " +
                    "Useful for maintaining notes during analysis sessions.",
                inputSchema: {
                    type: "object",
                    properties: {
                        insight: {
                            type: "string",
                            description: "The business insight text to store in the memo"
                        },
                    },
                    required: ["insight"],
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            description: "True if the insight was added successfully"
                        },
                        id: {
                            type: "number",
                            description: "ID of the newly created insight entry"
                        },
                        message: {
                            type: "string",
                            description: "Success message"
                        }
                    }
                },
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: false
                }
            },
            {
                name: "list_insights",
                title: "List Insights",
                description: "Retrieve all stored business insights from the SQLite insights memo. " +
                    "Only works with SQLite databases. " +
                    "Returns insights in descending order by creation time (newest first). " +
                    "Returns an empty list if no insights have been stored yet.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        insights: {
                            type: "array",
                            description: "Array of insight entries",
                            items: {
                                type: "object",
                                properties: {
                                    id: {type: "number", description: "Insight ID"},
                                    insight: {type: "string", description: "Insight text"},
                                    created_at: {type: "string", description: "Creation timestamp"}
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