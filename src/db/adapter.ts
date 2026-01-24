/**
 * 数据库适配器接口
 * 定义所有数据库实现的契约(SQLite、SQL Server)
 */
export interface DbAdapter {
  /**
   * 初始化数据库连接
   */
  init(): Promise<void>;

  /**
   * 关闭数据库连接
   */
  close(): Promise<void>;

  /**
   * 执行查询并返回所有结果
   * @param query 要执行的 SQL 查询
   * @param params 查询参数
   */
  all(query: string, params?: any[]): Promise<any[]>;

  /**
   * 执行修改数据的查询
   * @param query 要执行的 SQL 查询
   * @param params 查询参数
   */
  run(query: string, params?: any[]): Promise<{ changes: number, lastID: number }>;

  /**
   * 执行多条 SQL 语句
   * @param query 要执行的 SQL 语句
   */
  exec(query: string): Promise<void>;

  /**
   * 获取数据库元数据
   */
  getMetadata(): { name: string, type: string, path?: string, server?: string, database?: string };

  /**
   * 获取列出表的数据库特定查询
   */
  getListTablesQuery(): string;

  /**
   * 获取描述表的数据库特定查询
   * @param tableName 表名
   */
  getDescribeTableQuery(tableName: string): string;
}

// 使用动态导入适配器
import { SqliteAdapter } from './sqlite-adapter.js';
import { SqlServerAdapter } from './sqlserver-adapter.js';
import { PostgresqlAdapter } from './postgresql-adapter.js';
import { MysqlAdapter } from './mysql-adapter.js';

/**
 * 工厂函数,创建相应的数据库适配器
 */
export function createDbAdapter(type: string, connectionInfo: any): DbAdapter {
  switch (type.toLowerCase()) {
    case 'sqlite':
      // 对于 SQLite,如果 connectionInfo 是字符串,则直接将其用作路径
      if (typeof connectionInfo === 'string') {
        return new SqliteAdapter(connectionInfo);
      } else {
        return new SqliteAdapter(connectionInfo.path);
      }
    case 'sqlserver':
      return new SqlServerAdapter(connectionInfo);
    case 'postgresql':
    case 'postgres':
      return new PostgresqlAdapter(connectionInfo);
    case 'mysql':
      return new MysqlAdapter(connectionInfo);
    default:
      throw new Error(`Unsupported database type: ${type}`);
  }
} 