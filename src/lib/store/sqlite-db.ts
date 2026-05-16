import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

/**
 * Sovereign Intelligence Layer - SQLite Wasm Manager
 */
export class SqliteDatabase {
  private static instance: SqliteDatabase;
  private db: unknown = null;
  private ready: Promise<void>;

  private constructor() {
    this.ready = this.init();
  }

  public static getInstance(): SqliteDatabase {
    if (!SqliteDatabase.instance) {
      SqliteDatabase.instance = new SqliteDatabase();
    }
    return SqliteDatabase.instance;
  }

  private async init() {
    if (typeof window === "undefined") return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sqlite3 = await (sqlite3InitModule as any)();

      if ("opfs" in sqlite3) {
        this.db = new sqlite3.oo1.OpfsDb("/sovereign_intelligence.db");
      } else {
        this.db = new sqlite3.oo1.DB("/sovereign_intelligence.db", "ct");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const database = this.db as any;
      database.exec(`
        CREATE TABLE IF NOT EXISTS pii_fragments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          value TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(type, value)
        );
      `);
    } catch (err) {
      console.error("[SQLite] Failed to initialize database:", err);
    }
  }

  async exec(sql: string, params: unknown[] = []) {
    await this.ready;
    if (!this.db) throw new Error("Database not initialized");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.db as any).exec(sql, { bind: params, returnValue: "resultRows" });
  }

  async getDb() {
    await this.ready;
    return this.db;
  }
}

export const db = SqliteDatabase.getInstance();
