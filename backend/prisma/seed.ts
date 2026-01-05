import {
  PrismaClient,
  UserRole,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  SplitMethod,
  SplitPaymentStatus,
  StockEntryType,
  SessionStatus,
  SubscriptionStatus,
  SuggestionCategory,
  SuggestionStatus,
  ComplaintCategory,
  ComplaintStatus,
  Priority,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate UUIDs
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper function to generate order numbers
function generateOrderNumber(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(4, '0')}`;
}

// Helper function to generate QR codes
function generateQRCode(restaurantSlug: string, tableNumber: number): string {
  return `${restaurantSlug}-table-${tableNumber}-${generateUUID().substring(0, 8)}`;
}

// Helper to create dates relative to now
function daysAgo(days: number, hours = 0, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function hoursAgo(hours: number, minutes = 0): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours, minutes, 0, 0);
  return date;
}

async function main() {
  console.log('='.repeat(60));
  console.log('  TabSync - Database Seed');
  console.log('  Boteco do Chef - Restaurante Completo');
  console.log('='.repeat(60));
  console.log('');

  // ============================================
  // CLEANUP - Delete all existing data
  // ============================================
  console.log('[1/15] Limpando dados existentes...');

  await prisma.waiterCall.deleteMany();
  await prisma.npsResponse.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.suggestion.deleteMany();
  await prisma.review.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.stockEntryItem.deleteMany();
  await prisma.stockEntry.deleteMany();
  await prisma.invoiceUpload.deleteMany();
  await prisma.menuItemInventory.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.splitPayment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.orderParticipant.deleteMany();
  await prisma.order.deleteMany();
  await prisma.tableSessionMember.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.table.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.consultantRestaurant.deleteMany();
  await prisma.consultant.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  console.log('   Dados limpos com sucesso!');

  // ============================================
  // USERS - Create all user types
  // ============================================
  console.log('[2/15] Criando usuarios...');

  // Hash passwords
  const superAdminHash = await bcrypt.hash('Admin123!', 10);
  const consultantHash = await bcrypt.hash('Consultor123!', 10);
  const ownerHash = await bcrypt.hash('Dono123!', 10);
  const waiterHash = await bcrypt.hash('Garcom123!', 10);
  const kitchenHash = await bcrypt.hash('Cozinha123!', 10);
  const customerHash = await bcrypt.hash('Cliente123!', 10);

  // Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@tabsync.com',
      passwordHash: superAdminHash,
      fullName: 'Administrador TabSync',
      phone: '+55 11 99999-0001',
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    },
  });

  // Consultant
  const consultantUser = await prisma.user.create({
    data: {
      email: 'consultor@tabsync.com',
      passwordHash: consultantHash,
      fullName: 'Roberto Mendes Silva',
      phone: '+55 11 98765-4321',
      role: UserRole.CONSULTANT,
      emailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
  });

  // Restaurant Owner
  const owner = await prisma.user.create({
    data: {
      email: 'dono@botecodochef.com.br',
      passwordHash: ownerHash,
      fullName: 'Antonio Carlos Ferreira',
      phone: '+55 11 99888-7777',
      role: UserRole.RESTAURANT_OWNER,
      emailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    },
  });

  // Waiters
  const waiter1 = await prisma.user.create({
    data: {
      email: 'garcom1@botecodochef.com.br',
      passwordHash: waiterHash,
      fullName: 'Carlos Eduardo Santos',
      phone: '+55 11 97777-1111',
      role: UserRole.WAITER,
      emailVerified: true,
    },
  });

  const waiter2 = await prisma.user.create({
    data: {
      email: 'garcom2@botecodochef.com.br',
      passwordHash: waiterHash,
      fullName: 'Fernanda Oliveira Lima',
      phone: '+55 11 97777-2222',
      role: UserRole.WAITER,
      emailVerified: true,
    },
  });

  const waiter3 = await prisma.user.create({
    data: {
      email: 'garcom3@botecodochef.com.br',
      passwordHash: waiterHash,
      fullName: 'Ricardo Almeida Costa',
      phone: '+55 11 97777-3333',
      role: UserRole.WAITER,
      emailVerified: true,
    },
  });

  // Kitchen Staff
  const kitchen1 = await prisma.user.create({
    data: {
      email: 'cozinha1@botecodochef.com.br',
      passwordHash: kitchenHash,
      fullName: 'Jose Maria Pereira',
      phone: '+55 11 96666-1111',
      role: UserRole.KITCHEN,
      emailVerified: true,
    },
  });

  const kitchen2 = await prisma.user.create({
    data: {
      email: 'cozinha2@botecodochef.com.br',
      passwordHash: kitchenHash,
      fullName: 'Ana Paula Rodrigues',
      phone: '+55 11 96666-2222',
      role: UserRole.KITCHEN,
      emailVerified: true,
    },
  });

  // Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'cliente1@gmail.com',
      passwordHash: customerHash,
      fullName: 'Marcos Vinicius Silva',
      phone: '+55 11 95555-1111',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'cliente2@gmail.com',
      passwordHash: customerHash,
      fullName: 'Juliana Beatriz Souza',
      phone: '+55 11 95555-2222',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'cliente3@gmail.com',
      passwordHash: customerHash,
      fullName: 'Pedro Henrique Costa',
      phone: '+55 11 95555-3333',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  const customer4 = await prisma.user.create({
    data: {
      email: 'cliente4@gmail.com',
      passwordHash: customerHash,
      fullName: 'Camila Rodrigues Ferreira',
      phone: '+55 11 95555-4444',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  const customer5 = await prisma.user.create({
    data: {
      email: 'cliente5@gmail.com',
      passwordHash: customerHash,
      fullName: 'Lucas Gabriel Oliveira',
      phone: '+55 11 95555-5555',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  console.log('   12 usuarios criados!');

  // ============================================
  // PLANS - Subscription Plans
  // ============================================
  console.log('[3/15] Criando planos de assinatura...');

  const planBasic = await prisma.plan.create({
    data: {
      name: 'Basic',
      slug: 'basic',
      description: 'Plano ideal para restaurantes pequenos. Inclui funcionalidades essenciais para gestao de pedidos e pagamentos.',
      price: 99.9,
      billingCycle: 'MONTHLY',
      trialDays: 14,
      maxTables: 10,
      maxMenuItems: 50,
      maxStaff: 5,
      maxOrders: 500,
      platformFeePercent: 3.5,
      features: JSON.parse(
        JSON.stringify(['split_bill', 'basic_analytics', 'qr_code_menu', 'email_support'])
      ),
      isActive: true,
      displayOrder: 1,
    },
  });

  const planPro = await prisma.plan.create({
    data: {
      name: 'Pro',
      slug: 'pro',
      description: 'Plano completo para restaurantes em crescimento. Todas as funcionalidades do Basic mais recursos avancados.',
      price: 249.9,
      billingCycle: 'MONTHLY',
      trialDays: 14,
      maxTables: 30,
      maxMenuItems: 200,
      maxStaff: 15,
      maxOrders: 2000,
      platformFeePercent: 2.5,
      features: JSON.parse(
        JSON.stringify([
          'split_bill',
          'advanced_analytics',
          'qr_code_menu',
          'inventory_management',
          'ocr_invoice',
          'priority_support',
          'custom_branding',
          'api_access',
        ])
      ),
      isActive: true,
      displayOrder: 2,
    },
  });

  const planEnterprise = await prisma.plan.create({
    data: {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Solucao completa para redes de restaurantes. Recursos ilimitados e suporte dedicado 24/7.',
      price: 599.9,
      billingCycle: 'MONTHLY',
      trialDays: 30,
      maxTables: null, // unlimited
      maxMenuItems: null, // unlimited
      maxStaff: null, // unlimited
      maxOrders: null, // unlimited
      platformFeePercent: 1.5,
      features: JSON.parse(
        JSON.stringify([
          'split_bill',
          'enterprise_analytics',
          'qr_code_menu',
          'inventory_management',
          'ocr_invoice',
          'dedicated_support',
          'white_label',
          'api_access',
          'multi_location',
          'custom_integrations',
          'sla_guarantee',
        ])
      ),
      isActive: true,
      displayOrder: 3,
    },
  });

  console.log('   3 planos criados!');

  // ============================================
  // RESTAURANT - Boteco do Chef
  // ============================================
  console.log('[4/15] Criando restaurante Boteco do Chef...');

  const restaurant = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: 'Boteco do Chef',
      slug: 'boteco-do-chef',
      description:
        'O melhor boteco de Sao Paulo! Ambiente aconchegante, porcoes generosas e drinks especiais. Venha experimentar nossas famosas porcoes de calabresa acebolada, batata frita com cheddar e bacon, e nossa selecao exclusiva de cervejas artesanais. Happy Hour todos os dias das 17h as 20h!',
      logoUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200',
      coverUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
      addressStreet: 'Rua Oscar Freire, 1234',
      addressCity: 'Sao Paulo',
      addressState: 'SP',
      addressZip: '01426-001',
      addressCountry: 'Brasil',
      phone: '+55 11 3063-4567',
      email: 'contato@botecodochef.com.br',
      isActive: true,
      acceptsOrders: true,
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
      operatingHours: {
        monday: { open: '17:00', close: '00:00' },
        tuesday: { open: '17:00', close: '00:00' },
        wednesday: { open: '17:00', close: '01:00' },
        thursday: { open: '17:00', close: '01:00' },
        friday: { open: '17:00', close: '02:00' },
        saturday: { open: '12:00', close: '02:00' },
        sunday: { open: '12:00', close: '22:00' },
      },
    },
  });

  console.log('   Restaurante criado!');

  // ============================================
  // CONSULTANT - Link to restaurant
  // ============================================
  console.log('[5/15] Configurando consultor...');

  const consultant = await prisma.consultant.create({
    data: {
      userId: consultantUser.id,
      commissionPercent: 5.0,
      totalOnboardings: 12,
      totalEarnings: 14500.0,
      isActive: true,
    },
  });

  await prisma.consultantRestaurant.create({
    data: {
      consultantId: consultant.id,
      restaurantId: restaurant.id,
      onboardedAt: daysAgo(45),
    },
  });

  console.log('   Consultor vinculado!');

  // ============================================
  // SUBSCRIPTION - Pro Plan Active
  // ============================================
  console.log('[6/15] Criando assinatura...');

  await prisma.subscription.create({
    data: {
      restaurantId: restaurant.id,
      planId: planPro.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: daysAgo(15),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      gatewayCustomerId: 'cus_' + generateUUID().substring(0, 14),
      gatewaySubscriptionId: 'sub_' + generateUUID().substring(0, 14),
    },
  });

  console.log('   Assinatura Pro ativa!');

  // ============================================
  // STAFF - Waiters and Kitchen
  // ============================================
  console.log('[7/15] Criando equipe (staff)...');

  await prisma.staff.createMany({
    data: [
      {
        userId: waiter1.id,
        restaurantId: restaurant.id,
        role: UserRole.WAITER,
        pin: '1234',
        isActive: true,
      },
      {
        userId: waiter2.id,
        restaurantId: restaurant.id,
        role: UserRole.WAITER,
        pin: '2345',
        isActive: true,
      },
      {
        userId: waiter3.id,
        restaurantId: restaurant.id,
        role: UserRole.WAITER,
        pin: '3456',
        isActive: true,
      },
      {
        userId: kitchen1.id,
        restaurantId: restaurant.id,
        role: UserRole.KITCHEN,
        pin: '5678',
        isActive: true,
      },
      {
        userId: kitchen2.id,
        restaurantId: restaurant.id,
        role: UserRole.KITCHEN,
        pin: '6789',
        isActive: true,
      },
    ],
  });

  console.log('   5 funcionarios criados!');

  // ============================================
  // TABLES - 18 tables with varied capacities
  // ============================================
  console.log('[8/15] Criando mesas...');

  const tableData: Array<{ number: number; name: string | null; capacity: number }> = [
    { number: 1, name: 'Varanda 1', capacity: 2 },
    { number: 2, name: 'Varanda 2', capacity: 2 },
    { number: 3, name: 'Varanda 3', capacity: 4 },
    { number: 4, name: 'Varanda 4', capacity: 4 },
    { number: 5, name: null, capacity: 4 },
    { number: 6, name: null, capacity: 4 },
    { number: 7, name: null, capacity: 4 },
    { number: 8, name: null, capacity: 6 },
    { number: 9, name: null, capacity: 6 },
    { number: 10, name: null, capacity: 6 },
    { number: 11, name: 'Reservado VIP 1', capacity: 8 },
    { number: 12, name: 'Reservado VIP 2', capacity: 8 },
    { number: 13, name: null, capacity: 4 },
    { number: 14, name: null, capacity: 4 },
    { number: 15, name: 'Familia', capacity: 10 },
    { number: 16, name: null, capacity: 4 },
    { number: 17, name: null, capacity: 4 },
    { number: 18, name: 'Balcao', capacity: 6 },
  ];

  const tables: Array<{ id: string; number: number }> = [];

  for (const t of tableData) {
    const table = await prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        number: t.number,
        name: t.name,
        capacity: t.capacity,
        qrCode: generateQRCode('boteco-do-chef', t.number),
        isActive: true,
      },
    });
    tables.push({ id: table.id, number: table.number });
  }

  console.log('   18 mesas criadas!');

  // ============================================
  // MENU CATEGORIES
  // ============================================
  console.log('[9/15] Criando cardapio...');

  const catPorcoes = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Porcoes',
      description: 'Porcoes generosas para compartilhar',
      displayOrder: 1,
      isActive: true,
    },
  });

  const catPetiscos = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Petiscos',
      description: 'Deliciosos petiscos para beliscar',
      displayOrder: 2,
      isActive: true,
    },
  });

  const catPratosPrincipais = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Pratos Principais',
      description: 'Pratos completos para uma refeicao',
      displayOrder: 3,
      isActive: true,
    },
  });

  const catCervejasArtesanais = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Cervejas Artesanais',
      description: 'Selecao especial de cervejas artesanais',
      displayOrder: 4,
      isActive: true,
    },
  });

  const catCervejasComerciais = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Cervejas Comerciais',
      description: 'Cervejas tradicionais bem geladas',
      displayOrder: 5,
      isActive: true,
    },
  });

  const catDrinks = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Drinks e Coqueteis',
      description: 'Drinks classicos e autorais',
      displayOrder: 6,
      isActive: true,
    },
  });

  const catBebidasNaoAlcoolicas = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Bebidas Nao Alcoolicas',
      description: 'Refrigerantes, sucos e aguas',
      displayOrder: 7,
      isActive: true,
    },
  });

  const catSobremesas = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Sobremesas',
      description: 'Docuras para finalizar',
      displayOrder: 8,
      isActive: true,
    },
  });

  // ============================================
  // MENU ITEMS - 50+ items
  // ============================================

  // PORCOES (10 items)
  const menuItems = await prisma.menuItem.createManyAndReturn({
    data: [
      // PORCOES
      {
        restaurantId: restaurant.id,
        categoryId: catPorcoes.id,
        name: 'Batata Frita Tradicional',
        description: 'Porcao generosa de batata frita crocante com sal e oregano',
        imageUrl: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400',
        price: 32.9,
        calories: 450,
        allergens: [],
        isAvailable: true,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPorcoes.id,
        name: 'Batata com Cheddar e Bacon',
        description: 'Batata frita coberta com cheddar cremoso e bacon crocante',
        imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400',
        price: 45.9,
        calories: 720,
        allergens: ['lactose'],
        isAvailable: true,
        displayOrder: 2,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPorcoes.id,
        name: 'Calabresa Acebolada',
        description: 'Linguica calabresa grelhada com cebolas douradas, limao e farofa',
        imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400',
        price: 52.9,
        calories: 580,
        allergens: [],
        isAvailable: true,
        displayOrder: 3,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPorcoes.id,
        name: 'Frango a Passarinho',
        description: 'Pedacos de frango empanados e fritos, servidos com limao e molho',
        imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
        price: 48.9,
        calories: 650,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 4,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPorcoes.id,
        name: 'Isca de Peixe',
        description: 'Iscas de tilapia empanadas e fritas com molho tartaro',
        imageUrl: 'https://images.unsplash.com/photo-1580217593608-61931cefc821?w=400',
        price: 56.9,
        calories: 520,
        allergens: ['gluten', 'peixe'],
        isAvailable: true,
        displayOrder: 5,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPorcoes.id,
        name: 'Mandioca Frita',
        description: 'Mandioca frita crocante por fora e macia por dentro',
        imageUrl: 'https://images.unsplash.com/photo-1619221882220-947b3d3c8861?w=400',
        price: 28.9,
        calories: 380,
        allergens: [],
        isAvailable: true,
        displayOrder: 6,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPorcoes.id,
        name: 'Provolone a Milanesa',
        description: 'Fatias de provolone empanadas e fritas, servidas com geleia de pimenta',
        imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
        price: 49.9,
        calories: 480,
        allergens: ['gluten', 'lactose'],
        isAvailable: true,
        displayOrder: 7,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPorcoes.id,
        name: 'Polenta Frita',
        description: 'Palitos de polenta fritos ate dourar, acompanha molho de gorgonzola',
        imageUrl: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400',
        price: 34.9,
        calories: 420,
        allergens: ['lactose'],
        isAvailable: true,
        displayOrder: 8,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPorcoes.id,
        name: 'Dadinho de Tapioca',
        description: 'Cubos de tapioca com queijo coalho, acompanha geleia de pimenta',
        imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
        price: 38.9,
        calories: 350,
        allergens: ['lactose'],
        isAvailable: true,
        displayOrder: 9,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPorcoes.id,
        name: 'Torresmo de Rolo',
        description: 'Torresmo crocante cortado em cubos, servido com limao',
        imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400',
        price: 44.9,
        calories: 680,
        allergens: [],
        isAvailable: true,
        displayOrder: 10,
      },

      // PETISCOS (10 items)
      {
        restaurantId: restaurant.id,
        categoryId: catPetiscos.id,
        name: 'Bolinho de Bacalhau (6 un)',
        description: 'Tradicionais bolinhos de bacalhau fritos, crocantes por fora',
        imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
        price: 42.9,
        calories: 320,
        allergens: ['gluten', 'peixe', 'ovos'],
        isAvailable: true,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPetiscos.id,
        name: 'Coxinha (6 un)',
        description: 'Coxinhas de frango desfiado cremosas e crocantes',
        imageUrl: 'https://images.unsplash.com/photo-1630409346699-79a3c9521f15?w=400',
        price: 36.9,
        calories: 480,
        allergens: ['gluten', 'lactose'],
        isAvailable: true,
        displayOrder: 2,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPetiscos.id,
        name: 'Pastel de Carne (4 un)',
        description: 'Pasteis de carne moida temperada, fritos na hora',
        imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
        price: 32.9,
        calories: 450,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 3,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPetiscos.id,
        name: 'Pastel de Queijo (4 un)',
        description: 'Pasteis recheados com queijo mussarela derretido',
        imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
        price: 29.9,
        calories: 420,
        allergens: ['gluten', 'lactose'],
        isAvailable: true,
        displayOrder: 4,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPetiscos.id,
        name: 'Quibe Frito (6 un)',
        description: 'Quibes de carne bovina com triguilho, fritos ate dourar',
        imageUrl: 'https://images.unsplash.com/photo-1579888944880-d98341245702?w=400',
        price: 38.9,
        calories: 380,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 5,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPetiscos.id,
        name: 'Empada de Frango (4 un)',
        description: 'Empadas caseiras com recheio cremoso de frango',
        imageUrl: 'https://images.unsplash.com/photo-1612187146555-6e0eb06e4bb5?w=400',
        price: 28.9,
        calories: 360,
        allergens: ['gluten', 'lactose'],
        isAvailable: true,
        displayOrder: 6,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPetiscos.id,
        name: 'Carpaccio de Carne',
        description: 'Finas fatias de carne crua com molho mostarda e alcaparras',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        price: 54.9,
        calories: 280,
        allergens: ['mostarda'],
        isAvailable: true,
        displayOrder: 7,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPetiscos.id,
        name: 'Bruschetta Italiana (4 un)',
        description: 'Pao italiano grelhado com tomate, manjericao e azeite',
        imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400',
        price: 26.9,
        calories: 220,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 8,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPetiscos.id,
        name: 'Tabua de Frios',
        description: 'Selecao de queijos, presunto, salame, azeitonas e torradas',
        imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
        price: 68.9,
        calories: 550,
        allergens: ['gluten', 'lactose'],
        isAvailable: true,
        displayOrder: 9,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPetiscos.id,
        name: 'Aneis de Cebola',
        description: 'Aneis de cebola empanados e fritos, servidos com molho especial',
        imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400',
        price: 32.9,
        calories: 380,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 10,
      },

      // PRATOS PRINCIPAIS (8 items)
      {
        restaurantId: restaurant.id,
        categoryId: catPratosPrincipais.id,
        name: 'Picanha na Chapa (400g)',
        description: 'Picanha grelhada na chapa com arroz, farofa, vinagrete e batatas',
        imageUrl: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=400',
        price: 89.9,
        calories: 850,
        allergens: [],
        isAvailable: true,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPratosPrincipais.id,
        name: 'Costela no Bafo',
        description: 'Costela bovina cozida lentamente, desfiada, com mandioca e arroz',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        price: 78.9,
        calories: 920,
        allergens: [],
        isAvailable: true,
        displayOrder: 2,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPratosPrincipais.id,
        name: 'Frango a Parmegiana',
        description: 'File de frango empanado com molho de tomate, queijo derretido e arroz',
        imageUrl: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400',
        price: 58.9,
        calories: 780,
        allergens: ['gluten', 'lactose'],
        isAvailable: true,
        displayOrder: 3,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPratosPrincipais.id,
        name: 'File a Oswaldo Aranha',
        description: 'File mignon grelhado com alho frito, arroz, farofa e batatas',
        imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
        price: 94.9,
        calories: 820,
        allergens: [],
        isAvailable: true,
        displayOrder: 4,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPratosPrincipais.id,
        name: 'Escondidinho de Carne Seca',
        description: 'Pure de mandioca com carne seca desfiada, gratinado com queijo',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
        price: 52.9,
        calories: 680,
        allergens: ['lactose'],
        isAvailable: true,
        displayOrder: 5,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPratosPrincipais.id,
        name: 'Moqueca de Peixe',
        description: 'Peixe cozido em leite de coco, dende, pimentoes e coentro, com arroz',
        imageUrl: 'https://images.unsplash.com/photo-1535140728325-a4d3707eee61?w=400',
        price: 72.9,
        calories: 580,
        allergens: ['peixe'],
        isAvailable: true,
        displayOrder: 6,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPratosPrincipais.id,
        name: 'Risoto de Camarao',
        description: 'Risoto cremoso com camaroes, tomate seco e rucula',
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400',
        price: 76.9,
        calories: 620,
        allergens: ['lactose', 'crustaceos'],
        isAvailable: true,
        displayOrder: 7,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPratosPrincipais.id,
        name: 'Feijoada Completa',
        description: 'Feijoada tradicional com arroz, couve, farofa, torresmo e laranja (sab/dom)',
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
        price: 68.9,
        calories: 980,
        allergens: [],
        isAvailable: true,
        displayOrder: 8,
      },

      // CERVEJAS ARTESANAIS (6 items)
      {
        restaurantId: restaurant.id,
        categoryId: catCervejasArtesanais.id,
        name: 'IPA Colorado (500ml)',
        description: 'Cerveja IPA brasileira com notas citricas e amargor equilibrado',
        imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
        price: 28.9,
        calories: 180,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catCervejasArtesanais.id,
        name: 'Weiss Eisenbahn (500ml)',
        description: 'Cerveja de trigo com notas de banana e cravo',
        imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        price: 26.9,
        calories: 170,
        allergens: ['gluten', 'trigo'],
        isAvailable: true,
        displayOrder: 2,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catCervejasArtesanais.id,
        name: 'Pilsen Wals (500ml)',
        description: 'Pilsen artesanal leve e refrescante com lupulo floral',
        imageUrl: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=400',
        price: 24.9,
        calories: 150,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 3,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catCervejasArtesanais.id,
        name: 'Stout Baden Baden (500ml)',
        description: 'Cerveja escura com notas de cafe e chocolate',
        imageUrl: 'https://images.unsplash.com/photo-1514828260103-1e9bf9a58446?w=400',
        price: 29.9,
        calories: 200,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 4,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catCervejasArtesanais.id,
        name: 'APA Bodebrown (500ml)',
        description: 'American Pale Ale com lupulo americano tropical',
        imageUrl: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=400',
        price: 27.9,
        calories: 175,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 5,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catCervejasArtesanais.id,
        name: 'Belgian Tripel Dogma (330ml)',
        description: 'Cerveja belga forte com notas frutadas e condimentadas',
        imageUrl: 'https://images.unsplash.com/photo-1579619797758-c2b1b5f8a2a9?w=400',
        price: 32.9,
        calories: 240,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 6,
      },

      // CERVEJAS COMERCIAIS (5 items)
      {
        restaurantId: restaurant.id,
        categoryId: catCervejasComerciais.id,
        name: 'Heineken Long Neck',
        description: 'Cerveja premium holandesa (330ml)',
        imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        price: 12.9,
        calories: 140,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catCervejasComerciais.id,
        name: 'Brahma Litrinho',
        description: 'Cerveja Brahma em garrafa retornavel (300ml)',
        imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
        price: 8.9,
        calories: 130,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 2,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catCervejasComerciais.id,
        name: 'Original 600ml',
        description: 'Cerveja Original garrafa grande',
        imageUrl: 'https://images.unsplash.com/photo-1571068761877-d3e9117a60df?w=400',
        price: 16.9,
        calories: 240,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 3,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catCervejasComerciais.id,
        name: 'Stella Artois Long Neck',
        description: 'Cerveja belga premium (330ml)',
        imageUrl: 'https://images.unsplash.com/photo-1613735536968-7c53a65f8a77?w=400',
        price: 13.9,
        calories: 140,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 4,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catCervejasComerciais.id,
        name: 'Corona Extra Long Neck',
        description: 'Cerveja mexicana leve (330ml)',
        imageUrl: 'https://images.unsplash.com/photo-1581014042837-5d89c5c0ca37?w=400',
        price: 14.9,
        calories: 135,
        allergens: ['gluten'],
        isAvailable: true,
        displayOrder: 5,
      },

      // DRINKS E COQUETEIS (8 items)
      {
        restaurantId: restaurant.id,
        categoryId: catDrinks.id,
        name: 'Caipirinha Tradicional',
        description: 'Cachaca, limao, acucar e gelo - o classico brasileiro',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400',
        price: 22.9,
        calories: 180,
        allergens: [],
        isAvailable: true,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catDrinks.id,
        name: 'Caipiroska de Frutas',
        description: 'Vodka com frutas da estacao, limao e acucar',
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
        price: 26.9,
        calories: 195,
        allergens: [],
        isAvailable: true,
        displayOrder: 2,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catDrinks.id,
        name: 'Mojito',
        description: 'Rum, hortela, limao, acucar e agua com gas',
        imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400',
        price: 28.9,
        calories: 170,
        allergens: [],
        isAvailable: true,
        displayOrder: 3,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catDrinks.id,
        name: 'Moscow Mule',
        description: 'Vodka, cerveja de gengibre e limao servido em caneca de cobre',
        imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400',
        price: 32.9,
        calories: 160,
        allergens: [],
        isAvailable: true,
        displayOrder: 4,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catDrinks.id,
        name: 'Aperol Spritz',
        description: 'Aperol, prosecco e agua com gas',
        imageUrl: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400',
        price: 34.9,
        calories: 140,
        allergens: [],
        isAvailable: true,
        displayOrder: 5,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catDrinks.id,
        name: 'Gin Tonica',
        description: 'Gin premium, agua tonica, especiarias e citricos',
        imageUrl: 'https://images.unsplash.com/photo-1551751299-1b51cab2694c?w=400',
        price: 36.9,
        calories: 120,
        allergens: [],
        isAvailable: true,
        displayOrder: 6,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catDrinks.id,
        name: 'Whisky do Chef',
        description: 'Dose de whisky 12 anos com gelo (50ml)',
        imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
        price: 38.9,
        calories: 110,
        allergens: [],
        isAvailable: true,
        displayOrder: 7,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catDrinks.id,
        name: 'Sangria da Casa (jarra)',
        description: 'Vinho tinto com frutas frescas, especiarias e licor',
        imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
        price: 58.9,
        calories: 280,
        allergens: [],
        isAvailable: true,
        displayOrder: 8,
      },

      // BEBIDAS NAO ALCOOLICAS (6 items)
      {
        restaurantId: restaurant.id,
        categoryId: catBebidasNaoAlcoolicas.id,
        name: 'Refrigerante Lata',
        description: 'Coca-Cola, Guarana Antarctica, Sprite ou Fanta (350ml)',
        imageUrl: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400',
        price: 7.9,
        calories: 140,
        allergens: [],
        isAvailable: true,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catBebidasNaoAlcoolicas.id,
        name: 'Suco Natural (500ml)',
        description: 'Laranja, limao, abacaxi, maracuja ou morango',
        imageUrl: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400',
        price: 14.9,
        calories: 120,
        allergens: [],
        isAvailable: true,
        displayOrder: 2,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catBebidasNaoAlcoolicas.id,
        name: 'Agua Mineral (500ml)',
        description: 'Com ou sem gas',
        imageUrl: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400',
        price: 5.9,
        calories: 0,
        allergens: [],
        isAvailable: true,
        displayOrder: 3,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catBebidasNaoAlcoolicas.id,
        name: 'Agua de Coco (500ml)',
        description: 'Agua de coco natural gelada',
        imageUrl: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400',
        price: 9.9,
        calories: 45,
        allergens: [],
        isAvailable: true,
        displayOrder: 4,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catBebidasNaoAlcoolicas.id,
        name: 'Cha Gelado (500ml)',
        description: 'Cha preto com limao ou cha verde com limao',
        imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
        price: 11.9,
        calories: 80,
        allergens: [],
        isAvailable: true,
        displayOrder: 5,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catBebidasNaoAlcoolicas.id,
        name: 'Cafe Espresso',
        description: 'Cafe espresso curto ou longo',
        imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
        price: 6.9,
        calories: 5,
        allergens: [],
        isAvailable: true,
        displayOrder: 6,
      },

      // SOBREMESAS (5 items)
      {
        restaurantId: restaurant.id,
        categoryId: catSobremesas.id,
        name: 'Petit Gateau',
        description: 'Bolinho de chocolate com centro derretido e sorvete de creme',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
        price: 28.9,
        calories: 480,
        allergens: ['gluten', 'lactose', 'ovos'],
        isAvailable: true,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catSobremesas.id,
        name: 'Pudim de Leite',
        description: 'Pudim caseiro de leite condensado com calda de caramelo',
        imageUrl: 'https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?w=400',
        price: 18.9,
        calories: 320,
        allergens: ['lactose', 'ovos'],
        isAvailable: true,
        displayOrder: 2,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catSobremesas.id,
        name: 'Churros com Doce de Leite (4 un)',
        description: 'Churros crocantes recheados com doce de leite, com canela e acucar',
        imageUrl: 'https://images.unsplash.com/photo-1624371414361-e670e6dcc3e0?w=400',
        price: 22.9,
        calories: 380,
        allergens: ['gluten', 'lactose'],
        isAvailable: true,
        displayOrder: 3,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catSobremesas.id,
        name: 'Cartola',
        description: 'Banana assada com queijo coalho, canela e acucar',
        imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
        price: 24.9,
        calories: 350,
        allergens: ['lactose'],
        isAvailable: true,
        displayOrder: 4,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catSobremesas.id,
        name: 'Acai na Tigela (300ml)',
        description: 'Acai com granola, banana, morango e leite condensado',
        imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
        price: 26.9,
        calories: 420,
        allergens: ['gluten', 'lactose'],
        isAvailable: true,
        displayOrder: 5,
      },
    ],
  });

  console.log(`   ${menuItems.length} itens de cardapio criados!`);

  // Create a map for easy access to menu items by name
  const menuItemMap: Record<string, typeof menuItems[0]> = {};
  for (const item of menuItems) {
    menuItemMap[item.name] = item;
  }

  // ============================================
  // SUPPLIERS - 4 Fornecedores
  // ============================================
  console.log('[10/15] Criando fornecedores e estoque...');

  const supplierFrigorifico = await prisma.supplier.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Frigorifico Boi Gordo Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'vendas@boigordo.com.br',
      phone: '+55 11 4567-8901',
      address: 'Rodovia Anhanguera, km 52 - Jundiai, SP - CEP 13209-000',
      notes: 'Fornecedor de carnes bovinas e suinas. Entrega as teras e quintas.',
      isActive: true,
    },
  });

  const supplierBebidas = await prisma.supplier.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Distribuidora de Bebidas Paulista',
      cnpj: '23.456.789/0001-01',
      email: 'pedidos@bebidaspaulista.com.br',
      phone: '+55 11 3456-7890',
      address: 'Av. das Nacoes Unidas, 15000 - Chacara Santo Antonio, Sao Paulo - SP',
      notes: 'Distribuidora de cervejas, destilados e refrigerantes. Entrega diaria.',
      isActive: true,
    },
  });

  const supplierHortifruti = await prisma.supplier.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Hortifruti Ceagesp',
      cnpj: '34.567.890/0001-12',
      email: 'contato@ceagesp.com.br',
      phone: '+55 11 2345-6789',
      address: 'CEAGESP - Av. Dr. Gastao Vidigal, 1946 - Vila Leopoldina, Sao Paulo - SP',
      notes: 'Fornecedor de frutas, legumes e verduras frescos. Compra direta.',
      isActive: true,
    },
  });

  const supplierSecos = await prisma.supplier.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Atacadao Secos e Molhados',
      cnpj: '45.678.901/0001-23',
      email: 'atacado@secosemolhados.com.br',
      phone: '+55 11 5678-9012',
      address: 'Rua Augusta, 2500 - Consolacao, Sao Paulo - SP',
      notes: 'Fornecedor de produtos secos, enlatados e embalagens.',
      isActive: true,
    },
  });

  console.log('   4 fornecedores criados!');

  // ============================================
  // INVENTORY ITEMS - 25+ items
  // ============================================

  const inventoryItems = await prisma.inventoryItem.createManyAndReturn({
    data: [
      // Carnes
      {
        restaurantId: restaurant.id,
        name: 'Picanha Bovina',
        description: 'Picanha bovina de primeira',
        sku: 'CARNE-001',
        unit: 'KG',
        currentStock: 25.5,
        minimumStock: 10,
        lastPurchasePrice: 89.9,
        averagePrice: 85.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'File Mignon',
        description: 'File mignon bovino',
        sku: 'CARNE-002',
        unit: 'KG',
        currentStock: 15.0,
        minimumStock: 8,
        lastPurchasePrice: 98.9,
        averagePrice: 95.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Costela Bovina',
        description: 'Costela bovina para assado',
        sku: 'CARNE-003',
        unit: 'KG',
        currentStock: 30.0,
        minimumStock: 15,
        lastPurchasePrice: 42.9,
        averagePrice: 40.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Linguica Calabresa',
        description: 'Linguica calabresa defumada',
        sku: 'CARNE-004',
        unit: 'KG',
        currentStock: 18.0,
        minimumStock: 8,
        lastPurchasePrice: 32.9,
        averagePrice: 30.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Frango Inteiro',
        description: 'Frango inteiro resfriado',
        sku: 'CARNE-005',
        unit: 'KG',
        currentStock: 40.0,
        minimumStock: 20,
        lastPurchasePrice: 18.9,
        averagePrice: 17.5,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Bacon Defumado',
        description: 'Bacon em fatias',
        sku: 'CARNE-006',
        unit: 'KG',
        currentStock: 8.5,
        minimumStock: 5,
        lastPurchasePrice: 52.9,
        averagePrice: 50.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Torresmo',
        description: 'Torresmo de rolo',
        sku: 'CARNE-007',
        unit: 'KG',
        currentStock: 12.0,
        minimumStock: 6,
        lastPurchasePrice: 38.9,
        averagePrice: 36.0,
        trackStock: true,
        isActive: true,
      },
      // Peixes e Frutos do Mar
      {
        restaurantId: restaurant.id,
        name: 'Tilapia em Files',
        description: 'File de tilapia congelado',
        sku: 'PEIXE-001',
        unit: 'KG',
        currentStock: 10.0,
        minimumStock: 5,
        lastPurchasePrice: 45.9,
        averagePrice: 43.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Bacalhau Dessalgado',
        description: 'Lascas de bacalhau dessalgado',
        sku: 'PEIXE-002',
        unit: 'KG',
        currentStock: 6.0,
        minimumStock: 3,
        lastPurchasePrice: 120.0,
        averagePrice: 115.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Camarao G',
        description: 'Camarao grande limpo',
        sku: 'PEIXE-003',
        unit: 'KG',
        currentStock: 5.0,
        minimumStock: 3,
        lastPurchasePrice: 98.0,
        averagePrice: 95.0,
        trackStock: true,
        isActive: true,
      },
      // Vegetais e Legumes
      {
        restaurantId: restaurant.id,
        name: 'Batata Inglesa',
        description: 'Batata para fritura',
        sku: 'VEG-001',
        unit: 'KG',
        currentStock: 100.0,
        minimumStock: 50,
        lastPurchasePrice: 6.9,
        averagePrice: 6.5,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Mandioca',
        description: 'Mandioca fresca',
        sku: 'VEG-002',
        unit: 'KG',
        currentStock: 40.0,
        minimumStock: 20,
        lastPurchasePrice: 8.9,
        averagePrice: 8.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Cebola',
        description: 'Cebola branca',
        sku: 'VEG-003',
        unit: 'KG',
        currentStock: 30.0,
        minimumStock: 15,
        lastPurchasePrice: 5.9,
        averagePrice: 5.5,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Tomate',
        description: 'Tomate italiano',
        sku: 'VEG-004',
        unit: 'KG',
        currentStock: 20.0,
        minimumStock: 10,
        lastPurchasePrice: 8.9,
        averagePrice: 8.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Limao Tahiti',
        description: 'Limao tahiti fresco',
        sku: 'VEG-005',
        unit: 'KG',
        currentStock: 15.0,
        minimumStock: 8,
        lastPurchasePrice: 7.9,
        averagePrice: 7.0,
        trackStock: true,
        isActive: true,
      },
      // Laticinios
      {
        restaurantId: restaurant.id,
        name: 'Queijo Mussarela',
        description: 'Mussarela fatiada',
        sku: 'LAT-001',
        unit: 'KG',
        currentStock: 12.0,
        minimumStock: 6,
        lastPurchasePrice: 42.9,
        averagePrice: 40.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Queijo Cheddar',
        description: 'Cheddar em fatias',
        sku: 'LAT-002',
        unit: 'KG',
        currentStock: 8.0,
        minimumStock: 4,
        lastPurchasePrice: 55.9,
        averagePrice: 52.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Queijo Provolone',
        description: 'Provolone inteiro',
        sku: 'LAT-003',
        unit: 'KG',
        currentStock: 5.0,
        minimumStock: 3,
        lastPurchasePrice: 68.9,
        averagePrice: 65.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Cream Cheese',
        description: 'Cream cheese Philadelphia',
        sku: 'LAT-004',
        unit: 'KG',
        currentStock: 4.0,
        minimumStock: 2,
        lastPurchasePrice: 58.9,
        averagePrice: 55.0,
        trackStock: true,
        isActive: true,
      },
      // Bebidas
      {
        restaurantId: restaurant.id,
        name: 'Cerveja Heineken LN (caixa)',
        description: 'Caixa com 24 long necks',
        sku: 'BEB-001',
        unit: 'CX',
        currentStock: 15.0,
        minimumStock: 5,
        lastPurchasePrice: 180.0,
        averagePrice: 175.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Cerveja Brahma 300ml (caixa)',
        description: 'Caixa com 24 garrafas',
        sku: 'BEB-002',
        unit: 'CX',
        currentStock: 20.0,
        minimumStock: 8,
        lastPurchasePrice: 98.0,
        averagePrice: 95.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Coca-Cola Lata (caixa)',
        description: 'Caixa com 24 latas',
        sku: 'BEB-003',
        unit: 'CX',
        currentStock: 10.0,
        minimumStock: 4,
        lastPurchasePrice: 75.0,
        averagePrice: 72.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Cachaca 51',
        description: 'Cachaca 51 garrafa 1L',
        sku: 'BEB-004',
        unit: 'UN',
        currentStock: 12.0,
        minimumStock: 4,
        lastPurchasePrice: 18.9,
        averagePrice: 17.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Vodka Absolut',
        description: 'Vodka Absolut garrafa 1L',
        sku: 'BEB-005',
        unit: 'UN',
        currentStock: 8.0,
        minimumStock: 3,
        lastPurchasePrice: 85.0,
        averagePrice: 82.0,
        trackStock: true,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        name: 'Gin Tanqueray',
        description: 'Gin Tanqueray garrafa 750ml',
        sku: 'BEB-006',
        unit: 'UN',
        currentStock: 6.0,
        minimumStock: 2,
        lastPurchasePrice: 120.0,
        averagePrice: 115.0,
        trackStock: true,
        isActive: true,
      },
    ],
  });

  console.log(`   ${inventoryItems.length} itens de estoque criados!`);

  // Create Stock Entry
  const stockEntry = await prisma.stockEntry.create({
    data: {
      restaurantId: restaurant.id,
      supplierId: supplierFrigorifico.id,
      type: StockEntryType.PURCHASE,
      referenceNumber: 'NF-2024-0892',
      notes: 'Compra semanal de carnes - semana 01/2025',
      totalAmount: 3250.0,
      createdAt: daysAgo(3),
      createdBy: owner.id,
    },
  });

  await prisma.stockEntryItem.createMany({
    data: [
      {
        stockEntryId: stockEntry.id,
        inventoryItemId: inventoryItems.find((i) => i.sku === 'CARNE-001')!.id,
        quantity: 20.0,
        unitPrice: 89.9,
        totalPrice: 1798.0,
      },
      {
        stockEntryId: stockEntry.id,
        inventoryItemId: inventoryItems.find((i) => i.sku === 'CARNE-003')!.id,
        quantity: 25.0,
        unitPrice: 42.9,
        totalPrice: 1072.5,
      },
      {
        stockEntryId: stockEntry.id,
        inventoryItemId: inventoryItems.find((i) => i.sku === 'CARNE-004')!.id,
        quantity: 10.0,
        unitPrice: 32.9,
        totalPrice: 329.0,
      },
    ],
  });

  // ============================================
  // TABLE SESSIONS AND ORDERS - Last 7 days
  // ============================================
  console.log('[11/15] Criando pedidos dos ultimos 7 dias...');

  let orderCounter = 1;
  const orders: Array<{ id: string; orderNumber: string; status: OrderStatus }> = [];

  // Helper function to create orders
  async function createOrder(
    tableNum: number,
    daysBack: number,
    hoursStart: number,
    status: OrderStatus,
    items: Array<{ name: string; quantity: number; userId?: string }>,
    options?: {
      isSplit?: boolean;
      splitMethod?: SplitMethod;
      splitParticipants?: Array<{ userId: string; amountDue: number; paid: boolean }>;
      paymentMethod?: PaymentMethod;
      notes?: string;
    }
  ) {
    const table = tables.find((t) => t.number === tableNum);
    if (!table) return null;

    const orderDate = daysAgo(daysBack, hoursStart);
    const orderNumber = generateOrderNumber('BC', orderCounter++);

    let subtotal = 0;
    const orderItems: Array<{
      menuItemId: string;
      userId: string | null;
      quantity: number;
      unitPrice: number;
    }> = [];

    for (const item of items) {
      const menuItem = menuItemMap[item.name];
      if (menuItem) {
        orderItems.push({
          menuItemId: menuItem.id,
          userId: item.userId || null,
          quantity: item.quantity,
          unitPrice: Number(menuItem.price),
        });
        subtotal += Number(menuItem.price) * item.quantity;
      }
    }

    // Create table session
    const session = await prisma.tableSession.create({
      data: {
        tableId: table.id,
        restaurantId: restaurant.id,
        status: status === OrderStatus.DELIVERED ? SessionStatus.CLOSED : SessionStatus.ACTIVE,
        startedAt: orderDate,
        closedAt: status === OrderStatus.DELIVERED ? new Date(orderDate.getTime() + 2 * 60 * 60 * 1000) : null,
        subtotal: subtotal,
        taxAmount: 0,
        totalAmount: subtotal,
      },
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        tableSessionId: session.id,
        orderNumber: orderNumber,
        tableNumber: String(tableNum),
        status: status,
        subtotal: subtotal,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: subtotal,
        isSplit: options?.isSplit || false,
        splitCount: options?.splitParticipants?.length || 1,
        notes: options?.notes || null,
        createdAt: orderDate,
        confirmedAt: status !== OrderStatus.PENDING ? new Date(orderDate.getTime() + 5 * 60 * 1000) : null,
        preparingAt:
          status === OrderStatus.PREPARING ||
          status === OrderStatus.READY ||
          status === OrderStatus.DELIVERED
            ? new Date(orderDate.getTime() + 10 * 60 * 1000)
            : null,
        readyAt:
          status === OrderStatus.READY || status === OrderStatus.DELIVERED
            ? new Date(orderDate.getTime() + 25 * 60 * 1000)
            : null,
        completedAt:
          status === OrderStatus.DELIVERED
            ? new Date(orderDate.getTime() + 30 * 60 * 1000)
            : null,
        cancelledAt: status === OrderStatus.CANCELLED ? new Date(orderDate.getTime() + 15 * 60 * 1000) : null,
      },
    });

    // Create order items
    for (const item of orderItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: item.menuItemId,
          userId: item.userId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        },
      });
    }

    // Create payment if completed
    if (status === OrderStatus.DELIVERED && !options?.isSplit) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: options?.paymentMethod || PaymentMethod.PIX,
          gateway: 'tabsync',
          gatewayId: 'pay_' + generateUUID().substring(0, 14),
          amount: subtotal,
          currency: 'BRL',
          status: PaymentStatus.COMPLETED,
          createdAt: orderDate,
          processedAt: new Date(orderDate.getTime() + 32 * 60 * 1000),
          completedAt: new Date(orderDate.getTime() + 33 * 60 * 1000),
        },
      });
    }

    // Create split payments if applicable
    if (options?.isSplit && options?.splitParticipants) {
      for (const participant of options.splitParticipants) {
        await prisma.splitPayment.create({
          data: {
            orderId: order.id,
            userId: participant.userId,
            userEmail:
              participant.userId === customer1.id
                ? customer1.email
                : participant.userId === customer2.id
                  ? customer2.email
                  : participant.userId === customer3.id
                    ? customer3.email
                    : participant.userId === customer4.id
                      ? customer4.email
                      : customer5.email,
            userName:
              participant.userId === customer1.id
                ? customer1.fullName
                : participant.userId === customer2.id
                  ? customer2.fullName
                  : participant.userId === customer3.id
                    ? customer3.fullName
                    : participant.userId === customer4.id
                      ? customer4.fullName
                      : customer5.fullName,
            splitMethod: options.splitMethod || SplitMethod.EQUAL,
            amountDue: participant.amountDue,
            paymentStatus: participant.paid ? SplitPaymentStatus.PAID : SplitPaymentStatus.PENDING,
            paymentToken: 'split_' + generateUUID().substring(0, 12),
            paidAt: participant.paid ? new Date(orderDate.getTime() + 35 * 60 * 1000) : null,
            expiresAt: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    orders.push({ id: order.id, orderNumber: order.orderNumber, status: order.status });
    return order;
  }

  // Create 30+ orders over the last 7 days

  // Day 7 (7 days ago) - Saturday
  await createOrder(5, 7, 13, OrderStatus.DELIVERED, [
    { name: 'Calabresa Acebolada', quantity: 1 },
    { name: 'Batata Frita Tradicional', quantity: 1 },
    { name: 'Heineken Long Neck', quantity: 4 },
  ], { paymentMethod: PaymentMethod.CREDIT_CARD });

  await createOrder(8, 7, 19, OrderStatus.DELIVERED, [
    { name: 'Picanha na Chapa (400g)', quantity: 2 },
    { name: 'Caipirinha Tradicional', quantity: 4 },
    { name: 'Refrigerante Lata', quantity: 2 },
  ], { paymentMethod: PaymentMethod.DEBIT_CARD });

  // Day 6 (6 days ago) - Sunday (feijoada day)
  await createOrder(15, 6, 12, OrderStatus.DELIVERED, [
    { name: 'Feijoada Completa', quantity: 4 },
    { name: 'Original 600ml', quantity: 3 },
    { name: 'Caipirinha Tradicional', quantity: 2 },
    { name: 'Pudim de Leite', quantity: 2 },
  ], {
    paymentMethod: PaymentMethod.PIX,
    notes: 'Almoco de familia - mesa grande'
  });

  await createOrder(3, 6, 14, OrderStatus.DELIVERED, [
    { name: 'Frango a Passarinho', quantity: 1 },
    { name: 'Mandioca Frita', quantity: 1 },
    { name: 'Brahma Litrinho', quantity: 6 },
  ], { paymentMethod: PaymentMethod.CASH });

  // Day 5 (5 days ago) - Monday
  await createOrder(7, 5, 18, OrderStatus.DELIVERED, [
    { name: 'Tabua de Frios', quantity: 1 },
    { name: 'Gin Tonica', quantity: 2 },
    { name: 'Aperol Spritz', quantity: 2 },
  ], { paymentMethod: PaymentMethod.PIX });

  await createOrder(1, 5, 20, OrderStatus.DELIVERED, [
    { name: 'Caipirinha Tradicional', quantity: 2 },
    { name: 'Polenta Frita', quantity: 1 },
  ], { paymentMethod: PaymentMethod.CREDIT_CARD });

  // Day 4 (4 days ago) - Tuesday
  await createOrder(9, 4, 19, OrderStatus.DELIVERED, [
    { name: 'Provolone a Milanesa', quantity: 1 },
    { name: 'Calabresa Acebolada', quantity: 1 },
    { name: 'Batata com Cheddar e Bacon', quantity: 1 },
    { name: 'IPA Colorado (500ml)', quantity: 3 },
    { name: 'Weiss Eisenbahn (500ml)', quantity: 2 },
  ], {
    isSplit: true,
    splitMethod: SplitMethod.EQUAL,
    splitParticipants: [
      { userId: customer1.id, amountDue: 79.8, paid: true },
      { userId: customer2.id, amountDue: 79.8, paid: true },
      { userId: customer3.id, amountDue: 79.7, paid: true },
    ],
    notes: 'Happy hour entre amigos - divisao igual'
  });

  await createOrder(6, 4, 21, OrderStatus.DELIVERED, [
    { name: 'Isca de Peixe', quantity: 1 },
    { name: 'Agua Mineral (500ml)', quantity: 2 },
    { name: 'Suco Natural (500ml)', quantity: 1 },
  ], { paymentMethod: PaymentMethod.DEBIT_CARD });

  // Day 3 (3 days ago) - Wednesday
  await createOrder(11, 3, 19, OrderStatus.DELIVERED, [
    { name: 'File a Oswaldo Aranha', quantity: 2 },
    { name: 'Risoto de Camarao', quantity: 1 },
    { name: 'Whisky do Chef', quantity: 2 },
    { name: 'Petit Gateau', quantity: 2 },
  ], {
    paymentMethod: PaymentMethod.CREDIT_CARD,
    notes: 'Jantar VIP - aniversario'
  });

  await createOrder(4, 3, 18, OrderStatus.DELIVERED, [
    { name: 'Coxinha (6 un)', quantity: 2 },
    { name: 'Pastel de Carne (4 un)', quantity: 2 },
    { name: 'Corona Extra Long Neck', quantity: 4 },
  ], { paymentMethod: PaymentMethod.PIX });

  await createOrder(2, 3, 22, OrderStatus.DELIVERED, [
    { name: 'Moscow Mule', quantity: 2 },
    { name: 'Dadinho de Tapioca', quantity: 1 },
  ], { paymentMethod: PaymentMethod.PIX });

  // Order cancelled
  await createOrder(13, 3, 20, OrderStatus.CANCELLED, [
    { name: 'Moqueca de Peixe', quantity: 2 },
    { name: 'Agua de Coco (500ml)', quantity: 2 },
  ], { notes: 'Cliente desistiu - demora na cozinha' });

  // Day 2 (2 days ago) - Thursday
  await createOrder(8, 2, 18, OrderStatus.DELIVERED, [
    { name: 'Bolinho de Bacalhau (6 un)', quantity: 2 },
    { name: 'Carpaccio de Carne', quantity: 1 },
    { name: 'Stout Baden Baden (500ml)', quantity: 2 },
    { name: 'Belgian Tripel Dogma (330ml)', quantity: 1 },
  ], {
    isSplit: true,
    splitMethod: SplitMethod.BY_ITEM,
    splitParticipants: [
      { userId: customer2.id, amountDue: 72.8, paid: true }, // Bolinho + cerveja
      { userId: customer4.id, amountDue: 97.7, paid: true }, // Bolinho + carpaccio + cerveja
    ],
    notes: 'Cada um paga o que pediu'
  });

  await createOrder(10, 2, 19, OrderStatus.DELIVERED, [
    { name: 'Escondidinho de Carne Seca', quantity: 2 },
    { name: 'Caipiroska de Frutas', quantity: 4 },
    { name: 'Churros com Doce de Leite (4 un)', quantity: 2 },
  ], { paymentMethod: PaymentMethod.PIX });

  await createOrder(5, 2, 20, OrderStatus.DELIVERED, [
    { name: 'Torresmo de Rolo', quantity: 1 },
    { name: 'Aneis de Cebola', quantity: 1 },
    { name: 'Stella Artois Long Neck', quantity: 6 },
  ], { paymentMethod: PaymentMethod.CREDIT_CARD });

  await createOrder(14, 2, 21, OrderStatus.DELIVERED, [
    { name: 'Costela no Bafo', quantity: 1 },
    { name: 'Batata Frita Tradicional', quantity: 1 },
    { name: 'Original 600ml', quantity: 2 },
  ], { paymentMethod: PaymentMethod.DEBIT_CARD });

  // Day 1 (yesterday) - Friday
  await createOrder(12, 1, 18, OrderStatus.DELIVERED, [
    { name: 'Tabua de Frios', quantity: 2 },
    { name: 'Sangria da Casa (jarra)', quantity: 2 },
    { name: 'Bruschetta Italiana (4 un)', quantity: 2 },
  ], {
    isSplit: true,
    splitMethod: SplitMethod.CUSTOM,
    splitParticipants: [
      { userId: customer1.id, amountDue: 100.0, paid: true },
      { userId: customer3.id, amountDue: 85.0, paid: true },
      { userId: customer5.id, amountDue: 85.4, paid: true },
    ],
    notes: 'Divisao customizada - anfitriao paga mais'
  });

  await createOrder(7, 1, 19, OrderStatus.DELIVERED, [
    { name: 'Quibe Frito (6 un)', quantity: 2 },
    { name: 'Empada de Frango (4 un)', quantity: 2 },
    { name: 'Mojito', quantity: 4 },
  ], { paymentMethod: PaymentMethod.PIX });

  await createOrder(9, 1, 20, OrderStatus.DELIVERED, [
    { name: 'Frango a Parmegiana', quantity: 2 },
    { name: 'Refrigerante Lata', quantity: 2 },
    { name: 'Cafe Espresso', quantity: 2 },
  ], { paymentMethod: PaymentMethod.CREDIT_CARD });

  await createOrder(6, 1, 21, OrderStatus.DELIVERED, [
    { name: 'Picanha na Chapa (400g)', quantity: 1 },
    { name: 'Caipirinha Tradicional', quantity: 2 },
    { name: 'Cartola', quantity: 1 },
  ], { paymentMethod: PaymentMethod.PIX });

  await createOrder(3, 1, 22, OrderStatus.DELIVERED, [
    { name: 'APA Bodebrown (500ml)', quantity: 4 },
    { name: 'Polenta Frita', quantity: 1 },
  ], { paymentMethod: PaymentMethod.CASH });

  // Day 0 (today) - Saturday - Active orders
  await createOrder(5, 0, 13, OrderStatus.DELIVERED, [
    { name: 'Feijoada Completa', quantity: 2 },
    { name: 'Caipirinha Tradicional', quantity: 2 },
    { name: 'Acai na Tigela (300ml)', quantity: 2 },
  ], { paymentMethod: PaymentMethod.PIX });

  await createOrder(8, 0, 14, OrderStatus.READY, [
    { name: 'Calabresa Acebolada', quantity: 1 },
    { name: 'Batata com Cheddar e Bacon', quantity: 1 },
    { name: 'Heineken Long Neck', quantity: 4 },
  ], { notes: 'Pedido pronto para entrega' });

  await createOrder(10, 0, 15, OrderStatus.PREPARING, [
    { name: 'Moqueca de Peixe', quantity: 1 },
    { name: 'Risoto de Camarao', quantity: 1 },
    { name: 'Gin Tonica', quantity: 2 },
  ], { notes: 'Em preparacao' });

  await createOrder(11, 0, 15, OrderStatus.CONFIRMED, [
    { name: 'Costela no Bafo', quantity: 2 },
    { name: 'Mandioca Frita', quantity: 2 },
    { name: 'Original 600ml', quantity: 2 },
  ], { notes: 'Confirmado, aguardando preparo' });

  // Active split bill order (pending payments)
  await createOrder(15, 0, 14, OrderStatus.PREPARING, [
    { name: 'Picanha na Chapa (400g)', quantity: 3 },
    { name: 'Batata Frita Tradicional', quantity: 2 },
    { name: 'Calabresa Acebolada', quantity: 1 },
    { name: 'Caipirinha Tradicional', quantity: 4 },
    { name: 'Brahma Litrinho', quantity: 6 },
  ], {
    isSplit: true,
    splitMethod: SplitMethod.EQUAL,
    splitParticipants: [
      { userId: customer1.id, amountDue: 130.47, paid: true },
      { userId: customer2.id, amountDue: 130.47, paid: false },
      { userId: customer4.id, amountDue: 130.46, paid: false },
    ],
    notes: 'Almoco de sabado em grupo - 1 ja pagou, 2 pendentes'
  });

  await createOrder(4, 0, 15, OrderStatus.PENDING, [
    { name: 'Isca de Peixe', quantity: 1 },
    { name: 'Agua de Coco (500ml)', quantity: 2 },
  ], { notes: 'Novo pedido aguardando confirmacao' });

  await createOrder(2, 0, 16, OrderStatus.PENDING, [
    { name: 'Aperol Spritz', quantity: 2 },
    { name: 'Tabua de Frios', quantity: 1 },
  ], { notes: 'Mesa do balcao' });

  console.log(`   ${orders.length} pedidos criados!`);

  // ============================================
  // REVIEWS - 12 reviews
  // ============================================
  console.log('[12/15] Criando avaliacoes e feedback...');

  const reviews = await prisma.review.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        userId: customer1.id,
        overallRating: 5,
        foodRating: 5,
        serviceRating: 5,
        ambianceRating: 5,
        waitTimeRating: 4,
        valueRating: 5,
        comment: 'Melhor boteco de SP! Calabresa acebolada sensacional, atendimento impecavel. Voltarei sempre!',
        isPublic: true,
        createdAt: daysAgo(6),
      },
      {
        restaurantId: restaurant.id,
        userId: customer2.id,
        overallRating: 4,
        foodRating: 5,
        serviceRating: 4,
        ambianceRating: 4,
        waitTimeRating: 3,
        valueRating: 4,
        comment: 'Comida excelente! So demorou um pouco no sabado a noite, mas entendo que estava cheio.',
        response: 'Obrigado pelo feedback, Juliana! Estamos trabalhando para melhorar nossos tempos de espera nos fins de semana.',
        respondedAt: daysAgo(5),
        isPublic: true,
        createdAt: daysAgo(5),
      },
      {
        restaurantId: restaurant.id,
        userId: customer3.id,
        overallRating: 5,
        foodRating: 5,
        serviceRating: 5,
        ambianceRating: 4,
        waitTimeRating: 5,
        valueRating: 4,
        comment: 'Picanha na chapa perfeita! O ponto estava exatamente como pedi. Funcionarios muito atenciosos.',
        isPublic: true,
        createdAt: daysAgo(4),
      },
      {
        restaurantId: restaurant.id,
        userId: customer4.id,
        overallRating: 4,
        foodRating: 4,
        serviceRating: 5,
        ambianceRating: 4,
        waitTimeRating: 4,
        valueRating: 3,
        comment: 'Ambiente muito agradavel, cerveja sempre gelada. Achei um pouco caro, mas a qualidade compensa.',
        response: 'Camila, agradecemos sua visita! Trabalhamos com ingredientes de primeira qualidade para garantir a melhor experiencia.',
        respondedAt: daysAgo(3),
        isPublic: true,
        createdAt: daysAgo(3),
      },
      {
        restaurantId: restaurant.id,
        userId: customer5.id,
        overallRating: 5,
        foodRating: 5,
        serviceRating: 5,
        ambianceRating: 5,
        waitTimeRating: 5,
        valueRating: 5,
        comment: 'Feijoada de domingo e tradicao! Nao existe melhor em Sao Paulo. Parabens a toda equipe!',
        isPublic: true,
        createdAt: daysAgo(2),
      },
      {
        restaurantId: restaurant.id,
        userId: customer1.id,
        overallRating: 4,
        foodRating: 4,
        serviceRating: 4,
        ambianceRating: 5,
        waitTimeRating: 4,
        valueRating: 4,
        comment: 'Happy hour perfeito com os amigos. Drinks muito bem feitos e porcoes generosas.',
        isPublic: true,
        createdAt: daysAgo(1),
      },
      {
        restaurantId: restaurant.id,
        userId: customer2.id,
        overallRating: 5,
        foodRating: 5,
        serviceRating: 5,
        ambianceRating: 5,
        waitTimeRating: 5,
        valueRating: 5,
        comment: 'Sistema de dividir conta pelo celular e fantastico! Nunca mais vou ter dor de cabeca pra fechar conta.',
        isPublic: true,
        createdAt: daysAgo(1),
      },
      {
        restaurantId: restaurant.id,
        userId: customer3.id,
        overallRating: 3,
        foodRating: 4,
        serviceRating: 3,
        ambianceRating: 3,
        waitTimeRating: 2,
        valueRating: 3,
        comment: 'Comida boa mas demorou muito na sexta-feira. Quase 1 hora pra receber o pedido.',
        response: 'Pedro, pedimos desculpas pela demora! Sexta-feira foi atipico por conta de um evento. Esperamos ter a oportunidade de melhorar sua experiencia.',
        respondedAt: new Date(),
        isPublic: true,
        createdAt: daysAgo(1),
      },
      {
        restaurantId: restaurant.id,
        userId: customer4.id,
        overallRating: 5,
        foodRating: 5,
        serviceRating: 5,
        ambianceRating: 5,
        waitTimeRating: 4,
        valueRating: 5,
        comment: 'Boteco com alma! Ambiente acolhedor, comida de verdade e funcionarios que tratam a gente como amigo.',
        isPublic: true,
        createdAt: hoursAgo(12),
      },
      {
        restaurantId: restaurant.id,
        userId: customer5.id,
        overallRating: 4,
        foodRating: 5,
        serviceRating: 4,
        ambianceRating: 4,
        waitTimeRating: 4,
        valueRating: 4,
        comment: 'Cervejas artesanais muito bem selecionadas. Recomendo a IPA Colorado!',
        isPublic: true,
        createdAt: hoursAgo(6),
      },
    ],
  });

  console.log('   10 avaliacoes criadas!');

  // ============================================
  // SUGGESTIONS - 4 suggestions
  // ============================================

  await prisma.suggestion.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        userId: customer1.id,
        category: SuggestionCategory.MENU,
        content: 'Seria otimo ter opcoes vegetarianas no cardapio! Minha esposa e vegetariana e tem poucas opcoes pra ela.',
        isAnonymous: false,
        status: SuggestionStatus.READ,
        createdAt: daysAgo(5),
      },
      {
        restaurantId: restaurant.id,
        userId: customer3.id,
        category: SuggestionCategory.SERVICE,
        content: 'Sugestao de criar um programa de fidelidade. Frequento toda semana e seria legal ter algum beneficio.',
        isAnonymous: false,
        status: SuggestionStatus.RESPONDED,
        response: 'Otima sugestao Pedro! Estamos desenvolvendo nosso programa de fidelidade que sera lancado em breve. Obrigado!',
        respondedAt: daysAgo(4),
        createdAt: daysAgo(4),
      },
      {
        restaurantId: restaurant.id,
        userId: null,
        category: SuggestionCategory.AMBIANCE,
        content: 'O som ambiente poderia ser um pouco mais baixo, as vezes fica dificil conversar.',
        isAnonymous: true,
        status: SuggestionStatus.UNREAD,
        createdAt: daysAgo(2),
      },
      {
        restaurantId: restaurant.id,
        userId: customer5.id,
        category: SuggestionCategory.MENU,
        content: 'Adoraria ver mais opcoes de sobremesas! Quem sabe um brownie ou um cheesecake?',
        isAnonymous: false,
        status: SuggestionStatus.UNREAD,
        createdAt: daysAgo(1),
      },
    ],
  });

  console.log('   4 sugestoes criadas!');

  // ============================================
  // COMPLAINTS - 2 complaints
  // ============================================

  await prisma.complaint.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        userId: customer3.id,
        category: ComplaintCategory.WAIT_TIME,
        priority: Priority.MEDIUM,
        status: ComplaintStatus.RESOLVED,
        subject: 'Demora excessiva no pedido',
        description: 'Na sexta-feira passada esperei mais de 1 hora pelo meu pedido de moqueca. O garcom nao deu nenhuma satisfacao durante a espera.',
        escalatedToSuper: false,
        response: 'Caro Pedro, pedimos sinceras desculpas pelo ocorrido. Tivemos um problema na cozinha naquele dia que ja foi resolvido. Gostaramos de oferecer um desconto de 30% na sua proxima visita como forma de desculpas. Entre em contato conosco para receber seu cupom.',
        respondedAt: daysAgo(1),
        resolvedAt: daysAgo(1),
        createdAt: daysAgo(2),
      },
      {
        restaurantId: restaurant.id,
        userId: customer4.id,
        category: ComplaintCategory.BILLING,
        priority: Priority.LOW,
        status: ComplaintStatus.IN_PROGRESS,
        subject: 'Cobranca incorreta na conta',
        description: 'Fui cobrado por 3 cervejas quando pedi apenas 2. Ja paguei a conta mas gostaria de estorno.',
        escalatedToSuper: false,
        createdAt: daysAgo(1),
      },
    ],
  });

  console.log('   2 reclamacoes criadas!');

  // ============================================
  // NPS RESPONSES - 8 responses
  // ============================================

  await prisma.npsResponse.createMany({
    data: [
      { restaurantId: restaurant.id, userId: customer1.id, score: 10, feedback: 'Recomendo demais!', createdAt: daysAgo(6) },
      { restaurantId: restaurant.id, userId: customer2.id, score: 9, feedback: 'Otimo lugar, voltarei com certeza', createdAt: daysAgo(5) },
      { restaurantId: restaurant.id, userId: customer3.id, score: 8, feedback: 'Bom, mas pode melhorar o tempo de espera', createdAt: daysAgo(4) },
      { restaurantId: restaurant.id, userId: customer4.id, score: 10, feedback: 'Perfeito!', createdAt: daysAgo(3) },
      { restaurantId: restaurant.id, userId: customer5.id, score: 9, createdAt: daysAgo(2) },
      { restaurantId: restaurant.id, userId: customer1.id, score: 10, feedback: 'Melhor boteco de SP', createdAt: daysAgo(1) },
      { restaurantId: restaurant.id, userId: customer2.id, score: 7, feedback: 'Bom mas um pouco caro', createdAt: hoursAgo(12) },
      { restaurantId: restaurant.id, userId: customer5.id, score: 9, createdAt: hoursAgo(4) },
    ],
  });

  console.log('   8 respostas NPS criadas!');

  // ============================================
  // ANALYTICS EVENTS - 30+ events
  // ============================================
  console.log('[13/15] Criando eventos de analytics...');

  const analyticsEvents = [
    // Menu views
    { eventType: 'menu_view', eventData: { category: 'Porcoes' }, createdAt: daysAgo(6, 18) },
    { eventType: 'menu_view', eventData: { category: 'Cervejas Artesanais' }, createdAt: daysAgo(6, 19) },
    { eventType: 'menu_item_view', eventData: { itemName: 'Calabresa Acebolada', itemId: menuItemMap['Calabresa Acebolada']?.id }, createdAt: daysAgo(5, 18) },
    { eventType: 'menu_item_view', eventData: { itemName: 'Picanha na Chapa (400g)', itemId: menuItemMap['Picanha na Chapa (400g)']?.id }, createdAt: daysAgo(5, 19) },
    { eventType: 'menu_item_view', eventData: { itemName: 'Caipirinha Tradicional', itemId: menuItemMap['Caipirinha Tradicional']?.id }, createdAt: daysAgo(4, 18) },

    // Order events
    { eventType: 'order_created', eventData: { orderNumber: 'BC-0001', total: 137.5 }, createdAt: daysAgo(7, 13) },
    { eventType: 'order_completed', eventData: { orderNumber: 'BC-0001', duration_minutes: 45 }, createdAt: daysAgo(7, 14) },
    { eventType: 'order_created', eventData: { orderNumber: 'BC-0005', total: 239.3 }, createdAt: daysAgo(4, 19) },
    { eventType: 'order_completed', eventData: { orderNumber: 'BC-0005', duration_minutes: 52 }, createdAt: daysAgo(4, 20) },

    // Split bill events
    { eventType: 'split_bill_created', eventData: { orderNumber: 'BC-0007', participants: 3, method: 'EQUAL' }, createdAt: daysAgo(4, 19) },
    { eventType: 'split_payment_completed', eventData: { orderNumber: 'BC-0007', userId: customer1.id, amount: 79.8 }, createdAt: daysAgo(4, 20) },
    { eventType: 'split_payment_completed', eventData: { orderNumber: 'BC-0007', userId: customer2.id, amount: 79.8 }, createdAt: daysAgo(4, 20) },
    { eventType: 'split_payment_completed', eventData: { orderNumber: 'BC-0007', userId: customer3.id, amount: 79.7 }, createdAt: daysAgo(4, 21) },

    // Payment events
    { eventType: 'payment_received', eventData: { method: 'PIX', amount: 137.5 }, createdAt: daysAgo(7, 14) },
    { eventType: 'payment_received', eventData: { method: 'CREDIT_CARD', amount: 275.6 }, createdAt: daysAgo(6, 20) },
    { eventType: 'payment_received', eventData: { method: 'PIX', amount: 156.8 }, createdAt: daysAgo(5, 19) },
    { eventType: 'payment_received', eventData: { method: 'DEBIT_CARD', amount: 92.5 }, createdAt: daysAgo(4, 21) },
    { eventType: 'payment_received', eventData: { method: 'PIX', amount: 198.2 }, createdAt: daysAgo(3, 20) },

    // Table session events
    { eventType: 'table_session_started', eventData: { tableNumber: 5, membersCount: 2 }, createdAt: daysAgo(7, 13) },
    { eventType: 'table_session_started', eventData: { tableNumber: 15, membersCount: 4 }, createdAt: daysAgo(6, 12) },
    { eventType: 'table_session_started', eventData: { tableNumber: 9, membersCount: 3 }, createdAt: daysAgo(4, 19) },
    { eventType: 'table_session_closed', eventData: { tableNumber: 5, duration_minutes: 95 }, createdAt: daysAgo(7, 15) },
    { eventType: 'table_session_closed', eventData: { tableNumber: 15, duration_minutes: 180 }, createdAt: daysAgo(6, 15) },

    // Review events
    { eventType: 'review_submitted', eventData: { rating: 5, userId: customer1.id }, createdAt: daysAgo(6, 16) },
    { eventType: 'review_submitted', eventData: { rating: 4, userId: customer2.id }, createdAt: daysAgo(5, 22) },
    { eventType: 'review_submitted', eventData: { rating: 5, userId: customer3.id }, createdAt: daysAgo(4, 21) },

    // User activity
    { eventType: 'user_login', eventData: { userId: customer1.id, platform: 'web' }, createdAt: daysAgo(6, 17) },
    { eventType: 'user_login', eventData: { userId: customer2.id, platform: 'mobile' }, createdAt: daysAgo(5, 18) },
    { eventType: 'user_login', eventData: { userId: customer3.id, platform: 'web' }, createdAt: daysAgo(4, 18) },
    { eventType: 'qr_code_scanned', eventData: { tableNumber: 5 }, createdAt: daysAgo(7, 13) },
    { eventType: 'qr_code_scanned', eventData: { tableNumber: 8 }, createdAt: daysAgo(7, 19) },
    { eventType: 'qr_code_scanned', eventData: { tableNumber: 15 }, createdAt: daysAgo(6, 12) },
  ];

  for (const event of analyticsEvents) {
    await prisma.analyticsEvent.create({
      data: {
        restaurantId: restaurant.id,
        eventType: event.eventType,
        eventData: event.eventData,
        createdAt: event.createdAt,
      },
    });
  }

  console.log(`   ${analyticsEvents.length} eventos de analytics criados!`);

  // ============================================
  // AUDIT LOGS - 20+ entries
  // ============================================
  console.log('[14/15] Criando audit logs...');

  interface AuditLogEntry {
    userId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    oldValue?: Prisma.InputJsonValue;
    newValue?: Prisma.InputJsonValue;
    ipAddress?: string;
    createdAt: Date;
  }

  const auditLogs: AuditLogEntry[] = [
    { userId: superAdmin.id, action: 'LOGIN', ipAddress: '189.40.123.45', createdAt: daysAgo(7, 9) },
    { userId: owner.id, action: 'LOGIN', ipAddress: '189.40.123.46', createdAt: daysAgo(7, 10) },
    { userId: owner.id, action: 'UPDATE_MENU_ITEM', entityType: 'MenuItem', entityId: menuItemMap['Calabresa Acebolada']?.id, createdAt: daysAgo(6, 11) },
    { userId: waiter1.id, action: 'LOGIN', ipAddress: '189.40.123.47', createdAt: daysAgo(6, 17) },
    { userId: waiter1.id, action: 'CREATE_ORDER', entityType: 'Order', createdAt: daysAgo(6, 18) },
    { userId: kitchen1.id, action: 'LOGIN', ipAddress: '189.40.123.48', createdAt: daysAgo(6, 17) },
    { userId: kitchen1.id, action: 'UPDATE_ORDER_STATUS', entityType: 'Order', newValue: { status: 'PREPARING' }, createdAt: daysAgo(6, 18) },
    { userId: customer1.id, action: 'LOGIN', ipAddress: '187.123.45.67', createdAt: daysAgo(5, 18) },
    { userId: customer1.id, action: 'CREATE_ORDER', entityType: 'Order', createdAt: daysAgo(5, 19) },
    { userId: customer1.id, action: 'PROCESS_PAYMENT', entityType: 'Payment', createdAt: daysAgo(5, 20) },
    { userId: owner.id, action: 'VIEW_ANALYTICS', createdAt: daysAgo(4, 10) },
    { userId: owner.id, action: 'EXPORT_REPORT', entityType: 'Report', createdAt: daysAgo(4, 11) },
    { userId: consultantUser.id, action: 'LOGIN', ipAddress: '200.150.123.89', createdAt: daysAgo(3, 14) },
    { userId: consultantUser.id, action: 'VIEW_RESTAURANT', entityType: 'Restaurant', entityId: restaurant.id, createdAt: daysAgo(3, 14) },
    { userId: waiter2.id, action: 'LOGIN', ipAddress: '189.40.123.49', createdAt: daysAgo(2, 17) },
    { userId: waiter2.id, action: 'CREATE_ORDER', entityType: 'Order', createdAt: daysAgo(2, 18) },
    { userId: customer2.id, action: 'SUBMIT_REVIEW', entityType: 'Review', createdAt: daysAgo(2, 21) },
    { userId: owner.id, action: 'RESPOND_TO_COMPLAINT', entityType: 'Complaint', createdAt: daysAgo(1, 10) },
    { userId: superAdmin.id, action: 'VIEW_PLATFORM_METRICS', createdAt: daysAgo(1, 9) },
    { userId: owner.id, action: 'LOGIN', ipAddress: '189.40.123.46', createdAt: hoursAgo(5) },
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({
      data: {
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        oldValue: log.oldValue,
        newValue: log.newValue,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      },
    });
  }

  console.log(`   ${auditLogs.length} audit logs criados!`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('[15/15] Finalizando...');
  console.log('');
  console.log('='.repeat(60));
  console.log('  SEED CONCLUIDO COM SUCESSO!');
  console.log('='.repeat(60));
  console.log('');
  console.log('=== CREDENCIAIS DE TESTE ===');
  console.log('');
  console.log('SUPER ADMIN:');
  console.log('  Email: admin@tabsync.com');
  console.log('  Senha: Admin123!');
  console.log('');
  console.log('CONSULTANT:');
  console.log('  Email: consultor@tabsync.com');
  console.log('  Senha: Consultor123!');
  console.log('');
  console.log('RESTAURANT OWNER:');
  console.log('  Email: dono@botecodochef.com.br');
  console.log('  Senha: Dono123!');
  console.log('');
  console.log('WAITERS:');
  console.log('  Email: garcom1@botecodochef.com.br | PIN: 1234');
  console.log('  Email: garcom2@botecodochef.com.br | PIN: 2345');
  console.log('  Email: garcom3@botecodochef.com.br | PIN: 3456');
  console.log('  Senha: Garcom123!');
  console.log('');
  console.log('KITCHEN:');
  console.log('  Email: cozinha1@botecodochef.com.br | PIN: 5678');
  console.log('  Email: cozinha2@botecodochef.com.br | PIN: 6789');
  console.log('  Senha: Cozinha123!');
  console.log('');
  console.log('CUSTOMERS:');
  console.log('  Email: cliente1@gmail.com');
  console.log('  Email: cliente2@gmail.com');
  console.log('  Email: cliente3@gmail.com');
  console.log('  Email: cliente4@gmail.com');
  console.log('  Email: cliente5@gmail.com');
  console.log('  Senha: Cliente123!');
  console.log('');
  console.log('=== RESTAURANTE ===');
  console.log('');
  console.log('Nome: Boteco do Chef');
  console.log('Slug: boteco-do-chef');
  console.log('URL: /r/boteco-do-chef');
  console.log('Mesas: 18 (com QR codes)');
  console.log('Plano: Pro (Ativo)');
  console.log('');
  console.log('=== DADOS CRIADOS ===');
  console.log('');
  console.log(`- Usuarios: 12`);
  console.log(`- Planos: 3 (${planBasic.name}, ${planPro.name}, ${planEnterprise.name})`);
  console.log(`- Mesas: 18`);
  console.log(`- Categorias de Menu: 8`);
  console.log(`- Itens de Menu: ${menuItems.length}`);
  console.log(`- Fornecedores: 4 (${supplierFrigorifico.name.split(' ')[0]}, ${supplierBebidas.name.split(' ')[0]}, ${supplierHortifruti.name.split(' ')[0]}, ${supplierSecos.name.split(' ')[0]})`);
  console.log(`- Itens de Estoque: ${inventoryItems.length}`);
  console.log(`- Pedidos: ${orders.length}`);
  console.log(`- Avaliacoes: ${reviews.count}`);
  console.log(`- Sugestoes: 4`);
  console.log(`- Reclamacoes: 2`);
  console.log(`- Respostas NPS: 8`);
  console.log(`- Eventos Analytics: ${analyticsEvents.length}`);
  console.log(`- Audit Logs: ${auditLogs.length}`);
  console.log('');
  console.log('=== DEMO SPLIT BILL ===');
  console.log('');
  console.log('Pedido BC-0027 tem pagamentos divididos pendentes!');
  console.log('- 1 participante ja pagou');
  console.log('- 2 participantes com pagamento pendente');
  console.log('');
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
