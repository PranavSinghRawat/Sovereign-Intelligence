import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

/**
 * Sentinel Intelligence Layer - SQLite Wasm Manager
 */
export class SqliteDatabase {
  private static instance: SqliteDatabase;
  private db: unknown = null;
  private ready: Promise<void>;
  private isOpfs = false;
  private writeQueue: Promise<unknown> = Promise.resolve();

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
    // Allow initialization in both browser window and Web Worker (importScripts exists in workers)
    if (typeof window === "undefined" && typeof importScripts === "undefined") return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sqlite3 = await (sqlite3InitModule as any)();

      if ("opfs" in sqlite3) {
        this.db = new sqlite3.oo1.OpfsDb("/sentinel_intelligence.db");
        this.isOpfs = true;
      } else {
        this.db = new sqlite3.oo1.DB("/sentinel_intelligence.db", "ct");
        this.isOpfs = false;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const database = this.db as any;
      database.exec("PRAGMA foreign_keys = ON;");
      database.exec(`
        CREATE TABLE IF NOT EXISTS pii_fragments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          value TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(type, value)
        );
      `);
      database.exec(`
        CREATE TABLE IF NOT EXISTS api_cache (
          cache_key TEXT PRIMARY KEY,
          response_json TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );
      `);
      database.exec(`
        CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          size INTEGER NOT NULL,
          chunk_count INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      database.exec(`
        CREATE TABLE IF NOT EXISTS document_chunks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_name TEXT NOT NULL,
          chunk_index INTEGER NOT NULL,
          text_content TEXT NOT NULL,
          embedding_json TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(document_name) REFERENCES documents(name) ON DELETE CASCADE
        );
      `);
      database.exec(`
        CREATE TABLE IF NOT EXISTS peers (
          uri TEXT PRIMARY KEY,
          capabilities_json TEXT NOT NULL,
          latency INTEGER NOT NULL,
          reputation INTEGER NOT NULL DEFAULT 100,
          zk_identity_hash TEXT NOT NULL,
          last_seen INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      database.exec(`
        CREATE TABLE IF NOT EXISTS reputation_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          peer_uri TEXT NOT NULL,
          success BOOLEAN NOT NULL,
          score_change INTEGER NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(peer_uri) REFERENCES peers(uri) ON DELETE CASCADE
        );
      `);
    } catch (err) {
      console.error("[SQLite] Failed to initialize database:", err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async exec(sql: string, params: unknown[] = []): Promise<any[]> {
    await this.ready;
    if (!this.db) {
      if (typeof window === "undefined" && typeof importScripts === "undefined") {
        return [];
      }
      throw new Error("Database not initialized");
    }
    const resultPromise = this.writeQueue.then(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (this.db as any).exec(sql, { bind: params, returnValue: "resultRows" });
    });
    this.writeQueue = resultPromise.catch(() => {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return resultPromise as Promise<any[]>;
  }

  async getDb() {
    await this.ready;
    return this.db;
  }

  isOpfsUsed(): boolean {
    return this.isOpfs;
  }
}

export const db = SqliteDatabase.getInstance();
