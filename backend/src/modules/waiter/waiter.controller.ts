/**
 * Waiter Controller - HTTP Request Handlers
 * FAANG-level implementation with proper error handling
 */

import { Request, Response, NextFunction } from 'express';
import { WaiterService } from './waiter.service';
import {
  restaurantIdParamSchema,
  callIdParamSchema,
  orderIdParamSchema,
  createWaiterCallSchema,
  getCallsQuerySchema,
  getTablesQuerySchema,
} from './waiter.schema';

const waiterService = new WaiterService();

export class WaiterController {
  /**
   * GET /api/waiter/:restaurantId/dashboard
   * Get full dashboard data
   */
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse(req.params);
      const userId = req.user!.id;

      const dashboard = await waiterService.getDashboard(userId, restaurantId);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/waiter/:restaurantId/tables
   * Get all tables with session info
   */
  async getTables(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse(req.params);
      const query = getTablesQuerySchema.parse(req.query);
      const userId = req.user!.id;

      const tables = await waiterService.getTables(userId, restaurantId, query);

      res.json({
        success: true,
        data: tables,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/waiter/:restaurantId/ready-orders
   * Get all ready orders awaiting delivery
   */
  async getReadyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse(req.params);
      const userId = req.user!.id;

      // Verify access
      await waiterService.getDashboard(userId, restaurantId);
      const orders = await waiterService.getReadyOrders(restaurantId);

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/waiter/:restaurantId/orders/:orderId/deliver
   * Mark order as delivered
   */
  async deliverOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse({ restaurantId: req.params.restaurantId });
      const { orderId } = orderIdParamSchema.parse({ orderId: req.params.orderId });
      const userId = req.user!.id;

      const order = await waiterService.deliverOrder(userId, restaurantId, orderId);

      res.json({
        success: true,
        message: 'Pedido entregue com sucesso',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/waiter/:restaurantId/calls
   * Get waiter calls with filters
   */
  async getCalls(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse(req.params);
      const query = getCallsQuerySchema.parse(req.query);
      const userId = req.user!.id;

      const result = await waiterService.getCalls(userId, restaurantId, query);

      res.json({
        success: true,
        data: result.calls,
        pagination: {
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/waiter/:restaurantId/calls
   * Create a new waiter call (from customer)
   */
  async createCall(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse(req.params);
      const data = createWaiterCallSchema.parse(req.body);
      const userId = req.user!.id;

      const call = await waiterService.createCall(userId, restaurantId, data);

      res.status(201).json({
        success: true,
        message: 'Garçom chamado com sucesso',
        data: call,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/waiter/:restaurantId/calls/:callId/acknowledge
   * Acknowledge a waiter call
   */
  async acknowledgeCall(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse({ restaurantId: req.params.restaurantId });
      const { callId } = callIdParamSchema.parse({ callId: req.params.callId });
      const userId = req.user!.id;

      const call = await waiterService.acknowledgeCall(userId, restaurantId, callId);

      res.json({
        success: true,
        message: 'Chamada atendida',
        data: call,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/waiter/:restaurantId/calls/:callId/complete
   * Complete a waiter call
   */
  async completeCall(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse({ restaurantId: req.params.restaurantId });
      const { callId } = callIdParamSchema.parse({ callId: req.params.callId });
      const userId = req.user!.id;

      const call = await waiterService.completeCall(userId, restaurantId, callId);

      res.json({
        success: true,
        message: 'Chamada completada',
        data: call,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/waiter/:restaurantId/stats
   * Get waiter statistics
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse(req.params);
      const userId = req.user!.id;

      // Verify access
      await waiterService.getDashboard(userId, restaurantId);
      const stats = await waiterService.getStats(restaurantId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const waiterController = new WaiterController();
