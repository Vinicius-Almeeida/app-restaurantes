'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { listUsers, type User } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon,
} from 'lucide-react';

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', className: 'bg-purple-100 text-purple-800' },
  ADMIN: { label: 'Admin', className: 'bg-purple-100 text-purple-800' },
  CONSULTANT: { label: 'Consultor', className: 'bg-blue-100 text-blue-800' },
  RESTAURANT_OWNER: { label: 'Proprietario', className: 'bg-orange-100 text-orange-800' },
  WAITER: { label: 'Garcom', className: 'bg-green-100 text-green-800' },
  KITCHEN: { label: 'Cozinha', className: 'bg-yellow-100 text-yellow-800' },
  CUSTOMER: { label: 'Cliente', className: 'bg-gray-100 text-gray-800' },
};

function getRoleBadge(role: string) {
  return ROLE_BADGES[role] || { label: role, className: 'bg-gray-100 text-gray-800' };
}

function UsersPageContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(debouncedSearch && { search: debouncedSearch }),
      };

      const response = await listUsers(params);
      setUsers(Array.isArray(response.users) ? response.users : []);
      setTotalPages(response.pages);
      setTotalUsers(response.total);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, roleFilter, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600">Gerencie todos os usuarios da plataforma</p>
        </div>
        <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por email ou nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="CONSULTANT">Consultor</SelectItem>
                <SelectItem value="RESTAURANT_OWNER">Proprietario</SelectItem>
                <SelectItem value="WAITER">Garcom</SelectItem>
                <SelectItem value="KITCHEN">Cozinha</SelectItem>
                <SelectItem value="CUSTOMER">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {users.length} de {totalUsers} usuarios
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Lista de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">Nenhum usuario encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Nome</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Role</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Email Verificado</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Criado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const roleBadge = getRoleBadge(user.role);
                      return (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium">{user.email}</td>
                          <td className="py-4 px-4">{user.fullName}</td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className={roleBadge.className}>
                              {roleBadge.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {user.emailVerified ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                            )}
                          </td>
                          <td className="py-4 px-4 text-gray-600">{formatDate(user.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">Pagina {currentPage} de {totalPages}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => p - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Proxima <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <UsersPageContent />
    </ProtectedRoute>
  );
}
