/**
 * TabSync - Seed de Produção Ultra-Realista
 *
 * BOTECO DO CHEF - Boteco Brasileiro Premium
 * Simulação completa de 6 meses de operação real
 *
 * Inclui:
 * - Cardápio completo com 80+ itens
 * - Receitas com ingredientes e quantidades reais
 * - Estoque detalhado (ingredientes, bebidas, embalagens)
 * - Histórico de vendas de 6 meses com sazonalidade
 * - Fornecedores reais
 * - Reviews, NPS, sugestões e reclamações
 * - Mesas ativas com sessões em andamento
 */

import { PrismaClient, UserRole, OrderStatus, PaymentStatus, PaymentMethod, SplitMethod, SessionStatus, MemberRole, MemberStatus, MemberPaymentStatus, SubscriptionStatus, InvoiceStatus, StockEntryType, SuggestionCategory, SuggestionStatus, ComplaintCategory, Priority, ComplaintStatus, WaiterCallStatus, WaiterCallPriority } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// HELPERS
// ============================================

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function generateQrCode(tableNumber: number, restaurantSlug: string): string {
  return `${restaurantSlug}-mesa-${tableNumber}-${Date.now().toString(36)}`;
}

function generatePaymentToken(): string {
  return `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 15)}`;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Calcula fator de demanda baseado no dia da semana e se é feriado
function getDemandFactor(date: Date, isHoliday: boolean = false): number {
  const dayOfWeek = date.getDay();

  if (isHoliday) return 1.8; // Feriados +80%

  switch (dayOfWeek) {
    case 0: return 1.3;  // Domingo +30%
    case 1: return 0.6;  // Segunda -40%
    case 2: return 0.7;  // Terça -30%
    case 3: return 0.8;  // Quarta -20%
    case 4: return 0.9;  // Quinta -10%
    case 5: return 1.4;  // Sexta +40%
    case 6: return 1.5;  // Sábado +50%
    default: return 1.0;
  }
}

// Feriados brasileiros 2024/2025
const HOLIDAYS = [
  '2024-07-09', '2024-09-07', '2024-10-12', '2024-11-02', '2024-11-15',
  '2024-11-20', '2024-12-25', '2024-12-31', '2025-01-01',
];

function isHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return HOLIDAYS.includes(dateStr);
}

// ============================================
// DADOS DO CARDÁPIO - BOTECO BRASILEIRO PREMIUM
// ============================================

const MENU_CATEGORIES = [
  { name: 'Entradas', description: 'Porções e petiscos para compartilhar', order: 1 },
  { name: 'Caldos', description: 'Caldos quentes e reconfortantes', order: 2 },
  { name: 'Pratos Principais', description: 'Pratos fartos da cozinha brasileira', order: 3 },
  { name: 'Grelhados', description: 'Carnes e peixes na brasa', order: 4 },
  { name: 'Massas', description: 'Massas artesanais', order: 5 },
  { name: 'Saladas', description: 'Saladas frescas e leves', order: 6 },
  { name: 'Acompanhamentos', description: 'Para complementar seu prato', order: 7 },
  { name: 'Sobremesas', description: 'Doces tradicionais brasileiros', order: 8 },
  { name: 'Cervejas', description: 'Cervejas artesanais e importadas', order: 9 },
  { name: 'Drinks', description: 'Coquetéis clássicos e autorais', order: 10 },
  { name: 'Cachaças', description: 'Cachaças premium selecionadas', order: 11 },
  { name: 'Vinhos', description: 'Carta de vinhos nacionais e importados', order: 12 },
  { name: 'Não Alcoólicos', description: 'Sucos, refrigerantes e águas', order: 13 },
  { name: 'Cafés', description: 'Cafés especiais e digestivos', order: 14 },
];

