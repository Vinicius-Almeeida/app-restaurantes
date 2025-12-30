import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, CreditCard, QrCode, Users, Clock, ChefHat, TrendingUp, Receipt, Bell, Menu, User, Search, Star, Flame, Leaf, Check, ArrowLeft, Smartphone, Building2, BarChart3, Package, DollarSign, Eye, Coffee, Pizza, Wine, IceCream, Utensils, AlertCircle, Timer, Loader, CheckCircle2, UtensilsCrossed, LogOut, ShieldCheck, Mail, Lock, UserPlus, Store, UserCog, Home, Settings, Edit, Trash2, Save, XCircle, Phone, MapPin, Heart, History, Camera, Award, Calendar, ChevronRight, Wifi, Info, MessageSquare, HelpCircle, Volume2, Moon, Database } from 'lucide-react';

// ==================== INITIAL MOCK DATA ====================
const initialMenuItems = [
  { id: 1, category: 'entradas', name: 'Bruschetta Tradicional', description: 'Pão italiano tostado com tomate, manjericão fresco e azeite extravirgem', price: 28.90, image: '🍅', rating: 4.8, prepTime: '10 min', isPopular: true, isVegan: true, calories: 180, available: true },
  { id: 2, category: 'entradas', name: 'Carpaccio de Carne', description: 'Finas fatias de filé mignon com rúcula, alcaparras e parmesão', price: 45.90, image: '🥩', rating: 4.9, prepTime: '15 min', isPopular: true, calories: 220, available: true },
  { id: 3, category: 'entradas', name: 'Camarões ao Alho', description: 'Camarões salteados no azeite com alho dourado e ervas frescas', price: 52.90, image: '🦐', rating: 4.7, prepTime: '12 min', calories: 190, available: true },
  { id: 4, category: 'entradas', name: 'Salada Caesar', description: 'Mix de folhas, croutons, parmesão e molho caesar caseiro', price: 32.90, image: '🥗', rating: 4.5, prepTime: '8 min', calories: 280, available: true },
  { id: 5, category: 'principais', name: 'Risoto de Funghi', description: 'Arroz arbóreo cremoso com mix de cogumelos frescos e trufa negra', price: 68.90, image: '🍚', rating: 4.9, prepTime: '25 min', isPopular: true, isVegan: true, calories: 420, available: true },
  { id: 6, category: 'principais', name: 'Filé ao Molho Madeira', description: 'Filé mignon grelhado com molho madeira, acompanha batatas rústicas', price: 89.90, image: '🥩', rating: 5.0, prepTime: '30 min', isPopular: true, calories: 650, available: true },
  { id: 7, category: 'principais', name: 'Salmão Grelhado', description: 'Salmão fresco com crosta de ervas, risoto de limão siciliano', price: 78.90, image: '🐟', rating: 4.8, prepTime: '22 min', calories: 480, available: true },
  { id: 8, category: 'principais', name: 'Massa ao Pesto', description: 'Fettuccine al dente com pesto genovês artesanal e pinoli', price: 54.90, image: '🍝', rating: 4.6, prepTime: '18 min', isVegan: true, calories: 520, available: true },
  { id: 9, category: 'principais', name: 'Picanha na Brasa', description: 'Picanha argentina grelhada no ponto, farofa especial e vinagrete', price: 95.90, image: '🥩', rating: 4.9, prepTime: '35 min', isPopular: true, calories: 720, available: true },
  { id: 10, category: 'bebidas', name: 'Caipirinha Premium', description: 'Cachaça artesanal, limão tahiti, açúcar demerara e gelo', price: 24.90, image: '🍹', rating: 4.7, prepTime: '5 min', isPopular: true, available: true },
  { id: 11, category: 'bebidas', name: 'Vinho Tinto Reserva', description: 'Cabernet Sauvignon chileno, safra 2019 - Taça', price: 32.90, image: '🍷', rating: 4.8, prepTime: '2 min', available: true },
  { id: 12, category: 'bebidas', name: 'Suco Natural', description: 'Laranja, abacaxi, maracujá ou limão - 400ml', price: 14.90, image: '🧃', rating: 4.5, prepTime: '5 min', isVegan: true, available: true },
  { id: 13, category: 'bebidas', name: 'Chopp Artesanal', description: 'IPA, Pilsen ou Weiss - 500ml', price: 18.90, image: '🍺', rating: 4.6, prepTime: '2 min', available: true },
  { id: 14, category: 'bebidas', name: 'Água Mineral', description: 'Com ou sem gás - 500ml', price: 7.90, image: '💧', rating: 4.3, prepTime: '1 min', available: true },
  { id: 15, category: 'sobremesas', name: 'Petit Gâteau', description: 'Bolo de chocolate com centro derretido, sorvete de baunilha', price: 34.90, image: '🍫', rating: 5.0, prepTime: '15 min', isPopular: true, calories: 480, available: true },
  { id: 16, category: 'sobremesas', name: 'Cheesecake NY', description: 'Cheesecake cremoso com calda de frutas vermelhas', price: 28.90, image: '🍰', rating: 4.8, prepTime: '5 min', calories: 380, available: true },
  { id: 17, category: 'sobremesas', name: 'Tiramisù', description: 'Clássico italiano com café espresso e mascarpone', price: 32.90, image: '☕', rating: 4.9, prepTime: '5 min', calories: 420, available: true },
  { id: 18, category: 'sobremesas', name: 'Sorvete Artesanal', description: '3 bolas - escolha entre 8 sabores', price: 22.90, image: '🍨', rating: 4.6, prepTime: '3 min', calories: 280, available: true },
];

const initialRestaurant = {
  id: 1,
  name: "Bistrô Sabor & Arte",
  logo: "🍽️",
  address: "Rua das Flores, 123 - Centro",
  phone: "(11) 99999-9999",
  tables: Array.from({ length: 20 }, (_, i) => ({ id: i + 1, status: 'available', currentCustomer: null }))
};

const initialWaiters = [
  { id: 'w1', name: 'Carlos Silva', email: 'carlos@bistro.com', password: '123456', phone: '(11) 98888-1111', active: true },
  { id: 'w2', name: 'Maria Santos', email: 'maria@bistro.com', password: '123456', phone: '(11) 98888-2222', active: true },
  { id: 'w3', name: 'João Oliveira', email: 'joao@bistro.com', password: '123456', phone: '(11) 98888-3333', active: false },
];

const initialKitchenUsers = [
  { id: 'k1', name: 'Chef Ricardo', email: 'cozinha@bistro.com', password: '123456', role: 'Chef', active: true },
  { id: 'k2', name: 'Ana Paula', email: 'ana@bistro.com', password: '123456', role: 'Auxiliar', active: true },
];

const categories = [
  { id: 'entradas', name: 'Entradas', icon: Coffee, color: '#FF6B35' },
  { id: 'principais', name: 'Principais', icon: Pizza, color: '#4CAF50' },
  { id: 'bebidas', name: 'Bebidas', icon: Wine, color: '#9C27B0' },
  { id: 'sobremesas', name: 'Sobremesas', icon: IceCream, color: '#E91E63' },
];

const ORDER_STATUS_FLOW = [
  { key: 'pending', label: 'Pedido Enviado', icon: Receipt, color: '#F59E0B', description: 'Aguardando confirmação' },
  { key: 'received', label: 'Recebido', icon: CheckCircle2, color: '#3B82F6', description: 'Cozinha recebeu' },
  { key: 'preparing', label: 'Em Preparo', icon: ChefHat, color: '#8B5CF6', description: 'Sendo preparado' },
  { key: 'ready', label: 'Pronto!', icon: UtensilsCrossed, color: '#10B981', description: 'Pronto para servir' },
  { key: 'delivered', label: 'Entregue', icon: Check, color: '#6B7280', description: 'Entregue ao cliente' },
];

