// Gastro App - Constants
import { Coffee, Pizza, Wine, IceCream, Receipt, CheckCircle2, ChefHat, UtensilsCrossed, Check } from 'lucide-react';
import type { Category, OrderStatusStep, WaiterCallReason } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'entradas', name: 'Entradas', icon: Coffee, color: '#FF6B35' },
  { id: 'principais', name: 'Principais', icon: Pizza, color: '#4CAF50' },
  { id: 'bebidas', name: 'Bebidas', icon: Wine, color: '#9C27B0' },
  { id: 'sobremesas', name: 'Sobremesas', icon: IceCream, color: '#E91E63' },
];

export const ORDER_STATUS_FLOW: OrderStatusStep[] = [
  { key: 'pending', label: 'Pedido Enviado', icon: Receipt, color: '#F59E0B', description: 'Aguardando confirmação' },
  { key: 'received', label: 'Recebido', icon: CheckCircle2, color: '#3B82F6', description: 'Cozinha recebeu' },
  { key: 'preparing', label: 'Em Preparo', icon: ChefHat, color: '#8B5CF6', description: 'Sendo preparado' },
  { key: 'ready', label: 'Pronto!', icon: UtensilsCrossed, color: '#10B981', description: 'Pronto para servir' },
  { key: 'delivered', label: 'Entregue', icon: Check, color: '#6B7280', description: 'Entregue ao cliente' },
];

export const WAITER_CALL_REASONS: WaiterCallReason[] = [
  { id: 'conta', label: 'Conta, por favor', icon: '💳' },
  { id: 'cardapio', label: 'Cardápio', icon: '📋' },
  { id: 'agua', label: 'Água', icon: '💧' },
  { id: 'duvida', label: 'Dúvida', icon: '❓' },
  { id: 'outro', label: 'Outro', icon: '💬' },
];

export const SERVICE_FEE_PERCENT = 0.10;

export const DEMO_CREDENTIALS = {
  customer: { email: 'cliente@bistro.com', password: '123456' },
  waiter: { email: 'carlos@bistro.com', password: '123456' },
  kitchen: { email: 'cozinha@bistro.com', password: '123456' },
  admin: { email: 'admin@bistro.com', password: '123456' },
};
