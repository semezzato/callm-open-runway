import knex, { Knex } from 'knex';
import path from 'path';

export interface Message {
  id?: number;
  session_id: string;
  role: 'user' | 'model';
  content: string;
  created_at?: string;
}

export class SessionService {
  private db: Knex;

  constructor(dbPath: string) {
    this.db = knex({
      client: 'sqlite3',
      connection: {
        filename: dbPath
      },
      useNullAsDefault: true
    });
  }

  async init() {
    const hasTable = await this.db.schema.hasTable('messages');
    if (!hasTable) {
      await this.db.schema.createTable('messages', table => {
        table.increments('id').primary();
        table.string('session_id').index();
        table.string('role');
        table.text('content');
        table.timestamp('created_at').defaultTo(this.db.fn.now());
      });
    }
  }

  async addMessage(message: Message) {
    return this.db('messages').insert(message);
  }

  async getSessionHistory(sessionId: string): Promise<Message[]> {
    return this.db('messages')
      .where({ session_id: sessionId })
      .orderBy('created_at', 'asc');
  }

  async listSessions(): Promise<any[]> {
    return this.db('messages')
      .select('session_id')
      .count('id as message_count')
      .max('created_at as last_message_at')
      .groupBy('session_id')
      .orderBy('last_message_at', 'desc');
  }

  async close() {
    await this.db.destroy();
  }
}