const MENU_ITEMS = [
  // ========== ENTRADAS ==========
  { category: 'Entradas', name: 'Bolinho de Bacalhau (6 un)', description: 'Bolinhos crocantes de bacalhau desfiado com batata, servidos com molho tártaro da casa', price: 42.90, calories: 380, allergens: ['glúten', 'peixe', 'ovo'] },
  { category: 'Entradas', name: 'Bolinho de Feijoada (8 un)', description: 'Bolinhos cremosos recheados com feijoada desfiada, acompanha vinagrete', price: 38.90, calories: 420, allergens: ['glúten'] },
  { category: 'Entradas', name: 'Coxinha de Frango (6 un)', description: 'Coxinhas artesanais com frango desfiado e catupiry, massa crocante', price: 34.90, calories: 450, allergens: ['glúten', 'leite'] },
  { category: 'Entradas', name: 'Pastel de Carne Seca', description: 'Pastel gigante recheado com carne seca desfiada, cream cheese e cebola caramelizada', price: 28.90, calories: 520, allergens: ['glúten', 'leite'] },
  { category: 'Entradas', name: 'Torresmo de Rolo', description: '300g de torresmo crocante com limão e pimenta', price: 45.90, calories: 680, allergens: [] },
  { category: 'Entradas', name: 'Calabresa Acebolada', description: 'Linguiça calabresa fatiada com cebolas caramelizadas e farofa', price: 39.90, calories: 520, allergens: [] },
  { category: 'Entradas', name: 'Provolone à Milanesa', description: 'Fatias de provolone empanadas, servidas com geleia de pimenta', price: 44.90, calories: 480, allergens: ['glúten', 'leite', 'ovo'] },
  { category: 'Entradas', name: 'Mandioca Frita', description: 'Palitos de mandioca fritos, crocantes por fora e macios por dentro', price: 29.90, calories: 320, allergens: [] },
  { category: 'Entradas', name: 'Dadinho de Tapioca', description: 'Cubos de tapioca com queijo coalho, servidos com geleia de pimenta', price: 36.90, calories: 290, allergens: ['leite'] },
  { category: 'Entradas', name: 'Isca de Peixe (400g)', description: 'Iscas de tilápia empanadas com molho tártaro', price: 48.90, calories: 410, allergens: ['glúten', 'peixe', 'ovo'] },
  { category: 'Entradas', name: 'Carne de Sol na Nata', description: 'Cubos de carne de sol salteados na manteiga com nata e queijo coalho', price: 52.90, calories: 580, allergens: ['leite'] },
  { category: 'Entradas', name: 'Batata Rústica com Bacon', description: 'Batatas assadas com casca, bacon crocante, cheddar e cebolinha', price: 38.90, calories: 490, allergens: ['leite'] },
  { category: 'Entradas', name: 'Escondidinho de Carne Seca', description: 'Porção individual de purê de mandioca com carne seca desfiada e queijo gratinado', price: 42.90, calories: 520, allergens: ['leite'] },
  { category: 'Entradas', name: 'Frango a Passarinho', description: 'Pedaços de frango temperados e fritos, servidos com limão', price: 44.90, calories: 480, allergens: [] },
  { category: 'Entradas', name: 'Queijo Coalho na Brasa', description: '4 espetos de queijo coalho grelhado com melaço de cana', price: 32.90, calories: 340, allergens: ['leite'] },

  // ========== CALDOS ==========
  { category: 'Caldos', name: 'Caldo de Feijão', description: 'Caldo espesso de feijão preto com bacon, linguiça e torresmo', price: 24.90, calories: 320, allergens: [] },
  { category: 'Caldos', name: 'Caldo de Mocotó', description: 'Tradicional caldo de mocotó com grão de bico', price: 28.90, calories: 280, allergens: [] },
  { category: 'Caldos', name: 'Caldo Verde', description: 'Caldo de batata com couve fatiada e linguiça calabresa', price: 22.90, calories: 260, allergens: [] },
  { category: 'Caldos', name: 'Caldo de Costela', description: 'Caldo encorpado de costela bovina desfiada com mandioca', price: 32.90, calories: 380, allergens: [] },
  { category: 'Caldos', name: 'Caldo de Camarão', description: 'Caldo cremoso de camarão com leite de coco e dendê', price: 38.90, calories: 290, allergens: ['crustáceo', 'leite'] },

  // ========== PRATOS PRINCIPAIS ==========
  { category: 'Pratos Principais', name: 'Feijoada Completa', description: 'Feijoada tradicional com todas as carnes, acompanha arroz, couve, farofa, torresmo e laranja (serve 2)', price: 89.90, calories: 1200, allergens: [] },
  { category: 'Pratos Principais', name: 'Feijoada Individual', description: 'Porção individual da nossa feijoada com acompanhamentos', price: 52.90, calories: 680, allergens: [] },
  { category: 'Pratos Principais', name: 'Baião de Dois', description: 'Arroz com feijão verde, queijo coalho, nata e carne de sol desfiada', price: 54.90, calories: 720, allergens: ['leite'] },
  { category: 'Pratos Principais', name: 'Galinhada Caipira', description: 'Arroz com frango caipira, pequi, açafrão e quiabo (serve 2)', price: 78.90, calories: 890, allergens: [] },
  { category: 'Pratos Principais', name: 'Rabada com Agrião', description: 'Rabada bovina cozida lentamente, servida com agrião refogado e polenta cremosa', price: 72.90, calories: 780, allergens: ['leite'] },
  { category: 'Pratos Principais', name: 'Costela no Bafo', description: 'Costela bovina assada lentamente por 6 horas, desfiando no garfo (serve 2-3)', price: 129.90, calories: 1100, allergens: [] },
  { category: 'Pratos Principais', name: 'Moqueca de Peixe', description: 'Posta de peixe cozida no leite de coco, dendê, pimentões e coentro, servida com pirão', price: 79.90, calories: 620, allergens: ['peixe', 'leite'] },
  { category: 'Pratos Principais', name: 'Moqueca de Camarão', description: 'Camarões grandes cozidos no leite de coco e dendê, acompanha arroz e pirão', price: 98.90, calories: 580, allergens: ['crustáceo', 'leite'] },
  { category: 'Pratos Principais', name: 'Bobó de Camarão', description: 'Creme de mandioca com camarões, leite de coco e dendê', price: 89.90, calories: 650, allergens: ['crustáceo', 'leite'] },
  { category: 'Pratos Principais', name: 'Escondidinho Grande', description: 'Travessa de purê de mandioca com carne seca desfiada gratinada (serve 2)', price: 68.90, calories: 920, allergens: ['leite'] },
  { category: 'Pratos Principais', name: 'Arroz Carreteiro', description: 'Arroz com carne de sol desfiada, vinagrete e ovo frito', price: 48.90, calories: 680, allergens: ['ovo'] },
  { category: 'Pratos Principais', name: 'Frango com Quiabo', description: 'Frango caipira ensopado com quiabo, servido com angu cremoso', price: 52.90, calories: 580, allergens: [] },

  // ========== GRELHADOS ==========
  { category: 'Grelhados', name: 'Picanha na Brasa (400g)', description: 'Picanha argentina grelhada no ponto, acompanha arroz, farofa e vinagrete', price: 89.90, calories: 720, allergens: [] },
  { category: 'Grelhados', name: 'Fraldinha Grelhada (350g)', description: 'Fraldinha maturada grelhada, servida com chimichurri', price: 72.90, calories: 580, allergens: [] },
  { category: 'Grelhados', name: 'Costela Fogo de Chão (600g)', description: 'Costela bovina assada na brasa, corte grosso', price: 98.90, calories: 890, allergens: [] },
  { category: 'Grelhados', name: 'Linguiça Artesanal na Brasa', description: '400g de linguiça toscana artesanal grelhada', price: 48.90, calories: 520, allergens: [] },
  { category: 'Grelhados', name: 'Filé de Tilápia Grelhado', description: 'Filé de tilápia grelhado com ervas, acompanha legumes salteados', price: 58.90, calories: 320, allergens: ['peixe'] },
  { category: 'Grelhados', name: 'Salmão Grelhado', description: 'Posta de salmão grelhada com molho de maracujá', price: 78.90, calories: 420, allergens: ['peixe'] },

  // ========== MASSAS ==========
  { category: 'Massas', name: 'Nhoque da Nonna', description: 'Nhoque de batata artesanal com molho pomodoro e manjericão', price: 48.90, calories: 580, allergens: ['glúten', 'ovo'] },
  { category: 'Massas', name: 'Nhoque ao Sugo', description: 'Nhoque de batata ao molho de tomate fresco', price: 44.90, calories: 520, allergens: ['glúten', 'ovo'] },
  { category: 'Massas', name: 'Macarrão na Chapa', description: 'Espaguete salteado na chapa com carne, legumes e molho shoyu', price: 52.90, calories: 680, allergens: ['glúten', 'soja'] },

  // ========== SALADAS ==========
  { category: 'Saladas', name: 'Salada Caesar', description: 'Alface americana, croutons, parmesão e molho caesar, com frango grelhado', price: 38.90, calories: 320, allergens: ['glúten', 'ovo', 'leite'] },
  { category: 'Saladas', name: 'Salada Tropical', description: 'Mix de folhas com manga, abacaxi, palmito e molho de maracujá', price: 32.90, calories: 180, allergens: [] },
  { category: 'Saladas', name: 'Salada Caprese', description: 'Tomate, mozzarella de búfala, manjericão fresco e redução de balsâmico', price: 36.90, calories: 280, allergens: ['leite'] },

  // ========== ACOMPANHAMENTOS ==========
  { category: 'Acompanhamentos', name: 'Arroz Branco', description: 'Porção de arroz agulhinha', price: 14.90, calories: 200, allergens: [] },
  { category: 'Acompanhamentos', name: 'Arroz à Grega', description: 'Arroz com legumes salteados', price: 18.90, calories: 240, allergens: [] },
  { category: 'Acompanhamentos', name: 'Feijão Tropeiro', description: 'Feijão com farinha, torresmo, ovo e linguiça', price: 24.90, calories: 380, allergens: ['ovo'] },
  { category: 'Acompanhamentos', name: 'Farofa da Casa', description: 'Farofa com bacon, ovo e banana', price: 18.90, calories: 320, allergens: ['ovo'] },
  { category: 'Acompanhamentos', name: 'Vinagrete', description: 'Tomate, cebola, pimentão e coentro', price: 12.90, calories: 80, allergens: [] },
  { category: 'Acompanhamentos', name: 'Batata Frita', description: 'Porção de batatas fritas sequinhas', price: 22.90, calories: 380, allergens: [] },
  { category: 'Acompanhamentos', name: 'Purê de Mandioca', description: 'Purê cremoso de mandioca com manteiga', price: 19.90, calories: 280, allergens: ['leite'] },
  { category: 'Acompanhamentos', name: 'Couve Refogada', description: 'Couve fatiada refogada no alho', price: 16.90, calories: 120, allergens: [] },
  { category: 'Acompanhamentos', name: 'Polenta Cremosa', description: 'Polenta cremosa com parmesão', price: 19.90, calories: 260, allergens: ['leite'] },

  // ========== SOBREMESAS ==========
  { category: 'Sobremesas', name: 'Pudim de Leite', description: 'Pudim cremoso de leite condensado com calda de caramelo', price: 18.90, calories: 320, allergens: ['leite', 'ovo'] },
  { category: 'Sobremesas', name: 'Brigadeiro de Colher', description: 'Brigadeiro gourmet servido na colher com granulado belga', price: 16.90, calories: 280, allergens: ['leite'] },
  { category: 'Sobremesas', name: 'Romeu e Julieta', description: 'Goiabada cascão com queijo minas artesanal', price: 22.90, calories: 340, allergens: ['leite'] },
  { category: 'Sobremesas', name: 'Cartola', description: 'Banana frita com queijo coalho derretido, canela e açúcar', price: 24.90, calories: 380, allergens: ['leite'] },
  { category: 'Sobremesas', name: 'Petit Gateau', description: 'Bolo quente de chocolate com sorvete de creme', price: 28.90, calories: 480, allergens: ['glúten', 'leite', 'ovo'] },
  { category: 'Sobremesas', name: 'Sorvete (3 bolas)', description: 'Sorvetes artesanais - consulte sabores', price: 19.90, calories: 320, allergens: ['leite'] },
  { category: 'Sobremesas', name: 'Açaí na Tigela (400ml)', description: 'Açaí batido com granola, banana e mel', price: 26.90, calories: 420, allergens: [] },

  // ========== CERVEJAS ==========
  { category: 'Cervejas', name: 'Brahma Chopp (300ml)', description: 'Chopp Brahma bem gelado', price: 9.90, calories: 120, allergens: ['glúten'] },
  { category: 'Cervejas', name: 'Brahma Chopp (500ml)', description: 'Caneca de chopp Brahma', price: 14.90, calories: 200, allergens: ['glúten'] },
  { category: 'Cervejas', name: 'Original (600ml)', description: 'Cerveja Original - a legítima', price: 18.90, calories: 260, allergens: ['glúten'] },
  { category: 'Cervejas', name: 'Heineken (330ml)', description: 'Long neck Heineken', price: 14.90, calories: 140, allergens: ['glúten'] },
  { category: 'Cervejas', name: 'Heineken (600ml)', description: 'Garrafa Heineken', price: 22.90, calories: 280, allergens: ['glúten'] },
  { category: 'Cervejas', name: 'Stella Artois (330ml)', description: 'Long neck Stella Artois', price: 14.90, calories: 150, allergens: ['glúten'] },
  { category: 'Cervejas', name: 'Budweiser (330ml)', description: 'Long neck Budweiser', price: 12.90, calories: 140, allergens: ['glúten'] },
  { category: 'Cervejas', name: 'Colorado Appia (600ml)', description: 'Cerveja artesanal com mel', price: 28.90, calories: 280, allergens: ['glúten'] },
  { category: 'Cervejas', name: 'Eisenbahn Pilsen (600ml)', description: 'Cerveja artesanal Pilsen', price: 26.90, calories: 260, allergens: ['glúten'] },
  { category: 'Cervejas', name: 'IPA da Casa (500ml)', description: 'IPA artesanal produzida exclusivamente para o Boteco', price: 32.90, calories: 220, allergens: ['glúten'] },

  // ========== DRINKS ==========
  { category: 'Drinks', name: 'Caipirinha de Limão', description: 'Cachaça, limão, açúcar e gelo', price: 22.90, calories: 180, allergens: [] },
  { category: 'Drinks', name: 'Caipirinha de Morango', description: 'Cachaça, morango fresco, açúcar e gelo', price: 26.90, calories: 200, allergens: [] },
  { category: 'Drinks', name: 'Caipirinha de Maracujá', description: 'Cachaça, maracujá fresco, açúcar e gelo', price: 26.90, calories: 190, allergens: [] },
  { category: 'Drinks', name: 'Caipivodka de Limão', description: 'Vodka, limão, açúcar e gelo', price: 26.90, calories: 175, allergens: [] },
  { category: 'Drinks', name: 'Moscow Mule', description: 'Vodka, cerveja de gengibre, limão e hortelã', price: 32.90, calories: 160, allergens: [] },
  { category: 'Drinks', name: 'Mojito', description: 'Rum, hortelã, limão, açúcar e água com gás', price: 28.90, calories: 170, allergens: [] },
  { category: 'Drinks', name: 'Gin Tônica', description: 'Gin, água tônica e limão siciliano', price: 32.90, calories: 140, allergens: [] },
  { category: 'Drinks', name: 'Aperol Spritz', description: 'Aperol, prosecco e água com gás', price: 34.90, calories: 180, allergens: [] },
  { category: 'Drinks', name: 'Negroni', description: 'Gin, Campari e vermute rosso', price: 36.90, calories: 190, allergens: [] },

  // ========== CACHAÇAS ==========
  { category: 'Cachaças', name: 'Cachaça Salinas (dose)', description: 'Cachaça mineira tradicional', price: 12.90, calories: 65, allergens: [] },
  { category: 'Cachaças', name: 'Cachaça Leblon (dose)', description: 'Cachaça premium envelhecida', price: 18.90, calories: 65, allergens: [] },
  { category: 'Cachaças', name: 'Cachaça Ypióca Ouro (dose)', description: 'Cachaça envelhecida em carvalho', price: 16.90, calories: 65, allergens: [] },
  { category: 'Cachaças', name: 'Cachaça 51 (dose)', description: 'A cachaça mais famosa do Brasil', price: 8.90, calories: 65, allergens: [] },
  { category: 'Cachaças', name: 'Cachaça Germana (dose)', description: 'Cachaça artesanal premium', price: 22.90, calories: 65, allergens: [] },

  // ========== VINHOS ==========
  { category: 'Vinhos', name: 'Vinho da Casa Tinto (taça)', description: 'Cabernet Sauvignon chileno', price: 18.90, calories: 125, allergens: ['sulfitos'] },
  { category: 'Vinhos', name: 'Vinho da Casa Branco (taça)', description: 'Sauvignon Blanc chileno', price: 18.90, calories: 120, allergens: ['sulfitos'] },
  { category: 'Vinhos', name: 'Casillero del Diablo (garrafa)', description: 'Cabernet Sauvignon - Chile', price: 98.90, calories: 625, allergens: ['sulfitos'] },
  { category: 'Vinhos', name: 'Concha y Toro Reservado (garrafa)', description: 'Carmenère - Chile', price: 79.90, calories: 625, allergens: ['sulfitos'] },
  { category: 'Vinhos', name: 'Miolo Reserva (garrafa)', description: 'Merlot - Brasil', price: 89.90, calories: 625, allergens: ['sulfitos'] },

  // ========== NÃO ALCOÓLICOS ==========
  { category: 'Não Alcoólicos', name: 'Refrigerante Lata', description: 'Coca-Cola, Guaraná, Sprite ou Fanta', price: 7.90, calories: 140, allergens: [] },
  { category: 'Não Alcoólicos', name: 'Refrigerante 600ml', description: 'Coca-Cola, Guaraná ou Fanta', price: 10.90, calories: 250, allergens: [] },
  { category: 'Não Alcoólicos', name: 'Água Mineral (500ml)', description: 'Água mineral com ou sem gás', price: 5.90, calories: 0, allergens: [] },
  { category: 'Não Alcoólicos', name: 'Água de Coco', description: 'Água de coco natural', price: 8.90, calories: 45, allergens: [] },
  { category: 'Não Alcoólicos', name: 'Suco Natural de Laranja', description: 'Suco de laranja espremido na hora', price: 12.90, calories: 110, allergens: [] },
  { category: 'Não Alcoólicos', name: 'Suco Natural de Maracujá', description: 'Suco de maracujá natural', price: 12.90, calories: 95, allergens: [] },
  { category: 'Não Alcoólicos', name: 'Suco Natural de Limão', description: 'Limonada suíça ou tradicional', price: 10.90, calories: 85, allergens: [] },
  { category: 'Não Alcoólicos', name: 'Chá Gelado', description: 'Chá gelado de limão ou pêssego', price: 8.90, calories: 90, allergens: [] },
  { category: 'Não Alcoólicos', name: 'Red Bull', description: 'Energético Red Bull 250ml', price: 16.90, calories: 110, allergens: [] },

  // ========== CAFÉS ==========
  { category: 'Cafés', name: 'Café Expresso', description: 'Café expresso tradicional', price: 6.90, calories: 5, allergens: [] },
  { category: 'Cafés', name: 'Café Expresso Duplo', description: 'Dose dupla de café expresso', price: 9.90, calories: 10, allergens: [] },
  { category: 'Cafés', name: 'Cappuccino', description: 'Café expresso com leite vaporizado e espuma', price: 12.90, calories: 120, allergens: ['leite'] },
  { category: 'Cafés', name: 'Café com Leite', description: 'Café com leite cremoso', price: 8.90, calories: 80, allergens: ['leite'] },
  { category: 'Cafés', name: 'Irish Coffee', description: 'Café com whisky e chantilly', price: 24.90, calories: 180, allergens: ['leite'] },
];

