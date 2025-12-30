# Backend Integration Plan - TabSync
## Prototype Features to Production Backend

**Date**: 2025-12-26
**Version**: 1.0
**Target**: Migrate prototype features (Waiter, Kitchen, Tables, Calls) to production backend

---

## Executive Summary

This plan details the migration of 5 core features from the prototype to the production backend:
1. **WAITER Role** - New user role for waiters
2. **KITCHEN Role** - New user role for kitchen staff
3. **Table Management** - Track table status and assignments
4. **Waiter Calls** - Customer requests for waiter assistance
5. **Service Fee** - 10% automatic service charge

---

## 1. RBAC Changes - New User Roles

### 1.1 Schema Changes (Prisma)

**File**: `backend/prisma/schema.prisma`

```prisma
enum UserRole {
  CUSTOMER
  RESTAURANT_OWNER
  ADMIN
  WAITER          // NEW
  KITCHEN         // NEW
}

model User {
  // ... existing fields

  // New relations
  assignedRestaurantId String?   @map("assigned_restaurant_id")  // For WAITER/KITCHEN
  assignedRestaurant   Restaurant? @relation("RestaurantStaff", fields: [assignedRestaurantId], references: [id])
  waiterOrders         Order[]     @relation("WaiterOrders")

  @@index([assignedRestaurantId])
}

model Restaurant {
  // ... existing relations

  // New relations
  staff        User[]        @relation("RestaurantStaff")
  tables       Table[]       // NEW
  waiterCalls  WaiterCall[]  // NEW
}
```

### 1.2 Authentication Schema Update

**File**: `backend/src/modules/auth/auth.schema.ts`

```typescript
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    phone: z.string().optional(),
    role: z.enum(['CUSTOMER', 'RESTAURANT_OWNER', 'WAITER', 'KITCHEN']).default('CUSTOMER'),
    assignedRestaurantId: z.string().uuid().optional(), // Required for WAITER/KITCHEN
  }),
}).refine(
  (data) => {
    // WAITER and KITCHEN must have assignedRestaurantId
    if ((data.body.role === 'WAITER' || data.body.role === 'KITCHEN') && !data.body.assignedRestaurantId) {
      return false;
    }
    return true;
  },
  {
    message: 'WAITER and KITCHEN roles require assignedRestaurantId',
    path: ['body', 'assignedRestaurantId'],
  }
);
```

### 1.3 Permission Matrix

| Role | Permissions |
|------|-------------|
| **CUSTOMER** | View menu, create orders, view own orders, call waiter |
| **WAITER** | View assigned restaurant's orders, update order status, view tables, respond to calls, create orders on behalf of customers |
| **KITCHEN** | View assigned restaurant's orders, update order status (CONFIRMED → PREPARING → READY) |
| **RESTAURANT_OWNER** | Full restaurant management, view all orders, manage staff |
| **ADMIN** | System-wide access |

---

## 2. Table Management Module

### 2.1 Database Schema

**File**: `backend/prisma/schema.prisma`

```prisma
enum TableStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
  MAINTENANCE
}

model Table {
  id              String      @id @default(uuid())
  restaurantId    String      @map("restaurant_id")
  tableNumber     String      @map("table_number")  // "1", "2", "A1", etc.
  capacity        Int         @default(4)
  status          TableStatus @default(AVAILABLE)

  // Current session
  currentCustomerId String?   @map("current_customer_id")
  currentCustomer   User?     @relation("TableCustomer", fields: [currentCustomerId], references: [id])
  sessionStartedAt  DateTime? @map("session_started_at")

  // Metadata
  qrCodeUrl       String?     @map("qr_code_url") @db.Text
  notes           String?     @db.Text
  isActive        Boolean     @default(true) @map("is_active")

  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  // Relations
  restaurant      Restaurant  @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  orders          Order[]
  waiterCalls     WaiterCall[]

  @@unique([restaurantId, tableNumber])
  @@index([restaurantId])
  @@index([status])
  @@map("tables")
}

// Update User model
model User {
  // ... existing fields
  currentTable  Table? @relation("TableCustomer")
}

// Update Order model
model Order {
  // ... existing fields
  tableId    String? @map("table_id")
  table      Table?  @relation(fields: [tableId], references: [id])
  waiterId   String? @map("waiter_id")
  waiter     User?   @relation("WaiterOrders", fields: [waiterId], references: [id])

  @@index([tableId])
  @@index([waiterId])
}
```

