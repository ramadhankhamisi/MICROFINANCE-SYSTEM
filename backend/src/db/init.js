import { getClient } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const initializeDatabase = async () => {
  const client = await getClient();
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    console.log('✓ Database schema initialized successfully');
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase().catch(console.error);
}

export default initializeDatabase;