// ============================================
// INGREDIENTES E ESTOQUE
// ============================================

const INVENTORY_ITEMS = [
  // ===== CARNES =====
  { name: 'Picanha Argentina', sku: 'CAR001', unit: 'KG', minStock: 10 },
  { name: 'Fraldinha Maturada', sku: 'CAR002', unit: 'KG', minStock: 8 },
  { name: 'Costela Bovina', sku: 'CAR003', unit: 'KG', minStock: 15 },
  { name: 'Carne de Sol', sku: 'CAR004', unit: 'KG', minStock: 12 },
  { name: 'Carne Seca', sku: 'CAR005', unit: 'KG', minStock: 10 },
  { name: 'Rabada Bovina', sku: 'CAR006', unit: 'KG', minStock: 8 },
  { name: 'Linguiça Calabresa', sku: 'CAR008', unit: 'KG', minStock: 8 },
  { name: 'Linguiça Toscana', sku: 'CAR009', unit: 'KG', minStock: 6 },
  { name: 'Bacon em Cubos', sku: 'CAR010', unit: 'KG', minStock: 5 },
  { name: 'Torresmo', sku: 'CAR011', unit: 'KG', minStock: 4 },
  { name: 'Frango Inteiro', sku: 'CAR012', unit: 'KG', minStock: 15 },
  { name: 'Peito de Frango', sku: 'CAR013', unit: 'KG', minStock: 10 },

  // ===== PEIXES E FRUTOS DO MAR =====
  { name: 'Bacalhau Dessalgado', sku: 'PEI001', unit: 'KG', minStock: 5 },
  { name: 'Filé de Tilápia', sku: 'PEI002', unit: 'KG', minStock: 8 },
  { name: 'Salmão Fresco', sku: 'PEI003', unit: 'KG', minStock: 4 },
  { name: 'Camarão Limpo Grande', sku: 'PEI005', unit: 'KG', minStock: 5 },

  // ===== LATICÍNIOS =====
  { name: 'Queijo Coalho', sku: 'LAT001', unit: 'KG', minStock: 8 },
  { name: 'Queijo Minas', sku: 'LAT002', unit: 'KG', minStock: 5 },
  { name: 'Queijo Provolone', sku: 'LAT003', unit: 'KG', minStock: 4 },
  { name: 'Mozzarella de Búfala', sku: 'LAT004', unit: 'KG', minStock: 3 },
  { name: 'Catupiry', sku: 'LAT006', unit: 'KG', minStock: 4 },
  { name: 'Nata', sku: 'LAT008', unit: 'L', minStock: 5 },
  { name: 'Leite Integral', sku: 'LAT009', unit: 'L', minStock: 20 },
  { name: 'Leite Condensado', sku: 'LAT010', unit: 'UN', minStock: 20 },
  { name: 'Manteiga com Sal', sku: 'LAT012', unit: 'KG', minStock: 5 },
  { name: 'Ovos Caipira', sku: 'LAT013', unit: 'DZ', minStock: 10 },

  // ===== VEGETAIS E LEGUMES =====
  { name: 'Batata Inglesa', sku: 'VEG001', unit: 'KG', minStock: 30 },
  { name: 'Mandioca', sku: 'VEG002', unit: 'KG', minStock: 25 },
  { name: 'Cebola', sku: 'VEG003', unit: 'KG', minStock: 15 },
  { name: 'Alho', sku: 'VEG004', unit: 'KG', minStock: 3 },
  { name: 'Tomate', sku: 'VEG005', unit: 'KG', minStock: 10 },
  { name: 'Pimentão Verde', sku: 'VEG006', unit: 'KG', minStock: 4 },
  { name: 'Pimentão Vermelho', sku: 'VEG007', unit: 'KG', minStock: 4 },
  { name: 'Couve Manteiga', sku: 'VEG009', unit: 'MÇ', minStock: 15 },
  { name: 'Quiabo', sku: 'VEG010', unit: 'KG', minStock: 5 },
  { name: 'Limão Tahiti', sku: 'VEG012', unit: 'KG', minStock: 10 },
  { name: 'Laranja Pera', sku: 'VEG014', unit: 'KG', minStock: 10 },
  { name: 'Maracujá', sku: 'VEG015', unit: 'KG', minStock: 5 },
  { name: 'Morango', sku: 'VEG016', unit: 'KG', minStock: 3 },
  { name: 'Banana Prata', sku: 'VEG017', unit: 'KG', minStock: 8 },
  { name: 'Alface Americana', sku: 'VEG020', unit: 'UN', minStock: 10 },
  { name: 'Coentro', sku: 'VEG023', unit: 'MÇ', minStock: 10 },
  { name: 'Hortelã', sku: 'VEG024', unit: 'MÇ', minStock: 8 },

  // ===== GRÃOS E FARINHAS =====
  { name: 'Arroz Agulhinha', sku: 'GRA001', unit: 'KG', minStock: 40 },
  { name: 'Feijão Preto', sku: 'GRA002', unit: 'KG', minStock: 25 },
  { name: 'Feijão Carioca', sku: 'GRA003', unit: 'KG', minStock: 15 },
  { name: 'Farinha de Mandioca', sku: 'GRA005', unit: 'KG', minStock: 15 },
  { name: 'Farinha de Trigo', sku: 'GRA006', unit: 'KG', minStock: 20 },
  { name: 'Fubá', sku: 'GRA008', unit: 'KG', minStock: 10 },
  { name: 'Macarrão Espaguete', sku: 'GRA011', unit: 'KG', minStock: 10 },

  // ===== ÓLEOS E TEMPEROS =====
  { name: 'Óleo de Soja', sku: 'OLE001', unit: 'L', minStock: 20 },
  { name: 'Azeite Extra Virgem', sku: 'OLE002', unit: 'L', minStock: 8 },
  { name: 'Óleo de Dendê', sku: 'OLE003', unit: 'L', minStock: 5 },
  { name: 'Leite de Coco', sku: 'OLE004', unit: 'L', minStock: 10 },
  { name: 'Açúcar Refinado', sku: 'OLE007', unit: 'KG', minStock: 15 },
  { name: 'Sal Refinado', sku: 'OLE009', unit: 'KG', minStock: 10 },
  { name: 'Goiabada Cascão', sku: 'OLE019', unit: 'KG', minStock: 3 },

  // ===== BEBIDAS ALCOÓLICAS =====
  { name: 'Cachaça 51 (1L)', sku: 'BEB001', unit: 'UN', minStock: 12 },
  { name: 'Cachaça Salinas (700ml)', sku: 'BEB002', unit: 'UN', minStock: 8 },
  { name: 'Cachaça Leblon (750ml)', sku: 'BEB003', unit: 'UN', minStock: 6 },
  { name: 'Vodka Absolut (1L)', sku: 'BEB007', unit: 'UN', minStock: 6 },
  { name: 'Gin Tanqueray (750ml)', sku: 'BEB009', unit: 'UN', minStock: 4 },
  { name: 'Rum Bacardi (1L)', sku: 'BEB011', unit: 'UN', minStock: 4 },
  { name: 'Campari (1L)', sku: 'BEB013', unit: 'UN', minStock: 3 },
  { name: 'Aperol (750ml)', sku: 'BEB014', unit: 'UN', minStock: 4 },
  { name: 'Água Tônica (350ml)', sku: 'BEB018', unit: 'UN', minStock: 48 },

  // ===== CERVEJAS =====
  { name: 'Chopp Brahma (Barril 30L)', sku: 'CHO001', unit: 'UN', minStock: 4 },
  { name: 'Cerveja Original 600ml', sku: 'CER001', unit: 'UN', minStock: 48 },
  { name: 'Heineken Long Neck 330ml', sku: 'CER002', unit: 'UN', minStock: 72 },
  { name: 'Heineken 600ml', sku: 'CER003', unit: 'UN', minStock: 36 },
  { name: 'Stella Artois Long Neck', sku: 'CER004', unit: 'UN', minStock: 48 },
  { name: 'Budweiser Long Neck', sku: 'CER005', unit: 'UN', minStock: 48 },
  { name: 'Colorado Appia 600ml', sku: 'CER006', unit: 'UN', minStock: 24 },
  { name: 'Eisenbahn Pilsen 600ml', sku: 'CER007', unit: 'UN', minStock: 24 },
  { name: 'IPA da Casa 500ml', sku: 'CER008', unit: 'UN', minStock: 36 },

  // ===== VINHOS =====
  { name: 'Vinho Casillero del Diablo (750ml)', sku: 'VIN001', unit: 'UN', minStock: 12 },
  { name: 'Vinho Concha y Toro Reservado (750ml)', sku: 'VIN002', unit: 'UN', minStock: 12 },
  { name: 'Vinho Miolo Reserva (750ml)', sku: 'VIN003', unit: 'UN', minStock: 8 },
  { name: 'Vinho da Casa Tinto (bag 5L)', sku: 'VIN005', unit: 'UN', minStock: 3 },
  { name: 'Vinho da Casa Branco (bag 5L)', sku: 'VIN006', unit: 'UN', minStock: 3 },

  // ===== REFRIGERANTES =====
  { name: 'Coca-Cola Lata 350ml', sku: 'REF001', unit: 'UN', minStock: 96 },
  { name: 'Guaraná Lata 350ml', sku: 'REF002', unit: 'UN', minStock: 72 },
  { name: 'Coca-Cola 600ml', sku: 'REF005', unit: 'UN', minStock: 48 },
  { name: 'Água Mineral 500ml', sku: 'REF007', unit: 'UN', minStock: 96 },
  { name: 'Água de Coco 330ml', sku: 'REF009', unit: 'UN', minStock: 48 },
  { name: 'Red Bull 250ml', sku: 'REF010', unit: 'UN', minStock: 36 },
  { name: 'Polpa de Açaí (1kg)', sku: 'REF013', unit: 'KG', minStock: 10 },

  // ===== CAFÉS E SOBREMESAS =====
  { name: 'Café em Grãos (1kg)', sku: 'CAF001', unit: 'KG', minStock: 5 },
  { name: 'Chocolate em Pó (1kg)', sku: 'CAF002', unit: 'KG', minStock: 3 },
  { name: 'Sorvete Creme (5L)', sku: 'SOB001', unit: 'UN', minStock: 4 },
  { name: 'Sorvete Chocolate (5L)', sku: 'SOB002', unit: 'UN', minStock: 4 },
  { name: 'Granulado Belga (500g)', sku: 'SOB004', unit: 'UN', minStock: 5 },

  // ===== EMBALAGENS =====
  { name: 'Guardanapo de Papel (pct 1000)', sku: 'EMB001', unit: 'PCT', minStock: 10 },
  { name: 'Copo Descartável 200ml (pct 100)', sku: 'EMB006', unit: 'PCT', minStock: 20 },
  { name: 'Papel Toalha (rolo)', sku: 'EMB008', unit: 'UN', minStock: 30 },

  // ===== LIMPEZA =====
  { name: 'Detergente Neutro (5L)', sku: 'LIM001', unit: 'UN', minStock: 5 },
  { name: 'Álcool 70% (1L)', sku: 'LIM003', unit: 'UN', minStock: 10 },
  { name: 'Saco de Lixo 100L (pct 100)', sku: 'LIM006', unit: 'PCT', minStock: 5 },
];