// ==================== STYLES ====================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  :root {
    --primary: #1E3A5F;
    --primary-light: #2D5A8A;
    --secondary: #FF6B35;
    --secondary-light: #FF8F66;
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    --bg-dark: #0F1419;
    --bg-card: #1A2332;
    --bg-card-hover: #243044;
    --text-primary: #FFFFFF;
    --text-secondary: #94A3B8;
    --text-muted: #64748B;
    --border: #2D3F58;
    --glass: rgba(30, 58, 95, 0.4);
    --glass-border: rgba(255, 255, 255, 0.1);
  }
  
  body {
    font-family: 'Outfit', sans-serif;
    background: var(--bg-dark);
    color: var(--text-primary);
    min-height: 100vh;
  }
  
  .app-container {
    max-width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--bg-dark) 0%, #1A2332 50%, var(--bg-dark) 100%);
    position: relative;
  }
  
  .content-wrapper {
    position: relative;
    z-index: 1;
    padding-bottom: 100px;
  }
  
  /* Auth Styles */
  .auth-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .auth-logo {
    font-size: 64px;
    margin-bottom: 16px;
  }
  
  .auth-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    margin-bottom: 8px;
    text-align: center;
  }
  
  .auth-subtitle {
    color: var(--text-secondary);
    margin-bottom: 32px;
    text-align: center;
  }
  
  .auth-card {
    background: var(--bg-card);
    border-radius: 20px;
    padding: 32px;
    width: 100%;
    max-width: 400px;
    border: 1px solid var(--border);
  }
  
  .auth-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    background: var(--bg-card-hover);
    padding: 4px;
    border-radius: 12px;
  }
  
  .auth-tab {
    flex: 1;
    padding: 12px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-weight: 500;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }
  
  .auth-tab.active {
    background: var(--secondary);
    color: white;
  }
  
  .auth-type-selector {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .auth-type-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    border: 2px solid var(--border);
    background: var(--bg-card-hover);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }
  
  .auth-type-btn:hover {
    border-color: var(--primary-light);
  }
  
  .auth-type-btn.active {
    border-color: var(--secondary);
    background: rgba(255, 107, 53, 0.1);
  }
  
  .auth-type-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary);
    color: white;
  }
  
  .auth-type-info h4 {
    font-size: 15px;
    margin-bottom: 2px;
  }
  
  .auth-type-info p {
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--text-secondary);
  }
  
  .form-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg-card-hover);
    color: var(--text-primary);
    font-size: 15px;
    font-family: inherit;
    transition: all 0.2s;
  }
  
  .form-input:focus {
    outline: none;
    border-color: var(--secondary);
  }
  
  .form-input::placeholder {
    color: var(--text-muted);
  }
  
  .form-input-icon {
    position: relative;
  }
  
  .form-input-icon input {
    padding-left: 44px;
  }
  
  .form-input-icon svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
  }
  
  .auth-btn {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
    border: none;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    margin-top: 8px;
    transition: all 0.2s;
  }
  
  .auth-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
  }
  
  .auth-error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--danger);
    color: var(--danger);
    padding: 12px;
    border-radius: 10px;
    font-size: 14px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .auth-demo-info {
    margin-top: 24px;
    padding: 16px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
  }
  
  .auth-demo-info h4 {
    font-size: 14px;
    color: #60A5FA;
    margin-bottom: 8px;
  }
  
  .auth-demo-info p {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }
  
  /* Header */
  .header {
    background: var(--glass);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--glass-border);
    padding: 16px 20px;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .logo-icon { font-size: 32px; }
  
  .logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 600;
  }
  
  .header-user {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .header-user-name {
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .header-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  
  .table-badge {
    background: var(--secondary);
    color: white;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  /* Navigation */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--glass);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--glass-border);
    padding: 12px 20px;
    z-index: 100;
  }
  
  .nav-items {
    display: flex;
    justify-content: space-around;
    max-width: 500px;
    margin: 0 auto;
  }
  
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    color: var(--text-muted);
    background: transparent;
    border: none;
    font-family: inherit;
    position: relative;
  }
  
  .nav-item.active {
    color: var(--secondary);
    background: rgba(255, 107, 53, 0.1);
  }
  
  .nav-item span { font-size: 11px; font-weight: 500; }
  
  .nav-badge {
    position: absolute;
    top: 2px;
    right: 8px;
    background: var(--danger);
    color: white;
    font-size: 10px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Categories */
  .categories-scroll {
    display: flex;
    gap: 12px;
    padding: 20px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  
  .categories-scroll::-webkit-scrollbar { display: none; }
  
  .category-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 25px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
  }
  
  .category-pill.active {
    background: var(--secondary);
    border-color: var(--secondary);
    color: white;
  }
  
  /* Menu Grid */
  .menu-section { padding: 0 20px 20px; }
  
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  
  .menu-card {
    background: var(--bg-card);
    border-radius: 16px;
    border: 1px solid var(--border);
    overflow: hidden;
    transition: all 0.3s;
  }
  
  .menu-card:hover {
    transform: translateY(-4px);
    border-color: var(--secondary);
    box-shadow: 0 8px 32px rgba(255, 107, 53, 0.15);
  }
  
  .menu-card.unavailable {
    opacity: 0.5;
  }
  
  .menu-card-image {
    height: 120px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56px;
    position: relative;
    cursor: pointer;
  }
  
  .menu-card-badges {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 6px;
  }
  
  .badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .badge-popular { background: var(--secondary); color: white; }
  .badge-vegan { background: var(--success); color: white; }
  .badge-unavailable { background: var(--danger); color: white; }
  
  .menu-card-content { padding: 16px; }
  
  .menu-card-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 8px;
    cursor: pointer;
  }
  
  .menu-card-name {
    font-size: 16px;
    font-weight: 600;
    flex: 1;
    margin-right: 10px;
  }
  
  .menu-card-price {
    font-size: 18px;
    font-weight: 700;
    color: var(--secondary);
  }
  
  .menu-card-description {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 12px;
    cursor: pointer;
  }
  
  .menu-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .menu-card-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .menu-card-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  /* Card Notes */
  .card-notes-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .card-notes-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .card-notes-icon {
    position: absolute;
    left: 10px;
    color: var(--text-muted);
  }
  
  .card-notes-input {
    width: 100%;
    padding: 10px 12px 10px 32px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg-card-hover);
    color: var(--text-primary);
    font-size: 13px;
    font-family: inherit;
  }
  
  .card-notes-input:focus {
    outline: none;
    border-color: var(--secondary);
  }
  
  .card-notes-input::placeholder {
    color: var(--text-muted);
    font-size: 12px;
  }
  
  .add-btn-full {
    width: 100%;
    padding: 10px 16px;
    border-radius: 8px;
    background: var(--secondary);
    border: none;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: inherit;
    transition: all 0.2s;
  }
  
  .add-btn-full:hover { background: var(--secondary-light); }
  .add-btn-full:disabled { opacity: 0.5; cursor: not-allowed; }
  
  /* Cart */
  .cart-container { padding: 20px; }
  
  .cart-empty {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary);
  }
  
  .cart-empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .cart-item {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid var(--border);
    display: flex;
    gap: 16px;
    align-items: center;
  }
  
  .cart-item-image {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    background: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    flex-shrink: 0;
  }
  
  .cart-item-info { flex: 1; }
  .cart-item-name { font-weight: 600; margin-bottom: 4px; }
  .cart-item-price { color: var(--secondary); font-weight: 600; }
  .cart-item-notes {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--warning);
    margin-top: 4px;
    font-style: italic;
  }
  
  .cart-item-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .qty-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg-card-hover);
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .qty-btn:hover {
    border-color: var(--secondary);
    color: var(--secondary);
  }
  
  .qty-value {
    font-weight: 600;
    min-width: 24px;
    text-align: center;
  }
  
  /* Summary */
  .cart-summary {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 20px;
    margin-top: 20px;
    border: 1px solid var(--border);
  }
  
  .cart-summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    color: var(--text-secondary);
  }
  
  .cart-summary-row.total {
    color: var(--text-primary);
    font-size: 20px;
    font-weight: 700;
    border-top: 1px solid var(--border);
    padding-top: 12px;
    margin-top: 12px;
  }
  
  /* Buttons */
  .checkout-btn {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
    border: none;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 16px;
    transition: all 0.3s;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .checkout-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
  }
  
  .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .checkout-btn.secondary { background: var(--bg-card-hover); border: 1px solid var(--border); }
  .checkout-btn.success { background: linear-gradient(135deg, var(--success), #34D399); }
  .checkout-btn.danger { background: linear-gradient(135deg, var(--danger), #F87171); }
  
  /* Tabs */
  .tab-pills {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    background: var(--bg-card);
    padding: 6px;
    border-radius: 12px;
  }
  
  .tab-pill {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  
  .tab-pill.active {
    background: var(--secondary);
    color: white;
  }
  
  /* Split */
  .split-section {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 20px;
    margin-top: 20px;
    border: 1px solid var(--border);
  }
  
  .split-title {
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .split-options {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .split-option {
    flex: 1;
    min-width: 70px;
    padding: 12px;
    border-radius: 10px;
    background: var(--bg-card-hover);
    border: 2px solid transparent;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
    font-family: inherit;
    color: var(--text-primary);
  }
  
  .split-option.active {
    border-color: var(--secondary);
    background: rgba(255, 107, 53, 0.1);
  }
  
  .split-option-number {
    font-size: 24px;
    font-weight: 700;
    color: var(--secondary);
  }
  
  .split-option-label {
    font-size: 12px;
    color: var(--text-secondary);
  }
  
  .split-result {
    margin-top: 16px;
    padding: 16px;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 10px;
    text-align: center;
  }
  
  .split-result-label {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }
  
  .split-result-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--secondary);
  }
  
  /* Exit QR */
  .exit-qr-section {
    background: linear-gradient(135deg, var(--success), #34D399);
    border-radius: 20px;
    padding: 32px;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .exit-qr-icon {
    width: 80px;
    height: 80px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  
  .exit-qr-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .exit-qr-subtitle {
    opacity: 0.9;
    margin-bottom: 24px;
  }
  
  .exit-qr-code {
    width: 180px;
    height: 180px;
    background: white;
    border-radius: 16px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80px;
  }
  
  /* Tracking */
  .tracking-card {
    background: var(--bg-card);
    border-radius: 20px;
    padding: 24px;
    border: 1px solid var(--border);
    margin-bottom: 20px;
  }
  
  .tracking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .tracking-current-status {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .tracking-icon-container {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .tracking-icon-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    animation: trackingPulse 2s ease-in-out infinite;
  }
  
  @keyframes trackingPulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 0; }
  }
  
  .tracking-status-label {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .tracking-timeline {
    position: relative;
    padding-left: 40px;
  }
  
  .tracking-timeline::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--border);
  }
  
  .timeline-item {
    position: relative;
    padding-bottom: 24px;
  }
  
  .timeline-item:last-child { padding-bottom: 0; }
  
  .timeline-dot {
    position: absolute;
    left: -40px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg-card-hover);
    border: 2px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
  
  .timeline-dot.active {
    border-color: var(--success);
    background: rgba(16, 185, 129, 0.2);
    color: var(--success);
  }
  
  .timeline-dot.current {
    border-color: var(--secondary);
    background: var(--secondary);
    color: white;
    animation: currentPulse 1.5s ease-in-out infinite;
  }
  
  @keyframes currentPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4); }
    50% { box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); }
  }
  
  .timeline-dot.pending { opacity: 0.4; }
  
  .timeline-content { padding-left: 12px; }
  .timeline-label { font-weight: 600; margin-bottom: 2px; }
  .timeline-label.active { color: var(--success); }
  .timeline-label.current { color: var(--secondary); }
  .timeline-label.pending { color: var(--text-muted); }
  .timeline-time { font-size: 12px; color: var(--text-muted); }
  
  /* FAB */
  .call-waiter-fab {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3B82F6, #60A5FA);
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
    z-index: 90;
    transition: all 0.3s;
  }
  
  .call-waiter-fab:hover {
    transform: scale(1.1);
  }
  
  /* Quick Reasons */
  .quick-reasons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .quick-reason-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--bg-card-hover);
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }
  
  .quick-reason-btn.active {
    border-color: #3B82F6;
    background: rgba(59, 130, 246, 0.15);
    color: #60A5FA;
  }
  
  .call-reason-input {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg-card-hover);
    color: var(--text-primary);
    font-size: 14px;
    font-family: inherit;
    resize: none;
    min-height: 60px;
  }
  
  .call-reason-input:focus {
    outline: none;
    border-color: #3B82F6;
  }
  
  /* Waiter Calls */
  .waiter-calls-section {
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid var(--danger);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 24px;
    animation: alertGlow 1.5s ease-in-out infinite;
  }
  
  @keyframes alertGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); }
    50% { box-shadow: 0 0 20px 5px rgba(239, 68, 68, 0.2); }
  }
  
  .bell-ringing {
    animation: bellRing 0.5s ease-in-out infinite;
    color: var(--danger);
  }
  
  @keyframes bellRing {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(15deg); }
    75% { transform: rotate(-15deg); }
  }
  
  .waiter-call-card {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid var(--border);
  }
  
  .waiter-call-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .waiter-call-table {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: var(--danger);
  }
  
  .waiter-call-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--text-muted);
  }
  
  .waiter-call-reason {
    font-style: italic;
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  /* Dashboard Stats */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .stat-card {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid var(--border);
  }
  
  .stat-card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }
  
  .stat-card-value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  
  .stat-card-label {
    font-size: 13px;
    color: var(--text-secondary);
  }
  
  /* Orders */
  .order-card {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid var(--border);
  }
  
  .order-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .order-number {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .order-status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  
  .status-pending { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
  .status-received { background: rgba(59, 130, 246, 0.2); color: #3B82F6; }
  .status-preparing { background: rgba(139, 92, 246, 0.2); color: #8B5CF6; }
  .status-ready { background: rgba(16, 185, 129, 0.2); color: var(--success); }
  .status-delivered { background: rgba(100, 116, 139, 0.2); color: var(--text-muted); }
  
  .order-items {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }
  
  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .order-time {
    font-size: 13px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .order-total {
    font-weight: 600;
    color: var(--secondary);
  }
  
  .order-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  
  .action-btn {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  
  .action-btn-primary { background: var(--secondary); color: white; }
  .action-btn-secondary { background: var(--bg-card-hover); color: var(--text-primary); border: 1px solid var(--border); }
  .action-btn-success { background: var(--success); color: white; }
  .action-btn-danger { background: var(--danger); color: white; }
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }
  
  .modal {
    background: var(--bg-card);
    border-radius: 20px;
    padding: 24px;
    max-width: 400px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    text-align: center;
    border: 1px solid var(--border);
    animation: modalIn 0.3s ease;
  }
  
  .modal::-webkit-scrollbar { width: 6px; }
  .modal::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .modal-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--success), #34D399);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }
  
  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .modal-text {
    color: var(--text-secondary);
    margin-bottom: 24px;
  }
  
  /* Search */
  .search-container { padding: 0 20px; margin-bottom: 10px; }
  
  .search-wrapper { position: relative; }
  
  .search-input {
    width: 100%;
    padding: 14px 20px 14px 48px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-primary);
    font-size: 15px;
    font-family: inherit;
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--secondary);
  }
  
  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
  }
  
  /* Notification */
  .notification {
    position: fixed;
    top: 80px;
    right: 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 200;
    animation: slideIn 0.3s ease;
    max-width: 320px;
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .notification-content { flex: 1; }
  .notification-title { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
  .notification-text { font-size: 13px; color: var(--text-secondary); }
  
  /* Tables Grid */
  .tables-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 20px;
  }
  
  .table-btn {
    aspect-ratio: 1;
    border-radius: 12px;
    border: 2px solid var(--border);
    background: var(--bg-card);
    color: var(--text-primary);
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-family: inherit;
  }
  
  .table-btn:hover:not(:disabled) {
    border-color: var(--secondary);
    background: rgba(255, 107, 53, 0.1);
  }
  
  .table-btn.occupied { border-color: var(--danger); background: rgba(239, 68, 68, 0.1); }
  .table-btn.selected { border-color: var(--secondary); background: var(--secondary); color: white; }
  
  .table-status { font-size: 10px; font-weight: 400; }
  
  /* Management Styles */
  .management-card {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .management-card-avatar {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }
  
  .management-card-info { flex: 1; }
  .management-card-name { font-weight: 600; margin-bottom: 4px; }
  .management-card-meta { font-size: 13px; color: var(--text-secondary); }
  
  .management-card-actions {
    display: flex;
    gap: 8px;
  }
  
  .icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg-card-hover);
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .icon-btn:hover { border-color: var(--secondary); color: var(--secondary); }
  .icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); }
  
  /* Toggle Switch */
  .toggle-switch {
    position: relative;
    width: 48px;
    height: 26px;
    background: var(--border);
    border-radius: 13px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .toggle-switch.active { background: var(--success); }
  
  .toggle-switch::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s;
  }
  
  .toggle-switch.active::after { left: 25px; }
  
  /* Back Button */
  .back-btn {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    margin-left: -8px;
    font-family: inherit;
    font-size: 14px;
  }
  
  /* Loader */
  .loader { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  /* Waiter App Specific */
  .waiter-header {
    background: linear-gradient(135deg, #3B82F6, #60A5FA);
    padding: 20px;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .waiter-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .waiter-header p {
    opacity: 0.9;
    font-size: 14px;
  }
  
  /* Empty state for waiter */
  .waiter-empty {
    text-align: center;
    padding: 60px 20px;
  }
  
  .waiter-empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  /* Kitchen App Specific */
  .kitchen-header {
    background: linear-gradient(135deg, #10B981, #34D399);
    padding: 20px;
    text-align: center;
  }
  
  .kitchen-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .kitchen-header p {
    opacity: 0.9;
    font-size: 14px;
  }
  
  .kitchen-stats {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
  }
  
  .kitchen-stat {
    flex: 1;
    text-align: center;
    padding: 12px;
    border-radius: 12px;
    background: var(--bg-card-hover);
  }
  
  .kitchen-stat-value {
    font-size: 28px;
    font-weight: 700;
  }
  
  .kitchen-stat-label {
    font-size: 11px;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-top: 4px;
  }
  
  .kitchen-section {
    padding: 20px;
  }
  
  .kitchen-section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
  }
  
  .kitchen-section-title .count {
    background: var(--secondary);
    color: white;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 13px;
  }
  
  .kitchen-order-card {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    border: 2px solid var(--border);
    transition: all 0.3s;
  }
  
  .kitchen-order-card.pending {
    border-color: var(--warning);
    animation: pendingPulse 2s ease-in-out infinite;
  }
  
  @keyframes pendingPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.3); }
    50% { box-shadow: 0 0 20px 5px rgba(245, 158, 11, 0.1); }
  }
  
  .kitchen-order-card.preparing {
    border-color: #8B5CF6;
  }
  
  .kitchen-order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .kitchen-order-number {
    font-size: 18px;
    font-weight: 700;
  }
  
  .kitchen-order-table {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--primary);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  }
  
  .kitchen-order-time {
    font-size: 13px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 16px;
  }
  
  .kitchen-order-items {
    background: var(--bg-card-hover);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 16px;
  }
  
  .kitchen-order-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  
  .kitchen-order-item:last-child {
    border-bottom: none;
  }
  
  .kitchen-item-qty {
    background: var(--secondary);
    color: white;
    min-width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
  }
  
  .kitchen-item-info {
    flex: 1;
  }
  
  .kitchen-item-name {
    font-weight: 600;
    margin-bottom: 2px;
  }
  
  .kitchen-item-notes {
    font-size: 13px;
    color: var(--warning);
    font-style: italic;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .kitchen-order-actions {
    display: flex;
    gap: 10px;
  }
  
  .kitchen-btn {
    flex: 1;
    padding: 14px;
    border-radius: 12px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: inherit;
    transition: all 0.2s;
  }
  
  .kitchen-btn-confirm {
    background: linear-gradient(135deg, #3B82F6, #60A5FA);
    color: white;
  }
  
  .kitchen-btn-prepare {
    background: linear-gradient(135deg, #8B5CF6, #A78BFA);
    color: white;
  }
  
  .kitchen-btn-ready {
    background: linear-gradient(135deg, #10B981, #34D399);
    color: white;
  }
  
  .kitchen-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  }
  
  .kitchen-empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-secondary);
  }
  
  .kitchen-empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
  
  /* Sound notification indicator */
  .new-order-alert {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--warning);
    color: #000;
    padding: 12px;
    text-align: center;
    font-weight: 600;
    z-index: 1000;
    animation: alertBlink 0.5s ease-in-out infinite;
  }
  
  @keyframes alertBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

