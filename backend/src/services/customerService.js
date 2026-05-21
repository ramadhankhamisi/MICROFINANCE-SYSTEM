import { query } from '../config/database.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

export class CustomerService {
  static async createCustomer(data, branchId) {
    const { firstName, lastName, email, phone, nationalId, address, dateOfBirth } = data;

    const existingCustomer = await query(
      'SELECT id FROM customers WHERE national_id = $1 AND branch_id = $2',
      [nationalId, branchId]
    );

    if (existingCustomer.rows.length > 0) {
      throw new ValidationError('Customer with this national ID already exists');
    }

    const result = await query(
      `INSERT INTO customers (first_name, last_name, email, phone, national_id, address, date_of_birth, branch_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [firstName, lastName, email, phone, nationalId, address, dateOfBirth, branchId, 'active']
    );

    return result.rows[0];
  }

  static async getCustomer(customerId, branchId) {
    const result = await query(
      'SELECT * FROM customers WHERE id = $1 AND branch_id = $2',
      [customerId, branchId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Customer not found');
    }

    return result.rows[0];
  }

  static async getCustomers(branchId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const countResult = await query(
      'SELECT COUNT(*) as total FROM customers WHERE branch_id = $1',
      [branchId]
    );

    const dataResult = await query(
      'SELECT * FROM customers WHERE branch_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [branchId, limit, offset]
    );

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit),
      },
    };
  }

  static async updateCustomer(customerId, branchId, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach((key) => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = $${paramCount}`);
      values.push(data[key]);
      paramCount++;
    });

    values.push(customerId, branchId);

    const result = await query(
      `UPDATE customers SET ${fields.join(', ')} WHERE id = $${paramCount} AND branch_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Customer not found');
    }

    return result.rows[0];
  }

  static async deleteCustomer(customerId, branchId) {
    await query(
      'UPDATE customers SET status = $1 WHERE id = $2 AND branch_id = $3',
      ['inactive', customerId, branchId]
    );
  }
}
