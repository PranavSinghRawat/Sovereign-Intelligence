import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

/**
 * Sovereign Intelligence Layer - SQLite Wasm Manager
 * 
 * Provides a persistent local-first database using OPFS (Origin Private File System).
 */
export class SqliteDatabase {
  private static instance: SqliteDatabase;
  private db: any = null;
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
      const sqlite3 = await (sqlite3InitModule as any)();

      if ("opfs" in sqlite3) {
        this.db = new sqlite3.oo1.OpfsDb("/sovereign_intelligence.db");
        console.log("[SQLite] Persistent OPFS database initialized.");
      } else {
        this.db = new sqlite3.oo1.DB("/sovereign_intelligence.db", "ct");
        console.warn("[SQLite] OPFS not available, falling back to transient/session storage.");
      }

      // Initialize schemas
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS pii_fragments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          value TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(type, value)
        );

        CREATE TABLE IF NOT EXISTS agent_checkpoints (
          thread_id TEXT,
          checkpoint_id TEXT,
          data BLOB,
          PRIMARY KEY (thread_id, checkpoint_id)
        );
      `);
    } catch (err) {
      console.error("[SQLite] Failed to initialize database:", err);
    }
  }

  async exec(sql: string, params: any[] = []) {
    await this.ready;
    if (!this.db) throw new Error("Database not initialized");
    return this.db.exec(sql, { bind: params, returnValue: "resultRows" });
  }

  async getDb() {
    await this.ready;
    return this.db;
  }
}

export const db = SqliteDatabase.getInstance();
