import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'app.db');
console.log('Inspecting DB at:', dbPath);

try {
  const db = new Database(dbPath);
  
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('--- Tables ---');
  for (const table of tables) {
    console.log(`\nTable: ${table.name}`);
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.log(columns.map(c => `${c.name} (${c.type})`).join(', '));
  }
  
  db.close();
} catch (err) {
  console.error('Error:', err);
}
