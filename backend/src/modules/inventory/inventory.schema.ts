import { z } from 'zod';

// ============================================
// SUPPLIER SCHEMAS
// ============================================
export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

// ============================================
// INVENTORY ITEM SCHEMAS
// ============================================
export const createInventoryItemSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  sku: z.string().optional(),
  unit: z.string().default('UN'),
  minimumStock: z.number().min(0).default(0),
  trackStock: z.boolean().default(true),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

// ============================================
// INVOICE UPLOAD SCHEMAS
// ============================================
export const uploadInvoiceSchema = z.object({
  supplierId: z.string().uuid().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(), // ISO date string
});

export const confirmInvoiceSchema = z.object({
  supplierId: z.string().uuid().optional(),
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    unit: z.string().default('UN'),
    inventoryItemId: z.string().uuid().optional(), // Se já existe no estoque
  })),
});

// ============================================
// STOCK ENTRY SCHEMAS
// ============================================
export const createStockEntrySchema = z.object({
  supplierId: z.string().uuid().optional(),
  type: z.enum(['PURCHASE', 'ADJUSTMENT', 'RETURN', 'LOSS', 'TRANSFER']).default('PURCHASE'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    inventoryItemId: z.string().uuid(),
    quantity: z.number(),
    unitPrice: z.number().positive(),
    notes: z.string().optional(),
  })),
});

// ============================================
// MENU ITEM INVENTORY LINK SCHEMA
// ============================================
export const linkMenuItemToInventorySchema = z.object({
  menuItemId: z.string().uuid(),
  inventoryItemId: z.string().uuid(),
  quantity: z.number().positive(), // Quantidade do item de estoque usada por unidade do item do menu
});

export const unlinkMenuItemFromInventorySchema = z.object({
  menuItemId: z.string().uuid(),
  inventoryItemId: z.string().uuid(),
});

// Type exports
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
export type UploadInvoiceInput = z.infer<typeof uploadInvoiceSchema>;
export type ConfirmInvoiceInput = z.infer<typeof confirmInvoiceSchema>;
export type CreateStockEntryInput = z.infer<typeof createStockEntrySchema>;
export type LinkMenuItemToInventoryInput = z.infer<typeof linkMenuItemToInventorySchema>;
export type UnlinkMenuItemFromInventoryInput = z.infer<typeof unlinkMenuItemFromInventorySchema>;
