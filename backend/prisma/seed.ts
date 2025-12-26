import { PrismaClient, UserRole, OrderStatus, PaymentMethod, PaymentStatus, SplitMethod, SplitPaymentStatus, StockEntryType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.stockEntryItem.deleteMany();
  await prisma.stockEntry.deleteMany();
  await prisma.invoiceUpload.deleteMany();
  await prisma.menuItemInventory.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.splitPayment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.orderParticipant.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@tabsync.com',
      passwordHash: adminPassword,
      fullName: 'Admin TabSync',
      phone: '+55 11 99999-0000',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  // Create Restaurant Owner
  const ownerPassword = await bcrypt.hash('teste123', 10);
  const owner = await prisma.user.create({
    data: {
      email: 'restaurante@teste.com',
      passwordHash: ownerPassword,
      fullName: 'João Silva',
      phone: '+55 11 98888-1111',
      role: UserRole.RESTAURANT_OWNER,
      emailVerified: true,
    },
  });

  // Create Customers
  const customerPassword = await bcrypt.hash('teste123', 10);
  const customer1 = await prisma.user.create({
    data: {
      email: 'cliente@teste.com',
      passwordHash: customerPassword,
      fullName: 'Maria Santos',
      phone: '+55 11 97777-2222',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'pedro@teste.com',
      passwordHash: customerPassword,
      fullName: 'Pedro Oliveira',
      phone: '+55 11 96666-3333',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'ana@teste.com',
      passwordHash: customerPassword,
      fullName: 'Ana Costa',
      phone: '+55 11 95555-4444',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  console.log('Creating restaurants...');

  // Create Restaurant 1 - Burger House
  const restaurant1 = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: 'Burger House',
      slug: 'burger-house',
      description: 'Os melhores hambúrgueres artesanais da cidade. Carnes selecionadas e ingredientes frescos.',
      logoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
      coverUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200',
      addressStreet: 'Rua Augusta, 1500',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZip: '01304-001',
      phone: '+55 11 3333-4444',
      email: 'contato@burgerhouse.com.br',
      operatingHours: {
        monday: { open: '11:00', close: '23:00' },
        tuesday: { open: '11:00', close: '23:00' },
        wednesday: { open: '11:00', close: '23:00' },
        thursday: { open: '11:00', close: '23:00' },
        friday: { open: '11:00', close: '00:00' },
        saturday: { open: '11:00', close: '00:00' },
        sunday: { open: '12:00', close: '22:00' },
      },
    },
  });

  // Create Restaurant 2 - Sushi Master
  const restaurant2 = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: 'Sushi Master',
      slug: 'sushi-master',
      description: 'Culinária japonesa autêntica com ingredientes importados. Sushis, sashimis e pratos especiais.',
      logoUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200',
      coverUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200',
      addressStreet: 'Rua Liberdade, 200',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZip: '01503-010',
      phone: '+55 11 3333-5555',
      email: 'contato@sushimaster.com.br',
      operatingHours: {
        monday: { open: '18:00', close: '23:00' },
        tuesday: { open: '18:00', close: '23:00' },
        wednesday: { open: '18:00', close: '23:00' },
        thursday: { open: '18:00', close: '23:00' },
        friday: { open: '18:00', close: '00:00' },
        saturday: { open: '12:00', close: '00:00' },
        sunday: { open: '12:00', close: '22:00' },
      },
    },
  });

  console.log('Creating menu categories...');

  // Burger House Categories
  const burgerEntradas = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Entradas',
      description: 'Para abrir o apetite',
      displayOrder: 1,
    },
  });

  const burgerPrincipais = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Hambúrgueres',
      description: 'Nossos hambúrgueres artesanais',
      displayOrder: 2,
    },
  });

  const burgerAcompanhamentos = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Acompanhamentos',
      description: 'Complementos perfeitos',
      displayOrder: 3,
    },
  });

  const burgerBebidas = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Bebidas',
      description: 'Refrigerantes, sucos e cervejas',
      displayOrder: 4,
    },
  });

  const burgerSobremesas = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Sobremesas',
      description: 'Para adoçar o final',
      displayOrder: 5,
    },
  });

  // Sushi Master Categories
  const sushiEntradas = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant2.id,
      name: 'Entradas',
      description: 'Entradas japonesas',
      displayOrder: 1,
    },
  });

  const sushiSushis = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant2.id,
      name: 'Sushis',
      description: 'Sushis tradicionais e especiais',
      displayOrder: 2,
    },
  });

  const sushiCombos = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant2.id,
      name: 'Combos',
      description: 'Combinados especiais',
      displayOrder: 3,
    },
  });

  const sushiBebidas = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant2.id,
      name: 'Bebidas',
      description: 'Bebidas japonesas e tradicionais',
      displayOrder: 4,
    },
  });

  console.log('Creating menu items...');

  // Burger House Menu Items
  const menuItems1 = await prisma.menuItem.createMany({
    data: [
      // Entradas
      {
        restaurantId: restaurant1.id,
        categoryId: burgerEntradas.id,
        name: 'Onion Rings',
        description: 'Anéis de cebola empanados e fritos, servidos com molho especial',
        imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400',
        price: 24.90,
        calories: 450,
        allergens: ['glúten'],
        displayOrder: 1,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: burgerEntradas.id,
        name: 'Nachos Supreme',
        description: 'Nachos com cheddar, guacamole, sour cream e jalapeños',
        imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400',
        price: 32.90,
        calories: 680,
        allergens: ['lactose', 'glúten'],
        displayOrder: 2,
      },
      // Hambúrgueres
      {
        restaurantId: restaurant1.id,
        categoryId: burgerPrincipais.id,
        name: 'Classic Burger',
        description: 'Pão brioche, 180g de blend bovino, queijo cheddar, alface, tomate e molho especial',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        price: 34.90,
        calories: 850,
        allergens: ['glúten', 'lactose'],
        displayOrder: 1,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: burgerPrincipais.id,
        name: 'Bacon Lover',
        description: 'Pão brioche, 180g de blend bovino, bacon crocante, queijo cheddar, cebola caramelizada',
        imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
        price: 42.90,
        calories: 1100,
        allergens: ['glúten', 'lactose'],
        displayOrder: 2,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: burgerPrincipais.id,
        name: 'Double Smash',
        description: 'Pão brioche, 2x 90g de smash burger, queijo americano, picles e molho secreto',
        imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
        price: 45.90,
        calories: 1200,
        allergens: ['glúten', 'lactose'],
        displayOrder: 3,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: burgerPrincipais.id,
        name: 'Veggie Burger',
        description: 'Pão integral, hambúrguer de grão de bico, queijo vegano, alface, tomate e maionese de ervas',
        imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400',
        price: 36.90,
        calories: 650,
        allergens: ['glúten'],
        displayOrder: 4,
      },
      // Acompanhamentos
      {
        restaurantId: restaurant1.id,
        categoryId: burgerAcompanhamentos.id,
        name: 'Batata Frita',
        description: 'Porção de batatas fritas crocantes',
        imageUrl: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400',
        price: 18.90,
        calories: 400,
        allergens: [],
        displayOrder: 1,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: burgerAcompanhamentos.id,
        name: 'Batata com Cheddar e Bacon',
        description: 'Batatas fritas cobertas com cheddar cremoso e bacon',
        imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400',
        price: 28.90,
        calories: 720,
        allergens: ['lactose'],
        displayOrder: 2,
      },
      // Bebidas
      {
        restaurantId: restaurant1.id,
        categoryId: burgerBebidas.id,
        name: 'Refrigerante Lata',
        description: 'Coca-Cola, Guaraná ou Sprite (350ml)',
        imageUrl: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400',
        price: 7.90,
        calories: 150,
        allergens: [],
        displayOrder: 1,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: burgerBebidas.id,
        name: 'Milkshake',
        description: 'Chocolate, morango ou baunilha (400ml)',
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
        price: 19.90,
        calories: 580,
        allergens: ['lactose'],
        displayOrder: 2,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: burgerBebidas.id,
        name: 'Cerveja Artesanal',
        description: 'IPA, Pilsen ou Weiss (500ml)',
        imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
        price: 22.90,
        calories: 200,
        allergens: ['glúten'],
        displayOrder: 3,
      },
      // Sobremesas
      {
        restaurantId: restaurant1.id,
        categoryId: burgerSobremesas.id,
        name: 'Brownie com Sorvete',
        description: 'Brownie de chocolate quente com sorvete de baunilha e calda',
        imageUrl: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400',
        price: 24.90,
        calories: 650,
        allergens: ['glúten', 'lactose', 'ovos'],
        displayOrder: 1,
      },
    ],
  });

  // Sushi Master Menu Items
  const menuItems2 = await prisma.menuItem.createMany({
    data: [
      // Entradas
      {
        restaurantId: restaurant2.id,
        categoryId: sushiEntradas.id,
        name: 'Edamame',
        description: 'Vagem de soja cozida no vapor com sal marinho',
        imageUrl: 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=400',
        price: 18.90,
        calories: 120,
        allergens: ['soja'],
        displayOrder: 1,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: sushiEntradas.id,
        name: 'Guioza (6 un)',
        description: 'Pastel japonês recheado com carne de porco e vegetais',
        imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
        price: 28.90,
        calories: 380,
        allergens: ['glúten', 'soja'],
        displayOrder: 2,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: sushiEntradas.id,
        name: 'Sunomono',
        description: 'Salada de pepino japonês com gergelim',
        imageUrl: 'https://images.unsplash.com/photo-1534256958597-7fe685cbd745?w=400',
        price: 16.90,
        calories: 80,
        allergens: ['gergelim'],
        displayOrder: 3,
      },
      // Sushis
      {
        restaurantId: restaurant2.id,
        categoryId: sushiSushis.id,
        name: 'Sashimi de Salmão (5 fatias)',
        description: 'Fatias finas de salmão fresco',
        imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
        price: 38.90,
        calories: 180,
        allergens: ['peixe'],
        displayOrder: 1,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: sushiSushis.id,
        name: 'Niguiri de Salmão (4 un)',
        description: 'Bolinho de arroz com fatia de salmão',
        imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400',
        price: 32.90,
        calories: 220,
        allergens: ['peixe'],
        displayOrder: 2,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: sushiSushis.id,
        name: 'Hot Roll (8 un)',
        description: 'Uramaki empanado com cream cheese e salmão',
        imageUrl: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400',
        price: 36.90,
        calories: 480,
        allergens: ['peixe', 'glúten', 'lactose'],
        displayOrder: 3,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: sushiSushis.id,
        name: 'Philadelphia Roll (8 un)',
        description: 'Uramaki com salmão, cream cheese e cebolinha',
        imageUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400',
        price: 34.90,
        calories: 350,
        allergens: ['peixe', 'lactose'],
        displayOrder: 4,
      },
      // Combos
      {
        restaurantId: restaurant2.id,
        categoryId: sushiCombos.id,
        name: 'Combo Individual (15 peças)',
        description: '4 hot roll, 4 uramaki, 4 niguiri, 3 sashimi',
        imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
        price: 59.90,
        calories: 650,
        allergens: ['peixe', 'glúten', 'lactose'],
        displayOrder: 1,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: sushiCombos.id,
        name: 'Combo Casal (30 peças)',
        description: '8 hot roll, 8 uramaki, 8 niguiri, 6 sashimi',
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
        price: 109.90,
        calories: 1300,
        allergens: ['peixe', 'glúten', 'lactose'],
        displayOrder: 2,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: sushiCombos.id,
        name: 'Combo Família (50 peças)',
        description: 'Mix completo para 4 pessoas',
        imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400',
        price: 169.90,
        calories: 2200,
        allergens: ['peixe', 'glúten', 'lactose'],
        displayOrder: 3,
      },
      // Bebidas
      {
        restaurantId: restaurant2.id,
        categoryId: sushiBebidas.id,
        name: 'Chá Verde',
        description: 'Chá verde tradicional japonês (500ml)',
        imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400',
        price: 9.90,
        calories: 0,
        allergens: [],
        displayOrder: 1,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: sushiBebidas.id,
        name: 'Sake',
        description: 'Sake quente ou frio (180ml)',
        imageUrl: 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?w=400',
        price: 28.90,
        calories: 150,
        allergens: [],
        displayOrder: 2,
      },
    ],
  });

  console.log('Getting menu items for orders...');

  // Get some menu items for orders
  const classicBurger = await prisma.menuItem.findFirst({
    where: { name: 'Classic Burger' },
  });
  const baconLover = await prisma.menuItem.findFirst({
    where: { name: 'Bacon Lover' },
  });
  const batataFrita = await prisma.menuItem.findFirst({
    where: { name: 'Batata Frita' },
  });
  const refrigerante = await prisma.menuItem.findFirst({
    where: { name: 'Refrigerante Lata' },
  });
  const milkshake = await prisma.menuItem.findFirst({
    where: { name: 'Milkshake' },
  });
  const comboIndividual = await prisma.menuItem.findFirst({
    where: { name: 'Combo Individual (15 peças)' },
  });
  const comboCasal = await prisma.menuItem.findFirst({
    where: { name: 'Combo Casal (30 peças)' },
  });
  const sake = await prisma.menuItem.findFirst({
    where: { name: 'Sake' },
  });

  console.log('Creating orders...');

  // Order 1 - Completed order (Burger House)
  const order1 = await prisma.order.create({
    data: {
      restaurantId: restaurant1.id,
      orderNumber: 'BH-001',
      tableNumber: '5',
      status: OrderStatus.DELIVERED,
      subtotal: 103.60,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 103.60,
      isSplit: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      confirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        menuItemId: classicBurger!.id,
        userId: customer1.id,
        quantity: 2,
        unitPrice: 34.90,
      },
      {
        orderId: order1.id,
        menuItemId: batataFrita!.id,
        userId: customer1.id,
        quantity: 1,
        unitPrice: 18.90,
      },
      {
        orderId: order1.id,
        menuItemId: refrigerante!.id,
        userId: customer1.id,
        quantity: 2,
        unitPrice: 7.90,
      },
    ],
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      method: PaymentMethod.CREDIT_CARD,
      gateway: 'stripe',
      amount: 103.60,
      status: PaymentStatus.COMPLETED,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
    },
  });

  // Order 2 - Split Bill Order (Burger House) - THE MAIN FEATURE DEMO
  const order2 = await prisma.order.create({
    data: {
      restaurantId: restaurant1.id,
      orderNumber: 'BH-002',
      tableNumber: '8',
      status: OrderStatus.DELIVERED,
      subtotal: 156.40,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 156.40,
      isSplit: true,
      splitCount: 3,
      notes: 'Mesa de aniversário - Conta dividida entre 3 pessoas',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      confirmedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order2.id,
        menuItemId: classicBurger!.id,
        userId: customer1.id,
        quantity: 1,
        unitPrice: 34.90,
      },
      {
        orderId: order2.id,
        menuItemId: baconLover!.id,
        userId: customer2.id,
        quantity: 1,
        unitPrice: 42.90,
      },
      {
        orderId: order2.id,
        menuItemId: baconLover!.id,
        userId: customer3.id,
        quantity: 1,
        unitPrice: 42.90,
      },
      {
        orderId: order2.id,
        menuItemId: batataFrita!.id,
        quantity: 2,
        unitPrice: 18.90,
        isShared: true,
        sharedWith: [customer1.id, customer2.id, customer3.id],
      },
    ],
  });

  await prisma.orderParticipant.createMany({
    data: [
      { orderId: order2.id, userId: customer1.id, role: 'organizer' },
      { orderId: order2.id, userId: customer2.id, role: 'participant' },
      { orderId: order2.id, userId: customer3.id, role: 'participant' },
    ],
  });

  // Split payments - all paid
  await prisma.splitPayment.createMany({
    data: [
      {
        orderId: order2.id,
        userId: customer1.id,
        userEmail: customer1.email,
        userName: customer1.fullName,
        splitMethod: SplitMethod.BY_ITEM,
        amountDue: 47.53, // Classic + 1/3 batatas
        paymentStatus: SplitPaymentStatus.PAID,
        paymentToken: 'token-split-001',
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 65 * 60 * 1000),
      },
      {
        orderId: order2.id,
        userId: customer2.id,
        userEmail: customer2.email,
        userName: customer2.fullName,
        splitMethod: SplitMethod.BY_ITEM,
        amountDue: 55.53, // Bacon + 1/3 batatas
        paymentStatus: SplitPaymentStatus.PAID,
        paymentToken: 'token-split-002',
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 62 * 60 * 1000),
      },
      {
        orderId: order2.id,
        userId: customer3.id,
        userEmail: customer3.email,
        userName: customer3.fullName,
        splitMethod: SplitMethod.BY_ITEM,
        amountDue: 55.53, // Bacon + 1/3 batatas
        paymentStatus: SplitPaymentStatus.PAID,
        paymentToken: 'token-split-003',
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 70 * 60 * 1000),
      },
    ],
  });

  // Order 3 - Current pending split (Sushi Master) - LIVE DEMO
  const order3 = await prisma.order.create({
    data: {
      restaurantId: restaurant2.id,
      orderNumber: 'SM-001',
      tableNumber: '3',
      status: OrderStatus.PREPARING,
      subtotal: 197.70,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 197.70,
      isSplit: true,
      splitCount: 2,
      notes: 'Jantar romântico - Divisão igualitária',
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      confirmedAt: new Date(Date.now() - 25 * 60 * 1000),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order3.id,
        menuItemId: comboCasal!.id,
        quantity: 1,
        unitPrice: 109.90,
        isShared: true,
        sharedWith: [customer1.id, customer2.id],
      },
      {
        orderId: order3.id,
        menuItemId: sake!.id,
        quantity: 2,
        unitPrice: 28.90,
        isShared: true,
        sharedWith: [customer1.id, customer2.id],
      },
      {
        orderId: order3.id,
        menuItemId: comboIndividual!.id,
        userId: customer1.id,
        quantity: 1,
        unitPrice: 59.90,
        notes: 'Extra wasabi',
      },
    ],
  });

  await prisma.orderParticipant.createMany({
    data: [
      { orderId: order3.id, userId: customer1.id, role: 'organizer' },
      { orderId: order3.id, userId: customer2.id, role: 'participant' },
    ],
  });

  // Split payments - one paid, one pending
  await prisma.splitPayment.createMany({
    data: [
      {
        orderId: order3.id,
        userId: customer1.id,
        userEmail: customer1.email,
        userName: customer1.fullName,
        splitMethod: SplitMethod.EQUAL,
        amountDue: 98.85,
        paymentStatus: SplitPaymentStatus.PAID,
        paymentToken: 'token-split-004',
        paidAt: new Date(Date.now() - 20 * 60 * 1000),
      },
      {
        orderId: order3.id,
        userId: customer2.id,
        userEmail: customer2.email,
        userName: customer2.fullName,
        splitMethod: SplitMethod.EQUAL,
        amountDue: 98.85,
        paymentStatus: SplitPaymentStatus.PENDING,
        paymentToken: 'token-split-005',
        paymentLink: 'https://tabsync-backend.nicestone-9f661f17.brazilsouth.azurecontainerapps.io/pay/token-split-005',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Order 4 - Pending order (Burger House)
  const order4 = await prisma.order.create({
    data: {
      restaurantId: restaurant1.id,
      orderNumber: 'BH-003',
      tableNumber: '12',
      status: OrderStatus.PENDING,
      subtotal: 84.70,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 84.70,
      isSplit: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order4.id,
        menuItemId: baconLover!.id,
        userId: customer3.id,
        quantity: 1,
        unitPrice: 42.90,
      },
      {
        orderId: order4.id,
        menuItemId: batataFrita!.id,
        userId: customer3.id,
        quantity: 1,
        unitPrice: 18.90,
        notes: 'Bem crocante',
      },
      {
        orderId: order4.id,
        menuItemId: milkshake!.id,
        userId: customer3.id,
        quantity: 1,
        unitPrice: 19.90,
        customizations: { flavor: 'chocolate' },
      },
    ],
  });

  console.log('Creating inventory and suppliers...');

  // Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Frigorífico Premium',
      cnpj: '12.345.678/0001-90',
      email: 'vendas@frigorificop.com.br',
      phone: '+55 11 4444-5555',
      address: 'Rod. Anhanguera, km 50 - SP',
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Distribuidora Hortifruti',
      cnpj: '98.765.432/0001-10',
      email: 'pedidos@hortifruti.com.br',
      phone: '+55 11 4444-6666',
      address: 'CEAGESP - São Paulo',
    },
  });

  // Inventory Items
  const inventoryCarneBovina = await prisma.inventoryItem.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Blend Bovino Premium',
      description: 'Blend 50% costela, 30% acém, 20% peito',
      sku: 'CARNE-001',
      unit: 'KG',
      currentStock: 25.5,
      minimumStock: 10,
      lastPurchasePrice: 45.00,
      averagePrice: 43.50,
    },
  });

  const inventoryPaoBrioche = await prisma.inventoryItem.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Pão Brioche',
      description: 'Pão artesanal tipo brioche',
      sku: 'PAO-001',
      unit: 'UN',
      currentStock: 150,
      minimumStock: 50,
      lastPurchasePrice: 2.50,
      averagePrice: 2.40,
    },
  });

  const inventoryQueijo = await prisma.inventoryItem.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Queijo Cheddar',
      description: 'Queijo cheddar fatiado',
      sku: 'QUEIJO-001',
      unit: 'KG',
      currentStock: 8.2,
      minimumStock: 5,
      lastPurchasePrice: 55.00,
      averagePrice: 52.00,
    },
  });

  const inventoryBacon = await prisma.inventoryItem.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Bacon Defumado',
      description: 'Bacon em fatias',
      sku: 'BACON-001',
      unit: 'KG',
      currentStock: 6.8,
      minimumStock: 4,
      lastPurchasePrice: 48.00,
      averagePrice: 46.00,
    },
  });

  const inventoryBatata = await prisma.inventoryItem.create({
    data: {
      restaurantId: restaurant1.id,
      name: 'Batata Congelada',
      description: 'Batata palito pré-frita congelada',
      sku: 'BATATA-001',
      unit: 'KG',
      currentStock: 30,
      minimumStock: 15,
      lastPurchasePrice: 18.00,
      averagePrice: 17.50,
    },
  });

  // Stock Entry
  const stockEntry = await prisma.stockEntry.create({
    data: {
      restaurantId: restaurant1.id,
      supplierId: supplier1.id,
      type: StockEntryType.PURCHASE,
      referenceNumber: 'NF-12345',
      notes: 'Compra semanal de carnes',
      totalAmount: 1125.00,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.stockEntryItem.createMany({
    data: [
      {
        stockEntryId: stockEntry.id,
        inventoryItemId: inventoryCarneBovina.id,
        quantity: 25,
        unitPrice: 45.00,
        totalPrice: 1125.00,
      },
    ],
  });

  console.log('Creating analytics events...');

  // Analytics Events
  const analyticsData = [
    { eventType: 'order_created', eventData: { orderId: order1.id, total: 103.60 } },
    { eventType: 'order_completed', eventData: { orderId: order1.id, duration_minutes: 45 } },
    { eventType: 'split_bill_created', eventData: { orderId: order2.id, participants: 3, method: 'BY_ITEM' } },
    { eventType: 'payment_received', eventData: { orderId: order2.id, amount: 47.53, method: 'PIX' } },
    { eventType: 'payment_received', eventData: { orderId: order2.id, amount: 55.53, method: 'CREDIT_CARD' } },
    { eventType: 'payment_received', eventData: { orderId: order2.id, amount: 55.53, method: 'PIX' } },
    { eventType: 'order_created', eventData: { orderId: order3.id, total: 197.70 } },
    { eventType: 'split_bill_created', eventData: { orderId: order3.id, participants: 2, method: 'EQUAL' } },
    { eventType: 'menu_item_viewed', eventData: { itemId: classicBurger!.id, itemName: 'Classic Burger' } },
    { eventType: 'menu_item_viewed', eventData: { itemId: baconLover!.id, itemName: 'Bacon Lover' } },
  ];

  for (const event of analyticsData) {
    await prisma.analyticsEvent.create({
      data: {
        restaurantId: restaurant1.id,
        eventType: event.eventType,
        eventData: event.eventData,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log('');
  console.log('=== DEMO CREDENTIALS ===');
  console.log('');
  console.log('Admin:');
  console.log('  Email: admin@tabsync.com');
  console.log('  Password: admin123');
  console.log('');
  console.log('Restaurant Owner:');
  console.log('  Email: restaurante@teste.com');
  console.log('  Password: teste123');
  console.log('');
  console.log('Customer:');
  console.log('  Email: cliente@teste.com');
  console.log('  Password: teste123');
  console.log('');
  console.log('=== DEMO RESTAURANTS ===');
  console.log('');
  console.log('1. Burger House');
  console.log('   Slug: burger-house');
  console.log('   URL: /r/burger-house');
  console.log('');
  console.log('2. Sushi Master');
  console.log('   Slug: sushi-master');
  console.log('   URL: /r/sushi-master');
  console.log('');
  console.log('=== SPLIT BILL DEMO ===');
  console.log('');
  console.log('Order SM-001 has a pending split payment!');
  console.log('Payment link: token-split-005');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
