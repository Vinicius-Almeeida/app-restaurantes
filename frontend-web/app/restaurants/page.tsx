'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { RestaurantCard } from '@/components/restaurant';
import { LoadingScreen } from '@/components/common';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  acceptingOrders: boolean;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    } else {
      setFilteredRestaurants(restaurants);
    }
  }, [searchTerm, restaurants]);

  const fetchRestaurants = async () => {
    try {
      const response = await apiClient.get<{ data: Restaurant[] }>('/restaurants');
      const activeRestaurants = response.data.data.filter((r) => r.isActive);
      setRestaurants(activeRestaurants);
      setFilteredRestaurants(activeRestaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Erro ao carregar restaurantes');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando restaurantes..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurantes</h1>
          <p className="text-gray-600">Escolha um restaurante e faça seu pedido</p>
        </div>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Buscar por nome, tipo de comida ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'Nenhum restaurante encontrado' : 'Nenhum restaurante disponível'}
            </h2>
            <p className="text-gray-500">
              {searchTerm
                ? 'Tente buscar por outro termo'
                : 'Ainda não há restaurantes cadastrados'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} {...restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
