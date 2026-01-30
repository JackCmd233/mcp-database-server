import { dbAll, dbExec, getListTablesQuery, getDescribeTableQuery } from '../db/index.js';
import { formatSuccessResponse } from '../utils/formatUtils.js';

/**
 * 在数据库中创建新表
 * @param query CREATE TABLE SQL 语句
 * @returns 操作结果
 */
export async function createTable(query: string) {
  try {
    if (!query.trim().toLowerCase().startsWith("create table")) {
      throw new Error("Only CREATE TABLE statements are allowed");
    }

    await dbExec(query);
    return formatSuccessResponse({ success: true, message: "Table created successfully" });
  } catch (error: any) {
    throw new Error(`SQL Error: ${error.message}`);
  }
}

/**
 * 修改现有表的结构
 * @param query ALTER TABLE SQL 语句
 * @returns 操作结果
 */
export async function alterTable(query: string) {
  try {
    if (!query.trim().toLowerCase().startsWith("alter table")) {
      throw new Error("Only ALTER TABLE statements are allowed");
    }

    await dbExec(query);
    return formatSuccessResponse({ success: true, message: "Table altered successfully" });
  } catch (error: any) {
    throw new Error(`SQL Error: ${error.message}`);
  }
}

/**
 * 从数据库中删除表
 * @param tableName 要删除的表名
 * @param confirm 安全确认标志
 * @returns 操作结果
 */
export async function dropTable(tableName: string, confirm: boolean) {
  try {
    if (!tableName) {
      throw new Error("Table name is required");
    }
    
    if (!confirm) {
      return formatSuccessResponse({ 
        success: false, 
        message: "Safety confirmation required. Set confirm=true to proceed with dropping the table." 
      });
    }

    // First check if table exists by directly querying for tables
    const query = getListTablesQuery();
    const tables = await dbAll(query);
    const tableNames = tables.map(t => t.name);
    
    if (!tableNames.includes(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }
    
    // Drop the table
    await dbExec(`DROP TABLE "${tableName}"`);
    
    return formatSuccessResponse({ 
      success: true, 
      message: `Table '${tableName}' dropped successfully` 
    });
  } catch (error: any) {
    throw new Error(`Error dropping table: ${error.message}`);
  }
}

/**
 * 列出数据库中的所有表
 * @returns 表名数组
 */
export async function listTables() {
  try {
    // Use adapter-specific query for listing tables
    const query = getListTablesQuery();
    const tables = await dbAll(query);
    return formatSuccessResponse(tables.map((t) => t.name));
  } catch (error: any) {
    throw new Error(`Error listing tables: ${error.message}`);
  }
}

/**
 * 获取指定表的结构信息
 * @param tableName 要描述的表名
 * @returns 表的列定义
 */
export async function describeTable(tableName: string) {
  try {
    if (!tableName) {
      throw new Error("Table name is required");
    }

    // First check if table exists by directly querying for tables
    const query = getListTablesQuery();
    const tables = await dbAll(query);
    const tableNames = tables.map(t => t.name);
    
    if (!tableNames.includes(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }
    
    // Use adapter-specific query for describing tables
    const descQuery = getDescribeTableQuery(tableName);
    const columns = await dbAll(descQuery);
    
    return formatSuccessResponse(columns.map((col) => ({
      name: col.name,
      type: col.type,
      notnull: !!col.notnull,
      default_value: col.dflt_value,
      primary_key: !!col.pk,
      comment: col.comment || null
    })));
  } catch (error: any) {
    throw new Error(`Error describing table: ${error.message}`);
  }
} 