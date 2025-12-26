import { Request, Response } from 'express';
import { inventoryService } from './inventory.service';
import {
  createSupplierSchema,
  updateSupplierSchema,
  createInventoryItemSchema,
  updateInventoryItemSchema,
  uploadInvoiceSchema,
  confirmInvoiceSchema,
  createStockEntrySchema,
  linkMenuItemToInventorySchema,
  unlinkMenuItemFromInventorySchema,
} from './inventory.schema';

export class InventoryController {
  // ============================================
  // SUPPLIERS
  // ============================================
  async createSupplier(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const validatedData = createSupplierSchema.parse(req.body);

      const supplier = await inventoryService.createSupplier(restaurantId, validatedData);

      return res.status(201).json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar fornecedor',
      });
    }
  }

  async getSuppliers(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const suppliers = await inventoryService.getSuppliers(restaurantId);

      return res.json({
        success: true,
        data: suppliers,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar fornecedores',
      });
    }
  }

  async getSupplierById(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const supplier = await inventoryService.getSupplierById(id, restaurantId);

      if (!supplier) {
        return res.status(404).json({
          success: false,
          error: 'Fornecedor não encontrado',
        });
      }

      return res.json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar fornecedor',
      });
    }
  }

  async updateSupplier(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const validatedData = updateSupplierSchema.parse(req.body);

      const supplier = await inventoryService.updateSupplier(id, restaurantId, validatedData);

      return res.json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar fornecedor',
      });
    }
  }

  async deleteSupplier(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      await inventoryService.deleteSupplier(id, restaurantId);

      return res.json({
        success: true,
        message: 'Fornecedor removido com sucesso',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao remover fornecedor',
      });
    }
  }

  // ============================================
  // INVENTORY ITEMS
  // ============================================
  async createInventoryItem(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const validatedData = createInventoryItemSchema.parse(req.body);

      const item = await inventoryService.createInventoryItem(restaurantId, validatedData);

      return res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar item de estoque',
      });
    }
  }

  async getInventoryItems(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { lowStock, search } = req.query;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const items = await inventoryService.getInventoryItems(restaurantId, {
        lowStock: lowStock === 'true',
        search: search as string,
      });

      return res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar itens de estoque',
      });
    }
  }

  async getInventoryItemById(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const item = await inventoryService.getInventoryItemById(id, restaurantId);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Item de estoque não encontrado',
        });
      }

      return res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar item de estoque',
      });
    }
  }

  async updateInventoryItem(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const validatedData = updateInventoryItemSchema.parse(req.body);

      const item = await inventoryService.updateInventoryItem(id, restaurantId, validatedData);

      return res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar item de estoque',
      });
    }
  }

  async deleteInventoryItem(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      await inventoryService.deleteInventoryItem(id, restaurantId);

      return res.json({
        success: true,
        message: 'Item de estoque removido com sucesso',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao remover item de estoque',
      });
    }
  }

  // ============================================
  // INVOICES
  // ============================================
  async uploadInvoice(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const file = req.file;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo não fornecido',
        });
      }

      const metadata = uploadInvoiceSchema.parse(req.body);

      const invoice = await inventoryService.uploadInvoice(restaurantId, file, metadata);

      return res.status(201).json({
        success: true,
        data: invoice,
        message: 'Nota fiscal enviada! O processamento OCR está em andamento...',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer upload da nota fiscal',
      });
    }
  }

  async getInvoiceUploads(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { status } = req.query;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const invoices = await inventoryService.getInvoiceUploads(
        restaurantId,
        status as string
      );

      return res.json({
        success: true,
        data: invoices,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar notas fiscais',
      });
    }
  }

  async getInvoiceById(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const invoice = await inventoryService.getInvoiceById(id, restaurantId);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Nota fiscal não encontrada',
        });
      }

      return res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar nota fiscal',
      });
    }
  }

  async confirmInvoice(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const validatedData = confirmInvoiceSchema.parse(req.body);

      const stockEntry = await inventoryService.confirmInvoice(id, restaurantId, validatedData);

      return res.json({
        success: true,
        data: stockEntry,
        message: 'Nota fiscal confirmada e estoque atualizado!',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao confirmar nota fiscal',
      });
    }
  }

  // ============================================
  // STOCK ENTRIES
  // ============================================
  async createStockEntry(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const validatedData = createStockEntrySchema.parse(req.body);

      const stockEntry = await inventoryService.createStockEntry(restaurantId, validatedData);

      return res.status(201).json({
        success: true,
        data: stockEntry,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar entrada de estoque',
      });
    }
  }

  async getStockEntries(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { type, supplierId } = req.query;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const entries = await inventoryService.getStockEntries(restaurantId, {
        type: type as string,
        supplierId: supplierId as string,
      });

      return res.json({
        success: true,
        data: entries,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar entradas de estoque',
      });
    }
  }

  // ============================================
  // MENU <-> INVENTORY LINKS
  // ============================================
  async linkMenuItemToInventory(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const validatedData = linkMenuItemToInventorySchema.parse(req.body);

      const link = await inventoryService.linkMenuItemToInventory(restaurantId, validatedData);

      return res.status(201).json({
        success: true,
        data: link,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao vincular item',
      });
    }
  }

  async unlinkMenuItemFromInventory(req: Request, res: Response) {
    try {
      const validatedData = unlinkMenuItemFromInventorySchema.parse(req.body);

      await inventoryService.unlinkMenuItemFromInventory(
        validatedData.menuItemId,
        validatedData.inventoryItemId
      );

      return res.json({
        success: true,
        message: 'Vínculo removido com sucesso',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao desvincular item',
      });
    }
  }

  async getMenuItemInventoryLinks(req: Request, res: Response) {
    try {
      const { menuItemId } = req.params;

      const links = await inventoryService.getMenuItemInventoryLinks(menuItemId);

      return res.json({
        success: true,
        data: links,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar vínculos',
      });
    }
  }

  // ============================================
  // DASHBOARD
  // ============================================
  async getDashboard(req: Request, res: Response) {
    try {
      const restaurantId = req.user?.restaurantId;

      if (!restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: Restaurante não encontrado',
        });
      }

      const dashboard = await inventoryService.getInventoryDashboard(restaurantId);

      return res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar dashboard',
      });
    }
  }
}

export const inventoryController = new InventoryController();