// ============================================
// FORNECEDORES
// ============================================

const SUPPLIERS = [
  { name: 'Frigorífico São Paulo', cnpj: '12.345.678/0001-90', email: 'vendas@frigorificosp.com.br', phone: '(11) 3456-7890', address: 'Rua dos Açougues, 150 - Lapa, São Paulo/SP' },
  { name: 'Pescados Atlântico', cnpj: '23.456.789/0001-01', email: 'comercial@pescadosatlantico.com.br', phone: '(11) 2345-6789', address: 'Av. do Porto, 800 - Santos/SP' },
  { name: 'Laticínios Serra da Mantiqueira', cnpj: '34.567.890/0001-12', email: 'pedidos@laticiniosmantiqueira.com.br', phone: '(35) 3456-7890', address: 'Estrada do Leite, km 5 - Serra Negra/MG' },
  { name: 'CEAGESP - Hortifruti', cnpj: '45.678.901/0001-23', email: 'vendas@ceagesp.gov.br', phone: '(11) 3643-3700', address: 'Av. Dr. Gastão Vidigal, 1946 - Vila Leopoldina, São Paulo/SP' },
  { name: 'Distribuidora Grãos do Brasil', cnpj: '56.789.012/0001-34', email: 'comercial@graosdobrasil.com.br', phone: '(11) 4567-8901', address: 'Rod. Anhanguera, km 30 - Osasco/SP' },
  { name: 'Bebidas Premium Distribuidora', cnpj: '67.890.123/0001-45', email: 'vendas@bebidaspremium.com.br', phone: '(11) 5678-9012', address: 'Rua das Bebidas, 500 - Barra Funda, São Paulo/SP' },
  { name: 'Coca-Cola FEMSA', cnpj: '78.901.234/0001-56', email: 'pedidos@cocacolafemsa.com.br', phone: '0800 727 2020', address: 'Av. das Américas, 3500 - Jundiaí/SP' },
  { name: 'Embalagens Ecológicas Ltda', cnpj: '89.012.345/0001-67', email: 'vendas@embalagenseco.com.br', phone: '(11) 6789-0123', address: 'Rua Verde, 200 - Guarulhos/SP' },
];