### 2.2 Module Structure

**Files to create**:
- `backend/src/modules/tables/tables.controller.ts`
- `backend/src/modules/tables/tables.service.ts`
- `backend/src/modules/tables/tables.schema.ts`
- `backend/src/modules/tables/tables.routes.ts`

### 2.3 API Endpoints

```typescript
// GET /api/restaurants/:restaurantId/tables
// List all tables (with filters: status, isActive)
// Auth: RESTAURANT_OWNER, WAITER, KITCHEN, ADMIN
{
  "tables": [
    {
      "id": "uuid",
      "tableNumber": "5",
      "capacity": 4,
      "status": "OCCUPIED",
      "currentCustomer": { "id": "uuid", "fullName": "João Silva" },
      "sessionStartedAt": "2025-12-26T14:30:00Z",
      "activeOrders": 2,
      "unpaidAmount": 125.50
    }
  ]
}

// POST /api/restaurants/:restaurantId/tables
// Create new table
// Auth: RESTAURANT_OWNER, ADMIN
{
  "tableNumber": "10",
  "capacity": 6,
  "qrCodeUrl": "https://...",
  "notes": "Near the window"
}

// PATCH /api/tables/:id/status
// Update table status
// Auth: RESTAURANT_OWNER, WAITER, ADMIN
{
  "status": "OCCUPIED" | "AVAILABLE" | "RESERVED" | "MAINTENANCE",
  "currentCustomerId": "uuid" // Only when OCCUPIED
}

// GET /api/tables/:id/session
// Get current table session details
// Auth: RESTAURANT_OWNER, WAITER, ADMIN
{
  "table": {...},
  "currentCustomer": {...},
  "activeOrders": [...],
  "totalUnpaid": 250.00,
  "duration": "01:45:30"
}

// POST /api/tables/:id/close-session
// Close table session (after payment)
// Auth: RESTAURANT_OWNER, WAITER, ADMIN
```

### 2.4 Validation Schema

**File**: `backend/src/modules/tables/tables.schema.ts`

```typescript
import { z } from 'zod';

export const createTableSchema = z.object({
  body: z.object({
    tableNumber: z.string().min(1).max(10),
    capacity: z.number().int().min(1).max(20),
    qrCodeUrl: z.string().url().optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const updateTableStatusSchema = z.object({
  body: z.object({
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']),
    currentCustomerId: z.string().uuid().optional(),
  }),
}).refine(
  (data) => {
    // OCCUPIED requires currentCustomerId
    if (data.body.status === 'OCCUPIED' && !data.body.currentCustomerId) {
      return false;
    }
    return true;
  },
  {
    message: 'currentCustomerId is required when status is OCCUPIED',
    path: ['body', 'currentCustomerId'],
  }
);

export type CreateTableInput = z.infer<typeof createTableSchema>['body'];
export type UpdateTableStatusInput = z.infer<typeof updateTableStatusSchema>['body'];
```

### 2.5 Service Methods

**File**: `backend/src/modules/tables/tables.service.ts`

```typescript
export class TablesService {
  // CRUD
  async create(restaurantId: string, data: CreateTableInput)
  async findAll(restaurantId: string, filters?: { status?: TableStatus })
  async findById(id: string)
  async updateStatus(id: string, data: UpdateTableStatusInput)
  async delete(id: string)

  // Session management
  async getCurrentSession(tableId: string)
  async closeSession(tableId: string)

  // Ownership validation
  private async verifyTableOwnership(tableId: string, userId: string, role: string)
}
```

