import { PrismaClient } from '@prisma/client';
import { ocrService } from './ocr.service';
import {
  CreateSupplierInput,
  UpdateSupplierInput,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  ConfirmInvoiceInput,
  CreateStockEntryInput,
  LinkMenuItemToInventoryInput,
} from './inventory.schema';

const prisma = new PrismaClient();

export class InventoryService {
  // ============================================
  // SUPPLIERS
  // ============================================
  async createSupplier(restaurantId: string, data: CreateSupplierInput) {
    return prisma.supplier.create({
      data: {
        restaurantId,
        name: data.name,
        cnpj: data.cnpj,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
      },
    });
  }

  async getSuppliers(restaurantId: string) {
    return prisma.supplier.findMany({
      where: { restaurantId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getSupplierById(id: string, restaurantId: string) {
    return prisma.supplier.findFirst({
      where: { id, restaurantId },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        stockEntries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async updateSupplier(id: string, _restaurantId: string, data: UpdateSupplierInput) {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async deleteSupplier(id: string, _restaurantId: string) {
    // Soft delete
    return prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============================================
  // INVENTORY ITEMS
  // ============================================
  async createInventoryItem(restaurantId: string, data: CreateInventoryItemInput) {
    return prisma.inventoryItem.create({
      data: {
        restaurantId,
        name: data.name,
        description: data.description,
        sku: data.sku,
        unit: data.unit || 'UN',
        minimumStock: data.minimumStock || 0,
        trackStock: data.trackStock !== undefined ? data.trackStock : true,
      },
    });
  }

  async getInventoryItems(restaurantId: string, filters?: {
    lowStock?: boolean;
    search?: string;
  }) {
    const where: any = {
      restaurantId,
      isActive: true,
    };

    // Filtrar itens com estoque baixo
    if (filters?.lowStock) {
      where.AND = {
        currentStock: {
          lte: prisma.inventoryItem.fields.minimumStock,
        },
      };
    }

    // Buscar por nome
    if (filters?.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    return prisma.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        menuItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  async getInventoryItemById(id: string, restaurantId: string) {
    return prisma.inventoryItem.findFirst({
      where: { id, restaurantId },
      include: {
        stockEntries: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            stockEntry: {
              include: {
                supplier: true,
              },
            },
          },
        },
        menuItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  async updateInventoryItem(id: string, _restaurantId: string, data: UpdateInventoryItemInput) {
    return prisma.inventoryItem.update({
      where: { id },
      data,
    });
  }

  async deleteInventoryItem(id: string, _restaurantId: string) {
    // Soft delete
    return prisma.inventoryItem.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============================================
  // INVOICE UPLOAD & OCR
  // ============================================
  async uploadInvoice(
    restaurantId: string,
    file: Express.Multer.File,
    metadata: {
      supplierId?: string;
      invoiceNumber?: string;
      invoiceDate?: string;
    }
  ) {
    // Criar registro do upload
    const invoice = await prisma.invoiceUpload.create({
      data: {
        restaurantId,
        supplierId: metadata.supplierId,
        fileName: file.filename,
        fileUrl: file.path,
        fileType: file.mimetype.includes('pdf') ? 'pdf' : (file.mimetype.split('/')[1] || 'unknown'),
        fileSize: file.size,
        invoiceNumber: metadata.invoiceNumber,
        invoiceDate: metadata.invoiceDate ? new Date(metadata.invoiceDate) : undefined,
        status: 'UPLOADED',
      },
    });

    // Processar OCR em background (simulado)
    this.processInvoiceOCR(invoice.id, file.path, invoice.fileType).catch((error) => {
      console.error(`Erro ao processar OCR da invoice ${invoice.id}:`, error);
    });

    return invoice;
  }

  /**
   * Processa OCR da nota fiscal
   */
  private async processInvoiceOCR(invoiceId: string, filePath: string, fileType: string) {
    try {
      // Atualizar status para PROCESSING
      await prisma.invoiceUpload.update({
        where: { id: invoiceId },
        data: { status: 'PROCESSING' },
      });

      // Executar OCR
      const ocrResult = await ocrService.processFile(filePath, fileType);

      // Validar dados extraídos
      const validation = ocrService.validateExtractedData(ocrResult);

      if (!validation.isValid) {
        // Se houver erros, marcar como ERROR mas manter os dados
        await prisma.invoiceUpload.update({
          where: { id: invoiceId },
          data: {
            status: 'ERROR',
            ocrData: ocrResult as any,
            extractedData: {
              products: ocrResult.products,
              validationErrors: validation.errors,
            } as any,
            errorMessage: validation.errors.join('; '),
          },
        });
      } else {
        // Sucesso!
        await prisma.invoiceUpload.update({
          where: { id: invoiceId },
          data: {
            status: 'PROCESSED',
            ocrData: ocrResult as any,
            extractedData: {
              products: ocrResult.products,
            } as any,
            invoiceNumber: ocrResult.invoiceNumber || undefined,
            invoiceDate: ocrResult.invoiceDate ? new Date(ocrResult.invoiceDate) : undefined,
            totalAmount: ocrResult.totalAmount,
          },
        });
      }
    } catch (error) {
      console.error('Erro no processamento OCR:', error);
      await prisma.invoiceUpload.update({
        where: { id: invoiceId },
        data: {
          status: 'ERROR',
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
    }
  }

  async getInvoiceUploads(restaurantId: string, status?: string) {
    const where: any = { restaurantId };

    if (status) {
      where.status = status;
    }

    return prisma.invoiceUpload.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        stockEntry: true,
      },
    });
  }

  async getInvoiceById(id: string, restaurantId: string) {
    return prisma.invoiceUpload.findFirst({
      where: { id, restaurantId },
      include: {
        supplier: true,
        stockEntry: {
          include: {
            items: {
              include: {
                inventoryItem: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Confirma invoice e cria entrada de estoque
   */
  async confirmInvoice(invoiceId: string, restaurantId: string, data: ConfirmInvoiceInput) {
    const invoice = await this.getInvoiceById(invoiceId, restaurantId);

    if (!invoice) {
      throw new Error('Nota fiscal não encontrada');
    }

    if (invoice.isConfirmed) {
      throw new Error('Nota fiscal já foi confirmada');
    }

    // Criar ou buscar itens de estoque
    const stockEntryItems = [];
    let totalAmount = 0;

    for (const item of data.items) {
      let inventoryItem;

      if (item.inventoryItemId) {
        // Item já existe
        inventoryItem = await prisma.inventoryItem.findUnique({
          where: { id: item.inventoryItemId },
        });
      } else {
        // Criar novo item de estoque
        inventoryItem = await prisma.inventoryItem.create({
          data: {
            restaurantId,
            name: item.name,
            unit: item.unit,
            currentStock: 0,
          },
        });
      }

      if (!inventoryItem) {
        throw new Error(`Item de estoque não encontrado: ${item.inventoryItemId}`);
      }

      const totalPrice = item.quantity * item.unitPrice;
      totalAmount += totalPrice;

      stockEntryItems.push({
        inventoryItemId: inventoryItem.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
      });
    }

    // Criar entrada de estoque
    const stockEntry = await prisma.stockEntry.create({
      data: {
        restaurantId,
        supplierId: data.supplierId || invoice.supplierId || undefined,
        invoiceId: invoice.id,
        type: 'PURCHASE',
        referenceNumber: invoice.invoiceNumber || undefined,
        totalAmount,
        items: {
          create: stockEntryItems,
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    // Atualizar estoque dos itens
    for (const item of stockEntry.items) {
      await prisma.inventoryItem.update({
        where: { id: item.inventoryItemId },
        data: {
          currentStock: {
            increment: item.quantity,
          },
          lastPurchasePrice: item.unitPrice,
          // Calcular preço médio (simplificado)
          averagePrice: item.unitPrice,
        },
      });
    }

    // Marcar invoice como confirmada
    await prisma.invoiceUpload.update({
      where: { id: invoice.id },
      data: {
        isConfirmed: true,
        confirmedAt: new Date(),
        supplierId: data.supplierId || invoice.supplierId || undefined,
      },
    });

    return stockEntry;
  }

  // ============================================
  // STOCK ENTRIES
  // ============================================
  async createStockEntry(restaurantId: string, data: CreateStockEntryInput) {
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const stockEntry = await prisma.stockEntry.create({
      data: {
        restaurantId,
        supplierId: data.supplierId,
        type: data.type,
        referenceNumber: data.referenceNumber,
        notes: data.notes,
        totalAmount,
        items: {
          create: data.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    // Atualizar estoque
    for (const item of stockEntry.items) {
      const operation = ['PURCHASE', 'RETURN', 'ADJUSTMENT'].includes(data.type) ? 'increment' : 'decrement';

      await prisma.inventoryItem.update({
        where: { id: item.inventoryItemId },
        data: {
          currentStock: {
            [operation]: Math.abs(Number(item.quantity)),
          },
        },
      });
    }

    return stockEntry;
  }

  async getStockEntries(restaurantId: string, filters?: {
    type?: string;
    supplierId?: string;
  }) {
    const where: any = { restaurantId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.supplierId) {
      where.supplierId = filters.supplierId;
    }

    return prisma.stockEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        invoice: true,
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });
  }

  // ============================================
  // MENU ITEM <-> INVENTORY LINKS
  // ============================================
  async linkMenuItemToInventory(restaurantId: string, data: LinkMenuItemToInventoryInput) {
    // Verificar se o menu item pertence ao restaurante
    const menuItem = await prisma.menuItem.findFirst({
      where: { id: data.menuItemId, restaurantId },
    });

    if (!menuItem) {
      throw new Error('Item do menu não encontrado');
    }

    // Verificar se o item de estoque pertence ao restaurante
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: { id: data.inventoryItemId, restaurantId },
    });

    if (!inventoryItem) {
      throw new Error('Item de estoque não encontrado');
    }

    return prisma.menuItemInventory.create({
      data: {
        menuItemId: data.menuItemId,
        inventoryItemId: data.inventoryItemId,
        quantity: data.quantity,
      },
      include: {
        menuItem: true,
        inventoryItem: true,
      },
    });
  }

  async unlinkMenuItemFromInventory(menuItemId: string, inventoryItemId: string) {
    const link = await prisma.menuItemInventory.findFirst({
      where: {
        menuItemId,
        inventoryItemId,
      },
    });

    if (!link) {
      throw new Error('Vínculo não encontrado');
    }

    return prisma.menuItemInventory.delete({
      where: { id: link.id },
    });
  }

  async getMenuItemInventoryLinks(menuItemId: string) {
    return prisma.menuItemInventory.findMany({
      where: { menuItemId },
      include: {
        inventoryItem: true,
      },
    });
  }

  // ============================================
  // DASHBOARD & ANALYTICS
  // ============================================
  async getInventoryDashboard(restaurantId: string) {
    const [
      totalItems,
      lowStockItems,
      totalValue,
      recentEntries,
      topSuppliers,
    ] = await Promise.all([
      // Total de itens
      prisma.inventoryItem.count({
        where: { restaurantId, isActive: true },
      }),

      // Itens com estoque baixo
      prisma.inventoryItem.count({
        where: {
          restaurantId,
          isActive: true,
          currentStock: {
            lte: prisma.inventoryItem.fields.minimumStock,
          },
        },
      }),

      // Valor total em estoque (estimativa)
      prisma.inventoryItem.aggregate({
        where: { restaurantId, isActive: true },
        _sum: {
          currentStock: true,
        },
      }),

      // Entradas recentes
      prisma.stockEntry.findMany({
        where: { restaurantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          supplier: true,
        },
      }),

      // Top fornecedores
      prisma.supplier.findMany({
        where: { restaurantId, isActive: true },
        take: 5,
        include: {
          _count: {
            select: { stockEntries: true },
          },
        },
        orderBy: {
          stockEntries: {
            _count: 'desc',
          },
        },
      }),
    ]);

    return {
      totalItems,
      lowStockItems,
      totalValue: totalValue._sum.currentStock || 0,
      recentEntries,
      topSuppliers,
    };
  }
}

export const inventoryService = new InventoryService();
