import { DbAdapter } from "./adapter.js";
import sql from 'mssql';

/**
 * SQL Server 数据库适配器实现
 */
export class SqlServerAdapter implements DbAdapter {
  private pool: sql.ConnectionPool | null = null;
  private config: sql.config;
  private server: string;
  private database: string;

  constructor(connectionInfo: {
    server: string;
    database: string;
    user?: string;
    password?: string;
    port?: number;
    trustServerCertificate?: boolean;
    options?: any;
  }) {
    this.server = connectionInfo.server;
    this.database = connectionInfo.database;
    
    // 创建 SQL Server 连接配置
    this.config = {
      server: connectionInfo.server,
      database: connectionInfo.database,
      port: connectionInfo.port || 1433,
      options: {
        trustServerCertificate: connectionInfo.trustServerCertificate ?? true,
        ...connectionInfo.options
      }
    };

    // 添加认证选项
    if (connectionInfo.user && connectionInfo.password) {
      this.config.user = connectionInfo.user;
      this.config.password = connectionInfo.password;
    } else {
      // 如果未提供用户名/密码,则使用 Windows 身份验证
      this.config.options!.trustedConnection = true;
      this.config.options!.enableArithAbort = true;
    }
  }

  /**
   * 初始化 SQL Server 连接
   */
  async init(): Promise<void> {
    try {
      console.error(`[INFO] Connecting to SQL Server: ${this.server}, Database: ${this.database}`);
      this.pool = await new sql.ConnectionPool(this.config).connect();
      console.error(`[INFO] SQL Server connection established successfully`);
    } catch (err) {
      console.error(`[ERROR] SQL Server connection error: ${(err as Error).message}`);
      throw new Error(`Failed to connect to SQL Server: ${(err as Error).message}`);
    }
  }

  /**
   * 执行 SQL 查询并获取所有结果
   * @param query 要执行的 SQL 查询
   * @param params 查询参数
   * @returns 包含查询结果的 Promise
   */
  async all(query: string, params: any[] = []): Promise<any[]> {
    if (!this.pool) {
      throw new Error("Database not initialized");
    }

    try {
      const request = this.pool.request();
      
      // 向请求添加参数
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
      
      // 将 ? 替换为命名参数
      const preparedQuery = query.replace(/\?/g, (_, i) => `@param${i}`);
      
      const result = await request.query(preparedQuery);
      return result.recordset;
    } catch (err) {
      throw new Error(`SQL Server query error: ${(err as Error).message}`);
    }
  }

  /**
   * 执行修改数据的 SQL 查询
   * @param query 要执行的 SQL 查询
   * @param params 查询参数
   * @returns 包含结果信息的 Promise
   */
  async run(query: string, params: any[] = []): Promise<{ changes: number, lastID: number }> {
    if (!this.pool) {
      throw new Error("Database not initialized");
    }

    try {
      const request = this.pool.request();
      
      // 向请求添加参数
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
      
      // 将 ? 替换为命名参数
      const preparedQuery = query.replace(/\?/g, (_, i) => `@param${i}`);
      
      // 如果是 INSERT,添加标识值的输出参数
      let lastID = 0;
      if (query.trim().toUpperCase().startsWith('INSERT')) {
        request.output('insertedId', sql.Int, 0);
        const updatedQuery = `${preparedQuery}; SELECT @insertedId = SCOPE_IDENTITY();`;
        const result = await request.query(updatedQuery);
        lastID = result.output.insertedId || 0;
      } else {
        const result = await request.query(preparedQuery);
        lastID = 0;
      }
      
      return { 
        changes: this.getAffectedRows(query, lastID), 
        lastID: lastID 
      };
    } catch (err) {
      throw new Error(`SQL Server query error: ${(err as Error).message}`);
    }
  }

  /**
   * 执行多条 SQL 语句
   * @param query 要执行的 SQL 语句
   * @returns 执行完成后解析的 Promise
   */
  async exec(query: string): Promise<void> {
    if (!this.pool) {
      throw new Error("Database not initialized");
    }

    try {
      const request = this.pool.request();
      await request.batch(query);
    } catch (err) {
      throw new Error(`SQL Server batch error: ${(err as Error).message}`);
    }
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }

  /**
   * 获取数据库元数据
   */
  getMetadata(): { name: string, type: string, server: string, database: string } {
    return {
      name: "SQL Server",
      type: "sqlserver",
      server: this.server,
      database: this.database
    };
  }

  /**
   * 获取列出表的数据库特定查询
   */
  getListTablesQuery(): string {
    return "SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME";
  }

  /**
   * 获取描述表的数据库特定查询
   * @param tableName 表名
   */
  getDescribeTableQuery(tableName: string): string {
    return `
      SELECT 
        c.COLUMN_NAME as name,
        c.DATA_TYPE as type,
        CASE WHEN c.IS_NULLABLE = 'NO' THEN 1 ELSE 0 END as notnull,
        CASE WHEN pk.CONSTRAINT_TYPE = 'PRIMARY KEY' THEN 1 ELSE 0 END as pk,
        c.COLUMN_DEFAULT as dflt_value
      FROM 
        INFORMATION_SCHEMA.COLUMNS c
      LEFT JOIN 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON c.TABLE_NAME = kcu.TABLE_NAME AND c.COLUMN_NAME = kcu.COLUMN_NAME
      LEFT JOIN 
        INFORMATION_SCHEMA.TABLE_CONSTRAINTS pk ON kcu.CONSTRAINT_NAME = pk.CONSTRAINT_NAME AND pk.CONSTRAINT_TYPE = 'PRIMARY KEY'
      WHERE 
        c.TABLE_NAME = '${tableName}'
      ORDER BY 
        c.ORDINAL_POSITION
    `;
  }

  /**
   * 根据查询类型获取受影响行数的辅助方法
   */
  private getAffectedRows(query: string, lastID: number): number {
    const queryType = query.trim().split(' ')[0].toUpperCase();
    if (queryType === 'INSERT' && lastID > 0) {
      return 1;
    }
    return 0; // 对于 SELECT 返回 0,对于 UPDATE/DELETE 在没有额外查询的情况下未知
  }
} 