import { Request, Response } from 'express';
import { TablesService } from './tables.service';

const tablesService = new TablesService();

export class TablesController {
  async createTable(req: Request, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const table = await tablesService.createTable(userId, req.body);
    res.status(201).json({ success: true, data: table });
  }

  async listTables(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { restaurantId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tables = await tablesService.listTables(restaurantId, userId);
    res.json({ success: true, data: tables });
  }

  async startSession(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { tableId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await tablesService.startSession(tableId, userId);
    res.status(result.isNew ? 201 : 200).json({ success: true, data: result });
  }

  async getActiveSession(req: Request, res: Response) {
    const session = await tablesService.getActiveSession(req.params.tableId);
    res.json({ success: true, data: session });
  }

  async approveMember(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { sessionId, memberId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const member = await tablesService.approveMember(sessionId, memberId, userId, req.body.approved);
    res.json({ success: true, data: member });
  }

  async generateExitQr(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await tablesService.generateExitQr(sessionId, userId);
    res.json({ success: true, data: result });
  }

  async closeSession(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = await tablesService.closeSession(sessionId, userId);
    res.json({ success: true, data: session });
  }
}
