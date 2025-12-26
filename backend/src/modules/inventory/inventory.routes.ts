import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { upload } from './upload.config';

const router = Router();

// Todas as rotas requerem autenticação e permissão de RESTAURANT_OWNER
router.use(authenticate);
router.use(authorize('RESTAURANT_OWNER', 'ADMIN'));

// ============================================
// SUPPLIERS
// ============================================
router.post('/suppliers', inventoryController.createSupplier.bind(inventoryController));
router.get('/suppliers', inventoryController.getSuppliers.bind(inventoryController));
router.get('/suppliers/:id', inventoryController.getSupplierById.bind(inventoryController));
router.patch('/suppliers/:id', inventoryController.updateSupplier.bind(inventoryController));
router.delete('/suppliers/:id', inventoryController.deleteSupplier.bind(inventoryController));

// ============================================
// INVENTORY ITEMS
// ============================================
router.post('/items', inventoryController.createInventoryItem.bind(inventoryController));
router.get('/items', inventoryController.getInventoryItems.bind(inventoryController));
router.get('/items/:id', inventoryController.getInventoryItemById.bind(inventoryController));
router.patch('/items/:id', inventoryController.updateInventoryItem.bind(inventoryController));
router.delete('/items/:id', inventoryController.deleteInventoryItem.bind(inventoryController));

// ============================================
// INVOICES (UPLOAD & OCR)
// ============================================
router.post(
  '/invoices/upload',
  upload.single('invoice'), // Campo do form-data: 'invoice'
  inventoryController.uploadInvoice.bind(inventoryController)
);
router.get('/invoices', inventoryController.getInvoiceUploads.bind(inventoryController));
router.get('/invoices/:id', inventoryController.getInvoiceById.bind(inventoryController));
router.post('/invoices/:id/confirm', inventoryController.confirmInvoice.bind(inventoryController));

// ============================================
// STOCK ENTRIES
// ============================================
router.post('/stock-entries', inventoryController.createStockEntry.bind(inventoryController));
router.get('/stock-entries', inventoryController.getStockEntries.bind(inventoryController));

// ============================================
// MENU <-> INVENTORY LINKS
// ============================================
router.post('/menu-links', inventoryController.linkMenuItemToInventory.bind(inventoryController));
router.delete('/menu-links', inventoryController.unlinkMenuItemFromInventory.bind(inventoryController));
router.get('/menu-links/:menuItemId', inventoryController.getMenuItemInventoryLinks.bind(inventoryController));

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard', inventoryController.getDashboard.bind(inventoryController));

export default router;
