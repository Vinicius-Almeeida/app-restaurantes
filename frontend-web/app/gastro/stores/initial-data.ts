// Gastro App - Initial Mock Data
import type { MenuItem, Restaurant, WaiterUser, KitchenUser } from '../types';

export const initialMenuItems: MenuItem[] = [
  // Entradas
  { id: 1, category: 'entradas', name: 'Bruschetta Tradicional', description: 'Pão italiano tostado com tomate, manjericão fresco e azeite extravirgem', price: 28.90, image: '🍅', rating: 4.8, prepTime: '10 min', isPopular: true, isVegan: true, calories: 180, available: true },
  { id: 2, category: 'entradas', name: 'Carpaccio de Carne', description: 'Finas fatias de filé mignon com rúcula, alcaparras e parmesão', price: 45.90, image: '🥩', rating: 4.9, prepTime: '15 min', isPopular: true, calories: 220, available: true },
  { id: 3, category: 'entradas', name: 'Camarões ao Alho', description: 'Camarões salteados no azeite com alho dourado e ervas frescas', price: 52.90, image: '🦐', rating: 4.7, prepTime: '12 min', calories: 190, available: true },
  { id: 4, category: 'entradas', name: 'Salada Caesar', description: 'Mix de folhas, croutons, parmesão e molho caesar caseiro', price: 32.90, image: '🥗', rating: 4.5, prepTime: '8 min', calories: 280, available: true },

  // Principais
  { id: 5, category: 'principais', name: 'Risoto de Funghi', description: 'Arroz arbóreo cremoso com mix de cogumelos frescos e trufa negra', price: 68.90, image: '🍚', rating: 4.9, prepTime: '25 min', isPopular: true, isVegan: true, calories: 420, available: true },
  { id: 6, category: 'principais', name: 'Filé ao Molho Madeira', description: 'Filé mignon grelhado com molho madeira, acompanha batatas rústicas', price: 89.90, image: '🥩', rating: 5.0, prepTime: '30 min', isPopular: true, calories: 650, available: true },
  { id: 7, category: 'principais', name: 'Salmão Grelhado', description: 'Salmão fresco com crosta de ervas, risoto de limão siciliano', price: 78.90, image: '🐟', rating: 4.8, prepTime: '22 min', calories: 480, available: true },
  { id: 8, category: 'principais', name: 'Massa ao Pesto', description: 'Fettuccine al dente com pesto genovês artesanal e pinoli', price: 54.90, image: '🍝', rating: 4.6, prepTime: '18 min', isVegan: true, calories: 520, available: true },
  { id: 9, category: 'principais', name: 'Picanha na Brasa', description: 'Picanha argentina grelhada no ponto, farofa especial e vinagrete', price: 95.90, image: '🥩', rating: 4.9, prepTime: '35 min', isPopular: true, calories: 720, available: true },

  // Bebidas
  { id: 10, category: 'bebidas', name: 'Caipirinha Premium', description: 'Cachaça artesanal, limão tahiti, açúcar demerara e gelo', price: 24.90, image: '🍹', rating: 4.7, prepTime: '5 min', isPopular: true, available: true },
  { id: 11, category: 'bebidas', name: 'Vinho Tinto Reserva', description: 'Cabernet Sauvignon chileno, safra 2019 - Taça', price: 32.90, image: '🍷', rating: 4.8, prepTime: '2 min', available: true },
  { id: 12, category: 'bebidas', name: 'Suco Natural', description: 'Laranja, abacaxi, maracujá ou limão - 400ml', price: 14.90, image: '🧃', rating: 4.5, prepTime: '5 min', isVegan: true, available: true },
  { id: 13, category: 'bebidas', name: 'Chopp Artesanal', description: 'IPA, Pilsen ou Weiss - 500ml', price: 18.90, image: '🍺', rating: 4.6, prepTime: '2 min', available: true },
  { id: 14, category: 'bebidas', name: 'Água Mineral', description: 'Com ou sem gás - 500ml', price: 7.90, image: '💧', rating: 4.3, prepTime: '1 min', available: true },

  // Sobremesas
  { id: 15, category: 'sobremesas', name: 'Petit Gâteau', description: 'Bolo de chocolate com centro derretido, sorvete de baunilha', price: 34.90, image: '🍫', rating: 5.0, prepTime: '15 min', isPopular: true, calories: 480, available: true },
  { id: 16, category: 'sobremesas', name: 'Cheesecake NY', description: 'Cheesecake cremoso com calda de frutas vermelhas', price: 28.90, image: '🍰', rating: 4.8, prepTime: '5 min', calories: 380, available: true },
  { id: 17, category: 'sobremesas', name: 'Tiramisù', description: 'Clássico italiano com café espresso e mascarpone', price: 32.90, image: '☕', rating: 4.9, prepTime: '5 min', calories: 420, available: true },
  { id: 18, category: 'sobremesas', name: 'Sorvete Artesanal', description: '3 bolas - escolha entre 8 sabores', price: 22.90, image: '🍨', rating: 4.6, prepTime: '3 min', calories: 280, available: true },
];

export const initialRestaurant: Restaurant = {
  id: 1,
  name: 'Bistrô Sabor & Arte',
  logo: '🍽️',
  address: 'Rua das Flores, 123 - Centro',
  phone: '(11) 99999-9999',
  tables: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    status: 'available' as const,
    currentCustomerId: null,
  })),
};

export const initialWaiters: WaiterUser[] = [
  { id: 'w1', name: 'Carlos Silva', email: 'carlos@bistro.com', phone: '(11) 98888-1111', role: 'waiter', active: true },
  { id: 'w2', name: 'Maria Santos', email: 'maria@bistro.com', phone: '(11) 98888-2222', role: 'waiter', active: true },
  { id: 'w3', name: 'João Oliveira', email: 'joao@bistro.com', phone: '(11) 98888-3333', role: 'waiter', active: false },
];

export const initialKitchenUsers: KitchenUser[] = [
  { id: 'k1', name: 'Chef Ricardo', email: 'cozinha@bistro.com', role: 'kitchen', kitchenRole: 'Chef', active: true },
  { id: 'k2', name: 'Ana Paula', email: 'ana@bistro.com', role: 'kitchen', kitchenRole: 'Auxiliar', active: true },
];

// Demo admin user
export const adminUser = {
  id: 'admin1',
  name: 'Administrador',
  email: 'admin@bistro.com',
  role: 'admin' as const,
};
