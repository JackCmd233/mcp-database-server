import { dbAll, dbRun, dbExec } from '../db/index.js';
import { formatErrorResponse, formatSuccessResponse, convertToCSV } from '../utils/formatUtils.js';

/**
 * 执行只读 SQL 查询
 * @param query 要执行的 SQL 查询
 * @returns 查询结果
 */
export async function readQuery(query: string) {
  try {
    if (!query.trim().toLowerCase().startsWith("select")) {
      throw new Error("Only SELECT queries are allowed with read_query");
    }

    const result = await dbAll(query);
    return formatSuccessResponse(result);
  } catch (error: any) {
    throw new Error(`SQL Error: ${error.message}`);
  }
}

/**
 * 执行数据修改 SQL 查询
 * @param query 要执行的 SQL 查询
 * @returns 受影响行的信息
 */
export async function writeQuery(query: string) {
  try {
    const lowerQuery = query.trim().toLowerCase();
    
    if (lowerQuery.startsWith("select")) {
      throw new Error("Use read_query for SELECT operations");
    }
    
    if (!(lowerQuery.startsWith("insert") || lowerQuery.startsWith("update") || lowerQuery.startsWith("delete"))) {
      throw new Error("Only INSERT, UPDATE, or DELETE operations are allowed with write_query");
    }

    const result = await dbRun(query);
    return formatSuccessResponse({ affected_rows: result.changes });
  } catch (error: any) {
    throw new Error(`SQL Error: ${error.message}`);
  }
}

/**
 * 将查询结果导出为 CSV 或 JSON 格式
 * @param query 要执行的 SQL 查询
 * @param format 输出格式(csv 或 json)
 * @returns 格式化的查询结果
 */
export async function exportQuery(query: string, format: string) {
  try {
    if (!query.trim().toLowerCase().startsWith("select")) {
      throw new Error("Only SELECT queries are allowed with export_query");
    }

    const result = await dbAll(query);
    
    if (format === "csv") {
      const csvData = convertToCSV(result);
      return {
        content: [{ 
          type: "text", 
          text: csvData
        }],
        isError: false,
      };
    } else if (format === "json") {
      return formatSuccessResponse(result);
    } else {
      throw new Error("Unsupported export format. Use 'csv' or 'json'");
    }
  } catch (error: any) {
    throw new Error(`Export Error: ${error.message}`);
  }
} 