---

## 3. Waiter Call System

### 3.1 Database Schema

**File**: `backend/prisma/schema.prisma`

```prisma
enum CallStatus {
  PENDING
  ACKNOWLEDGED  // Waiter saw it
  IN_PROGRESS   // Waiter is handling it
  RESOLVED
  CANCELLED
}

enum CallReason {
  ASSISTANCE      // General help
  ORDER_READY     // Ready to order
  REQUEST_BILL    // Want to pay
  COMPLAINT       // Problem/complaint
  REFILL          // Refill drinks
  OTHER
}

model WaiterCall {
  id           String     @id @default(uuid())
  restaurantId String     @map("restaurant_id")
  tableId      String     @map("table_id")
  customerId   String     @map("customer_id")

  reason       CallReason
  notes        String?    @db.Text
  status       CallStatus @default(PENDING)

  // Assignment
  assignedWaiterId String?   @map("assigned_waiter_id")
  assignedWaiter   User?     @relation("AssignedCalls", fields: [assignedWaiterId], references: [id])

  // Timestamps
  createdAt        DateTime  @default(now()) @map("created_at")
  acknowledgedAt   DateTime? @map("acknowledged_at")
  resolvedAt       DateTime? @map("resolved_at")

  // Relations
  restaurant  Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  table       Table      @relation(fields: [tableId], references: [id])
  customer    User       @relation("CustomerCalls", fields: [customerId], references: [id])

  @@index([restaurantId])
  @@index([tableId])
  @@index([customerId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@map("waiter_calls")
}

// Update User model
model User {
  // ... existing fields
  customerCalls  WaiterCall[] @relation("CustomerCalls")
  assignedCalls  WaiterCall[] @relation("AssignedCalls")
}
```

### 3.2 Module Structure

**Files to create**:
- `backend/src/modules/calls/calls.controller.ts`
- `backend/src/modules/calls/calls.service.ts`
- `backend/src/modules/calls/calls.schema.ts`
- `backend/src/modules/calls/calls.routes.ts`

### 3.3 API Endpoints

```typescript
// POST /api/calls
// Customer calls waiter
// Auth: CUSTOMER
{
  "tableId": "uuid",
  "reason": "ASSISTANCE",
  "notes": "Need more napkins"
}
Response: 201 Created

// GET /api/restaurants/:restaurantId/calls
// List calls (with filters: status, tableId)
// Auth: RESTAURANT_OWNER, WAITER, ADMIN
{
  "calls": [
    {
      "id": "uuid",
      "table": { "tableNumber": "5" },
      "customer": { "fullName": "Maria Santos" },
      "reason": "REQUEST_BILL",
      "status": "PENDING",
      "createdAt": "2025-12-26T15:20:00Z",
      "waitingTime": "00:03:45"
    }
  ]
}

// PATCH /api/calls/:id/acknowledge
// Waiter acknowledges call
// Auth: WAITER, RESTAURANT_OWNER, ADMIN
Response: 200 OK

// PATCH /api/calls/:id/resolve
// Mark call as resolved
// Auth: WAITER, RESTAURANT_OWNER, ADMIN
{
  "notes": "Bill delivered"
}

// PATCH /api/calls/:id/assign
// Assign to specific waiter
// Auth: RESTAURANT_OWNER, ADMIN
{
  "waiterId": "uuid"
}
```

### 3.4 Validation Schema

**File**: `backend/src/modules/calls/calls.schema.ts`

