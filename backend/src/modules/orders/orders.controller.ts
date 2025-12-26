import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { asyncHandler } from '../../utils/asyncHandler';
import type { CreateOrderInput, AddItemToOrderInput, UpdateOrderStatusInput, AddParticipantInput } from './orders.schema';

const ordersService = new OrdersService();

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: CreateOrderInput = req.body;

  const order = await ordersService.create(userId, data);

  res.status(201).json({
    message: 'Order created successfully',
    data: order,
  });
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  const { restaurantId } = req.query;

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const orders = await ordersService.findAll(
    userId,
    role,
    restaurantId as string | undefined
  );

  res.status(200).json({
    message: 'Orders retrieved successfully',
    data: orders,
  });
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await ordersService.findById(id);

  res.status(200).json({
    message: 'Order retrieved successfully',
    data: order,
  });
});

export const addItemToOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: AddItemToOrderInput = req.body;

  const orderItem = await ordersService.addItem(id, userId, data);

  res.status(201).json({
    message: 'Item added to order successfully',
    data: orderItem,
  });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const role = req.user?.role;

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: UpdateOrderStatusInput = req.body;

  const order = await ordersService.updateStatus(id, userId, role, data);

  res.status(200).json({
    message: 'Order status updated successfully',
    data: order,
  });
});

export const addParticipant = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: AddParticipantInput = req.body;

  const participant = await ordersService.addParticipant(id, userId, data);

  res.status(201).json({
    message: 'Participant added successfully',
    data: participant,
  });
});
