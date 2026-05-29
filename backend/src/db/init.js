import { getClient } from '../config/database.js';
import { hashPassword } from '../utils/passwordUtils.js';
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
    const branchResult = await client.query(
      `INSERT INTO branches (name, code, address, city, phone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (code) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      ['Main Branch', 'MAIN', 'Head office', 'Dar es Salaam', '+255700000000']
    );

    const branchId = branchResult.rows[0].id;
    const password = await hashPassword('Admin@123');

    await client.query(
      `INSERT INTO users (email, password, first_name, last_name, branch_id, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@microfinance.local', password, 'System', 'Admin', branchId, 'admin', 'active']
    );

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default initializeDatabase;