```typescript
import { z } from 'zod';

export const createCallSchema = z.object({
  body: z.object({
    tableId: z.string().uuid(),
    reason: z.enum(['ASSISTANCE', 'ORDER_READY', 'REQUEST_BILL', 'COMPLAINT', 'REFILL', 'OTHER']),
    notes: z.string().max(500).optional(),
  }),
});

export const assignCallSchema = z.object({
  body: z.object({
    waiterId: z.string().uuid(),
  }),
});

export const resolveCallSchema = z.object({
  body: z.object({
    notes: z.string().max(500).optional(),
  }),
});

export type CreateCallInput = z.infer<typeof createCallSchema>['body'];
export type AssignCallInput = z.infer<typeof assignCallSchema>['body'];
export type ResolveCallInput = z.infer<typeof resolveCallSchema>['body'];
```

---

## 4. Service Fee (Taxa de Serviço)

### 4.1 Schema Changes

**File**: `backend/prisma/schema.prisma`

```prisma
model Order {
  // ... existing fields

  serviceFeeAmount  Decimal  @default(0) @db.Decimal(10, 2) @map("service_fee_amount")
  serviceFeeRate    Decimal  @default(0.10) @db.Decimal(5, 4) @map("service_fee_rate") // 0.10 = 10%

  // Update totalAmount calculation to include service fee
  // totalAmount = subtotal + taxAmount + serviceFeeAmount - discountAmount
}

model Restaurant {
  // ... existing fields

  // Settings
  serviceFeeEnabled Boolean  @default(true) @map("service_fee_enabled")
  serviceFeeRate    Decimal  @default(0.10) @db.Decimal(5, 4) @map("service_fee_rate")
}
```

### 4.2 Order Service Update

**File**: `backend/src/modules/orders/orders.service.ts`

```typescript
// In create() method:
const serviceFeeAmount = restaurant.serviceFeeEnabled
  ? subtotal * Number(restaurant.serviceFeeRate)
  : 0;

const totalAmount = subtotal
  + data.taxAmount
  + serviceFeeAmount
  - data.discountAmount;

const order = await prisma.order.create({
  data: {
    // ... existing fields
    serviceFeeAmount,
    serviceFeeRate: restaurant.serviceFeeRate,
    totalAmount,
  },
});
```

### 4.3 Schema Validation

**File**: `backend/src/modules/orders/orders.schema.ts`

```typescript
// No changes needed - service fee is auto-calculated
// Backend ALWAYS recalculates, NEVER trusts frontend values
```

---

## 5. Enhanced Order Workflow

### 5.1 New Order Status Permissions

| Status | Who Can Set | Real-time Event |
|--------|-------------|-----------------|
| PENDING | Customer, Waiter | `new-order` |
| CONFIRMED | Kitchen, Owner | `order-confirmed` |
| PREPARING | Kitchen, Owner | `order-preparing` |
| READY | Kitchen, Owner | `order-ready` |
| DELIVERED | Waiter, Owner | `order-delivered` |
| CANCELLED | Any participant, Owner | `order-cancelled` |

### 5.2 Service Updates

**File**: `backend/src/modules/orders/orders.service.ts`

```typescript
async updateStatus(orderId: string, userId: string, role: string, data: UpdateOrderStatusInput) {
  const order = await this.findById(orderId);

  // Enhanced permission checks
  const canUpdate = this.canUpdateStatus(order, userId, role, data.status);
  if (!canUpdate) {
    throw new AppError(403, 'You do not have permission to update to this status');
  }

  // ... existing logic
}

private canUpdateStatus(order: Order, userId: string, role: string, newStatus: OrderStatus): boolean {
  // CUSTOMER cannot update status
  if (role === 'CUSTOMER') return false;

  // KITCHEN can only update CONFIRMED → PREPARING → READY
  if (role === 'KITCHEN') {
    return ['CONFIRMED', 'PREPARING', 'READY'].includes(newStatus);
  }

  // WAITER can update to DELIVERED
  if (role === 'WAITER') {
    const restaurant = order.restaurant;
    if (order.waiterId !== userId && restaurant.ownerId !== userId) {
      return false; // Not assigned waiter
    }
    return newStatus === 'DELIVERED';
  }

  // RESTAURANT_OWNER and ADMIN can update to any status
  return ['RESTAURANT_OWNER', 'ADMIN'].includes(role);
}
```

