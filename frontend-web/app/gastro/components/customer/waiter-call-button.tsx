'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useGastroStore } from '../../stores/useGastroStore';
import { WAITER_CALL_REASONS } from '../../constants';

export function WaiterCallButton() {
  const [isOpen, setIsOpen] = useState(false);
  const callWaiter = useGastroStore((state) => state.callWaiter);

  const handleCall = (reasonId: string) => {
    callWaiter(reasonId);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="waiter-call-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Chamar garçom"
      >
        <Bell size={24} />
      </button>

      {isOpen && (
        <div className="waiter-call-modal" onClick={() => setIsOpen(false)}>
          <div className="waiter-call-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>Chamar Garçom</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X size={24} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Selecione o motivo:
            </p>

            <div className="waiter-call-options">
              {WAITER_CALL_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  className="waiter-call-option"
                  onClick={() => handleCall(reason.id)}
                >
                  <span className="waiter-call-option-icon">{reason.icon}</span>
                  <span style={{ fontWeight: 500 }}>{reason.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
