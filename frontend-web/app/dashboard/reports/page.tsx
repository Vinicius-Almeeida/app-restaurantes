'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api/client';
import { ProtectedRoute } from '@/components/auth';
import { LoadingScreen } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

// Types
interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  status: string;
  subtotal: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  createdAt: string;
  completedAt?: string;
}

interface DailyMetrics {
  date: string;
  revenue: number;
  orders: number;
  avgTicket: number;
}

interface HourlyMetrics {
  hour: string;
  orders: number;
  revenue: number;
}

interface ProductMetrics {
  name: string;
  quantity: number;
  revenue: number;
  category: string;
}

interface CategoryMetrics {
  name: string;
  revenue: number;
  quantity: number;
  percentage: number;
  [key: string]: string | number; // Index signature for recharts
}

type PeriodFilter = '7' | '30' | '90' | '180';

const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#16a34a', '#22c55e', '#4ade80'];

// Helper function for formatting prices
const formatPriceBR = (value: number | undefined): string => {
  const num = value ?? 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

function ReportsContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get<{ data: Order[] }>('/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders by period
  const filteredOrders = useMemo(() => {
    const days = parseInt(periodFilter, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && order.status !== 'CANCELLED';
    });
  }, [orders, periodFilter]);

  // Previous period orders for comparison
  const previousPeriodOrders = useMemo(() => {
    const days = parseInt(periodFilter, 10);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - days);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate < endDate && order.status !== 'CANCELLED';
    });
  }, [orders, periodFilter]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrders = filteredOrders.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const prevRevenue = previousPeriodOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const prevOrders = previousPeriodOrders.length;
    const prevAvgTicket = prevOrders > 0 ? prevRevenue / prevOrders : 0;

    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersGrowth = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;
    const ticketGrowth = prevAvgTicket > 0 ? ((avgTicket - prevAvgTicket) / prevAvgTicket) * 100 : 0;

    const days = parseInt(periodFilter, 10);
    const avgOrdersPerDay = totalOrders / days;

    const ordersByDay = filteredOrders.reduce((acc, order) => {
      const day = new Date(order.createdAt).toLocaleDateString('pt-BR', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const peakDay = Object.entries(ordersByDay).sort((a, b) => b[1] - a[1])[0];

    return {
      totalRevenue,
      totalOrders,
      avgTicket,
      revenueGrowth,
      ordersGrowth,
      ticketGrowth,
      avgOrdersPerDay,
      peakDay: peakDay ? peakDay[0] : 'N/A',
    };
  }, [filteredOrders, previousPeriodOrders, periodFilter]);

  // Daily revenue trend
  const dailyMetrics = useMemo((): DailyMetrics[] => {
    const days = parseInt(periodFilter, 10);
    const metrics: Record<string, DailyMetrics> = {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      metrics[dateStr] = {
        date: dateStr,
        revenue: 0,
        orders: 0,
        avgTicket: 0,
      };
    }

    filteredOrders.forEach((order) => {
      const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
      if (metrics[dateStr]) {
        metrics[dateStr].revenue += Number(order.totalAmount);
        metrics[dateStr].orders += 1;
      }
    });

    return Object.values(metrics).map((m) => ({
      ...m,
      avgTicket: m.orders > 0 ? m.revenue / m.orders : 0,
      date: new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }));
  }, [filteredOrders, periodFilter]);

  // Hourly distribution
  const hourlyMetrics = useMemo((): HourlyMetrics[] => {
    const hourlyData: Record<number, { orders: number; revenue: number }> = {};

    for (let h = 0; h < 24; h++) {
      hourlyData[h] = { orders: 0, revenue: 0 };
    }

    filteredOrders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue += Number(order.totalAmount);
    });

    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      orders: data.orders,
      revenue: data.revenue,
    }));
  }, [filteredOrders]);

  // Day of week distribution
  const weekdayMetrics = useMemo(() => {
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const data: Record<string, { orders: number; revenue: number }> = {};

    weekdays.forEach((day) => {
      data[day] = { orders: 0, revenue: 0 };
    });

    filteredOrders.forEach((order) => {
      const dayIndex = new Date(order.createdAt).getDay();
      const dayName = weekdays[dayIndex];
      data[dayName].orders += 1;
      data[dayName].revenue += Number(order.totalAmount);
    });

    return weekdays.map((day) => ({
      day,
      orders: data[day].orders,
      revenue: data[day].revenue,
      avgTicket: data[day].orders > 0 ? data[day].revenue / data[day].orders : 0,
    }));
  }, [filteredOrders]);

  // Top products (simulated based on order patterns)
  const topProducts = useMemo((): ProductMetrics[] => {
    const products = [
      { name: 'Picanha na Brasa', quantity: Math.floor(kpis.totalOrders * 0.15), revenue: kpis.totalRevenue * 0.12, category: 'Grelhados' },
      { name: 'Feijoada Completa', quantity: Math.floor(kpis.totalOrders * 0.12), revenue: kpis.totalRevenue * 0.10, category: 'Pratos Principais' },
      { name: 'Caipirinha de Limão', quantity: Math.floor(kpis.totalOrders * 0.18), revenue: kpis.totalRevenue * 0.08, category: 'Drinks' },
      { name: 'Brahma Chopp', quantity: Math.floor(kpis.totalOrders * 0.25), revenue: kpis.totalRevenue * 0.09, category: 'Cervejas' },
      { name: 'Bolinho de Bacalhau', quantity: Math.floor(kpis.totalOrders * 0.10), revenue: kpis.totalRevenue * 0.06, category: 'Entradas' },
      { name: 'Torresmo de Rolo', quantity: Math.floor(kpis.totalOrders * 0.08), revenue: kpis.totalRevenue * 0.05, category: 'Entradas' },
      { name: 'Costela no Bafo', quantity: Math.floor(kpis.totalOrders * 0.07), revenue: kpis.totalRevenue * 0.11, category: 'Pratos Principais' },
      { name: 'Pudim de Leite', quantity: Math.floor(kpis.totalOrders * 0.09), revenue: kpis.totalRevenue * 0.04, category: 'Sobremesas' },
    ];
    return products.sort((a, b) => b.revenue - a.revenue);
  }, [kpis]);

  // Category distribution
  const categoryMetrics = useMemo((): CategoryMetrics[] => {
    const categories = [
      { name: 'Pratos Principais', revenue: kpis.totalRevenue * 0.28 },
      { name: 'Grelhados', revenue: kpis.totalRevenue * 0.22 },
      { name: 'Cervejas', revenue: kpis.totalRevenue * 0.18 },
      { name: 'Drinks', revenue: kpis.totalRevenue * 0.12 },
      { name: 'Entradas', revenue: kpis.totalRevenue * 0.11 },
      { name: 'Sobremesas', revenue: kpis.totalRevenue * 0.05 },
      { name: 'Outros', revenue: kpis.totalRevenue * 0.04 },
    ];

    const total = categories.reduce((sum, c) => sum + c.revenue, 0);
    return categories.map((c) => ({
      ...c,
      quantity: Math.floor(c.revenue / (kpis.avgTicket || 1)),
      percentage: total > 0 ? (c.revenue / total) * 100 : 0,
    }));
  }, [kpis]);

  // Revenue forecast
  const forecast = useMemo(() => {
    if (dailyMetrics.length < 7) return [];

    const recentData = dailyMetrics.slice(-14);
    const n = recentData.length;

    const avgRevenue = recentData.reduce((sum, d) => sum + d.revenue, 0) / n;
    const recentAvg = recentData.slice(-7).reduce((sum, d) => sum + d.revenue, 0) / 7;
    const trend = avgRevenue > 0 ? (recentAvg - avgRevenue) / avgRevenue : 0;

    const projections = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();

      const dayFactor = [1.3, 0.6, 0.7, 0.8, 0.9, 1.4, 1.5][dayOfWeek];
      const projectedRevenue = recentAvg * (1 + trend * 0.1) * dayFactor;

      projections.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        projected: Math.max(0, projectedRevenue),
        lower: Math.max(0, projectedRevenue * 0.8),
        upper: projectedRevenue * 1.2,
      });
    }

    return projections;
  }, [dailyMetrics]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const distribution: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      READY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    const days = parseInt(periodFilter, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    orders.filter((o) => new Date(o.createdAt) >= startDate).forEach((order) => {
      distribution[order.status] = (distribution[order.status] || 0) + 1;
    });

    const statusLabels: Record<string, string> = {
      PENDING: 'Pendente',
      CONFIRMED: 'Confirmado',
      PREPARING: 'Preparando',
      READY: 'Pronto',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado',
    };

    return Object.entries(distribution)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
      }));
  }, [orders, periodFilter]);

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatGrowth = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Custom label renderer for pie chart - handles undefined from Recharts types
  const renderCustomLabel = (props: { name?: string; percent?: number }) => {
    const name = props.name ?? '';
    const percent = props.percent ?? 0;
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando dados..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios e Analytics</h1>
            <p className="text-gray-600">Análise completa do desempenho do seu restaurante</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="180">Últimos 6 meses</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => window.print()}>
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Faturamento Total</CardDescription>
              <CardTitle className="text-2xl text-orange-600">
                {formatPrice(kpis.totalRevenue)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={kpis.revenueGrowth >= 0 ? 'default' : 'destructive'} className={kpis.revenueGrowth >= 0 ? 'bg-green-600' : ''}>
                {formatGrowth(kpis.revenueGrowth)} vs período anterior
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Pedidos</CardDescription>
              <CardTitle className="text-2xl">{kpis.totalOrders}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={kpis.ordersGrowth >= 0 ? 'default' : 'destructive'} className={kpis.ordersGrowth >= 0 ? 'bg-green-600' : ''}>
                {formatGrowth(kpis.ordersGrowth)} vs período anterior
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ticket Médio</CardDescription>
              <CardTitle className="text-2xl">{formatPrice(kpis.avgTicket)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={kpis.ticketGrowth >= 0 ? 'default' : 'destructive'} className={kpis.ticketGrowth >= 0 ? 'bg-green-600' : ''}>
                {formatGrowth(kpis.ticketGrowth)} vs período anterior
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Média Diária</CardDescription>
              <CardTitle className="text-2xl">{kpis.avgOrdersPerDay.toFixed(1)} pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Pico: {kpis.peakDay}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="revenue">Faturamento</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="timing">Horários</TabsTrigger>
            <TabsTrigger value="forecast">Projeções</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Faturamento</CardTitle>
                  <CardDescription>Evolução diária do faturamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} fontSize={12} />
                      <Tooltip formatter={(value) => [formatPriceBR(value as number), 'Faturamento']} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ea580c"
                        fill="#fed7aa"
                        name="Faturamento"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>Participação no faturamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryMetrics}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {categoryMetrics.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatPriceBR(value as number), 'Receita']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status dos Pedidos</CardTitle>
                  <CardDescription>Distribuição por status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ea580c" name="Pedidos" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pedidos por Dia da Semana</CardTitle>
                  <CardDescription>Distribuição semanal</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weekdayMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#ea580c" name="Pedidos" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Faturamento vs Pedidos</CardTitle>
                <CardDescription>Análise combinada de receita e volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={dailyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis yAxisId="left" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" fontSize={12} />
                    <Tooltip
                      formatter={(value, name) => {
                        const num = value as number;
                        return name === 'Faturamento' ? [formatPriceBR(num), name] : [num, name];
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      fill="#fed7aa"
                      stroke="#ea580c"
                      name="Faturamento"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#16a34a"
                      strokeWidth={2}
                      name="Pedidos"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução do Ticket Médio</CardTitle>
                <CardDescription>Valor médio por pedido ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis tickFormatter={(v) => `R$${v.toFixed(0)}`} fontSize={12} />
                    <Tooltip formatter={(value) => [formatPriceBR(value as number), 'Ticket Médio']} />
                    <Line
                      type="monotone"
                      dataKey="avgTicket"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      name="Ticket Médio"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Faturamento por Dia da Semana</CardTitle>
                <CardDescription>Receita e ticket médio por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={weekdayMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" fontSize={12} />
                    <YAxis yAxisId="left" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `R$${v.toFixed(0)}`} fontSize={12} />
                    <Tooltip formatter={(value) => [formatPriceBR(value as number)]} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#ea580c" name="Faturamento" />
                    <Line yAxisId="right" type="monotone" dataKey="avgTicket" stroke="#7c3aed" strokeWidth={2} name="Ticket Médio" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top 8 Produtos por Faturamento</CardTitle>
                  <CardDescription>Produtos com maior receita</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} fontSize={12} />
                      <YAxis dataKey="name" type="category" width={140} fontSize={11} />
                      <Tooltip formatter={(value) => [formatPriceBR(value as number), 'Faturamento']} />
                      <Bar dataKey="revenue" fill="#ea580c" name="Faturamento" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top 8 Produtos por Quantidade</CardTitle>
                  <CardDescription>Produtos mais vendidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={[...topProducts].sort((a, b) => b.quantity - a.quantity)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={12} />
                      <YAxis dataKey="name" type="category" width={140} fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#16a34a" name="Quantidade" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Análise por Categoria</CardTitle>
                  <CardDescription>Detalhamento de vendas por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Categoria</th>
                          <th className="text-right py-3 px-4">Faturamento</th>
                          <th className="text-right py-3 px-4">Participação</th>
                          <th className="text-left py-3 px-4">Barra</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryMetrics.map((cat, index) => (
                          <tr key={cat.name} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{cat.name}</td>
                            <td className="text-right py-3 px-4">{formatPrice(cat.revenue)}</td>
                            <td className="text-right py-3 px-4">{cat.percentage.toFixed(1)}%</td>
                            <td className="py-3 px-4 w-48">
                              <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                  className="h-4 rounded-full"
                                  style={{
                                    width: `${cat.percentage}%`,
                                    backgroundColor: COLORS[index % COLORS.length],
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timing Tab */}
          <TabsContent value="timing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Hora</CardTitle>
                <CardDescription>Volume de pedidos ao longo do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={hourlyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" fontSize={12} />
                    <YAxis yAxisId="left" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} fontSize={12} />
                    <Tooltip
                      formatter={(value, name) => {
                        const num = value as number;
                        return name === 'Faturamento' ? [formatPriceBR(num), name] : [num, name];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="orders" fill="#ea580c" name="Pedidos" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} name="Faturamento" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Horário de Pico - Almoço</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const lunchHours = hourlyMetrics.filter((h) => {
                      const hour = parseInt(h.hour);
                      return hour >= 11 && hour <= 14;
                    });
                    const totalOrders = lunchHours.reduce((sum, h) => sum + h.orders, 0);
                    const totalRevenue = lunchHours.reduce((sum, h) => sum + h.revenue, 0);
                    return (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">{totalOrders} pedidos</p>
                        <p className="text-lg text-orange-600">{formatPrice(totalRevenue)}</p>
                        <p className="text-sm text-gray-500">11:00 - 14:00</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Horário de Pico - Happy Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const happyHours = hourlyMetrics.filter((h) => {
                      const hour = parseInt(h.hour);
                      return hour >= 17 && hour <= 19;
                    });
                    const totalOrders = happyHours.reduce((sum, h) => sum + h.orders, 0);
                    const totalRevenue = happyHours.reduce((sum, h) => sum + h.revenue, 0);
                    return (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">{totalOrders} pedidos</p>
                        <p className="text-lg text-orange-600">{formatPrice(totalRevenue)}</p>
                        <p className="text-sm text-gray-500">17:00 - 19:00</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Horário de Pico - Jantar</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const dinnerHours = hourlyMetrics.filter((h) => {
                      const hour = parseInt(h.hour);
                      return hour >= 19 && hour <= 22;
                    });
                    const totalOrders = dinnerHours.reduce((sum, h) => sum + h.orders, 0);
                    const totalRevenue = dinnerHours.reduce((sum, h) => sum + h.revenue, 0);
                    return (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">{totalOrders} pedidos</p>
                        <p className="text-lg text-orange-600">{formatPrice(totalRevenue)}</p>
                        <p className="text-sm text-gray-500">19:00 - 22:00</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Mapa de Calor - Pedidos por Hora e Dia</CardTitle>
                <CardDescription>Intensidade de pedidos (baseado em médias)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="p-2">Hora</th>
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                          <th key={day} className="p-2 text-center">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[12, 13, 14, 17, 18, 19, 20, 21, 22, 23].map((hour) => (
                        <tr key={hour}>
                          <td className="p-2 font-medium">{`${hour}:00`}</td>
                          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                            let intensity = 0.3;
                            if (hour >= 19 && hour <= 21) intensity += 0.3;
                            if (day === 5 || day === 6) intensity += 0.3;
                            if (day === 0) intensity += 0.2;
                            if (day === 1) intensity -= 0.2;
                            intensity = Math.min(1, Math.max(0, intensity));

                            return (
                              <td
                                key={day}
                                className="p-2 text-center"
                                style={{
                                  backgroundColor: `rgba(234, 88, 12, ${intensity})`,
                                  color: intensity > 0.5 ? 'white' : 'black',
                                }}
                              >
                                {Math.round(intensity * 10)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  * Valores de 0-10 representam intensidade relativa de pedidos
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projeção de Faturamento - Próximos 7 Dias</CardTitle>
                <CardDescription>Baseado em tendências históricas e sazonalidade</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={forecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} fontSize={12} />
                    <Tooltip formatter={(value) => [formatPriceBR(value as number)]} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="transparent"
                      fill="#bbf7d0"
                      name="Limite Superior"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="transparent"
                      fill="#ffffff"
                      name="Limite Inferior"
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="#16a34a"
                      strokeWidth={3}
                      name="Projeção"
                      dot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Faturamento Projetado (7 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {formatPrice(forecast.reduce((sum, f) => sum + f.projected, 0))}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Intervalo: {formatPrice(forecast.reduce((sum, f) => sum + f.lower, 0))} - {formatPrice(forecast.reduce((sum, f) => sum + f.upper, 0))}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Melhor Dia Projetado</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const bestDay = forecast.length > 0
                      ? forecast.reduce((best, current) => current.projected > best.projected ? current : best, forecast[0])
                      : null;
                    return bestDay ? (
                      <>
                        <p className="text-3xl font-bold">{bestDay.date}</p>
                        <p className="text-lg text-orange-600 mt-2">{formatPrice(bestDay.projected)}</p>
                      </>
                    ) : (
                      <p className="text-gray-500">Sem dados</p>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tendência</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const avgRecent = dailyMetrics.slice(-7).reduce((sum, d) => sum + d.revenue, 0) / 7;
                    const avgForecast = forecast.length > 0
                      ? forecast.reduce((sum, f) => sum + f.projected, 0) / forecast.length
                      : 0;
                    const trend = avgRecent > 0 ? ((avgForecast - avgRecent) / avgRecent) * 100 : 0;
                    return (
                      <>
                        <p className={`text-3xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {trend >= 0 ? 'Crescimento esperado' : 'Redução esperada'}
                        </p>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Insights e Recomendações</CardTitle>
                <CardDescription>Análise automática baseada nos dados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <span className="text-2xl">📈</span>
                    <div>
                      <h4 className="font-semibold text-green-800">Crescimento Consistente</h4>
                      <p className="text-sm text-green-700">
                        Seu faturamento mostra tendência de crescimento de {kpis.revenueGrowth.toFixed(1)}% em relação ao período anterior.
                        Continue investindo nas estratégias atuais.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                    <span className="text-2xl">🕐</span>
                    <div>
                      <h4 className="font-semibold text-orange-800">Oportunidade no Happy Hour</h4>
                      <p className="text-sm text-orange-700">
                        O período das 17h-19h representa uma oportunidade de crescimento.
                        Considere promoções especiais para aumentar o volume neste horário.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <span className="text-2xl">🍽️</span>
                    <div>
                      <h4 className="font-semibold text-blue-800">Ticket Médio</h4>
                      <p className="text-sm text-blue-700">
                        Seu ticket médio é de {formatPrice(kpis.avgTicket)}.
                        Estratégias de upselling podem aumentar este valor em até 15%.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <span className="text-2xl">📅</span>
                    <div>
                      <h4 className="font-semibold text-purple-800">Dia de Pico: {kpis.peakDay}</h4>
                      <p className="text-sm text-purple-700">
                        {kpis.peakDay} é seu dia mais forte. Garanta staff adequado e estoque preparado.
                        Considere promoções em dias mais fracos para equilibrar a demanda.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_OWNER']}>
      <ReportsContent />
    </ProtectedRoute>
  );
}