---

## 6. Socket.IO Events

### 6.1 New Events

**File**: `backend/src/config/socket.ts`

```typescript
// Existing events
'new-order'
'order-status-changed'
'payment-received'
'all-payments-complete'

// NEW events to add:
'waiter-call-created'      // Customer called waiter
'waiter-call-acknowledged' // Waiter saw it
'waiter-call-resolved'     // Call completed
'table-status-changed'     // Table occupied/freed
'kitchen-order-confirmed'  // Kitchen confirmed order
'kitchen-order-ready'      // Order ready for pickup
```

### 6.2 Room Structure

```typescript
// Join rooms on connection:
socket.join(`restaurant:${restaurantId}`)        // All restaurant events
socket.join(`table:${tableId}`)                  // Specific table
socket.join(`kitchen:${restaurantId}`)           // Kitchen staff only
socket.join(`waiter:${userId}`)                  // Waiter notifications
```

### 6.3 Event Payloads

```typescript
// waiter-call-created
io.to(`restaurant:${restaurantId}`).emit('waiter-call-created', {
  callId: string,
  tableNumber: string,
  customerName: string,
  reason: CallReason,
  createdAt: string
});

// table-status-changed
io.to(`restaurant:${restaurantId}`).emit('table-status-changed', {
  tableId: string,
  tableNumber: string,
  newStatus: TableStatus,
  customerId?: string,
  timestamp: string
});

// kitchen-order-ready
io.to(`restaurant:${restaurantId}`).emit('kitchen-order-ready', {
  orderId: string,
  orderNumber: string,
  tableNumber: string,
  items: [...],
  timestamp: string
});
```

---

## 7. Middleware Updates

### 7.1 Role-Based Access Control

**File**: `backend/src/middlewares/auth.ts`

```typescript
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new AppError(401, 'Unauthorized');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError(403, 'Insufficient permissions');
    }

    next();
  };
};

// New: Verify staff assignment
export const requireRestaurantStaff = (restaurantIdParam: string = 'restaurantId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const restaurantId = req.params[restaurantIdParam];

    if (!user) {
      throw new AppError(401, 'Unauthorized');
    }

    // ADMIN can access any restaurant
    if (user.role === 'ADMIN') {
      return next();
    }

    // RESTAURANT_OWNER must own the restaurant
    if (user.role === 'RESTAURANT_OWNER') {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });

      if (!restaurant || restaurant.ownerId !== user.id) {
        throw new AppError(403, 'Not authorized for this restaurant');
      }

      return next();
    }

    // WAITER/KITCHEN must be assigned to restaurant
    if (user.role === 'WAITER' || user.role === 'KITCHEN') {
      if (user.assignedRestaurantId !== restaurantId) {
        throw new AppError(403, 'Not assigned to this restaurant');
      }

      return next();
    }

    throw new AppError(403, 'Insufficient permissions');
  };
};
```

---

## 8. Migration Strategy

### 8.1 Database Migration Order

```bash
# 1. Add new roles to UserRole enum
npx prisma migrate dev --name add_waiter_kitchen_roles

# 2. Add Table model
npx prisma migrate dev --name add_table_model

# 3. Add WaiterCall model
npx prisma migrate dev --name add_waiter_call_model

# 4. Add service fee fields to Order and Restaurant
npx prisma migrate dev --name add_service_fee

# 5. Add table and waiter relations to Order
npx prisma migrate dev --name add_order_relations
```

### 8.2 Seed Data

**File**: `backend/prisma/seed.ts`

