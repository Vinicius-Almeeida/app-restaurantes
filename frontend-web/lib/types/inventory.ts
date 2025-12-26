// ============================================
// SUPPLIER TYPES
// ============================================
export interface Supplier {
  id: string;
  restaurantId: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

// ============================================
// INVENTORY ITEM TYPES
// ============================================
export interface InventoryItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  sku?: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  lastPurchasePrice?: number;
  averagePrice?: number;
  trackStock: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemInput {
  name: string;
  description?: string;
  sku?: string;
  unit?: string;
  minimumStock?: number;
  trackStock?: boolean;
}

// ============================================
// INVOICE TYPES
// ============================================
export type InvoiceStatus = 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'ERROR' | 'CANCELLED';

export interface ExtractedProduct {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  inventoryItemId?: string; // Se já existe no estoque
}

export interface InvoiceUpload {
  id: string;
  restaurantId: string;
  supplierId?: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  invoiceNumber?: string;
  invoiceDate?: string;
  totalAmount?: number;
  status: InvoiceStatus;
  ocrData?: any;
  extractedData?: {
    products: ExtractedProduct[];
    validationErrors?: string[];
  };
  errorMessage?: string;
  isConfirmed: boolean;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  supplier?: Supplier;
  stockEntry?: StockEntry;
}

export interface UploadInvoiceInput {
  file: File;
  supplierId?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
}

export interface ConfirmInvoiceInput {
  supplierId?: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    unit?: string;
    inventoryItemId?: string;
  }[];
}

// ============================================
// STOCK ENTRY TYPES
// ============================================
export type StockEntryType = 'PURCHASE' | 'ADJUSTMENT' | 'RETURN' | 'LOSS' | 'TRANSFER';

export interface StockEntry {
  id: string;
  restaurantId: string;
  supplierId?: string;
  invoiceId?: string;
  type: StockEntryType;
  referenceNumber?: string;
  notes?: string;
  totalAmount?: number;
  createdAt: string;
  createdBy?: string;
  supplier?: Supplier;
  invoice?: InvoiceUpload;
  items: StockEntryItem[];
}

export interface StockEntryItem {
  id: string;
  stockEntryId: string;
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  inventoryItem: InventoryItem;
}

export interface CreateStockEntryInput {
  supplierId?: string;
  type?: StockEntryType;
  referenceNumber?: string;
  notes?: string;
  items: {
    inventoryItemId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }[];
}

// ============================================
// MENU ITEM INVENTORY LINK TYPES
// ============================================
export interface MenuItemInventory {
  id: string;
  menuItemId: string;
  inventoryItemId: string;
  quantity: number;
  createdAt: string;
  menuItem: any; // MenuItem type from menu.ts
  inventoryItem: InventoryItem;
}

export interface LinkMenuItemToInventoryInput {
  menuItemId: string;
  inventoryItemId: string;
  quantity: number;
}

// ============================================
// DASHBOARD TYPES
// ============================================
export interface InventoryDashboard {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  recentEntries: StockEntry[];
  topSuppliers: (Supplier & {
    _count: {
      stockEntries: number;
    };
  })[];
}
