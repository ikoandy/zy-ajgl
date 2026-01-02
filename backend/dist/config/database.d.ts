import mysql from 'mysql2/promise';
export declare const dbConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    charset: string;
    timezone: string;
    connectionLimit: number;
    acquireTimeout: number;
    timeout: number;
    reconnect: boolean;
    pool: {
        max: number;
        min: number;
        acquireTimeout: number;
        idleTimeout: number;
    };
};
export declare const createPool: () => mysql.Pool;
export declare const pool: mysql.Pool;
export declare const testConnection: () => Promise<boolean>;
export declare const query: (sql: string, params?: any[]) => Promise<any>;
export declare const transaction: (callback: (connection: any) => Promise<void>) => Promise<void>;
//# sourceMappingURL=database.d.ts.map