```typescript
// Create WAITER users
const waiter1 = await prisma.user.create({
  data: {
    email: 'carlos@bistro.com',
    passwordHash: await bcrypt.hash('teste123', 10),
    fullName: 'Carlos Silva',
    phone: '(11) 98888-1111',
    role: 'WAITER',
    assignedRestaurantId: restaurant.id,
  },
});

// Create KITCHEN users
const kitchen1 = await prisma.user.create({
  data: {
    email: 'cozinha@bistro.com',
    passwordHash: await bcrypt.hash('teste123', 10),
    fullName: 'Chef Ricardo',
    role: 'KITCHEN',
    assignedRestaurantId: restaurant.id,
  },
});

// Create tables
for (let i = 1; i <= 20; i++) {
  await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      tableNumber: String(i),
      capacity: i % 5 === 0 ? 6 : 4,
      status: 'AVAILABLE',
    },
  });
}

// Update restaurant settings
await prisma.restaurant.update({
  where: { id: restaurant.id },
  data: {
    serviceFeeEnabled: true,
    serviceFeeRate: 0.10,
  },
});
```

---

## 9. Implementation Priority

### Phase 1 - Core Infrastructure (Week 1)
- [ ] Update UserRole enum (WAITER, KITCHEN)
- [ ] Update auth schemas and validation
- [ ] Add role-based middleware
- [ ] Update seed data
- [ ] Test auth with new roles

### Phase 2 - Table Management (Week 2)
- [ ] Create Table model and migration
- [ ] Implement tables module (controller, service, schema, routes)
- [ ] Add QR code generation for tables
- [ ] Test table CRUD and session management
- [ ] Add Socket.IO events for table status

### Phase 3 - Waiter Call System (Week 3)
- [ ] Create WaiterCall model and migration
- [ ] Implement calls module
- [ ] Add real-time notifications
- [ ] Test call flow (create → acknowledge → resolve)
- [ ] Add call analytics

### Phase 4 - Service Fee (Week 3)
- [ ] Add service fee fields to schema
- [ ] Update order calculation logic
- [ ] Add restaurant settings for service fee
- [ ] Test order totals with service fee
- [ ] Update split payment calculations

### Phase 5 - Enhanced Order Workflow (Week 4)
- [ ] Add table and waiter relations to Order
- [ ] Update order status permissions
- [ ] Add kitchen-specific endpoints
- [ ] Test complete order flow (all roles)
- [ ] Add order filtering by waiter/table

### Phase 6 - Integration & Testing (Week 5)
- [ ] End-to-end testing with all roles
- [ ] Performance testing (real-time updates)
- [ ] Security audit (RBAC, ownership validation)
- [ ] Documentation updates
- [ ] Deploy to staging

---

## 10. Security Considerations

### 10.1 Ownership Validation

```typescript
// ALWAYS validate ownership/assignment:

// Tables: Must belong to restaurant
async verifyTableAccess(tableId: string, userId: string, role: string) {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { restaurant: true },
  });

  if (!table) throw new AppError(404, 'Table not found');

  if (role === 'WAITER' || role === 'KITCHEN') {
    if (user.assignedRestaurantId !== table.restaurantId) {
      throw new AppError(403, 'Not assigned to this restaurant');
    }
  }

  if (role === 'RESTAURANT_OWNER') {
    if (table.restaurant.ownerId !== userId) {
      throw new AppError(403, 'Not your restaurant');
    }
  }
}

// Calls: Verify restaurant assignment
// Orders: Verify waiter assignment or restaurant ownership
```

### 10.2 Rate Limiting

**File**: `backend/src/config/rateLimiter.ts`

```typescript
// Add specific limits for new endpoints
export const callWaiterLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Max 3 calls per 5 minutes per customer
  message: 'Too many waiter calls. Please wait before calling again.',
});

export const statusUpdateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Max 30 status updates per minute (for kitchen rapid updates)
});
```

### 10.3 Input Validation

