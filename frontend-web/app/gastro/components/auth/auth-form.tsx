'use client';

import { useState } from 'react';
import { User, ChefHat, ShieldCheck, Store, Mail, Lock, Hash } from 'lucide-react';
import type { UserRole } from '../../types';
import { useGastroStore } from '../../stores/useGastroStore';
import { DEMO_CREDENTIALS } from '../../constants';

type AuthMode = 'customer' | 'staff';

interface FormData {
  email: string;
  password: string;
  tableNumber: string;
}

interface UserTypeConfig {
  role: UserRole;
  label: string;
  icon: typeof User;
  description: string;
}

const USER_TYPES: UserTypeConfig[] = [
  {
    role: 'customer',
    label: 'Cliente',
    icon: User,
    description: 'Fazer pedidos',
  },
  {
    role: 'waiter',
    label: 'Garçom',
    icon: ShieldCheck,
    description: 'Gerenciar mesas',
  },
  {
    role: 'kitchen',
    label: 'Cozinha',
    icon: ChefHat,
    description: 'Ver pedidos',
  },
  {
    role: 'admin',
    label: 'Admin',
    icon: Store,
    description: 'Dashboard',
  },
];

/**
 * AuthForm Component
 *
 * Authentication form for Gastro app with 4 user types:
 * - Customer: requires email + table number (1-20)
 * - Waiter/Kitchen/Admin: requires email + password
 *
 * Features:
 * - Tab switching between Customer and Staff login
 * - User type selection with icons
 * - Form validation
 * - Demo credentials display
 * - TypeScript strict mode compliant
 *
 * @example
 * <AuthForm />
 */
export default function AuthForm() {
  const [authMode, setAuthMode] = useState<AuthMode>('customer');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    tableNumber: '',
  });
  const [error, setError] = useState<string>('');

  const login = useGastroStore((state) => state.login);

  const handleModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    setSelectedRole(mode === 'customer' ? 'customer' : 'waiter');
    setFormData({ email: '', password: '', tableNumber: '' });
    setError('');
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setFormData({ email: '', password: '', tableNumber: '' });
    setError('');
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (selectedRole === 'customer') {
      const tableNum = parseInt(formData.tableNumber, 10);

      if (!formData.tableNumber || isNaN(tableNum)) {
        setError('Número da mesa é obrigatório');
        return;
      }

      if (tableNum < 1 || tableNum > 20) {
        setError('Mesa deve ser entre 1 e 20');
        return;
      }

      const success = login(formData.email, '', 'customer', tableNum);

      if (!success) {
        setError('Falha no login. Tente novamente.');
      }
    } else {
      // Staff login (waiter, kitchen, admin)
      if (!formData.password.trim()) {
        setError('Senha é obrigatória');
        return;
      }

      const success = login(formData.email, formData.password, selectedRole);

      if (!success) {
        setError('Email ou senha incorretos');
      }
    }
  };

  const fillDemoCredentials = () => {
    const demoData = DEMO_CREDENTIALS[selectedRole];
    setFormData({
      email: demoData.email,
      password: demoData.password,
      tableNumber: selectedRole === 'customer' ? '5' : '',
    });
    setError('');
  };

  const isCustomerMode = authMode === 'customer';
  const staffUserTypes = USER_TYPES.filter((type) => type.role !== 'customer');

  return (
    <div className="auth-container">
      {/* Logo */}
      <div className="auth-logo">🍽️</div>
      <h1 className="auth-title">Le Bistro</h1>
      <p className="auth-subtitle">Experiência gastronômica completa</p>

      {/* Auth Card */}
      <div className="auth-card">
        {/* Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isCustomerMode ? 'active' : ''}`}
            onClick={() => handleModeChange('customer')}
          >
            Cliente
          </button>
          <button
            type="button"
            className={`auth-tab ${!isCustomerMode ? 'active' : ''}`}
            onClick={() => handleModeChange('staff')}
          >
            Staff
          </button>
        </div>

        {/* User Type Selector */}
        {isCustomerMode ? (
          // Customer type (single option)
          <div className="auth-type-selector">
            <button
              type="button"
              className="auth-type-btn active"
              onClick={() => handleRoleChange('customer')}
            >
              <div className="auth-type-icon">
                <User size={20} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Cliente</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Fazer pedidos
                </div>
              </div>
            </button>
          </div>
        ) : (
          // Staff types (waiter, kitchen, admin)
          <div className="auth-type-selector">
            {staffUserTypes.map((type) => {
              const Icon = type.icon;
              const isActive = selectedRole === type.role;

              return (
                <button
                  key={type.role}
                  type="button"
                  className={`auth-type-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleRoleChange(type.role)}
                >
                  <div className="auth-type-icon">
                    <Icon size={20} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>
                      {type.label}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {type.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <div className="form-input-icon">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>

          {/* Conditional Fields */}
          {selectedRole === 'customer' ? (
            // Table Number for Customer
            <div className="form-group">
              <label className="form-label" htmlFor="tableNumber">
                Número da Mesa
              </label>
              <div className="form-input-icon">
                <Hash size={18} />
                <input
                  id="tableNumber"
                  type="number"
                  className="form-input"
                  placeholder="1-20"
                  min="1"
                  max="20"
                  value={formData.tableNumber}
                  onChange={(e) => handleInputChange('tableNumber', e.target.value)}
                />
              </div>
            </div>
          ) : (
            // Password for Staff
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Senha
              </label>
              <div className="form-input-icon">
                <Lock size={18} />
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                color: 'var(--danger)',
                fontSize: '14px',
                marginBottom: '16px',
                padding: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </form>

        {/* Demo Credentials */}
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            background: 'var(--bg-card-hover)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            Credenciais Demo
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email:</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                {DEMO_CREDENTIALS[selectedRole].email}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {selectedRole === 'customer' ? 'Mesa:' : 'Senha:'}
              </span>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                {selectedRole === 'customer'
                  ? '1-20'
                  : DEMO_CREDENTIALS[selectedRole].password}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={fillDemoCredentials}
            className="btn-secondary"
            style={{
              width: '100%',
              marginTop: '12px',
              fontSize: '13px',
              padding: '8px',
            }}
          >
            Preencher com demo
          </button>
        </div>
      </div>
    </div>
  );
}
