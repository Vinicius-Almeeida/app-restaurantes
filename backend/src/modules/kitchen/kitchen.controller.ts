/**
 * Kitchen Controller - HTTP Request Handlers
 * FAANG-level implementation with proper error handling
 */

import { Request, Response, NextFunction } from 'express';
import { KitchenService } from './kitchen.service';
import {
  getOrdersQuerySchema,
  restaurantIdParamSchema,
  orderIdParamSchema,
  startOrderSchema,
  markOrderReadySchema,
} from './kitchen.schema';

const kitchenService = new KitchenService();

export class KitchenController {
  /**
   * GET /api/kitchen/:restaurantId/orders
   * Get all active orders for Kanban board
   */
  async getActiveOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse(req.params);
      const userId = req.user!.id;

      const orders = await kitchenService.getActiveOrders(userId, restaurantId);

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/kitchen/:restaurantId/orders/list
   * Get orders with pagination and status filter
   */
  async getOrdersByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse(req.params);
      const query = getOrdersQuerySchema.parse(req.query);
      const userId = req.user!.id;

      const result = await kitchenService.getOrdersByStatus(userId, restaurantId, query);

      res.json({
        success: true,
        data: result.orders,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/kitchen/:restaurantId/orders/:orderId
   * Get single order details
   */
  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse({ restaurantId: req.params.restaurantId });
      const { orderId } = orderIdParamSchema.parse({ orderId: req.params.orderId });
      const userId = req.user!.id;

      const order = await kitchenService.getOrderById(userId, restaurantId, orderId);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/kitchen/:restaurantId/stats
   * Get kitchen statistics
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse(req.params);
      const userId = req.user!.id;

      // Verify access first
      await kitchenService.getActiveOrders(userId, restaurantId);
      const stats = await kitchenService.getStats(restaurantId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/kitchen/:restaurantId/orders/:orderId/confirm
   * Confirm order (PENDING -> CONFIRMED)
   */
  async confirmOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse({ restaurantId: req.params.restaurantId });
      const { orderId } = orderIdParamSchema.parse({ orderId: req.params.orderId });
      const userId = req.user!.id;

      const order = await kitchenService.confirmOrder(userId, restaurantId, orderId);

      res.json({
        success: true,
        message: 'Pedido confirmado com sucesso',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/kitchen/:restaurantId/orders/:orderId/start
   * Start preparing order (CONFIRMED -> PREPARING)
   */
  async startOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse({ restaurantId: req.params.restaurantId });
      const { orderId } = orderIdParamSchema.parse({ orderId: req.params.orderId });
      const data = startOrderSchema.parse(req.body);
      const userId = req.user!.id;

      const order = await kitchenService.startOrder(userId, restaurantId, orderId, data);

      res.json({
        success: true,
        message: 'Preparação do pedido iniciada',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/kitchen/:restaurantId/orders/:orderId/ready
   * Mark order as ready (PREPARING -> READY)
   */
  async markOrderReady(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse({ restaurantId: req.params.restaurantId });
      const { orderId } = orderIdParamSchema.parse({ orderId: req.params.orderId });
      const data = markOrderReadySchema.parse(req.body);
      const userId = req.user!.id;

      const order = await kitchenService.markOrderReady(userId, restaurantId, orderId, data);

      res.json({
        success: true,
        message: 'Pedido marcado como pronto',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/kitchen/:restaurantId/orders/:orderId/cancel
   * Cancel order
   */
  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = restaurantIdParamSchema.parse({ restaurantId: req.params.restaurantId });
      const { orderId } = orderIdParamSchema.parse({ orderId: req.params.orderId });
      const { reason } = req.body;
      const userId = req.user!.id;

      const order = await kitchenService.cancelOrder(userId, restaurantId, orderId, reason);

      res.json({
        success: true,
        message: 'Pedido cancelado',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const kitchenController = new KitchenController();