- **ALWAYS** use Zod schemas on all endpoints
- **NEVER** trust client-calculated totals (service fee, tax)
- **ALWAYS** recalculate on backend
- Validate enum values (TableStatus, CallReason, CallStatus)
- Sanitize notes/text fields (max length, no scripts)

---

## 11. API Documentation Updates

### 11.1 New Endpoints Summary

```
Tables Module:
GET    /api/restaurants/:restaurantId/tables
POST   /api/restaurants/:restaurantId/tables
GET    /api/tables/:id
PATCH  /api/tables/:id/status
DELETE /api/tables/:id
GET    /api/tables/:id/session
POST   /api/tables/:id/close-session

Calls Module:
POST   /api/calls
GET    /api/restaurants/:restaurantId/calls
GET    /api/calls/:id
PATCH  /api/calls/:id/acknowledge
PATCH  /api/calls/:id/resolve
PATCH  /api/calls/:id/assign
DELETE /api/calls/:id

Enhanced Orders:
GET    /api/restaurants/:restaurantId/orders?status=READY&waiterId=uuid
PATCH  /api/orders/:id/assign-waiter
```

### 11.2 Example Request/Response

**Create Waiter Call**:
```bash
POST /api/calls
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "tableId": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "REQUEST_BILL",
  "notes": "Split 3 ways please"
}

Response 201:
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "tableId": "550e8400-e29b-41d4-a716-446655440000",
  "customerId": "770e8400-e29b-41d4-a716-446655440002",
  "reason": "REQUEST_BILL",
  "notes": "Split 3 ways please",
  "status": "PENDING",
  "createdAt": "2025-12-26T15:30:00.000Z",
  "table": {
    "tableNumber": "12",
    "restaurant": { "name": "Bistrô Sabor & Arte" }
  }
}
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

```typescript
// tables.service.test.ts
describe('TablesService', () => {
  describe('create', () => {
    it('should create table for restaurant owner');
    it('should reject duplicate table numbers');
    it('should reject non-owner creation');
  });

  describe('updateStatus', () => {
    it('should update to OCCUPIED with customerId');
    it('should reject OCCUPIED without customerId');
    it('should allow waiter to update status');
  });
});

// calls.service.test.ts
describe('CallsService', () => {
  describe('create', () => {
    it('should create call from customer at table');
    it('should reject call without valid table');
  });

  describe('acknowledge', () => {
    it('should allow waiter to acknowledge');
    it('should reject customer acknowledgement');
  });
});
```

### 12.2 Integration Tests

```typescript
// Complete waiter flow
it('should handle complete waiter call flow', async () => {
  // 1. Customer calls waiter
  const call = await request(app)
    .post('/api/calls')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ tableId, reason: 'ASSISTANCE' });

  // 2. Waiter acknowledges
  await request(app)
    .patch(`/api/calls/${call.body.id}/acknowledge`)
    .set('Authorization', `Bearer ${waiterToken}`);

  // 3. Waiter resolves
  await request(app)
    .patch(`/api/calls/${call.body.id}/resolve`)
    .set('Authorization', `Bearer ${waiterToken}`)
    .send({ notes: 'Helped customer' });

  // 4. Verify final status
  const final = await request(app)
    .get(`/api/calls/${call.body.id}`)
    .set('Authorization', `Bearer ${waiterToken}`);

  expect(final.body.status).toBe('RESOLVED');
});
```

---

## 13. Monitoring & Analytics

### 13.1 New Metrics to Track

```typescript
// Add to analytics module
- Average waiter response time
- Table turnover rate (sessions per day)
- Most common call reasons
- Waiter performance (calls handled, orders served)
- Kitchen performance (order preparation times)
- Service fee revenue
```

### 13.2 AnalyticsEvent Types

```typescript
enum EventType {
  // Existing...
  'order_created',
  'payment_completed',