// ==================== MAIN APP ====================
export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authTab, setAuthTab] = useState('login');
  const [authType, setAuthType] = useState('customer');
  const [authError, setAuthError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  
  // App State
  const [currentView, setCurrentView] = useState('menu');
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  
  // Data State (simulating database with localStorage)
  const [users, setUsers] = useState([]);
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [waiters, setWaiters] = useState(initialWaiters);
  const [kitchenUsers, setKitchenUsers] = useState(initialKitchenUsers);
  const [orders, setOrders] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  
  // Customer State
  const [cart, setCart] = useState([]);
  const [cardNotes, setCardNotes] = useState({});
  const [comanda, setComanda] = useState([]);
  const [isPaid, setIsPaid] = useState(false);
  const [splitCount, setSplitCount] = useState(1);
  const [cartTab, setCartTab] = useState('newOrder');
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderStatusIndex, setOrderStatusIndex] = useState(0);
  const [statusTimestamps, setStatusTimestamps] = useState({});
  
  // Modal State
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCallWaiter, setShowCallWaiter] = useState(false);
  const [callReason, setCallReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  
  // Admin State
  const [adminView, setAdminView] = useState('dashboard');
  const [editingItem, setEditingItem] = useState(null);
  const [editingWaiter, setEditingWaiter] = useState(null);
  
  // Waiter State
  const [waiterView, setWaiterView] = useState('calls');
  const [waiterSelectedTable, setWaiterSelectedTable] = useState(null);
  const [waiterCart, setWaiterCart] = useState([]);
  const [waiterCardNotes, setWaiterCardNotes] = useState({});
  const [waiterSearchQuery, setWaiterSearchQuery] = useState('');
  const [waiterSelectedCategory, setWaiterSelectedCategory] = useState('all');
  
  // Customer extras
  const [favorites, setFavorites] = useState([]);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showItemDetail, setShowItemDetail] = useState(null);
  const [editProfileData, setEditProfileData] = useState({});
  const [cartTab, setCartTab] = useState('cart');
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('gastro_users');
    const savedOrders = localStorage.getItem('gastro_orders');
    const savedMenu = localStorage.getItem('gastro_menu');
    const savedWaiters = localStorage.getItem('gastro_waiters');
    const savedRestaurant = localStorage.getItem('gastro_restaurant');
    
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedMenu) setMenuItems(JSON.parse(savedMenu));
    if (savedWaiters) setWaiters(JSON.parse(savedWaiters));
    if (savedRestaurant) setRestaurant(JSON.parse(savedRestaurant));
    
    // Check for saved session
    const savedSession = localStorage.getItem('gastro_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setCurrentUser(session);
      setIsAuthenticated(true);
    }
  }, []);
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('gastro_users', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    localStorage.setItem('gastro_orders', JSON.stringify(orders));
  }, [orders]);
  
  useEffect(() => {
    localStorage.setItem('gastro_menu', JSON.stringify(menuItems));
  }, [menuItems]);
  
  useEffect(() => {
    localStorage.setItem('gastro_waiters', JSON.stringify(waiters));
  }, [waiters]);
  
  // Auto update order status
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'delivered') return;
    
    const interval = setInterval(() => {
      setOrderStatusIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex < ORDER_STATUS_FLOW.length - 1) {
          const newStatus = ORDER_STATUS_FLOW[nextIndex];
          setStatusTimestamps(ts => ({
            ...ts,
            [newStatus.key]: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }));
          setActiveOrder(order => ({ ...order, status: newStatus.key }));
          showNotificationMsg(`${newStatus.label}!`, 'success');
          return nextIndex;
        }
        return prev;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeOrder]);
  
  // ==================== AUTH FUNCTIONS ====================
  const handleLogin = () => {
    setAuthError('');
    
    // Check for restaurant admin
    if (authType === 'restaurant') {
      if (formData.email === 'admin@bistro.com' && formData.password === '123456') {
        const adminUser = { id: 'admin', type: 'restaurant', name: 'Administrador', email: 'admin@bistro.com' };
        setCurrentUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('gastro_session', JSON.stringify(adminUser));
        return;
      }
    }
    
    // Check for waiter
    if (authType === 'waiter') {
      const waiter = waiters.find(w => w.email === formData.email && w.password === formData.password);
      if (waiter) {
        if (!waiter.active) {
          setAuthError('Sua conta está desativada. Contate o administrador.');
          return;
        }
        const waiterUser = { ...waiter, type: 'waiter' };
        setCurrentUser(waiterUser);
        setIsAuthenticated(true);
        localStorage.setItem('gastro_session', JSON.stringify(waiterUser));
        return;
      }
    }
    
    // Check for kitchen
    if (authType === 'kitchen') {
      const kitchenUser = kitchenUsers.find(k => k.email === formData.email && k.password === formData.password);
      if (kitchenUser) {
        if (!kitchenUser.active) {
          setAuthError('Sua conta está desativada. Contate o administrador.');
          return;
        }
        const kUser = { ...kitchenUser, type: 'kitchen' };
        setCurrentUser(kUser);
        setIsAuthenticated(true);
        localStorage.setItem('gastro_session', JSON.stringify(kUser));
        return;
      }
    }
    
    // Check for customer
    if (authType === 'customer') {
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        const customerUser = { ...user, type: 'customer' };
        setCurrentUser(customerUser);
        setIsAuthenticated(true);
        localStorage.setItem('gastro_session', JSON.stringify(customerUser));
        return;
      }
    }
    
    setAuthError('Email ou senha incorretos');
  };
  
  const handleRegister = () => {
    setAuthError('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setAuthError('Preencha todos os campos');
      return;
    }
    
    if (authType === 'customer') {
      const exists = users.find(u => u.email === formData.email);
      if (exists) {
        setAuthError('Este email já está cadastrado');
        return;
      }
      
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        type: 'customer',
        createdAt: new Date().toISOString(),
      };
      
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('gastro_session', JSON.stringify(newUser));
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSelectedTable(null);
    setCart([]);
    setComanda([]);
    setActiveOrder(null);
    setIsPaid(false);
    setCurrentView('menu');
    setAdminView('dashboard');
    localStorage.removeItem('gastro_session');
  };
  
  // ==================== HELPER FUNCTIONS ====================
  const showNotificationMsg = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  const addToCart = (item, notes = '') => {
    if (!item.available) return;
    const itemWithNotes = { ...item, notes: notes.trim() };
    const existing = cart.find(i => i.id === item.id && i.notes === notes.trim());
    if (existing) {
      setCart(cart.map(i => (i.id === item.id && i.notes === notes.trim()) ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...itemWithNotes, quantity: 1 }]);
    }
    showNotificationMsg(`${item.name} adicionado!`);
    setCardNotes(prev => ({ ...prev, [item.id]: '' }));
  };
  
  const updateQuantity = (itemId, notes, delta) => {
    setCart(cart.map(item => {
      if (item.id === itemId && item.notes === notes) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };
  
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const comandaTotal = comanda.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const handleSendOrder = () => {
    if (cart.length === 0) return;
    
    const newOrder = {
      id: Date.now(),
      table: selectedTable,
      customer: currentUser,
      items: [...cart],
      status: 'pending',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      total: cartTotal
    };
    
    setOrders(prev => [...prev, newOrder]);
    
    cart.forEach(item => {
      const existingInComanda = comanda.find(c => c.id === item.id && c.notes === item.notes);
      if (existingInComanda) {
        setComanda(prev => prev.map(c => 
          (c.id === item.id && c.notes === item.notes) 
            ? { ...c, quantity: c.quantity + item.quantity } 
            : c
        ));
      } else {
        setComanda(prev => [...prev, { ...item }]);
      }
    });
    
    setStatusTimestamps({ pending: newOrder.time });
    setActiveOrder(newOrder);
    setOrderStatusIndex(0);
    setShowSuccess(true);
    setCart([]);
    
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentView('tracking');
    }, 2000);
  };
  
  const handlePayment = () => {
    setShowPayment(false);
    setIsPaid(true);
    
    // Update table status
    setRestaurant(prev => ({
      ...prev,
      tables: prev.tables.map(t => t.id === selectedTable ? { ...t, status: 'available', currentCustomer: null } : t)
    }));
    
    showNotificationMsg('Pagamento confirmado!', 'success');
  };
  
  const handleCallWaiter = () => {
    const newCall = {
      id: Date.now(),
      table: selectedTable,
      customer: currentUser?.name || 'Cliente',
      reason: callReason || 'Preciso de atendimento',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending'
    };
    setWaiterCalls(prev => [...prev, newCall]);
    setShowCallWaiter(false);
    setCallReason('');
    showNotificationMsg('Garçom chamado! Aguarde...');
  };
  
  const dismissWaiterCall = (callId) => {
    setWaiterCalls(prev => prev.filter(c => c.id !== callId));
    showNotificationMsg('Chamado atendido!');
  };
  
  // Favorites function
  const toggleFavorite = (itemId) => {
    if (favorites.includes(itemId)) {
      setFavorites(favorites.filter(id => id !== itemId));
      showNotificationMsg('Removido dos favoritos');
    } else {
      setFavorites([...favorites, itemId]);
      showNotificationMsg('Adicionado aos favoritos!');
    }
  };
  
  // Update profile function
  const handleUpdateProfile = () => {
    if (!editProfileData.name) {
      showNotificationMsg('Nome é obrigatório', 'error');
      return;
    }
    const updatedUser = { ...currentUser, ...editProfileData };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    localStorage.setItem('gastro_session', JSON.stringify(updatedUser));
    setShowEditProfile(false);
    showNotificationMsg('Perfil atualizado!');
  };
  
  // Waiter order functions
  const waiterAddToCart = (item, notes = '') => {
    if (!item.available) return;
    const itemWithNotes = { ...item, notes: notes.trim() };
    const existing = waiterCart.find(i => i.id === item.id && i.notes === notes.trim());
    if (existing) {
      setWaiterCart(waiterCart.map(i => (i.id === item.id && i.notes === notes.trim()) ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setWaiterCart([...waiterCart, { ...itemWithNotes, quantity: 1 }]);
    }
    showNotificationMsg(`${item.name} adicionado!`);
    setWaiterCardNotes(prev => ({ ...prev, [item.id]: '' }));
  };
  
  const waiterUpdateQuantity = (itemId, notes, delta) => {
    setWaiterCart(waiterCart.map(item => {
      if (item.id === itemId && item.notes === notes) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };
  
  const waiterCartTotal = waiterCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const waiterCartCount = waiterCart.reduce((sum, item) => sum + item.quantity, 0);
  
  const waiterSendOrder = () => {
    if (waiterCart.length === 0 || !waiterSelectedTable) return;
    
    const newOrder = {
      id: Date.now(),
      table: waiterSelectedTable,
      items: [...waiterCart],
      status: 'pending',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      total: waiterCartTotal,
      orderedBy: currentUser?.name || 'Garçom'
    };
    
    setOrders(prev => [...prev, newOrder]);
    
    // Update table status
    setRestaurant(prev => ({
      ...prev,
      tables: prev.tables.map(t => t.id === waiterSelectedTable ? { ...t, status: 'occupied' } : t)
    }));
    
    setWaiterCart([]);
    showNotificationMsg(`Pedido da Mesa ${waiterSelectedTable} enviado!`);
    setWaiterView('calls');
    setWaiterSelectedTable(null);
  };
  
  const getTableOrders = (tableId) => {
    return orders.filter(o => o.table === tableId && o.status !== 'delivered');
  };
  
  const getTableComanda = (tableId) => {
    const tableOrders = orders.filter(o => o.table === tableId);
    const items = {};
    tableOrders.forEach(order => {
      order.items.forEach(item => {
        const key = `${item.id}-${item.notes || ''}`;
        if (items[key]) {
          items[key].quantity += item.quantity;
        } else {
          items[key] = { ...item };
        }
      });
    });
    return Object.values(items);
  };
  
  const closeTable = (tableId) => {
    // Clear all orders for this table
    setOrders(prev => prev.filter(o => o.table !== tableId));
    // Set table as available
    setRestaurant(prev => ({
      ...prev,
      tables: prev.tables.map(t => t.id === tableId ? { ...t, status: 'available', currentCustomer: null } : t)
    }));
    showNotificationMsg(`Mesa ${tableId} liberada!`);
  };
  
  // Filter menu items for waiter
  const waiterFilteredItems = menuItems.filter(item => {
    const matchesCategory = waiterSelectedCategory === 'all' || item.category === waiterSelectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(waiterSearchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(waiterSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showNotificationMsg(`Pedido #${orderId} atualizado!`);
  };
  
  const selectTable = (tableId) => {
    setSelectedTable(tableId);
    setRestaurant(prev => ({
      ...prev,
      tables: prev.tables.map(t => t.id === tableId ? { ...t, status: 'occupied', currentCustomer: currentUser?.id } : t)
    }));
  };
  
  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
                           selectedCategory === 'favorites' ? favorites.includes(item.id) :
                           item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return (selectedCategory === 'favorites' ? favorites.includes(item.id) : matchesCategory) && matchesSearch;
  });
  
  // ==================== RENDER: AUTH ====================
  const renderAuth = () => (
    <div className="auth-container">
      <div className="auth-logo">🍽️</div>
      <h1 className="auth-title">Bistrô Sabor & Arte</h1>
      <p className="auth-subtitle">Sistema de Gestão de Restaurante</p>
      
      <div className="auth-card">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
            onClick={() => { setAuthTab('login'); setAuthError(''); }}
          >
            Entrar
          </button>
          <button 
            className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
            onClick={() => { setAuthTab('register'); setAuthError(''); setAuthType('customer'); }}
          >
            Cadastrar
          </button>
        </div>
        
        <div className="auth-type-selector">
          <button 
            className={`auth-type-btn ${authType === 'customer' ? 'active' : ''}`}
            onClick={() => setAuthType('customer')}
          >
            <div className="auth-type-icon"><User size={20} /></div>
            <div className="auth-type-info">
              <h4>Cliente</h4>
              <p>Fazer pedidos e pagar</p>
            </div>
          </button>
          
          {authTab === 'login' && (
            <>
              <button 
                className={`auth-type-btn ${authType === 'waiter' ? 'active' : ''}`}
                onClick={() => setAuthType('waiter')}
              >
                <div className="auth-type-icon" style={{ background: '#3B82F6' }}><UserCog size={20} /></div>
                <div className="auth-type-info">
                  <h4>Garçom</h4>
                  <p>Atender chamados e pedidos</p>
                </div>
              </button>
              
              <button 
                className={`auth-type-btn ${authType === 'kitchen' ? 'active' : ''}`}
                onClick={() => setAuthType('kitchen')}
              >
                <div className="auth-type-icon" style={{ background: '#10B981' }}><ChefHat size={20} /></div>
                <div className="auth-type-info">
                  <h4>Cozinha</h4>
                  <p>Gerenciar preparo dos pedidos</p>
                </div>
              </button>
              
              <button 
                className={`auth-type-btn ${authType === 'restaurant' ? 'active' : ''}`}
                onClick={() => setAuthType('restaurant')}
              >
                <div className="auth-type-icon" style={{ background: '#8B5CF6' }}><Store size={20} /></div>
                <div className="auth-type-info">
                  <h4>Restaurante</h4>
                  <p>Gerenciar estabelecimento</p>
                </div>
              </button>
            </>
          )}
        </div>
        
        {authError && (
          <div className="auth-error">
            <XCircle size={18} />
            {authError}
          </div>
        )}
        
        {authTab === 'register' && (
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <div className="form-input-icon">
              <User size={18} />
              <input 
                type="text"
                className="form-input"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="form-input-icon">
            <Mail size={18} />
            <input 
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Senha</label>
          <div className="form-input-icon">
            <Lock size={18} />
            <input 
              type="password"
              className="form-input"
              placeholder="••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>
        
        {authTab === 'register' && (
          <div className="form-group">
            <label className="form-label">Telefone (opcional)</label>
            <div className="form-input-icon">
              <Phone size={18} />
              <input 
                type="tel"
                className="form-input"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        )}
        
        <button 
          className="auth-btn"
          onClick={authTab === 'login' ? handleLogin : handleRegister}
        >
          {authTab === 'login' ? 'Entrar' : 'Criar Conta'}
        </button>
        
        <div className="auth-demo-info">
          <h4>🔑 Contas Demo</h4>
          <p><strong>Admin:</strong> admin@bistro.com / 123456</p>
          <p><strong>Cozinha:</strong> cozinha@bistro.com / 123456</p>
          <p><strong>Garçom:</strong> carlos@bistro.com / 123456</p>
          <p><strong>Cliente:</strong> Cadastre-se ou use qualquer email</p>
        </div>
      </div>
    </div>
  );
  
  // ==================== RENDER: TABLE SELECTION ====================
  const renderTableSelection = () => (
    <div style={{ padding: 20 }}>
      <h2 className="section-title">
        <Utensils size={24} />
        Selecione sua Mesa
      </h2>
      
      <div className="tables-grid">
        {restaurant.tables.map(table => (
          <button
            key={table.id}
            className={`table-btn ${table.status === 'occupied' && table.currentCustomer !== currentUser?.id ? 'occupied' : ''} ${selectedTable === table.id ? 'selected' : ''}`}
            onClick={() => table.status !== 'occupied' || table.currentCustomer === currentUser?.id ? selectTable(table.id) : null}
            disabled={table.status === 'occupied' && table.currentCustomer !== currentUser?.id}
          >
            {table.id}
            <span className="table-status">
              {table.status === 'occupied' ? 'Ocupada' : 'Livre'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
  
  // ==================== RENDER: CUSTOMER APP ====================
  const renderCustomerHeader = () => (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <span className="logo-icon">🍽️</span>
          <span className="logo-text">{restaurant.name}</span>
        </div>
        <div className="header-user">
          {selectedTable && (
            <div className="table-badge">
              <Utensils size={14} />
              Mesa {selectedTable}
            </div>
          )}
        </div>
      </div>
    </header>
  );
  
  const renderCustomerNav = () => (
    <nav className="bottom-nav">
      <div className="nav-items">
        <button className={`nav-item ${currentView === 'menu' ? 'active' : ''}`} onClick={() => setCurrentView('menu')}>
          <Menu size={22} />
          <span>Cardápio</span>
        </button>
        <button className={`nav-item ${currentView === 'cart' ? 'active' : ''}`} onClick={() => setCurrentView('cart')}>
          <Receipt size={22} />
          <span>Pedido</span>
          {(cartCount > 0 || comanda.length > 0) && <span className="nav-badge">{cartCount || '!'}</span>}
        </button>
        <button className={`nav-item ${currentView === 'tracking' ? 'active' : ''}`} onClick={() => setCurrentView('tracking')}>
          <Timer size={22} />
          <span>Acompanhar</span>
          {activeOrder && activeOrder.status !== 'delivered' && <span className="nav-badge">!</span>}
        </button>
        <button className={`nav-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => setCurrentView('profile')}>
          <User size={22} />
          <span>Perfil</span>
        </button>
      </div>
    </nav>
  );
  
  const renderMenu = () => (
    <>
      <div className="search-container">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar no cardápio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="categories-scroll">
        <button className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>
          Todos
        </button>
        <button className={`category-pill ${selectedCategory === 'favorites' ? 'active' : ''}`} onClick={() => setSelectedCategory('favorites')} style={selectedCategory === 'favorites' ? { background: 'var(--danger)', borderColor: 'var(--danger)' } : {}}>
          <Heart size={16} fill={selectedCategory === 'favorites' ? 'white' : 'none'} /> Favoritos
        </button>
        {categories.map(cat => (
          <button key={cat.id} className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.id)}>
            <cat.icon size={16} />
            {cat.name}
          </button>
        ))}
      </div>
      
      <div className="menu-section">
        <h2 className="section-title">
          {selectedCategory === 'all' ? 'Cardápio' : selectedCategory === 'favorites' ? '❤️ Favoritos' : categories.find(c => c.id === selectedCategory)?.name}
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400, fontFamily: 'Outfit' }}> ({filteredItems.length})</span>
        </h2>
        
        {selectedCategory === 'favorites' && favorites.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">💔</div>
            <h3>Nenhum favorito ainda</h3>
            <p>Toque no ❤️ para salvar seus pratos preferidos</p>
            <button className="checkout-btn" style={{ maxWidth: 200, margin: '20px auto 0' }} onClick={() => setSelectedCategory('all')}>
              <Menu size={18} /> Ver Cardápio
            </button>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map(item => (
              <div key={item.id} className={`menu-card ${!item.available ? 'unavailable' : ''}`}>
                <div className="menu-card-image" onClick={() => setShowItemDetail(item)} style={{ cursor: 'pointer' }}>
                  {item.image}
                  <div className="menu-card-badges">
                    {!item.available && <span className="badge badge-unavailable">Indisponível</span>}
                    {item.isPopular && item.available && <span className="badge badge-popular"><Flame size={12} /> Popular</span>}
                    {item.isVegan && item.available && <span className="badge badge-vegan"><Leaf size={12} /> Vegano</span>}
                  </div>
                  {/* Botão Favorito */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                    style={{ 
                      position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: '50%',
                      background: favorites.includes(item.id) ? 'white' : 'rgba(0,0,0,0.3)',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: favorites.includes(item.id) ? 'var(--danger)' : 'white', transition: 'all 0.2s'
                    }}
                  >
                    <Heart size={18} fill={favorites.includes(item.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="menu-card-content">
                  <div className="menu-card-header" onClick={() => setShowItemDetail(item)} style={{ cursor: 'pointer' }}>
                    <h3 className="menu-card-name">{item.name}</h3>
                    <span className="menu-card-price">R$ {item.price.toFixed(2)}</span>
                  </div>
                  <p className="menu-card-description" onClick={() => setShowItemDetail(item)} style={{ cursor: 'pointer' }}>{item.description}</p>
                  <div className="menu-card-footer">
                    <div className="menu-card-meta">
                      <span><Star size={14} fill="#FFD700" color="#FFD700" /> {item.rating}</span>
                      <span><Clock size={14} /> {item.prepTime}</span>
                    </div>
                  </div>
                  
                  {item.available && (
                    <div className="card-notes-section">
                      <div className="card-notes-input-wrapper">
                        <AlertCircle size={14} className="card-notes-icon" />
                        <input
                          type="text"
                          className="card-notes-input"
                          placeholder="Alguma observação? Ex: sem cebola..."
                          value={cardNotes[item.id] || ''}
                          onChange={(e) => setCardNotes({ ...cardNotes, [item.id]: e.target.value })}
                        />
                      </div>
                      <button className="add-btn-full" onClick={() => addToCart(item, cardNotes[item.id] || '')}>
                        <Plus size={18} /> Adicionar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
  
  const renderCart = () => (
    <div className="cart-container">
      <h2 className="section-title"><Receipt size={24} /> Pedido</h2>
      
      <div className="tab-pills">
        <button className={`tab-pill ${cartTab === 'newOrder' ? 'active' : ''}`} onClick={() => setCartTab('newOrder')}>
          <Plus size={16} /> Novo Pedido {cartCount > 0 && `(${cartCount})`}
        </button>
        <button className={`tab-pill ${cartTab === 'comanda' ? 'active' : ''}`} onClick={() => setCartTab('comanda')}>
          <Receipt size={16} /> Minha Comanda
        </button>
        <button className={`tab-pill ${cartTab === 'history' ? 'active' : ''}`} onClick={() => setCartTab('history')}>
          <History size={16} /> Histórico
        </button>
      </div>
      
      {cartTab === 'newOrder' && (
        cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h3>Carrinho vazio</h3>
            <p>Adicione itens do cardápio</p>
          </div>
        ) : (
          <>
            {cart.map((item, index) => (
              <div key={`${item.id}-${item.notes}-${index}`} className="cart-item">
                <div className="cart-item-image">{item.image}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  {item.notes && <div className="cart-item-notes"><AlertCircle size={12} />{item.notes}</div>}
                  <div className="cart-item-price">R$ {(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="cart-item-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.notes, -1)}><Minus size={16} /></button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.notes, 1)}><Plus size={16} /></button>
                </div>
              </div>
            ))}
            <div className="cart-summary">
              <div className="cart-summary-row total" style={{ border: 'none', padding: 0, margin: 0 }}>
                <span>Total</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <button className="checkout-btn" onClick={handleSendOrder}>
              <ChefHat size={20} /> Enviar para Cozinha
            </button>
          </>
        )
      )}
      
      {cartTab === 'comanda' && (
        isPaid ? (
          <div className="exit-qr-section">
            <div className="exit-qr-icon"><ShieldCheck size={40} color="#10B981" /></div>
            <h2 className="exit-qr-title">Conta Paga!</h2>
            <p className="exit-qr-subtitle">Apresente este QR Code na saída</p>
            <div className="exit-qr-code">✅</div>
          </div>
        ) : comanda.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">📋</div>
            <h3>Comanda vazia</h3>
            <p>Seus pedidos aparecerão aqui</p>
          </div>
        ) : (
          <>
            <div className="cart-summary">
              {comanda.map((item, i) => (
                <div key={i} className="cart-summary-row">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="cart-summary-row"><span>Taxa serviço (10%)</span><span>R$ {(comandaTotal * 0.1).toFixed(2)}</span></div>
              <div className="cart-summary-row total"><span>Total</span><span>R$ {(comandaTotal * 1.1).toFixed(2)}</span></div>
            </div>
            
            <div className="split-section">
              <h3 className="split-title"><Users size={18} /> Dividir Conta</h3>
              <div className="split-options">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button key={n} className={`split-option ${splitCount === n ? 'active' : ''}`} onClick={() => setSplitCount(n)}>
                    <div className="split-option-number">{n}</div>
                    <div className="split-option-label">{n === 1 ? 'Sozinho' : 'pessoas'}</div>
                  </button>
                ))}
              </div>
              {splitCount > 1 && (
                <div className="split-result">
                  <div className="split-result-label">Por pessoa</div>
                  <div className="split-result-value">R$ {((comandaTotal * 1.1) / splitCount).toFixed(2)}</div>
                </div>
              )}
            </div>
            
            <button className="checkout-btn success" onClick={() => setShowPayment(true)}>
              <CreditCard size={20} /> Fechar Conta
            </button>
          </>
        )
      )}
      
      {cartTab === 'history' && (
        (() => {
          const myOrders = orders.filter(o => o.table === selectedTable || o.customer?.id === currentUser?.id);
          return myOrders.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">📜</div>
              <h3>Nenhum pedido ainda</h3>
              <p>Seu histórico aparecerá aqui</p>
            </div>
          ) : (
            myOrders.slice().reverse().map(order => (
              <div key={order.id} className="order-card" style={{ marginBottom: 12 }}>
                <div className="order-card-header">
                  <div className="order-number"><Receipt size={16} /> #{order.id}</div>
                  <span className={`order-status status-${order.status}`}>
                    {ORDER_STATUS_FLOW.find(s => s.key === order.status)?.label || order.status}
                  </span>
                </div>
                <div className="order-items">
                  {order.items.map((item, i) => (
                    <span key={i}>{item.quantity}x {item.name}{i < order.items.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}><Clock size={14} /> {order.time}</span>
                  <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            ))
          );
        })()
      )}
    </div>
  );
  
  const renderTracking = () => {
    if (!activeOrder) {
      return (
        <div className="cart-container">
          <h2 className="section-title"><Timer size={24} /> Acompanhar</h2>
          <div className="cart-empty">
            <div className="cart-empty-icon">📋</div>
            <h3>Nenhum pedido ativo</h3>
          </div>
        </div>
      );
    }

    const currentStatus = ORDER_STATUS_FLOW[orderStatusIndex];
    const StatusIcon = currentStatus.icon;

    return (
      <div style={{ padding: 20 }}>
        <h2 className="section-title"><Timer size={24} /> Acompanhar</h2>
        
        <div className="tracking-card">
          <div className="tracking-header">
            <span style={{ color: 'var(--text-secondary)' }}>Pedido #{activeOrder.id}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}><Clock size={14} /> {activeOrder.time}</span>
          </div>
          
          <div className="tracking-current-status">
            <div className="tracking-icon-container" style={{ background: `${currentStatus.color}20` }}>
              <div className="tracking-icon-pulse" style={{ background: currentStatus.color }} />
              <StatusIcon size={48} color={currentStatus.color} />
            </div>
            <h2 className="tracking-status-label" style={{ color: currentStatus.color }}>{currentStatus.label}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{currentStatus.description}</p>
          </div>
          
          <div className="tracking-timeline">
            {ORDER_STATUS_FLOW.slice(0, -1).map((status, index) => {
              const Icon = status.icon;
              return (
                <div key={status.key} className="timeline-item">
                  <div className={`timeline-dot ${index < orderStatusIndex ? 'active' : ''} ${index === orderStatusIndex ? 'current' : ''} ${index > orderStatusIndex ? 'pending' : ''}`}>
                    {index < orderStatusIndex ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <div className="timeline-content">
                    <div className={`timeline-label ${index < orderStatusIndex ? 'active' : ''} ${index === orderStatusIndex ? 'current' : ''} ${index > orderStatusIndex ? 'pending' : ''}`}>
                      {status.label}
                    </div>
                    {statusTimestamps[status.key] && <div className="timeline-time">{statusTimestamps[status.key]}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  const renderProfile = () => {
    const userOrderHistory = orders.filter(o => o.customer?.id === currentUser?.id || o.table === selectedTable);
    const totalSpent = userOrderHistory.reduce((sum, o) => sum + o.total, 0);
    
    return (
      <div style={{ paddingBottom: 20 }}>
        {/* Profile Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', padding: '32px 20px', textAlign: 'center', borderRadius: '0 0 24px 24px', marginBottom: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 12px', position: 'relative' }}>
            {currentUser?.name?.charAt(0) || '👤'}
            <button onClick={() => { setEditProfileData({ name: currentUser?.name, email: currentUser?.email, phone: currentUser?.phone || '' }); setShowEditProfile(true); }} style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: 'var(--secondary)', border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Camera size={12} />
            </button>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 4 }}>{currentUser?.name}</h2>
          <p style={{ opacity: 0.8, fontSize: 14 }}>{currentUser?.email}</p>
          
          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{userOrderHistory.length}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Pedidos</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{favorites.length}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Favoritos</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>R$ {totalSpent.toFixed(0)}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Total</div>
            </div>
          </div>
        </div>
        
        {/* Menu Items */}
        <div style={{ padding: '0 20px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Conta</p>
          
          <div className="management-card" style={{ cursor: 'pointer' }} onClick={() => { setEditProfileData({ name: currentUser?.name, email: currentUser?.email, phone: currentUser?.phone || '' }); setShowEditProfile(true); }}>
            <div className="management-card-avatar" style={{ background: 'rgba(255, 107, 53, 0.2)' }}><Edit size={20} color="var(--secondary)" /></div>
            <div className="management-card-info">
              <div className="management-card-name">Editar Perfil</div>
              <div className="management-card-meta">Nome, telefone</div>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
          
          <div className="management-card" style={{ cursor: 'pointer' }} onClick={() => { setCurrentView('menu'); setSelectedCategory('favorites'); }}>
            <div className="management-card-avatar" style={{ background: 'rgba(239, 68, 68, 0.2)' }}><Heart size={20} color="var(--danger)" /></div>
            <div className="management-card-info">
              <div className="management-card-name">Meus Favoritos</div>
              <div className="management-card-meta">{favorites.length} itens salvos</div>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
          
          <div className="management-card" style={{ cursor: 'pointer' }} onClick={() => { setCurrentView('cart'); setCartTab('history'); }}>
            <div className="management-card-avatar" style={{ background: 'rgba(139, 92, 246, 0.2)' }}><History size={20} color="#8B5CF6" /></div>
            <div className="management-card-info">
              <div className="management-card-name">Histórico de Pedidos</div>
              <div className="management-card-meta">{userOrderHistory.length} pedidos</div>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
        </div>
        
        {/* Settings */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Sobre</p>
          
          <div className="management-card">
            <div className="management-card-avatar" style={{ background: 'rgba(59, 130, 246, 0.2)' }}><Info size={20} color="#3B82F6" /></div>
            <div className="management-card-info">
              <div className="management-card-name">{restaurant.name}</div>
              <div className="management-card-meta">{restaurant.address}</div>
            </div>
          </div>
          
          <div className="management-card">
            <div className="management-card-avatar" style={{ background: 'rgba(16, 185, 129, 0.2)' }}><Wifi size={20} color="var(--success)" /></div>
            <div className="management-card-info">
              <div className="management-card-name">Wi-Fi: Bistro_Guest</div>
              <div className="management-card-meta">Senha: bemvindo123</div>
            </div>
          </div>
          
          <div className="management-card">
            <div className="management-card-avatar" style={{ background: 'rgba(245, 158, 11, 0.2)' }}><Phone size={20} color="var(--warning)" /></div>
            <div className="management-card-info">
              <div className="management-card-name">{restaurant.phone}</div>
              <div className="management-card-meta">WhatsApp disponível</div>
            </div>
          </div>
        </div>
        
        {/* Help */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Ajuda</p>
          
          <div className="management-card" style={{ cursor: 'pointer' }}>
            <div className="management-card-avatar" style={{ background: 'rgba(59, 130, 246, 0.2)' }}><HelpCircle size={20} color="#3B82F6" /></div>
            <div className="management-card-info">
              <div className="management-card-name">Central de Ajuda</div>
              <div className="management-card-meta">Dúvidas frequentes</div>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
          
          <div className="management-card" style={{ cursor: 'pointer' }}>
            <div className="management-card-avatar" style={{ background: 'rgba(16, 185, 129, 0.2)' }}><MessageSquare size={20} color="var(--success)" /></div>
            <div className="management-card-info">
              <div className="management-card-name">Fale Conosco</div>
              <div className="management-card-meta">Sugestões e reclamações</div>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
        </div>
        
        {/* Logout */}
        <div style={{ padding: 20 }}>
          <button className="checkout-btn danger" onClick={handleLogout}>
            <LogOut size={20} /> Sair da Conta
          </button>
        </div>
      </div>
    );
  };
  
  // ==================== RENDER: ADMIN DASHBOARD ====================
  const renderAdminDashboard = () => {
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const activeTableCount = restaurant.tables.filter(t => t.status === 'occupied').length;
    
    return (
      <>
        {waiterCalls.length > 0 && (
          <div className="waiter-calls-section">
            <h3 className="section-title" style={{ fontSize: 18 }}>
              <Bell size={20} className="bell-ringing" /> Chamados de Garçom
            </h3>
            {waiterCalls.map(call => (
              <div key={call.id} className="waiter-call-card">
                <div className="waiter-call-header">
                  <div className="waiter-call-table"><Utensils size={16} /> Mesa {call.table}</div>
                  <div className="waiter-call-time"><Clock size={14} /> {call.time}</div>
                </div>
                <div className="waiter-call-reason">"{call.reason}"</div>
                <button className="action-btn action-btn-success" onClick={() => dismissWaiterCall(call.id)} style={{ marginTop: 12, width: '100%' }}>
                  <Check size={16} /> Atender
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}><DollarSign size={20} /></div>
            <div className="stat-card-value" style={{ color: 'var(--success)' }}>R$ {todaySales.toFixed(2)}</div>
            <div className="stat-card-label">Vendas Hoje</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(255, 107, 53, 0.2)', color: 'var(--secondary)' }}><Package size={20} /></div>
            <div className="stat-card-value">{todayOrders.length}</div>
            <div className="stat-card-label">Pedidos Hoje</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8B5CF6' }}><TrendingUp size={20} /></div>
            <div className="stat-card-value">R$ {todayOrders.length > 0 ? (todaySales / todayOrders.length).toFixed(2) : '0.00'}</div>
            <div className="stat-card-label">Ticket Médio</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}><Eye size={20} /></div>
            <div className="stat-card-value">{activeTableCount}</div>
            <div className="stat-card-label">Mesas Ativas</div>
          </div>
        </div>
        
        <h3 className="section-title" style={{ fontSize: 18 }}><ChefHat size={20} /> Pedidos Recentes</h3>
        {orders.filter(o => o.status !== 'delivered').length === 0 ? (
          <div className="cart-empty"><p>Nenhum pedido em andamento</p></div>
        ) : (
          orders.filter(o => o.status !== 'delivered').slice(-5).reverse().map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-number"><Receipt size={16} /> #{order.id} • Mesa {order.table}</div>
                <span className={`order-status status-${order.status}`}>
                  {ORDER_STATUS_FLOW.find(s => s.key === order.status)?.label}
                </span>
              </div>
              <div className="order-items">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
              <div className="order-footer">
                <div className="order-time"><Clock size={14} /> {order.time}</div>
                <div className="order-total">R$ {order.total.toFixed(2)}</div>
              </div>
              <div className="order-actions">
                {order.status === 'pending' && <button className="action-btn action-btn-primary" onClick={() => updateOrderStatus(order.id, 'received')}>Confirmar</button>}
                {order.status === 'received' && <button className="action-btn action-btn-primary" onClick={() => updateOrderStatus(order.id, 'preparing')}>Preparar</button>}
                {order.status === 'preparing' && <button className="action-btn action-btn-success" onClick={() => updateOrderStatus(order.id, 'ready')}>Pronto</button>}
                {order.status === 'ready' && <button className="action-btn action-btn-success" onClick={() => updateOrderStatus(order.id, 'delivered')}>Entregue</button>}
              </div>
            </div>
          ))
        )}
      </>
    );
  };
  
  const renderMenuManagement = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 className="section-title" style={{ margin: 0 }}><Menu size={20} /> Cardápio</h3>
        <button className="action-btn action-btn-primary" onClick={() => setEditingItem({ id: null, name: '', description: '', price: '', category: 'entradas', image: '🍽️', available: true })}>
          <Plus size={16} /> Novo
        </button>
      </div>
      
      {menuItems.map(item => (
        <div key={item.id} className="management-card">
          <div className="management-card-avatar">{item.image}</div>
          <div className="management-card-info">
            <div className="management-card-name">{item.name}</div>
            <div className="management-card-meta">R$ {item.price.toFixed(2)} • {item.available ? '✅ Disponível' : '❌ Indisponível'}</div>
          </div>
          <div className="management-card-actions">
            <div className="toggle-switch" style={{ background: item.available ? 'var(--success)' : 'var(--border)' }} onClick={() => {
              setMenuItems(menuItems.map(m => m.id === item.id ? { ...m, available: !m.available } : m));
            }}>
              <div style={{ position: 'absolute', top: 3, left: item.available ? 25 : 3, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
  
  const renderWaiterManagement = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 className="section-title" style={{ margin: 0 }}><UserCog size={20} /> Garçons</h3>
        <button className="action-btn action-btn-primary" onClick={() => setEditingWaiter({ id: null, name: '', email: '', password: '', phone: '', active: true })}>
          <Plus size={16} /> Novo
        </button>
      </div>
      
      {waiters.map(waiter => (
        <div key={waiter.id} className="management-card">
          <div className="management-card-avatar">👤</div>
          <div className="management-card-info">
            <div className="management-card-name">{waiter.name}</div>
            <div className="management-card-meta">{waiter.email} • {waiter.active ? '✅ Ativo' : '❌ Inativo'}</div>
          </div>
          <div className="management-card-actions">
            <div className="toggle-switch" style={{ background: waiter.active ? 'var(--success)' : 'var(--border)' }} onClick={() => {
              setWaiters(waiters.map(w => w.id === waiter.id ? { ...w, active: !w.active } : w));
            }}>
              <div style={{ position: 'absolute', top: 3, left: waiter.active ? 25 : 3, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
  
  const renderAdminNav = () => (
    <nav className="bottom-nav">
      <div className="nav-items">
        <button className={`nav-item ${adminView === 'dashboard' ? 'active' : ''}`} onClick={() => setAdminView('dashboard')}>
          <BarChart3 size={22} />
          <span>Dashboard</span>
          {waiterCalls.length > 0 && <span className="nav-badge">{waiterCalls.length}</span>}
        </button>
        <button className={`nav-item ${adminView === 'menu' ? 'active' : ''}`} onClick={() => setAdminView('menu')}>
          <Menu size={22} />
          <span>Cardápio</span>
        </button>
        <button className={`nav-item ${adminView === 'waiters' ? 'active' : ''}`} onClick={() => setAdminView('waiters')}>
          <UserCog size={22} />
          <span>Garçons</span>
        </button>
        <button className={`nav-item ${adminView === 'settings' ? 'active' : ''}`} onClick={() => setAdminView('settings')}>
          <Settings size={22} />
          <span>Config</span>
        </button>
      </div>
    </nav>
  );
  
  // ==================== RENDER: WAITER APP ====================
  const renderWaiterApp = () => {
    const readyOrders = orders.filter(o => o.status === 'ready');
    const occupiedTables = restaurant.tables.filter(t => t.status === 'occupied');
    
    return (
      <>
        <div className="waiter-header">
          <h2>👋 Olá, {currentUser?.name}</h2>
          <p>Área do Garçom</p>
        </div>
        
        {/* Navigation */}
        <div style={{ padding: '0 20px' }}>
          <div className="tab-pills">
            <button className={`tab-pill ${waiterView === 'calls' ? 'active' : ''}`} onClick={() => setWaiterView('calls')}>
              <Bell size={16} /> Chamados {waiterCalls.length > 0 && `(${waiterCalls.length})`}
            </button>
            <button className={`tab-pill ${waiterView === 'tables' ? 'active' : ''}`} onClick={() => setWaiterView('tables')}>
              <Utensils size={16} /> Mesas
            </button>
            <button className={`tab-pill ${waiterView === 'ready' ? 'active' : ''}`} onClick={() => setWaiterView('ready')}>
              <Package size={16} /> Prontos {readyOrders.length > 0 && `(${readyOrders.length})`}
            </button>
          </div>
        </div>
        
        {/* Chamados */}
        {waiterView === 'calls' && (
          <div style={{ padding: 20 }}>
            {waiterCalls.length > 0 ? (
              <>
                <h3 className="section-title" style={{ fontSize: 18 }}>
                  <Bell size={20} className="bell-ringing" /> Chamados Ativos
                </h3>
                {waiterCalls.map(call => (
                  <div key={call.id} className="waiter-call-card">
                    <div className="waiter-call-header">
                      <div className="waiter-call-table"><Utensils size={16} /> Mesa {call.table}</div>
                      <div className="waiter-call-time"><Clock size={14} /> {call.time}</div>
                    </div>
                    <div className="waiter-call-reason">"{call.reason}"</div>
                    <button className="action-btn action-btn-success" onClick={() => dismissWaiterCall(call.id)} style={{ marginTop: 12, width: '100%' }}>
                      <Check size={16} /> Atender Chamado
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <div className="waiter-empty">
                <div className="waiter-empty-icon">✅</div>
                <h3>Nenhum chamado</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Os chamados de clientes aparecerão aqui</p>
              </div>
            )}
          </div>
        )}
        
        {/* Mesas */}
        {waiterView === 'tables' && !waiterSelectedTable && (
          <div style={{ padding: 20 }}>
            <h3 className="section-title" style={{ fontSize: 18 }}>
              <Utensils size={20} /> Selecione uma Mesa
            </h3>
            
            <div className="tables-grid">
              {restaurant.tables.map(table => {
                const tableOrders = getTableOrders(table.id);
                const hasActiveOrders = tableOrders.length > 0;
                
                return (
                  <button
                    key={table.id}
                    className={`table-btn ${table.status === 'occupied' ? 'occupied' : ''}`}
                    onClick={() => setWaiterSelectedTable(table.id)}
                    style={hasActiveOrders ? { borderColor: 'var(--warning)' } : {}}
                  >
                    {table.id}
                    <span className="table-status">
                      {table.status === 'occupied' ? 'Ocupada' : 'Livre'}
                    </span>
                    {hasActiveOrders && (
                      <span style={{ fontSize: 10, color: 'var(--warning)' }}>
                        {tableOrders.length} pedido(s)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Mesa Selecionada - Tabs */}
        {waiterView === 'tables' && waiterSelectedTable && (
          <div style={{ padding: 20 }}>
            <button className="back-btn" onClick={() => { setWaiterSelectedTable(null); setWaiterCart([]); }}>
              <ArrowLeft size={20} /> Voltar às Mesas
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                Mesa {waiterSelectedTable}
              </h2>
              <span className={`order-status ${restaurant.tables.find(t => t.id === waiterSelectedTable)?.status === 'occupied' ? 'status-preparing' : 'status-delivered'}`}>
                {restaurant.tables.find(t => t.id === waiterSelectedTable)?.status === 'occupied' ? 'Ocupada' : 'Livre'}
              </span>
            </div>
            
            {/* Sub-navigation for table */}
            <div className="tab-pills" style={{ marginBottom: 16 }}>
              <button className={`tab-pill ${!waiterCart.length ? 'active' : ''}`} onClick={() => {}}>
                <Receipt size={16} /> Comanda
              </button>
              <button className={`tab-pill`} style={{ background: 'var(--secondary)', color: 'white' }}>
                <Plus size={16} /> Novo Pedido {waiterCartCount > 0 && `(${waiterCartCount})`}
              </button>
            </div>
            
            {/* Comanda da Mesa */}
            {(() => {
              const tableComanda = getTableComanda(waiterSelectedTable);
              const tableTotal = tableComanda.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              
              if (tableComanda.length > 0) {
                return (
                  <div className="cart-summary" style={{ marginBottom: 20 }}>
                    <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Receipt size={16} /> Comanda da Mesa
                    </h4>
                    {tableComanda.map((item, i) => (
                      <div key={i} className="cart-summary-row">
                        <span>{item.quantity}x {item.name}</span>
                        <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="cart-summary-row" style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8 }}>
                      <span>Subtotal</span>
                      <span>R$ {tableTotal.toFixed(2)}</span>
                    </div>
                    <div className="cart-summary-row">
                      <span>Taxa (10%)</span>
                      <span>R$ {(tableTotal * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="cart-summary-row total">
                      <span>Total</span>
                      <span>R$ {(tableTotal * 1.1).toFixed(2)}</span>
                    </div>
                    <button className="checkout-btn danger" onClick={() => { if(confirm('Fechar e liberar mesa?')) closeTable(waiterSelectedTable); setWaiterSelectedTable(null); }} style={{ marginTop: 12 }}>
                      <Check size={18} /> Fechar Mesa
                    </button>
                  </div>
                );
              }
              return null;
            })()}
            
            {/* Carrinho do Garçom */}
            {waiterCart.length > 0 && (
              <div className="cart-summary" style={{ marginBottom: 20, borderColor: 'var(--secondary)' }}>
                <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--secondary)' }}>
                  <ShoppingCart size={16} /> Novo Pedido
                </h4>
                {waiterCart.map((item, index) => (
                  <div key={`${item.id}-${item.notes}-${index}`} className="cart-item" style={{ padding: 12, marginBottom: 8 }}>
                    <div className="cart-item-image" style={{ width: 40, height: 40, fontSize: 20 }}>{item.image}</div>
                    <div className="cart-item-info">
                      <div className="cart-item-name" style={{ fontSize: 14 }}>{item.name}</div>
                      {item.notes && <div className="cart-item-notes"><AlertCircle size={10} />{item.notes}</div>}
                      <div className="cart-item-price" style={{ fontSize: 13 }}>R$ {(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div className="cart-item-controls">
                      <button className="qty-btn" style={{ width: 28, height: 28 }} onClick={() => waiterUpdateQuantity(item.id, item.notes, -1)}><Minus size={14} /></button>
                      <span className="qty-value" style={{ fontSize: 14 }}>{item.quantity}</span>
                      <button className="qty-btn" style={{ width: 28, height: 28 }} onClick={() => waiterUpdateQuantity(item.id, item.notes, 1)}><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
                <div className="cart-summary-row total" style={{ marginTop: 8 }}>
                  <span>Total do Pedido</span>
                  <span>R$ {waiterCartTotal.toFixed(2)}</span>
                </div>
                <button className="checkout-btn" onClick={waiterSendOrder} style={{ marginTop: 12 }}>
                  <ChefHat size={18} /> Enviar para Cozinha
                </button>
              </div>
            )}
            
            {/* Cardápio */}
            <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Menu size={16} /> Adicionar Itens
            </h4>
            
            <div className="search-container" style={{ padding: 0, marginBottom: 12 }}>
              <div className="search-wrapper">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar no cardápio..."
                  value={waiterSearchQuery}
                  onChange={(e) => setWaiterSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="categories-scroll" style={{ padding: '0 0 12px 0', marginLeft: -4 }}>
              <button className={`category-pill ${waiterSelectedCategory === 'all' ? 'active' : ''}`} onClick={() => setWaiterSelectedCategory('all')} style={{ padding: '8px 14px', fontSize: 12 }}>
                Todos
              </button>
              {categories.map(cat => (
                <button key={cat.id} className={`category-pill ${waiterSelectedCategory === cat.id ? 'active' : ''}`} onClick={() => setWaiterSelectedCategory(cat.id)} style={{ padding: '8px 14px', fontSize: 12 }}>
                  <cat.icon size={14} />
                  {cat.name}
                </button>
              ))}
            </div>
            
            {/* Menu items compacto */}
            {waiterFilteredItems.map(item => (
              <div key={item.id} className="management-card" style={{ opacity: item.available ? 1 : 0.5 }}>
                <div className="management-card-avatar">{item.image}</div>
                <div className="management-card-info" style={{ flex: 1 }}>
                  <div className="management-card-name">{item.name}</div>
                  <div className="management-card-meta">R$ {item.price.toFixed(2)}</div>
                  <input
                    type="text"
                    placeholder="Observação..."
                    value={waiterCardNotes[item.id] || ''}
                    onChange={(e) => setWaiterCardNotes({ ...waiterCardNotes, [item.id]: e.target.value })}
                    className="form-input"
                    style={{ marginTop: 8, padding: '6px 10px', fontSize: 12 }}
                    disabled={!item.available}
                  />
                </div>
                <button 
                  className="action-btn action-btn-primary" 
                  style={{ padding: '10px 16px' }}
                  onClick={() => waiterAddToCart(item, waiterCardNotes[item.id] || '')}
                  disabled={!item.available}
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Pedidos Prontos */}
        {waiterView === 'ready' && (
          <div style={{ padding: 20 }}>
            <h3 className="section-title" style={{ fontSize: 18 }}><Package size={20} /> Pedidos Prontos para Entrega</h3>
            {readyOrders.length === 0 ? (
              <div className="waiter-empty">
                <div className="waiter-empty-icon">✅</div>
                <h3>Tudo entregue!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Nenhum pedido pronto para entrega</p>
              </div>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-number"><Receipt size={16} /> #{order.id}</div>
                    <span className="order-status status-ready">Pronto!</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className="table-badge" style={{ fontSize: 12, padding: '4px 10px' }}>
                      <Utensils size={12} /> Mesa {order.table}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      <Clock size={12} /> {order.time}
                    </span>
                  </div>
                  <div className="order-items" style={{ marginBottom: 12 }}>
                    {order.items.map((item, i) => (
                      <div key={i}>
                        {item.quantity}x {item.name}
                        {item.notes && <span style={{ color: 'var(--warning)', fontSize: 12 }}> ({item.notes})</span>}
                      </div>
                    ))}
                  </div>
                  <button className="action-btn action-btn-success" onClick={() => updateOrderStatus(order.id, 'delivered')} style={{ width: '100%' }}>
                    <Check size={16} /> Marcar como Entregue
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Logout button */}
        <div style={{ padding: 20 }}>
          <button className="checkout-btn secondary" onClick={handleLogout}>
            <LogOut size={20} /> Sair
          </button>
        </div>
      </>
    );
  };
  
  // ==================== RENDER: KITCHEN APP ====================
  const renderKitchenApp = () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const receivedOrders = orders.filter(o => o.status === 'received');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    
    return (
      <>
        {pendingOrders.length > 0 && (
          <div className="new-order-alert">
            🔔 {pendingOrders.length} NOVO{pendingOrders.length > 1 ? 'S' : ''} PEDIDO{pendingOrders.length > 1 ? 'S' : ''}!
          </div>
        )}
        
        <div className="kitchen-header" style={{ marginTop: pendingOrders.length > 0 ? 44 : 0 }}>
          <h2>👨‍🍳 Cozinha</h2>
          <p>Olá, {currentUser?.name}</p>
        </div>
        
        <div className="kitchen-stats">
          <div className="kitchen-stat">
            <div className="kitchen-stat-value" style={{ color: 'var(--warning)' }}>{pendingOrders.length}</div>
            <div className="kitchen-stat-label">Novos</div>
          </div>
          <div className="kitchen-stat">
            <div className="kitchen-stat-value" style={{ color: '#3B82F6' }}>{receivedOrders.length}</div>
            <div className="kitchen-stat-label">Recebidos</div>
          </div>
          <div className="kitchen-stat">
            <div className="kitchen-stat-value" style={{ color: '#8B5CF6' }}>{preparingOrders.length}</div>
            <div className="kitchen-stat-label">Preparando</div>
          </div>
        </div>
        
        <div className="kitchen-section">
          {/* Pedidos Pendentes */}
          {pendingOrders.length > 0 && (
            <>
              <div className="kitchen-section-title">
                <Bell size={18} /> Novos Pedidos
                <span className="count">{pendingOrders.length}</span>
              </div>
              {pendingOrders.map(order => (
                <div key={order.id} className="kitchen-order-card pending">
                  <div className="kitchen-order-header">
                    <div className="kitchen-order-number">#{order.id}</div>
                    <div className="kitchen-order-table">
                      <Utensils size={14} /> Mesa {order.table}
                    </div>
                  </div>
                  <div className="kitchen-order-time">
                    <Clock size={14} /> {order.time}
                  </div>
                  <div className="kitchen-order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="kitchen-order-item">
                        <div className="kitchen-item-qty">{item.quantity}</div>
                        <div className="kitchen-item-info">
                          <div className="kitchen-item-name">{item.image} {item.name}</div>
                          {item.notes && (
                            <div className="kitchen-item-notes">
                              <AlertCircle size={12} /> {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="kitchen-order-actions">
                    <button className="kitchen-btn kitchen-btn-confirm" onClick={() => updateOrderStatus(order.id, 'received')}>
                      <CheckCircle2 size={18} /> Confirmar Recebimento
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* Pedidos Recebidos */}
          {receivedOrders.length > 0 && (
            <>
              <div className="kitchen-section-title" style={{ marginTop: 24 }}>
                <CheckCircle2 size={18} /> Aguardando Preparo
                <span className="count" style={{ background: '#3B82F6' }}>{receivedOrders.length}</span>
              </div>
              {receivedOrders.map(order => (
                <div key={order.id} className="kitchen-order-card">
                  <div className="kitchen-order-header">
                    <div className="kitchen-order-number">#{order.id}</div>
                    <div className="kitchen-order-table">
                      <Utensils size={14} /> Mesa {order.table}
                    </div>
                  </div>
                  <div className="kitchen-order-time">
                    <Clock size={14} /> {order.time}
                  </div>
                  <div className="kitchen-order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="kitchen-order-item">
                        <div className="kitchen-item-qty">{item.quantity}</div>
                        <div className="kitchen-item-info">
                          <div className="kitchen-item-name">{item.image} {item.name}</div>
                          {item.notes && (
                            <div className="kitchen-item-notes">
                              <AlertCircle size={12} /> {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="kitchen-order-actions">
                    <button className="kitchen-btn kitchen-btn-prepare" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                      <ChefHat size={18} /> Iniciar Preparo
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* Pedidos em Preparo */}
          {preparingOrders.length > 0 && (
            <>
              <div className="kitchen-section-title" style={{ marginTop: 24 }}>
                <ChefHat size={18} /> Em Preparo
                <span className="count" style={{ background: '#8B5CF6' }}>{preparingOrders.length}</span>
              </div>
              {preparingOrders.map(order => (
                <div key={order.id} className="kitchen-order-card preparing">
                  <div className="kitchen-order-header">
                    <div className="kitchen-order-number">#{order.id}</div>
                    <div className="kitchen-order-table">
                      <Utensils size={14} /> Mesa {order.table}
                    </div>
                  </div>
                  <div className="kitchen-order-time">
                    <Clock size={14} /> {order.time}
                  </div>
                  <div className="kitchen-order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="kitchen-order-item">
                        <div className="kitchen-item-qty">{item.quantity}</div>
                        <div className="kitchen-item-info">
                          <div className="kitchen-item-name">{item.image} {item.name}</div>
                          {item.notes && (
                            <div className="kitchen-item-notes">
                              <AlertCircle size={12} /> {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="kitchen-order-actions">
                    <button className="kitchen-btn kitchen-btn-ready" onClick={() => updateOrderStatus(order.id, 'ready')}>
                      <UtensilsCrossed size={18} /> Marcar como Pronto
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* Estado vazio */}
          {pendingOrders.length === 0 && receivedOrders.length === 0 && preparingOrders.length === 0 && (
            <div className="kitchen-empty">
              <div className="kitchen-empty-icon">✅</div>
              <h3>Nenhum pedido no momento</h3>
              <p>Novos pedidos aparecerão aqui automaticamente</p>
            </div>
          )}
        </div>
        
        <div style={{ padding: 20 }}>
          <button className="checkout-btn secondary" onClick={handleLogout}>
            <LogOut size={20} /> Sair
          </button>
        </div>
      </>
    );
  };
  
  // ==================== RENDER: MODALS ====================
  const renderPaymentModal = () => (
    <div className="modal-overlay" onClick={() => setShowPayment(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="section-title" style={{ justifyContent: 'center' }}><CreditCard size={22} /> Pagamento</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <button className={`auth-type-btn ${paymentMethod === 'pix' ? 'active' : ''}`} onClick={() => setPaymentMethod('pix')}>
            <div className="auth-type-icon" style={{ background: '#00B8A9' }}><QrCode size={20} /></div>
            <div className="auth-type-info"><h4>PIX</h4><p>Instantâneo</p></div>
          </button>
          <button className={`auth-type-btn ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>
            <div className="auth-type-icon" style={{ background: '#6366F1' }}><CreditCard size={20} /></div>
            <div className="auth-type-info"><h4>Cartão</h4><p>Crédito ou Débito</p></div>
          </button>
        </div>
        
        {paymentMethod === 'pix' && (
          <div style={{ background: 'white', padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 80, textAlign: 'center' }}>📱</div>
            <p style={{ textAlign: 'center', color: '#333', fontSize: 14 }}>Escaneie o QR Code</p>
          </div>
        )}
        
        <div className="cart-summary">
          <div className="cart-summary-row total" style={{ border: 'none', padding: 0, margin: 0 }}>
            <span>Total</span>
            <span>R$ {((comandaTotal * 1.1) / splitCount).toFixed(2)}</span>
          </div>
        </div>
        
        <button className="checkout-btn success" onClick={handlePayment} style={{ marginTop: 16 }}>
          <Check size={20} /> Confirmar Pagamento
        </button>
      </div>
    </div>
  );
  
  const renderSuccessModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon"><ChefHat size={36} color="white" /></div>
        <h2 className="modal-title">Pedido Enviado!</h2>
        <p className="modal-text">Acompanhe o status em tempo real</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-secondary)' }}>
          <Loader size={16} className="loader" /> Redirecionando...
        </div>
      </div>
    </div>
  );
  
  const renderCallWaiterModal = () => (
    <div className="modal-overlay" onClick={() => setShowCallWaiter(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}><Bell size={36} color="white" /></div>
        <h2 className="modal-title">Chamar Garçom</h2>
        
        <div className="quick-reasons">
          {['🍽️ Talheres', '💧 Água', '❓ Dúvida', '📋 Pedir', '🧾 Conta'].map(r => (
            <button key={r} className={`quick-reason-btn ${callReason === r ? 'active' : ''}`} onClick={() => setCallReason(r)}>{r}</button>
          ))}
        </div>
        
        <textarea className="call-reason-input" placeholder="Ou descreva..." value={callReason} onChange={(e) => setCallReason(e.target.value)} />
        
        <button className="checkout-btn" onClick={handleCallWaiter} style={{ marginTop: 16 }}><Bell size={20} /> Chamar</button>
        <button className="checkout-btn secondary" onClick={() => setShowCallWaiter(false)} style={{ marginTop: 8 }}>Cancelar</button>
      </div>
    </div>
  );
  
  // Modal Editar Perfil
  const renderEditProfileModal = () => (
    <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="modal-title">Editar Perfil</h2>
          <button onClick={() => setShowEditProfile(false)} style={{ background: 'var(--bg-card-hover)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <X size={20} />
          </button>
        </div>
        
        <div className="form-group">
          <label className="form-label">Nome completo</label>
          <input type="text" className="form-input" value={editProfileData.name || ''} onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })} />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={editProfileData.email || ''} disabled style={{ opacity: 0.6 }} />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>O email não pode ser alterado</p>
        </div>
        
        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input type="tel" className="form-input" placeholder="(11) 99999-9999" value={editProfileData.phone || ''} onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })} />
        </div>
        
        <button className="checkout-btn" onClick={handleUpdateProfile}>
          <Save size={20} /> Salvar Alterações
        </button>
      </div>
    </div>
  );
  
  // Modal Detalhes do Item
  const renderItemDetailModal = () => {
    if (!showItemDetail) return null;
    const item = showItemDetail;
    
    return (
      <div className="modal-overlay" onClick={() => setShowItemDetail(null)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
          <button onClick={() => setShowItemDetail(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 1 }}>
            <X size={20} />
          </button>
          
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', margin: -24, marginBottom: 20, padding: 40, textAlign: 'center', borderRadius: '20px 20px 0 0', position: 'relative' }}>
            <div style={{ fontSize: 80 }}>{item.image}</div>
            <button onClick={() => toggleFavorite(item.id)} style={{ position: 'absolute', top: 16, left: 16, background: favorites.includes(item.id) ? 'white' : 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: favorites.includes(item.id) ? 'var(--danger)' : 'white' }}>
              <Heart size={20} fill={favorites.includes(item.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, flex: 1 }}>{item.name}</h2>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--secondary)' }}>R$ {item.price.toFixed(2)}</span>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{item.description}</p>
          
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: 'var(--text-muted)' }}>
              <Star size={16} fill="#FFD700" color="#FFD700" /> {item.rating}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: 'var(--text-muted)' }}>
              <Clock size={16} /> {item.prepTime}
            </span>
            {item.calories && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: 'var(--text-muted)' }}>
                <Flame size={16} /> {item.calories} kcal
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {item.isPopular && <span className="badge badge-popular"><Flame size={12} /> Popular</span>}
            {item.isVegan && <span className="badge badge-vegan"><Leaf size={12} /> Vegano</span>}
            {!item.available && <span className="badge badge-unavailable">Indisponível</span>}
          </div>
          
          {item.available && (
            <>
              <div className="form-group">
                <label className="form-label">Observações</label>
                <input type="text" className="form-input" placeholder="Ex: Sem cebola, bem passado..." value={cardNotes[item.id] || ''} onChange={(e) => setCardNotes({ ...cardNotes, [item.id]: e.target.value })} />
              </div>
              
              <button className="checkout-btn" onClick={() => { addToCart(item, cardNotes[item.id] || ''); setShowItemDetail(null); }}>
                <Plus size={20} /> Adicionar ao Pedido
              </button>
            </>
          )}
        </div>
      </div>
    );
  };
  
  // ==================== MAIN RENDER ====================
  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        <div className="content-wrapper">
          {notification && (
            <div className="notification">
              <div className="notification-icon" style={{ background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: notification.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                <Check size={20} />
              </div>
              <div className="notification-content">
                <div className="notification-text">{notification.message}</div>
              </div>
            </div>
          )}
          
          {!isAuthenticated && renderAuth()}
          
          {isAuthenticated && currentUser?.type === 'customer' && (
            !selectedTable ? (
              <>
                {renderCustomerHeader()}
                {renderTableSelection()}
                <button className="checkout-btn secondary" style={{ margin: 20 }} onClick={handleLogout}><LogOut size={20} /> Sair</button>
              </>
            ) : (
              <>
                {renderCustomerHeader()}
                {currentView === 'menu' && renderMenu()}
                {currentView === 'cart' && renderCart()}
                {currentView === 'tracking' && renderTracking()}
                {currentView === 'profile' && renderProfile()}
                {renderCustomerNav()}
                <button className="call-waiter-fab" onClick={() => setShowCallWaiter(true)}><Bell size={24} /></button>
              </>
            )
          )}
          
          {isAuthenticated && currentUser?.type === 'restaurant' && (
            <>
              <header className="header">
                <div className="header-content">
                  <div className="logo-section">
                    <span className="logo-icon">🍽️</span>
                    <span className="logo-text">Admin</span>
                  </div>
                  <div className="header-user">
                    <span className="header-user-name">{currentUser?.name}</span>
                    <button className="icon-btn" onClick={handleLogout}><LogOut size={18} /></button>
                  </div>
                </div>
              </header>
              <div style={{ padding: 20 }}>
                {adminView === 'dashboard' && renderAdminDashboard()}
                {adminView === 'menu' && renderMenuManagement()}
                {adminView === 'waiters' && renderWaiterManagement()}
                {adminView === 'settings' && (
                  <>
                    <h2 className="section-title" style={{ marginBottom: 20 }}><Settings size={24} /> Configurações</h2>
                    
                    {/* Informações do Restaurante */}
                    <div className="cart-summary" style={{ marginBottom: 20 }}>
                      <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Store size={18} /> Informações do Restaurante</h4>
                      
                      <div className="form-group">
                        <label className="form-label">Nome do Restaurante</label>
                        <input type="text" className="form-input" value={restaurant.name} onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })} />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Endereço</label>
                        <input type="text" className="form-input" value={restaurant.address} onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })} />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Telefone</label>
                        <input type="text" className="form-input" value={restaurant.phone} onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })} />
                      </div>
                    </div>
                    
                    {/* Configurações de Operação */}
                    <div className="cart-summary" style={{ marginBottom: 20 }}>
                      <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={18} /> Operação</h4>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>Taxa de Serviço</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Percentual sobre a conta</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="number" className="form-input" style={{ width: 80, textAlign: 'center' }} value={restaurant.serviceFee || 10} onChange={(e) => setRestaurant({ ...restaurant, serviceFee: parseInt(e.target.value) || 0 })} />
                          <span>%</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>Total de Mesas</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Capacidade do restaurante</div>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--secondary)' }}>{restaurant.tables?.length || 20}</div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>Mesas Ocupadas</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Neste momento</div>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--success)' }}>{restaurant.tables?.filter(t => t.status === 'occupied').length || 0}</div>
                      </div>
                    </div>
                    
                    {/* Wi-Fi */}
                    <div className="cart-summary" style={{ marginBottom: 20 }}>
                      <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Wifi size={18} /> Wi-Fi para Clientes</h4>
                      
                      <div className="form-group">
                        <label className="form-label">Nome da Rede</label>
                        <input type="text" className="form-input" placeholder="Nome do Wi-Fi" defaultValue="Bistro_Guest" />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Senha</label>
                        <input type="text" className="form-input" placeholder="Senha do Wi-Fi" defaultValue="bemvindo123" />
                      </div>
                    </div>
                    
                    {/* Equipe Cozinha */}
                    <div className="cart-summary" style={{ marginBottom: 20 }}>
                      <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><ChefHat size={18} /> Equipe da Cozinha</h4>
                      
                      {kitchenUsers.map(user => (
                        <div key={user.id} className="management-card" style={{ margin: '0 -20px', padding: '12px 20px', borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border)' }}>
                          <div className="management-card-avatar">{user.avatar || '👨‍🍳'}</div>
                          <div className="management-card-info">
                            <div className="management-card-name">{user.name}</div>
                            <div className="management-card-meta">{user.role} • {user.email}</div>
                          </div>
                          <div className={`toggle-switch ${user.active ? 'active' : ''}`} onClick={() => setKitchenUsers(kitchenUsers.map(k => k.id === user.id ? { ...k, active: !k.active } : k))} />
                        </div>
                      ))}
                    </div>
                    
                    {/* Dados & Cache */}
                    <div className="cart-summary" style={{ marginBottom: 20 }}>
                      <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Database size={18} /> Dados</h4>
                      
                      <button className="checkout-btn secondary" style={{ marginBottom: 8 }} onClick={() => { localStorage.clear(); showNotificationMsg('Cache limpo! Recarregue a página.'); }}>
                        <Trash2 size={18} /> Limpar Cache Local
                      </button>
                      
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                        Isso irá apagar todos os dados salvos localmente (pedidos, usuários, etc)
                      </p>
                    </div>
                    
                    {/* Sobre */}
                    <div className="cart-summary">
                      <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Info size={18} /> Sobre o Sistema</h4>
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p style={{ marginBottom: 8 }}>Sistema de Gestão de Restaurante</p>
                        <p style={{ fontSize: 13, marginBottom: 8 }}>Versão 1.0.0</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Desenvolvido com ❤️</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {renderAdminNav()}
            </>
          )}
          
          {isAuthenticated && currentUser?.type === 'waiter' && renderWaiterApp()}
          
          {isAuthenticated && currentUser?.type === 'kitchen' && renderKitchenApp()}
          
          {showPayment && renderPaymentModal()}
          {showSuccess && renderSuccessModal()}
          {showCallWaiter && renderCallWaiterModal()}
          {showEditProfile && renderEditProfileModal()}
          {showItemDetail && renderItemDetailModal()}
        </div>
      </div>
    </>
  );
}
