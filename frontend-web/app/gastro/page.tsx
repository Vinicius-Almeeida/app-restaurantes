'use client';

import { useGastroStore } from './stores/useGastroStore';
import AuthForm from './components/auth/auth-form';
import { Header, BottomNav } from './components/shared';
import { MenuView, CartView, TrackingView, ProfileView, WaiterCallButton } from './components/customer';
import { WaiterDashboard } from './components/waiter';
import { KitchenDashboard } from './components/kitchen';
import { AdminDashboard } from './components/admin';

export default function GastroPage() {
  const currentView = useGastroStore((state) => state.currentView);
  const isAuthenticated = useGastroStore((state) => state.isAuthenticated);
  const currentUser = useGastroStore((state) => state.currentUser);

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // Staff dashboards
  if (currentUser?.role === 'waiter') {
    return <WaiterDashboard />;
  }

  if (currentUser?.role === 'kitchen') {
    return <KitchenDashboard />;
  }

  if (currentUser?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Customer views
  const renderCustomerView = () => {
    switch (currentView) {
      case 'menu':
        return <MenuView />;
      case 'cart':
        return <CartView />;
      case 'tracking':
        return <TrackingView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <MenuView />;
    }
  };

  return (
    <div className="gastro-container">
      <Header />
      {renderCustomerView()}
      <WaiterCallButton />
      <BottomNav />
    </div>
  );
}