  // NEW:
  'waiter_call_created',
  'waiter_call_resolved',
  'table_occupied',
  'table_freed',
  'kitchen_order_confirmed',
  'kitchen_order_ready',
  'order_delivered',
}
```

---

## 14. Potential Bottlenecks & Scaling

### 14.1 Real-time Performance

**Challenge**: High frequency of status updates in busy restaurants

**Solution**:
- Redis pub/sub for Socket.IO scaling
- Batch status updates (e.g., update UI every 2 seconds instead of real-time)
- Use WebSocket rooms efficiently (only join relevant rooms)

### 14.2 Database Queries

**Indexes to add**:
```prisma
@@index([restaurantId, status]) // tables, waiter_calls
@@index([tableId, createdAt(sort: Desc)]) // orders
@@index([assignedWaiterId, status]) // waiter_calls
@@index([restaurantId, status, createdAt(sort: Desc)]) // orders
```

### 14.3 Concurrent Session Management

**Challenge**: Multiple devices accessing same table

**Solution**:
- Use database transactions for table status updates
- Implement optimistic locking (version field)
- Add `updatedAt` checks before status changes

---

## 15. Documentation Checklist

- [ ] Update API documentation (Swagger/OpenAPI)
- [ ] Update RBAC permission matrix
- [ ] Add Postman collection for new endpoints
- [ ] Update deployment guide
- [ ] Add Socket.IO event documentation
- [ ] Create waiter/kitchen user guides
- [ ] Update database schema diagram
- [ ] Add troubleshooting guide for real-time issues

---

## 16. Technology Recommendations

### Confirmed Stack (from CLAUDE.md)
- Backend: Node.js 20+, Express.js 4.21+, TypeScript 5.7+ (strict)
- Database: Prisma 5.22+ / PostgreSQL 15+ (Supabase)
- Validation: Zod 3.23+
- Real-time: Socket.IO 4.8+

### Additional Libraries Needed
- **QR Code Generation**: `qrcode` (npm package)
- **Date Handling**: `date-fns` (already in frontend)
- **Testing**: Jest + Supertest (already configured)

---

## 17. Next Steps

### Immediate Actions (This Week)
1. Review and approve this plan
2. Create feature branch: `feature/add-waiter-kitchen-tables`
3. Start Phase 1 (RBAC changes)
4. Set up testing environment with new roles

### Questions to Resolve
1. Should waiters be able to create orders without customer accounts? (e.g., walk-in customers)
2. What happens to active calls when table status changes to AVAILABLE?
3. Should service fee be optional per order or always restaurant-level setting?
4. Do we need a "shift" concept for waiters (check-in/check-out)?

---

## Appendix A - Complete Schema Diff

See migration files in `backend/prisma/migrations/` for complete schema changes.

Key additions:
- 2 new UserRole values
- 2 new models (Table, WaiterCall)
- 3 new enums (TableStatus, CallStatus, CallReason)
- 5 new fields on Order
- 2 new fields on Restaurant
- Multiple new indexes for performance

---

## Appendix B - Migration Rollback Plan

If issues arise during deployment:

```bash
# Rollback last migration
npx prisma migrate rollback

# Restore from database backup
pg_restore -d tabsync_db backup.dump

# Remove feature flag in code
ENABLE_WAITER_FEATURES=false
```

---

**Document Version**: 1.0
**Last Updated**: 2025-12-26
**Author**: Backend Architecture Team
**Status**: Pending Review

---

## Signature

This plan follows ALL guidelines from `.claude/CLAUDE.md`:
- ✅ TypeScript strict mode, zero `any`
- ✅ Zod validation on all endpoints
- ✅ Ownership validation everywhere
- ✅ Rate limiting configured
- ✅ Real-time via Socket.IO
- ✅ Modular architecture (controller → service → schema → routes)
- ✅ Security-first approach (Defense in Depth)
- ✅ RBAC with proper permission matrix
- ✅ Database indexes for performance
- ✅ Comprehensive testing strategy
