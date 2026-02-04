import {dbAll, dbExec, getListTablesQuery, getDescribeTableQuery} from '../db/index.js';
import {formatSuccessResponse} from '../utils/formatUtils.js';

/**
 * 从 SQL 语句中提取表名
 * @param query SQL 语句
 * @param operation SQL 操作类型（CREATE TABLE、ALTER TABLE 等）
 * @returns 提取的表名或 null
 */
function extractTableName(query: string, operation: string): string | null {
    try {
        const normalizedQuery = query.trim().replace(/\s+/g, ' ');
        const operationPrefix = operation.toLowerCase();

        if (!normalizedQuery.toLowerCase().startsWith(operationPrefix)) {
            return null;
        }

        // 移除操作前缀后的剩余部分
        const afterOperation = normalizedQuery.substring(operationPrefix.length).trim();

        // 处理 IF NOT EXISTS 或 IF EXISTS 等子句
        const patterns = [
            /^if\s+not\s+exists\s+([^\s(]+)/i,  // CREATE TABLE IF NOT EXISTS tablename
            /^if\s+exists\s+([^\s(]+)/i,        // DROP TABLE IF EXISTS tablename
            /^([^\s(]+)/                        // CREATE TABLE tablename
        ];

        for (const pattern of patterns) {
            const match = afterOperation.match(pattern);
            if (match && match[1]) {
                // 移除引号（如果有）
                return match[1].replace(/^[`"[]|[`"\]]$/g, '');
            }
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * 在数据库中创建新表
 * @param query CREATE TABLE SQL 语句
 * @param confirm 安全确认标志（默认 false，防止误操作）
 * @returns 操作结果
 */
export async function createTable(query: string, confirm: boolean = false) {
    try {
        if (!query.trim().toLowerCase().startsWith("create table")) {
            throw new Error("只允许执行 CREATE TABLE 语句");
        }

        // 确认检查：防止误操作
        if (!confirm) {
            const tableName = extractTableName(query, "CREATE TABLE");
            const tableInfo = tableName ? ` '${tableName}'` : '';
            return formatSuccessResponse({
                success: false,
                message: `需要安全确认。设置 confirm=true 以继续创建表${tableInfo}。`
            });
        }

        await dbExec(query);
        return formatSuccessResponse({success: true, message: "表创建成功"});
    } catch (error: any) {
        throw new Error(`SQL 错误: ${error.message}`);
    }
}

/**
 * 修改现有表的结构
 * @param query ALTER TABLE SQL 语句
 * @param confirm 安全确认标志（默认 false，防止误操作）
 * @returns 操作结果
 */
export async function alterTable(query: string, confirm: boolean = false) {
    try {
        if (!query.trim().toLowerCase().startsWith("alter table")) {
            throw new Error("只允许执行 ALTER TABLE 语句");
        }

        // 确认检查：防止误操作
        if (!confirm) {
            const tableName = extractTableName(query, "ALTER TABLE");
            const tableInfo = tableName ? ` '${tableName}'` : '';
            return formatSuccessResponse({
                success: false,
                message: `需要安全确认。设置 confirm=true 以继续修改表结构${tableInfo}。`
            });
        }

        await dbExec(query);
        return formatSuccessResponse({success: true, message: "表结构修改成功"});
    } catch (error: any) {
        throw new Error(`SQL 错误: ${error.message}`);
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
            throw new Error("表名不能为空");
        }

        if (!confirm) {
            return formatSuccessResponse({
                success: false,
                message: "需要安全确认。设置 confirm=true 以继续删除表。"
            });
        }

        // First check if table exists by directly querying for tables
        const query = getListTablesQuery();
        const tables = await dbAll(query);
        const tableNames = tables.map(t => t.name);

        if (!tableNames.includes(tableName)) {
            throw new Error(`表 '${tableName}' 不存在`);
        }

        // 删除表
        await dbExec(`DROP TABLE "${tableName}"`);

        return formatSuccessResponse({
            success: true,
            message: `表 '${tableName}' 删除成功`
        });
    } catch (error: any) {
        throw new Error(`删除表失败: ${error.message}`);
    }
}

/**
 * 列出数据库中的所有表
 * @returns 表名数组
 */
export async function listTables() {
    try {
        // 使用适配器特定的查询来列出表
        const query = getListTablesQuery();
        const tables = await dbAll(query);
        return formatSuccessResponse(tables.map((t) => t.name));
    } catch (error: any) {
        throw new Error(`列出表失败: ${error.message}`);
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
            throw new Error("表名不能为空");
        }

        // 首先通过直接查询来检查表是否存在
        const query = getListTablesQuery();
        const tables = await dbAll(query);
        const tableNames = tables.map(t => t.name);

        if (!tableNames.includes(tableName)) {
            throw new Error(`Table '${tableName}' does not exist`);
        }

        // 使用适配器特定的查询来描述表结构
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
        throw new Error(`描述表结构失败: ${error.message}`);
    }
} 