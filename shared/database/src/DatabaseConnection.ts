import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface IQueryResult<T = RowDataPacket> {
  rows: T[];
  fields?: mysql.FieldPacket[];
}

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'realestate_db',
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20', 10),
      queueLimit: 0,
      charset: 'utf8mb4',
      timezone: '+02:00',
      connectTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query<T extends RowDataPacket>(
    sql: string,
    params?: unknown[],
  ): Promise<IQueryResult<T>> {
    const [rows, fields] = await this.pool.query<T[]>(sql, params);
    return { rows, fields };
  }

  public async execute<T extends RowDataPacket>(
    sql: string,
    params?: unknown[],
  ): Promise<IQueryResult<T>> {
    const [rows, fields] = await this.pool.execute<T[]>(sql, params);
    return { rows, fields };
  }

  public async executeModify(sql: string, params?: unknown[]): Promise<ResultSetHeader> {
    const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
    return result;
  }

  public async getConnection(): Promise<PoolConnection> {
    return this.pool.getConnection();
  }

  public async transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.pool.execute('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
