import {DbAdapter, createDbAdapter} from './adapter.js';

// 存储活动的数据库适配器
let dbAdapter: DbAdapter | null = null;

/**
 * 初始化数据库连接
 * @param connectionInfo 连接信息对象或 SQLite 路径字符串
 * @param dbType 数据库类型 ('sqlite' 或 'sqlserver')
 */
export async function initDatabase(connectionInfo: any, dbType: string = 'sqlite'): Promise<void> {
    try {
        // 如果 connectionInfo 是字符串,则假定它是 SQLite 路径
        if (typeof connectionInfo === 'string') {
            connectionInfo = {path: connectionInfo};
        }

        // 根据数据库类型创建相应的适配器
        dbAdapter = createDbAdapter(dbType, connectionInfo);

        // 初始化连接
        await dbAdapter.init();
    } catch (error) {
        throw new Error(`数据库初始化失败: ${(error as Error).message}`);
    }
}

/**
 * 执行 SQL 查询并获取所有结果
 * @param query 要执行的 SQL 查询
 * @param params 查询参数
 * @returns 包含查询结果的 Promise
 */
export function dbAll(query: string, params: any[] = []): Promise<any[]> {
    if (!dbAdapter) {
        throw new Error("数据库未初始化");
    }
    return dbAdapter.all(query, params);
}

/**
 * 执行修改数据的 SQL 查询
 * @param query 要执行的 SQL 查询
 * @param params 查询参数
 * @returns 包含结果信息的 Promise
 */
export function dbRun(query: string, params: any[] = []): Promise<{ changes: number, lastID: number }> {
    if (!dbAdapter) {
        throw new Error("数据库未初始化");
    }
    return dbAdapter.run(query, params);
}

/**
 * 执行多条 SQL 语句
 * @param query 要执行的 SQL 语句
 * @returns 执行完成后解析的 Promise
 */
export function dbExec(query: string): Promise<void> {
    if (!dbAdapter) {
        throw new Error("数据库未初始化");
    }
    return dbAdapter.exec(query);
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): Promise<void> {
    if (!dbAdapter) {
        return Promise.resolve();
    }
    return dbAdapter.close();
}

/**
 * 获取数据库元数据
 */
export function getDatabaseMetadata(): {
    name: string,
    type: string,
    path?: string,
    server?: string,
    database?: string
} {
    if (!dbAdapter) {
        throw new Error("数据库未初始化");
    }
    return dbAdapter.getMetadata();
}

/**
 * 获取列出表的数据库特定查询
 */
export function getListTablesQuery(): string {
    if (!dbAdapter) {
        throw new Error("数据库未初始化");
    }
    return dbAdapter.getListTablesQuery();
}

/**
 * 获取描述表的数据库特定查询
 * @param tableName 表名
 */
export function getDescribeTableQuery(tableName: string): string {
    if (!dbAdapter) {
        throw new Error("数据库未初始化");
    }
    return dbAdapter.getDescribeTableQuery(tableName);
} 