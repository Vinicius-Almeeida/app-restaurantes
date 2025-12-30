import type { Response } from 'express';
import { AdminService } from './admin.service';
import type { AuthRequest } from '../../middlewares/auth';

const adminService = new AdminService();

export class AdminController {
  async getDashboardMetrics(req: AuthRequest, res: Response) {
    const metrics = await adminService.getDashboardMetrics(req.query.period as string);
    res.json({ success: true, data: metrics });
  }

  async listRestaurants(req: AuthRequest, res: Response) {
    const result = await adminService.listRestaurants(req.query as Record<string, unknown>);
    res.json({ success: true, data: result });
  }

  async getRestaurantDetails(req: AuthRequest, res: Response) {
    const restaurant = await adminService.getRestaurantDetails(req.params.id);
    res.json({ success: true, data: restaurant });
  }

  async listUsers(req: AuthRequest, res: Response) {
    const result = await adminService.listUsers(req.query as Record<string, unknown>);
    res.json({ success: true, data: result });
  }

  async listPlans(req: AuthRequest, res: Response) {
    const plans = await adminService.listPlans();
    res.json({ success: true, data: plans });
  }

  async createPlan(req: AuthRequest, res: Response) {
    const plan = await adminService.createPlan(req.body);
    res.status(201).json({ success: true, data: plan });
  }

  async updatePlan(req: AuthRequest, res: Response) {
    const plan = await adminService.updatePlan(req.params.id, req.body);
    res.json({ success: true, data: plan });
  }

  async listSubscriptions(req: AuthRequest, res: Response) {
    const result = await adminService.listSubscriptions(req.query as Record<string, unknown>);
    res.json({ success: true, data: result });
  }

  async updateSubscription(req: AuthRequest, res: Response) {
    const subscription = await adminService.updateSubscription(req.params.id, req.body);
    res.json({ success: true, data: subscription });
  }

  async listConsultants(req: AuthRequest, res: Response) {
    const consultants = await adminService.listConsultants();
    res.json({ success: true, data: consultants });
  }

  async createConsultant(req: AuthRequest, res: Response) {
    const consultant = await adminService.createConsultant(req.body);
    res.status(201).json({ success: true, data: consultant });
  }

  async updateConsultant(req: AuthRequest, res: Response) {
    const consultant = await adminService.updateConsultant(req.params.id, req.body);
    res.json({ success: true, data: consultant });
  }

  async getConsultantPerformance(req: AuthRequest, res: Response) {
    const consultant = await adminService.getConsultantPerformance(req.params.id);
    res.json({ success: true, data: consultant });
  }

  async getEscalatedComplaints(req: AuthRequest, res: Response) {
    const complaints = await adminService.getEscalatedComplaints();
    res.json({ success: true, data: complaints });
  }
}