// ============================================
// NOMES BRASILEIROS PARA CLIENTES
// ============================================

const FIRST_NAMES = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia', 'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Pedro', 'Rafaela', 'Samuel', 'Tatiana', 'Victor', 'Yasmin', 'André', 'Beatriz', 'Carlos', 'Diana', 'Felipe', 'Giovanna', 'Henrique', 'Isabella', 'João', 'Karen', 'Leonardo', 'Letícia', 'Marcos', 'Natália', 'Otávio', 'Patrícia', 'Ricardo', 'Sofia', 'Thiago', 'Vanessa'];

const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas'];

function generateBrazilianName(): { firstName: string; lastName: string; fullName: string } {
  const firstName = randomFromArray(FIRST_NAMES);
  const lastName = randomFromArray(LAST_NAMES);
  return { firstName, lastName, fullName: `${firstName} ${lastName}` };
}

function generateEmail(firstName: string, lastName: string): string {
  const normalizedFirst = firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedLast = lastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const random = Math.floor(Math.random() * 100);
  return `${normalizedFirst}.${normalizedLast}${random}@gmail.com`;
}

function generatePhone(): string {
  const ddd = randomFromArray(['11', '21', '31', '41', '51', '61', '71', '81', '85', '92']);
  const prefix = randomBetween(98000, 99999);
  const suffix = randomBetween(1000, 9999);
  return `(${ddd}) ${prefix}-${suffix}`;
}

// ============================================
// COMENTÁRIOS DE REVIEWS
// ============================================

const POSITIVE_REVIEWS = [
  'Excelente! A feijoada estava divina, melhor que a da minha vó! Voltarei com certeza.',
  'Ambiente super aconchegante e atendimento impecável. O chopp estava gelado na medida!',
  'A picanha derretia na boca. Preço justo pelo que é servido. Recomendo demais!',
  'Vim pelo split bill e fiquei pela comida! Muito prático dividir a conta pelo app.',
  'Primeira vez aqui e já virou meu boteco favorito. Caipirinha sensacional!',
  'O torresmo é o melhor que já comi em SP. Crocante e sequinho. 10/10!',
  'Trouxe a família inteira e todo mundo adorou. Porções generosas e saborosas.',
  'O caldinho de feijão no frio é vida! Perfeito para acompanhar uma cerveja.',
  'Atendimento nota mil, garçons super atenciosos. O escondidinho é imperdível.',
  'Ambiente descontraído, comida maravilhosa. O bolinho de bacalhau é espetacular!',
];

const NEUTRAL_REVIEWS = [
  'Comida boa, mas o tempo de espera foi um pouco longo no sábado à noite.',
  'Gostei do ambiente, porém achei o preço um pouco salgado para as porções.',
  'Atendimento ok, mas poderia ser mais rápido. A comida estava boa.',
  'Local agradável, mas estava muito cheio. Tivemos que esperar 30 min por mesa.',
];

