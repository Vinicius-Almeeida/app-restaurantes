'use client';

import { Search } from 'lucide-react';
import { useGastroStore } from '../../stores/useGastroStore';
import { CATEGORIES } from '../../constants';
import { MenuCard } from '../shared';
import type { CategoryId } from '../../types';

export function MenuView() {
  const menuItems = useGastroStore((state) => state.menuItems);
  const selectedCategory = useGastroStore((state) => state.selectedCategory);
  const searchQuery = useGastroStore((state) => state.searchQuery);
  const setSelectedCategory = useGastroStore((state) => state.setSelectedCategory);
  const setSearchQuery = useGastroStore((state) => state.setSearchQuery);
  const addToCart = useGastroStore((state) => state.addToCart);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="gastro-content">
      {/* Search Bar */}
      <div style={{ padding: '16px 16px 0' }}>
        <div className="form-input-icon">
          <Search size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar no cardápio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: 16,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: 'none',
            background: selectedCategory === 'all' ? 'var(--secondary)' : 'var(--bg-card)',
            color: selectedCategory === 'all' ? 'white' : 'var(--text-secondary)',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Todos
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as CategoryId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 20,
                border: 'none',
                background: isActive ? cat.color : 'var(--bg-card)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Menu Grid */}
      <div className="menu-grid">
        {filteredItems.map((item) => (
          <MenuCard key={item.id} item={item} onAddToCart={addToCart} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          Nenhum item encontrado
        </div>
      )}
    </div>
  );
}
