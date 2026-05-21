import { CustomerService } from '../services/customerService.js';
import { sendSuccess, sendPaginatedSuccess, sendError } from '../utils/responseUtils.js';

export class CustomerController {
  static async create(req, res, next) {
    try {
      const customer = await CustomerService.createCustomer(req.body, req.user.branchId);
      sendSuccess(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req, res, next) {
    try {
      const customer = await CustomerService.getCustomer(req.params.id, req.user.branchId);
      sendSuccess(res, customer, 'Customer retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await CustomerService.getCustomers(
        req.user.branchId,
        parseInt(page),
        parseInt(limit)
      );
      sendPaginatedSuccess(res, result.data, result.pagination, 'Customers retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const customer = await CustomerService.updateCustomer(
        req.params.id,
        req.user.branchId,
        req.body
      );
      sendSuccess(res, customer, 'Customer updated');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await CustomerService.deleteCustomer(req.params.id, req.user.branchId);
      sendSuccess(res, null, 'Customer deleted');
    } catch (error) {
      next(error);
    }
  }
}