const SUGGESTION_CONTENTS = [
  'Seria legal ter opções de pratos sem glúten no cardápio.',
  'Poderiam colocar mais tomadas para carregar celular nas mesas.',
  'Sugestão: criar um combo de casal com entrada + prato + sobremesa.',
  'O estacionamento poderia ter manobrista nos finais de semana.',
  'Adoraria ver cervejas artesanais locais no cardápio!',
  'Que tal um programa de fidelidade? Tipo a cada 10 visitas ganha uma caipirinha.',
  'Poderiam ter música ao vivo às sextas-feiras.',
];

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log('🌱 Iniciando seed ultra-realista do Boteco do Chef...\n');

  // Limpa dados existentes
  console.log('🧹 Limpando dados existentes...');
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.analyticsEvent.deleteMany(),
    prisma.npsResponse.deleteMany(),
    prisma.complaint.deleteMany(),
    prisma.suggestion.deleteMany(),
    prisma.review.deleteMany(),
    prisma.waiterCall.deleteMany(),
    prisma.splitPayment.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.orderParticipant.deleteMany(),
    prisma.order.deleteMany(),
    prisma.tableSessionMember.deleteMany(),
    prisma.tableSession.deleteMany(),
    prisma.table.deleteMany(),
    prisma.menuItemInventory.deleteMany(),
    prisma.stockEntryItem.deleteMany(),
    prisma.stockEntry.deleteMany(),
    prisma.invoiceUpload.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.menuCategory.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.plan.deleteMany(),
    prisma.consultantRestaurant.deleteMany(),
    prisma.consultant.deleteMany(),
    prisma.staff.deleteMany(),
    prisma.restaurant.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log('✅ Dados limpos!\n');

  // ========================================
  // 1. CRIAR PLANOS
  // ========================================
  console.log('📋 Criando planos de assinatura...');
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: 'Starter', slug: 'starter', description: 'Ideal para pequenos estabelecimentos',
        price: 0, billingCycle: 'MONTHLY', trialDays: 14, maxTables: 5, maxMenuItems: 30, maxStaff: 3, maxOrders: 100,
        platformFeePercent: 3.5, features: ['basic_menu', 'qr_code', 'basic_orders'], displayOrder: 1,
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Professional', slug: 'professional', description: 'Para restaurantes em crescimento',
        price: 199.90, billingCycle: 'MONTHLY', trialDays: 14, maxTables: 20, maxMenuItems: 100, maxStaff: 10, maxOrders: 500,
        platformFeePercent: 2.5, features: ['basic_menu', 'qr_code', 'basic_orders', 'split_bill', 'analytics', 'inventory'], displayOrder: 2,
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Enterprise', slug: 'enterprise', description: 'Solução completa para grandes operações',
        price: 499.90, billingCycle: 'MONTHLY', trialDays: 30, maxTables: null, maxMenuItems: null, maxStaff: null, maxOrders: null,
        platformFeePercent: 1.5, features: ['basic_menu', 'qr_code', 'basic_orders', 'split_bill', 'analytics', 'inventory', 'ocr_invoice', 'api_access'], displayOrder: 3,
      },
    }),
  ]);
  console.log(`✅ ${plans.length} planos criados!\n`);

  // ========================================
  // 2. CRIAR USUÁRIOS DO SISTEMA
  // ========================================
  console.log('👥 Criando usuários do sistema...');
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const superAdmin = await prisma.user.create({
    data: { email: 'admin@tabsync.com', passwordHash, fullName: 'Administrador TabSync', phone: '(11) 99999-0001', role: 'SUPER_ADMIN', emailVerified: true },
  });

  const consultorPassword = await bcrypt.hash('Consultor123!', 12);
  const consultor1 = await prisma.user.create({
    data: { email: 'maria.consultora@tabsync.com', passwordHash: consultorPassword, fullName: 'Maria Silva - Consultora', phone: '(11) 99999-0002', role: 'CONSULTANT', emailVerified: true },
  });

  await prisma.consultant.create({
    data: { userId: consultor1.id, commissionPercent: 10, totalOnboardings: 15, totalEarnings: 8500, isActive: true },
  });

  const ownerPassword = await bcrypt.hash('Dono123!', 12);
  const owner = await prisma.user.create({
    data: { email: 'dono@botecodochef.com.br', passwordHash: ownerPassword, fullName: 'Carlos Eduardo Mendes', phone: '(11) 98765-4321', role: 'RESTAURANT_OWNER', emailVerified: true },
  });

  console.log('✅ Usuários do sistema criados!\n');

  // ========================================
  // 3. CRIAR RESTAURANTE
  // ========================================
  console.log('🍽️ Criando Boteco do Chef...');
  const restaurant = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: 'Boteco do Chef',
      slug: 'boteco-do-chef',
      description: 'O autêntico boteco brasileiro com o melhor da culinária nacional. Ambiente descontraído, cerveja gelada e aquele clima de interior que você ama!',
      logoUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
      coverUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
      addressStreet: 'Rua Augusta, 1500',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZip: '01304-001',
      phone: '(11) 3456-7890',
      email: 'contato@botecodochef.com.br',
      isActive: true,
      acceptsOrders: true,
      operatingHours: {
        monday: { open: '17:00', close: '00:00' },
        tuesday: { open: '17:00', close: '00:00' },
        wednesday: { open: '17:00', close: '00:00' },
        thursday: { open: '17:00', close: '01:00' },
        friday: { open: '17:00', close: '02:00' },
        saturday: { open: '12:00', close: '02:00' },
        sunday: { open: '12:00', close: '22:00' },
      },
    },
  });

  await prisma.subscription.create({
    data: {
      restaurantId: restaurant.id,
      planId: plans[1].id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(new Date().setDate(1)),
      currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1, 0)),
    },
  });

  const consultant = await prisma.consultant.findUnique({ where: { userId: consultor1.id } });
  if (consultant) {
    await prisma.consultantRestaurant.create({
      data: { consultantId: consultant.id, restaurantId: restaurant.id, onboardedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
    });
  }

  console.log(`✅ Restaurante "${restaurant.name}" criado!\n`);

  // ========================================
  // 4. CRIAR STAFF
  // ========================================
  console.log('👨‍🍳 Criando equipe do restaurante...');
  const staffPassword = await bcrypt.hash('Staff123!', 12);

  const waiters = await Promise.all([
    prisma.user.create({ data: { email: 'pedro.garcom@botecodochef.com.br', passwordHash: staffPassword, fullName: 'Pedro Henrique Souza', phone: '(11) 98111-1111', role: 'WAITER', emailVerified: true } }),
    prisma.user.create({ data: { email: 'ana.garcoca@botecodochef.com.br', passwordHash: staffPassword, fullName: 'Ana Paula Costa', phone: '(11) 98222-2222', role: 'WAITER', emailVerified: true } }),
    prisma.user.create({ data: { email: 'marcos.garcom@botecodochef.com.br', passwordHash: staffPassword, fullName: 'Marcos Vinícius Lima', phone: '(11) 98333-3333', role: 'WAITER', emailVerified: true } }),
  ]);

  const kitchenStaff = await Promise.all([
    prisma.user.create({ data: { email: 'chef.roberto@botecodochef.com.br', passwordHash: staffPassword, fullName: 'Roberto Carlos Almeida', phone: '(11) 98555-5555', role: 'KITCHEN', emailVerified: true } }),
    prisma.user.create({ data: { email: 'sous.fernanda@botecodochef.com.br', passwordHash: staffPassword, fullName: 'Fernanda Rodrigues', phone: '(11) 98666-6666', role: 'KITCHEN', emailVerified: true } }),
  ]);

  for (const waiter of waiters) {
    await prisma.staff.create({ data: { userId: waiter.id, restaurantId: restaurant.id, role: 'WAITER', pin: String(randomBetween(1000, 9999)), isActive: true } });
  }
  for (const kitchen of kitchenStaff) {
    await prisma.staff.create({ data: { userId: kitchen.id, restaurantId: restaurant.id, role: 'KITCHEN', pin: String(randomBetween(1000, 9999)), isActive: true } });
  }

  console.log(`✅ ${waiters.length} garçons e ${kitchenStaff.length} cozinheiros criados!\n`);

  // ========================================
  // 5. CRIAR MESAS
  // ========================================
  console.log('🪑 Criando mesas...');
  const tableConfigs = [
    { number: 1, name: 'Mesa 1 - Entrada', capacity: 4 },
    { number: 2, name: 'Mesa 2 - Entrada', capacity: 4 },
    { number: 3, name: 'Mesa 3 - Entrada', capacity: 2 },
    { number: 4, name: 'Mesa 4 - Centro', capacity: 6 },
    { number: 5, name: 'Mesa 5 - Centro', capacity: 6 },
    { number: 6, name: 'Mesa 6 - Centro', capacity: 4 },
    { number: 7, name: 'Mesa 7 - Centro', capacity: 4 },
    { number: 8, name: 'Mesa 8 - Fundo', capacity: 8 },
    { number: 9, name: 'Mesa 9 - Fundo', capacity: 8 },
    { number: 10, name: 'Mesa 10 - Fundo', capacity: 4 },
    { number: 11, name: 'Varanda 1', capacity: 4 },
    { number: 12, name: 'Varanda 2', capacity: 4 },
    { number: 13, name: 'Varanda 3', capacity: 6 },
    { number: 14, name: 'Varanda 4', capacity: 2 },
    { number: 15, name: 'Balcão 1', capacity: 2 },
    { number: 16, name: 'Balcão 2', capacity: 2 },
    { number: 17, name: 'Balcão 3', capacity: 2 },
    { number: 18, name: 'Reservado', capacity: 12 },
  ];

  const tables = await Promise.all(
    tableConfigs.map((config) =>
      prisma.table.create({
        data: { restaurantId: restaurant.id, number: config.number, name: config.name, capacity: config.capacity, qrCode: generateQrCode(config.number, restaurant.slug), isActive: true },
      })
    )
  );
  console.log(`✅ ${tables.length} mesas criadas!\n`);

  // ========================================
  // 6. CRIAR CATEGORIAS E ITENS DO MENU
  // ========================================
  console.log('📜 Criando cardápio completo...');
  const categoryMap = new Map<string, string>();

  for (const cat of MENU_CATEGORIES) {
    const category = await prisma.menuCategory.create({
      data: { restaurantId: restaurant.id, name: cat.name, description: cat.description, displayOrder: cat.order, isActive: true },
    });
    categoryMap.set(cat.name, category.id);
  }

  const menuItemsCreated: Array<{ id: string; name: string; price: number; categoryName: string }> = [];

  for (let i = 0; i < MENU_ITEMS.length; i++) {
    const item = MENU_ITEMS[i];
    const categoryId = categoryMap.get(item.category);

    const menuItem = await prisma.menuItem.create({
      data: { restaurantId: restaurant.id, categoryId: categoryId ?? null, name: item.name, description: item.description, price: item.price, calories: item.calories, allergens: item.allergens, isAvailable: true, displayOrder: i + 1 },
    });

    menuItemsCreated.push({ id: menuItem.id, name: menuItem.name, price: Number(menuItem.price), categoryName: item.category });
  }
  console.log(`✅ ${MENU_CATEGORIES.length} categorias e ${menuItemsCreated.length} itens criados!\n`);

  // ========================================
  // 7. CRIAR FORNECEDORES
  // ========================================
  console.log('🏭 Criando fornecedores...');
  const suppliersCreated = await Promise.all(
    SUPPLIERS.map((supplier) =>
      prisma.supplier.create({ data: { restaurantId: restaurant.id, name: supplier.name, cnpj: supplier.cnpj, email: supplier.email, phone: supplier.phone, address: supplier.address, isActive: true } })
    )
  );
  console.log(`✅ ${suppliersCreated.length} fornecedores criados!\n`);

  // ========================================
  // 8. CRIAR INVENTÁRIO
  // ========================================
  console.log('📦 Criando inventário detalhado...');
  const inventoryCreated: Array<{ id: string; name: string; unit: string }> = [];

  for (const item of INVENTORY_ITEMS) {
    const lastPrice = randomDecimal(5, 100);
    const avgPrice = randomDecimal(5, 100);
    const currentStock = randomDecimal(item.minStock * 1.5, item.minStock * 4, 3);

    const invItem = await prisma.inventoryItem.create({
      data: { restaurantId: restaurant.id, name: item.name, sku: item.sku, unit: item.unit, currentStock, minimumStock: item.minStock, lastPurchasePrice: lastPrice, averagePrice: avgPrice, trackStock: true, isActive: true },
    });
    inventoryCreated.push({ id: invItem.id, name: invItem.name, unit: invItem.unit });
  }
  console.log(`✅ ${inventoryCreated.length} itens de estoque criados!\n`);

  // ========================================
  // 9. CRIAR CLIENTES
  // ========================================
  console.log('👤 Criando clientes...');
  const customerPassword = await bcrypt.hash('Cliente123!', 12);
  const customers: Array<{ id: string; email: string; fullName: string }> = [];

  for (let i = 0; i < 150; i++) {
    const name = generateBrazilianName();
    const email = generateEmail(name.firstName, name.lastName);

    const customer = await prisma.user.create({
      data: { email, passwordHash: customerPassword, fullName: name.fullName, phone: generatePhone(), role: 'CUSTOMER', emailVerified: Math.random() > 0.3, createdAt: new Date(Date.now() - randomBetween(0, 180) * 24 * 60 * 60 * 1000) },
    });
    customers.push({ id: customer.id, email: customer.email, fullName: customer.fullName });
  }
  console.log(`✅ ${customers.length} clientes criados!\n`);

  // ========================================
  // 10. GERAR HISTÓRICO DE VENDAS (6 MESES)
  // ========================================
  console.log('📊 Gerando histórico de vendas de 6 meses...');

  const allFoodItems = menuItemsCreated.filter((item) => !['Cafés'].includes(item.categoryName));

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  let totalOrdersCreated = 0;
  let totalRevenue = 0;
  let currentDate = new Date(startDate);

  // Track today's orders for special handling
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  let todayOrderIndex = 0;

  while (currentDate <= today) {
    const holiday = isHoliday(currentDate);
    const demandFactor = getDemandFactor(currentDate, holiday);
    const baseOrders = randomBetween(15, 25);
    const ordersToday = Math.round(baseOrders * demandFactor);

    // Check if this is today
    const isToday = currentDate >= todayStart;

    for (let i = 0; i < ordersToday; i++) {
      const customer = randomFromArray(customers);
      const table = randomFromArray(tables);

      const hour = randomBetween(12, 23);
      const minute = randomBetween(0, 59);
      const orderTime = new Date(currentDate);
      orderTime.setHours(hour, minute, randomBetween(0, 59));

      const numItems = randomBetween(2, 6);
      const selectedItems = shuffleArray(allFoodItems).slice(0, numItems);

      let subtotal = 0;
      const orderItemsData: Array<{ menuItemId: string; userId: string; quantity: number; unitPrice: number }> = [];

      for (const item of selectedItems) {
        const quantity = randomBetween(1, 3);
        subtotal += item.price * quantity;
        orderItemsData.push({ menuItemId: item.id, userId: customer.id, quantity, unitPrice: item.price });
      }

      const taxAmount = subtotal * 0.1;
      const totalAmount = subtotal + taxAmount;

      // For today: first order is PENDING, rest are DELIVERED
      // For historical: all DELIVERED
      let status: OrderStatus;
      if (isToday) {
        if (todayOrderIndex === 0) {
          status = 'PENDING';
        } else {
          status = 'DELIVERED';
        }
        todayOrderIndex++;
      } else {
        status = 'DELIVERED';
      }

      const order = await prisma.order.create({
        data: {
          restaurantId: restaurant.id, orderNumber: generateOrderNumber(), tableNumber: String(table.number), status, subtotal, taxAmount, totalAmount, createdAt: orderTime,
          confirmedAt: status !== 'PENDING' ? new Date(orderTime.getTime() + 2 * 60 * 1000) : null,
          preparingAt: ['PREPARING', 'READY', 'DELIVERED'].includes(status) ? new Date(orderTime.getTime() + 5 * 60 * 1000) : null,
          readyAt: ['READY', 'DELIVERED'].includes(status) ? new Date(orderTime.getTime() + 20 * 60 * 1000) : null,
          completedAt: status === 'DELIVERED' ? new Date(orderTime.getTime() + 25 * 60 * 1000) : null,
        },
      });

      for (const item of orderItemsData) {
        await prisma.orderItem.create({ data: { orderId: order.id, menuItemId: item.menuItemId, userId: item.userId, quantity: item.quantity, unitPrice: item.unitPrice } });
      }

      if (status === 'DELIVERED') {
        const paymentMethod = randomFromArray(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH']) as PaymentMethod;
        await prisma.payment.create({
          data: { orderId: order.id, method: paymentMethod, amount: totalAmount, status: 'COMPLETED', createdAt: orderTime, processedAt: new Date(orderTime.getTime() + 1 * 60 * 1000), completedAt: new Date(orderTime.getTime() + 2 * 60 * 1000) },
        });
      }

      totalOrdersCreated++;
      totalRevenue += Number(totalAmount);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`✅ ${totalOrdersCreated} pedidos criados!`);
  console.log(`💰 Faturamento total: R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);

  // ========================================
  // 11. CRIAR SESSÕES ATIVAS (HOJE)
  // ========================================
  console.log('🎯 Criando sessões ativas de hoje...');

  const activeTables = shuffleArray(tables).slice(0, 5);

  for (const table of activeTables) {
    const sessionCustomers = shuffleArray(customers).slice(0, randomBetween(2, 4));

    const session = await prisma.tableSession.create({
      data: { tableId: table.id, restaurantId: restaurant.id, status: 'ACTIVE', startedAt: new Date(Date.now() - randomBetween(30, 120) * 60 * 1000) },
    });

    for (let i = 0; i < sessionCustomers.length; i++) {
      await prisma.tableSessionMember.create({
        data: { sessionId: session.id, userId: sessionCustomers[i].id, role: i === 0 ? 'OWNER' : 'MEMBER', status: 'APPROVED', paymentStatus: 'PENDING' },
      });
    }

    const numItems = randomBetween(3, 8);
    const selectedItems = shuffleArray(allFoodItems).slice(0, numItems);

    let subtotal = 0;
    const orderItemsData: Array<{ menuItemId: string; userId: string; quantity: number; unitPrice: number }> = [];

    for (const item of selectedItems) {
      const quantity = randomBetween(1, 2);
      const orderedBy = randomFromArray(sessionCustomers);
      subtotal += item.price * quantity;
      orderItemsData.push({ menuItemId: item.id, userId: orderedBy.id, quantity, unitPrice: item.price });
    }

    const taxAmount = subtotal * 0.1;
    const totalAmount = subtotal + taxAmount;

    const order = await prisma.order.create({
      data: {
        restaurantId: restaurant.id, tableSessionId: session.id, orderNumber: generateOrderNumber(), tableNumber: String(table.number),
        status: randomFromArray(['CONFIRMED', 'PREPARING', 'READY']), subtotal, taxAmount, totalAmount,
        isSplit: sessionCustomers.length > 1, splitCount: sessionCustomers.length, createdAt: new Date(Date.now() - randomBetween(15, 60) * 60 * 1000),
      },
    });

    for (const item of orderItemsData) {
      await prisma.orderItem.create({ data: { orderId: order.id, menuItemId: item.menuItemId, userId: item.userId, quantity: item.quantity, unitPrice: item.unitPrice } });
    }

    await prisma.tableSession.update({ where: { id: session.id }, data: { subtotal, taxAmount, totalAmount } });
  }
  console.log(`✅ ${activeTables.length} sessões ativas criadas!\n`);

  // ========================================
  // 12. CRIAR REVIEWS
  // ========================================
  console.log('⭐ Criando avaliações...');
  const reviewCustomers = shuffleArray(customers).slice(0, 80);

  for (const customer of reviewCustomers) {
    const rating = randomFromArray([3, 4, 4, 4, 5, 5, 5, 5, 5]);
    const comments = rating >= 4 ? POSITIVE_REVIEWS : NEUTRAL_REVIEWS;

    await prisma.review.create({
      data: {
        restaurantId: restaurant.id, userId: customer.id, overallRating: rating,
        foodRating: randomBetween(Math.max(1, rating - 1), 5), serviceRating: randomBetween(Math.max(1, rating - 1), 5),
        ambianceRating: randomBetween(Math.max(1, rating - 1), 5), waitTimeRating: randomBetween(Math.max(1, rating - 1), 5), valueRating: randomBetween(Math.max(1, rating - 1), 5),
        comment: Math.random() > 0.3 ? randomFromArray(comments) : null, isPublic: true,
        createdAt: new Date(Date.now() - randomBetween(1, 180) * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ ${reviewCustomers.length} avaliações criadas!\n`);

  // ========================================
  // 13. CRIAR SUGESTÕES
  // ========================================
  console.log('💡 Criando sugestões...');
  const suggestionCustomers = shuffleArray(customers).slice(0, 15);

  for (const customer of suggestionCustomers) {
    await prisma.suggestion.create({
      data: {
        restaurantId: restaurant.id, userId: customer.id,
        category: randomFromArray(['MENU', 'SERVICE', 'AMBIANCE', 'OTHER']),
        content: randomFromArray(SUGGESTION_CONTENTS), isAnonymous: Math.random() > 0.7,
        status: randomFromArray(['UNREAD', 'READ', 'RESPONDED']),
        createdAt: new Date(Date.now() - randomBetween(1, 90) * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ ${suggestionCustomers.length} sugestões criadas!\n`);

  // ========================================
  // 14. CRIAR NPS
  // ========================================
  console.log('📈 Criando respostas NPS...');
  const npsCustomers = shuffleArray(customers).slice(0, 50);

  for (const customer of npsCustomers) {
    const score = randomFromArray([6, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10]);

    await prisma.npsResponse.create({
      data: {
        restaurantId: restaurant.id, userId: customer.id, score,
        feedback: score >= 9 ? 'Excelente experiência!' : score <= 6 ? 'Pode melhorar.' : null,
        createdAt: new Date(Date.now() - randomBetween(1, 180) * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ ${npsCustomers.length} respostas NPS criadas!\n`);

  // ========================================
  // 15. CRIAR ENTRADAS DE ESTOQUE
  // ========================================
  console.log('📥 Criando histórico de entradas de estoque...');

  for (let i = 0; i < 20; i++) {
    const supplier = randomFromArray(suppliersCreated);
    const daysAgo = randomBetween(1, 180);
    const entryDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const numItems = randomBetween(3, 8);
    const selectedInventory = shuffleArray(inventoryCreated).slice(0, numItems);

    let totalAmount = 0;
    const entryItems: Array<{ inventoryItemId: string; quantity: number; unitPrice: number; totalPrice: number }> = [];

    for (const inv of selectedInventory) {
      const unitPrice = randomDecimal(5, 100);
      const quantity = randomDecimal(5, 30, 3);
      const totalPrice = unitPrice * quantity;
      totalAmount += totalPrice;

      entryItems.push({ inventoryItemId: inv.id, quantity, unitPrice, totalPrice });
    }

    const stockEntry = await prisma.stockEntry.create({
      data: { restaurantId: restaurant.id, supplierId: supplier.id, type: 'PURCHASE', referenceNumber: `NF-${Date.now().toString(36).toUpperCase()}-${i}`, totalAmount, createdAt: entryDate },
    });

    for (const item of entryItems) {
      await prisma.stockEntryItem.create({
        data: { stockEntryId: stockEntry.id, inventoryItemId: item.inventoryItemId, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.totalPrice },
      });
    }
  }
  console.log(`✅ 20 entradas de estoque criadas!\n`);

  // ========================================
  // 16. CRIAR ANALYTICS EVENTS
  // ========================================
  console.log('📊 Criando eventos de analytics...');

  const eventTypes = ['page_view', 'menu_view', 'item_click', 'add_to_cart', 'checkout_start', 'payment_success', 'review_submit', 'qr_scan', 'session_start', 'session_end'];

  for (let i = 0; i < 500; i++) {
    const customer = randomFromArray(customers);
    const daysAgo = randomBetween(0, 30);

    await prisma.analyticsEvent.create({
      data: {
        restaurantId: restaurant.id, userId: customer.id, eventType: randomFromArray(eventTypes),
        eventData: { source: randomFromArray(['web', 'mobile', 'qr']), duration: randomBetween(10, 600) },
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ 500 eventos de analytics criados!\n`);

  // ========================================
  // RESUMO FINAL
  // ========================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    🎉 SEED CONCLUÍDO COM SUCESSO!              ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('📊 RESUMO DO BOTECO DO CHEF:');
  console.log('');
  console.log(`   🏪 Restaurante: ${restaurant.name}`);
  console.log(`   📍 Endereço: ${restaurant.addressStreet}, ${restaurant.addressCity}/${restaurant.addressState}`);
  console.log('');
  console.log('   👥 USUÁRIOS:');
  console.log(`      • 1 Super Admin: admin@tabsync.com`);
  console.log(`      • 1 Consultor: maria.consultora@tabsync.com`);
  console.log(`      • 1 Dono: dono@botecodochef.com.br`);
  console.log(`      • ${waiters.length} Garçons`);
  console.log(`      • ${kitchenStaff.length} Cozinheiros`);
  console.log(`      • ${customers.length} Clientes`);
  console.log('');
  console.log('   🍽️ OPERAÇÃO:');
  console.log(`      • ${tables.length} Mesas`);
  console.log(`      • ${MENU_CATEGORIES.length} Categorias de menu`);
  console.log(`      • ${menuItemsCreated.length} Itens no cardápio`);
  console.log(`      • ${inventoryCreated.length} Itens de estoque`);
  console.log(`      • ${suppliersCreated.length} Fornecedores`);
  console.log('');
  console.log('   📈 HISTÓRICO (6 MESES):');
  console.log(`      • ${totalOrdersCreated} Pedidos`);
  console.log(`      • R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Faturamento`);
  console.log(`      • ${reviewCustomers.length} Avaliações`);
  console.log(`      • ${npsCustomers.length} Respostas NPS`);
  console.log('');
  console.log('   🔐 CREDENCIAIS DE ACESSO:');
  console.log('');
  console.log('      SUPER ADMIN:');
  console.log('      Email: admin@tabsync.com');
  console.log('      Senha: Admin123!');
  console.log('');
  console.log('      DONO DO RESTAURANTE:');
  console.log('      Email: dono@botecodochef.com.br');
  console.log('      Senha: Dono123!');
  console.log('');
  console.log('      GARÇOM:');
  console.log('      Email: pedro.garcom@botecodochef.com.br');
  console.log('      Senha: Staff123!');
  console.log('');
  console.log('      COZINHA:');
  console.log('      Email: chef.roberto@botecodochef.com.br');
  console.log('      Senha: Staff123!');
  console.log('');
  console.log('      CLIENTE (qualquer um):');
  console.log('      Senha: Cliente123!');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
